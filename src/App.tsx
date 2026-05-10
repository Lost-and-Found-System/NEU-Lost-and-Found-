/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { supabase, signInWithGoogle, logout, signInWithEmail, signUpWithEmail } from '../supabase';
import { analyzeItemImage } from '../gemini';
import { cn, formatDate } from '../utils';
import { 
  Search, 
  Plus, 
  Camera, 
  MapPin, 
  Calendar, 
  Tag, 
  LogOut, 
  User, 
  CheckCircle2, 
  Clock, 
  X, 
  Loader2,
  Filter,
  ArrowRight,
  Info,
  GraduationCap,
  Home,
  Bell,
  Share2,
  Flag,
  MessageSquare,
  Shield,
  ShieldOff,
  Phone,
  Mail,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import imageCompression from 'browser-image-compression';

// --- Types ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
  }
}

function handleSupabaseError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: SupabaseErrorInfo = {
    error: error?.message || String(error),
    authInfo: {
      userId: undefined, // Will be filled if needed
      email: undefined,
    },
    operationType,
    path
  }
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = this.state.error?.message || "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.error.includes("insufficient permissions")) {
          errorMessage = "You don't have permission to perform this action. Please check if you are logged in or if the data is valid.";
        }
      } catch (e) {
        // Not a JSON error, use the message as is
      }

      const isConfigError = errorMessage.includes("Supabase URL or Anon Key is missing");

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-red-100 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <Info className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isConfigError ? "Configuration Required" : "Oops!"}
            </h2>
            <p className="text-slate-600">{errorMessage}</p>
            {isConfigError ? (
              <div className="space-y-4 pt-4">
                <p className="text-sm text-slate-500">
                  Alternatively, I can set up a Firebase database for you which works automatically in this environment.
                </p>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Retry after adding Secrets
                </Button>
              </div>
            ) : (
              <Button onClick={() => window.location.reload()} className="w-full">
                Reload Application
              </Button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface Item {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  location: string;
  date: any;
  image_urls: string[];
  author_uid: string;
  author_name: string;
  author_photo?: string;
  status: 'active' | 'resolved' | 'archived';
  created_at: any;
  contact_info: string;
  is_anonymous: boolean;
}

interface ItemComment {
  id: string;
  item_id: string;
  author_uid: string;
  author_name: string;
  author_photo?: string;
  content: string;
  created_at: string;
}

interface AppNotification {
  id: string;
  type: 'post' | 'comment';
  message: string;
  timestamp: string;
  read: boolean;
  itemId?: string;
}

// --- Components ---

const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-blue-700 text-blue-950 hover:bg-blue-800',
    secondary: 'bg-white text-blue-950 border border-blue-200 hover:bg-blue-50',
    ghost: 'bg-transparent text-slate-900 hover:bg-slate-100',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100',
  };
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className, ...props }: any) => (
  <input 
    className={cn(
      'w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all',
      className
    )}
    {...props}
  />
);

const Badge = ({ children, variant = 'default' }: any) => {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    lost: 'bg-blue-700 text-blue-950',
    found: 'bg-blue-200 text-blue-950 border border-blue-300',
    resolved: 'bg-blue-50 text-blue-900 border border-blue-100',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest', variants[variant as keyof typeof variants])}>
      {children}
    </span>
  );
};

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState<React.ReactNode | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('app_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('app_items', JSON.stringify(items));
  }, [items]);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [comments, setComments] = useState<ItemComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string, preview: string, progress: number }[]>([]);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('app_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentView, setCurrentView] = useState<'home' | 'my-posts' | 'notifications' | 'profile' | 'admin'>('home');
  const [myPostsFilter, setMyPostsFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [adminFilter, setAdminFilter] = useState<'all' | 'active' | 'resolved' | 'archived'>('all');
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (type: 'post' | 'comment', message: string, itemId?: string) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(7),
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      itemId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    if (currentView === 'notifications') {
      markNotificationsAsRead();
    }
  }, [currentView]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (signInError) {
      const timer = setTimeout(() => {
        setSignInError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [signInError]);

  useEffect(() => {
    if (selectedItem?.id) {
      fetchComments(selectedItem.id);
    } else {
      setComments([]);
      setCommentText('');
    }
  }, [selectedItem?.id]);

  // Keep selectedItem in sync if items list refreshes
  useEffect(() => {
    if (selectedItem) {
      const updatedItem = items.find(i => i.id === selectedItem.id);
      if (updatedItem && updatedItem !== selectedItem) {
        setSelectedItem(updatedItem);
      }
    }
  }, [items, selectedItem]);

  const fetchComments = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });
      
      const localCommentsJSON = localStorage.getItem(`comments_${itemId}`);
      const localComments = localCommentsJSON ? JSON.parse(localCommentsJSON) : [];

      if (error) {
        // Only log real errors, not RLS/table missing for demo
        if (!error.message.includes("Could not find the table") && !error.message.includes("violates row-level security policy")) {
          console.error("Error fetching comments from Supabase:", error);
        }
        setComments(localComments);
      } else {
        const remoteComments = data as ItemComment[];
        
        // Merge remote and local comments by ID to prevent duplicates and preserve locally saved comments
        const combined = [...remoteComments];
        localComments.forEach((lc: ItemComment) => {
          if (!combined.some(rc => rc.id === lc.id)) {
            combined.push(lc);
          }
        });
        
        const sorted = combined.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        setComments(sorted);
        // Sync local storage with both remote and local merged results
        localStorage.setItem(`comments_${itemId}`, JSON.stringify(sorted));
      }
    } catch (err) {
      console.error("Fetch comments error:", err);
      const localComments = JSON.parse(localStorage.getItem(`comments_${itemId}`) || '[]');
      setComments(localComments);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanComment = commentText.trim();
    if (!user || !selectedItem || !cleanComment || isSubmittingComment) return;

    // 1. Create the optimistic comment object
    const commentId = Math.random().toString(36).substring(7);
    const optimisticComment: ItemComment = {
      id: commentId,
      item_id: selectedItem.id,
      author_uid: user.id,
      author_name: user.user_metadata.full_name || user.email,
      author_photo: user.user_metadata.avatar_url,
      content: cleanComment,
      created_at: new Date().toISOString()
    };

    // 2. Update UI INSTANTLY
    setComments(prev => [...prev, optimisticComment]);
    setCommentText('');
    
    // Save to local storage immediately so it persists even if sync fails
    const localComments = JSON.parse(localStorage.getItem(`comments_${selectedItem.id}`) || '[]');
    localStorage.setItem(`comments_${selectedItem.id}`, JSON.stringify([...localComments, optimisticComment]));
    
    // 3. Handle background sync
    setIsSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          item_id: optimisticComment.item_id,
          author_uid: optimisticComment.author_uid,
          author_name: optimisticComment.author_name,
          author_photo: optimisticComment.author_photo,
          content: optimisticComment.content,
          created_at: optimisticComment.created_at
        })
        .select()
        .single();
      
      if (error) {
        // If it's just an RLS/Table missing issue, we don't treat it as a critical failure 
        // since we already saved it locally.
        if (error.message.includes("Could not find the table") || error.message.includes("violates row-level security policy")) {
          showToast('Comment saved locally (Database restricted)', 'success');
        } else {
          console.error("Supabase sync error:", error);
        }
      } else if (data) {
        // Replace optimistic ID with real database ID
        const realComment = data as ItemComment;
        setComments(prev => prev.map(c => c.id === commentId ? realComment : c));
        
        // Update local cache with real IDs
        const currentLocal = JSON.parse(localStorage.getItem(`comments_${selectedItem.id}`) || '[]');
        const updatedLocal = currentLocal.map((c: any) => c.id === commentId ? realComment : c);
        localStorage.setItem(`comments_${selectedItem.id}`, JSON.stringify(updatedLocal));
      }
      
      addNotification('comment', `New comment on "${selectedItem.title}": ${cleanComment.substring(0, 30)}...`, selectedItem.id);
    } catch (err: any) {
      console.error("Background sync catch error:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSupabaseError = (error: any, operationType: OperationType, path: string | null) => {
    if (error.message.includes("Could not find the table") || error.message.includes("violates row-level security policy")) {
       // Silent swallow if it's a known RLS/schema issue for demo
       return;
    }
    console.error(`Supabase ${operationType} on ${path} error:`, error);
  };

  const categories = ['All', 'Electronics', 'Clothing', 'ID/Cards', 'Keys', 'Jewelry', 'Others'];

  // Form state
  const [formData, setFormData] = useState({
    type: 'lost' as 'lost' | 'found',
    title: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    image_urls: [] as string[],
    contact_info: '',
    is_anonymous: false,
  });

  // Detect if we are in the OAuth popup
  const isOAuthPopup = typeof window !== 'undefined' && 
    (window.location.search.includes('oauth=true') || window.location.hash.includes('access_token')) && 
    window.opener;

  useEffect(() => {
    if (isOAuthPopup) {
      // Handle errors from Supabase (e.g. user cancelled)
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error_description') || urlParams.get('error');
      
      if (error) {
        let friendlyError = error;
        if (error.includes("Database error saving new user")) {
          friendlyError = "Access restricted to @neu.edu.ph accounts only.";
        }
        window.opener.postMessage({ type: 'OAUTH_ERROR', error: friendlyError }, '*');
        window.close();
        return;
      }

      // Listen for the session to be established in the popup
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          window.opener.postMessage({ type: 'OAUTH_SUCCESS' }, '*');
          setTimeout(() => window.close(), 200);
        }
      });

      // Immediate check
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          window.opener.postMessage({ type: 'OAUTH_SUCCESS' }, '*');
          setTimeout(() => window.close(), 200);
        }
      });

      // Safety timeout: close the popup if nothing happens after 10 seconds
      const timeout = setTimeout(() => window.close(), 10000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      if (user && !user.email?.endsWith('@neu.edu.ph')) {
        supabase.auth.signOut();
        setUser(null);
        setSignInError("Access restricted to @neu.edu.ph accounts only.");
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      if (user && !user.email?.endsWith('@neu.edu.ph')) {
        supabase.auth.signOut();
        setUser(null);
        setSignInError("Access restricted to @neu.edu.ph accounts only.");
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    // Listen for messages from the OAuth popup
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('run.app') && !event.origin.includes('localhost')) return;
      
      if (event.data?.type === 'OAUTH_SUCCESS' || event.data?.type === 'OAUTH_ERROR') {
        const checkSession = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user ?? null;
          
          if (user && !user.email?.endsWith('@neu.edu.ph')) {
            await supabase.auth.signOut();
            setUser(null);
            setSignInError("Access restricted to @neu.edu.ph accounts only.");
          } else {
            setUser(user);
          }
          setIsSigningIn(false);
        };

        if (event.data?.type === 'OAUTH_SUCCESS') {
          checkSession();
        } else {
          setSignInError(event.data.error || "Failed to sign in with Google.");
          setIsSigningIn(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, [isOAuthPopup]);

  useEffect(() => {
    if (!user || !user.email?.endsWith('@neu.edu.ph')) return;

    // Sync user profile to Supabase (users table)
    const syncUser = async () => {
      // Check if user already exists to preserve role, or auto-promote if it's the admin email
      const isAdminEmail = user.email === 'angellyn.tolentino@neu.edu.ph';
      
      const { data: existingUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      // Always promote to admin if email matches, otherwise use existing role or default to 'user'
      const roleToSet = isAdminEmail ? 'admin' : (existingUser?.role || 'user');
      setUserRole(roleToSet as 'user' | 'admin');

      const { error } = await supabase.from('users').upsert({
        id: user.id,
        display_name: user.user_metadata.full_name || user.email,
        email: user.email,
        avatar_url: user.user_metadata.avatar_url,
        role: roleToSet
      });
      if (error) console.error("Error syncing user:", error);
    };
    syncUser();

    // Fetch items
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        handleSupabaseError(error, OperationType.LIST, 'items');
      } else if (data) {
        const remoteItems = data as any[];
        const localItems = JSON.parse(localStorage.getItem('app_items') || '[]');
        
        // Merge to preserve locally created items if they haven't synced to DB yet
        const combined = [...remoteItems];
        localItems.forEach((li: any) => {
          if (!combined.some(ri => ri.id === li.id)) {
            combined.push(li);
          }
        });
        
        setItems(combined.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    };
    fetchItems();

    // Subscribe to changes
    const channel = supabase
      .channel('items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      showToast('Cloudinary config missing. Please check your secrets.', 'error');
      return;
    }

    const newUploadingFiles = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      preview: URL.createObjectURL(file),
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);
    setIsUploading(true);

    const compressionOptions = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1280,
      useWebWorker: true
    };

    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileId = newUploadingFiles[index].id;
        
        try {
          // Compress
          const compressedFile = await imageCompression(file, compressionOptions);
          
          setUploadingFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress: 30 } : f
          ));

          const formData = new FormData();
          formData.append('file', compressedFile);
          formData.append('upload_preset', uploadPreset);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.error?.message || response.statusText;
            if (message.includes('whitelisted for unsigned uploads')) {
              throw new Error('Cloudinary Error: Your upload preset must be set to "Unsigned" in Cloudinary settings > Upload > Upload presets.');
            }
            throw new Error(`Cloudinary upload failed: ${message}`);
          }

          setUploadingFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress: 100 } : f
          ));

          const data = await response.json();
          const url = data.secure_url as string;

          setFormData(prev => ({ 
            ...prev, 
            image_urls: [...prev.image_urls, url].slice(0, 5)
          }));
          
          setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
          
          return { url, id: fileId };
        } catch (error) {
          setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const uploadedUrls = results
        .filter((r): r is PromiseFulfilledResult<{url: string, id: string}> => r.status === 'fulfilled')
        .map(r => r.value.url);
      
      // Auto-analyze found items using the first new image if title is empty
      if (formData.type === 'found' && !formData.title && uploadedUrls.length > 0) {
        setIsAnalyzing(true);
        const analysis = await analyzeItemImage(uploadedUrls[0]);
        if (analysis) {
          setFormData(prev => ({
            ...prev,
            title: analysis.title || prev.title,
            description: analysis.description || prev.description,
            category: analysis.category || prev.category,
          }));
        }
        setIsAnalyzing(false);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      showToast(err.message || 'Failed to upload images.', 'error');
    } finally {
      setIsUploading(false);
      // Revoke and clear previews
      newUploadingFiles.forEach(f => URL.revokeObjectURL(f.preview));
      setUploadingFiles(prev => prev.filter(f => !newUploadingFiles.some(nf => nf.id === f.id)));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const path = 'items';
    try {
      const { data, error } = await supabase.from('items').insert({
        ...formData,
        author_uid: user.id,
        author_name: user.user_metadata.full_name || user.email,
        author_photo: user.user_metadata.avatar_url,
        status: 'active',
        created_at: new Date().toISOString(),
        date: new Date(formData.date).toISOString()
      }).select().single();
      
      if (error) {
        // Fallback to local
        const localItem = {
          ...formData,
          id: Math.random().toString(36).substring(7),
          author_uid: user.id,
          author_name: user.user_metadata.full_name || user.email,
          author_photo: user.user_metadata.avatar_url,
          status: 'active',
          created_at: new Date().toISOString()
        } as Item;
        setItems(prev => [localItem, ...prev]);
        addNotification('post', `Your ${formData.type} post "${formData.title}" has been saved locally.`, localItem.id);
        
        if (error.message.includes("Could not find the table") || error.message.includes("violates row-level security policy")) {
          showToast('Item saved locally (Database restriction)', 'success');
        } else {
          showToast('Saved locally (Sync error)', 'success');
        }
      } else if (data) {
        const newItem = {
          ...formData,
          id: data.id,
          author_uid: user.id,
          author_name: user.user_metadata.full_name || user.email,
          author_photo: user.user_metadata.avatar_url,
          status: 'active',
          created_at: new Date().toISOString()
        } as Item;
        setItems(prev => [newItem, ...prev]);
        addNotification('post', `Your ${formData.type} post "${formData.title}" has been posted.`, data.id);
        showToast('Item posted successfully!');
      }

      setIsModalOpen(false);
      setFormData({
        type: 'lost',
        title: '',
        description: '',
        category: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        image_urls: [],
        contact_info: '',
        is_anonymous: false,
      });
    } catch (err) {
      handleSupabaseError(err, OperationType.CREATE, path);
    }
  };

  const resolveItem = async (itemId: string) => {
    const path = `items/${itemId}`;
    try {
      const { error } = await supabase
        .from('items')
        .update({ status: 'resolved' })
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Update local state immediately
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'resolved' } : item));
      setSelectedItem(null);
      showToast('Item marked as resolved!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'An error occurred', 'error');
      handleSupabaseError(err, OperationType.UPDATE, path);
    }
  };

  const archiveItem = async (itemId: string) => {
    const path = `items/${itemId}`;
    try {
      const { error } = await supabase
        .from('items')
        .update({ status: 'archived' })
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Update local state immediately
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'archived' } : item));
      setSelectedItem(null);
      showToast('Item archived successfully!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'An error occurred', 'error');
      handleSupabaseError(err, OperationType.UPDATE, path);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;

    if (currentView === 'my-posts') {
      const isMine = item.author_uid === user?.id;
      const matchesMyFilter = myPostsFilter === 'all' || item.type === myPostsFilter;
      return matchesSearch && isMine && matchesMyFilter && matchesCategory;
    }
    
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab && matchesCategory && item.status !== 'archived';
  });

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSignInError(null);
    setIsSigningIn(true);

    // Basic domain validation
    if (email && !email.endsWith('@neu.edu.ph')) {
      setSignInError("Access restricted to @neu.edu.ph accounts only.");
      setIsSigningIn(false);
      return;
    }

    try {
      if (authMode === 'signin') {
        if (email && password) {
          try {
            await signInWithEmail(email, password);
          } catch (err: any) {
            if (err.message === 'Invalid login credentials') {
              throw new Error("Invalid email or password. If you don't have an account yet, please Sign Up first.");
            }
            throw err;
          }
        } else {
          await signInWithGoogle();
        }
      } else {
        if (!fullName) {
          throw new Error("Please enter your full name.");
        }
        await signUpWithEmail(email, password, fullName);
        setSignInError("Registration successful! Please check your email for a confirmation link before signing in.");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setSignInError(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSignInError(null);
    setIsSigningIn(true);
    
    // Set a safety timeout to clear the loading state after 60s if the popup is closed or lost
    const timeout = setTimeout(() => setIsSigningIn(false), 60000);
    
    try {
      await signInWithGoogle();
      // We don't set setIsSigningIn(false) here because we wait for the message from the popup
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setSignInError("Failed to sign in with Google.");
      setIsSigningIn(false);
      clearTimeout(timeout);
    }
  };

  if (isOAuthPopup) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatePresence mode="wait">
      {loading ? (
        <motion.div 
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen flex items-center justify-center bg-slate-50"
        >
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-700 animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">Initializing NEU Found Hub...</p>
          </div>
        </motion.div>
      ) : !user ? (
        <motion.div 
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="min-h-screen bg-white flex flex-col md:flex-row"
        >
          {/* Left Side: Branding */}
          <div className="md:w-1/2 p-12 md:p-24 flex flex-col justify-center bg-white">
            <div className="max-w-lg space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 p-2 border border-slate-50">
                  <img 
                    src="https://neu.edu.ph/main/assets/images/webp/neulogo.webp" 
                    alt="NEU Logo" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-3xl font-black tracking-tighter text-blue-950 font-serif">NEU FOUND</div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight font-serif leading-tight">
                  Reuniting the <br />
                  <span className="text-blue-700">NEU Community.</span>
                </h1>
                <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
                  The official digital lost and found hub for New Era University. Post lost items, find found ones, and help your fellow Eagles.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Authentication */}
          <div className="md:w-1/2 bg-slate-50 flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 max-w-md w-full space-y-8 text-center border border-slate-100"
            >
              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
                  {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-500 font-medium">
                  {authMode === 'signin' ? 'Sign in to access the hub' : 'Join the NEU Found community'}
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4 text-left">
                {authMode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Full Name</label>
                    <Input 
                      placeholder="Juan Dela Cruz" 
                      required 
                      value={fullName}
                      onChange={(e: any) => setFullName(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Email Address</label>
                  <Input 
                    type="email"
                    placeholder="name@neu.edu.ph" 
                    required 
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Password</label>
                  <Input 
                    type="password"
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-4 text-lg rounded-2xl shadow-lg shadow-blue-100 bg-blue-700 text-blue-950 hover:bg-blue-800"
                >
                  {isSigningIn && authMode !== 'signin' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    authMode === 'signin' ? 'Sign In' : 'Sign Up'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
                </div>
              </div>

              <Button 
                onClick={handleGoogleSignIn} 
                disabled={isSigningIn}
                variant="secondary"
                className="w-full py-4 rounded-2xl border-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50 overflow-hidden relative"
              >
                {isSigningIn ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-700" />
                    <span className="text-blue-700 font-bold">Signing in...</span>
                  </div>
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                    Google
                  </>
                )}
              </Button>

              {signInError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-900 text-sm font-medium text-left flex gap-3"
                >
                  <Info className="w-5 h-5 shrink-0 mt-0.5 text-red-700" />
                  <p>{signInError}</p>
                </motion.div>
              )}

              <p className="text-sm text-slate-500 font-medium">
                {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-blue-700 font-bold hover:underline"
                >
                  {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24"
        >
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('home')}>
                <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <GraduationCap className="w-6 h-6 text-blue-950" />
                </div>
                <span className="text-xl font-extrabold tracking-tight hidden sm:block text-blue-900 font-serif">NEU Found Hub</span>
              </div>

              <nav className="hidden md:flex items-center gap-8">
                {(['home', 'my-posts', 'notifications', 'profile'] as const).map(view => (
                  <button 
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={cn(
                      "text-sm font-bold transition-all relative py-1 capitalize", 
                      currentView === view ? "text-blue-900" : "text-slate-400 hover:text-blue-700"
                    )}
                  >
                    {view.replace('-', ' ')}
                    {view === 'notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                    {currentView === view && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-700 rounded-full"
                      />
                    )}
                  </button>
                ))}
                {userRole === 'admin' && (
                  <button 
                    onClick={() => setCurrentView('admin')}
                    className={cn("text-sm font-bold transition-colors flex items-center gap-1.5", currentView === 'admin' ? "text-red-600" : "text-slate-500 hover:text-red-600")}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                )}
              </nav>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                  <img src={user.user_metadata.avatar_url || undefined} className="w-6 h-6 rounded-full" alt="Profile" />
                  <span className="text-sm font-semibold text-slate-700">{user.user_metadata.full_name || user.email}</span>
                </div>
                <Button variant="ghost" onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-6 pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {currentView === 'home' && (
                  <div className="space-y-10">
                    {/* Search & Filter */}
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input 
                            placeholder="Search for items, categories, locations..." 
                            className="pl-12 py-5 text-lg rounded-2xl shadow-lg border-slate-200 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e: any) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          {(['all', 'lost', 'found'] as const).map(tab => (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={cn(
                                'px-8 py-2 rounded-2xl font-bold capitalize transition-all text-sm tracking-wide',
                                activeTab === tab 
                                  ? 'bg-blue-700 text-blue-950 shadow-lg shadow-blue-200' 
                                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                              )}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Category Chips */}
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                              'px-4 py-1.5 rounded-full text-xs font-bold transition-all border',
                              activeCategory === cat
                                ? 'bg-blue-50 text-blue-950 border-blue-200'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentView === 'my-posts' && (
                  <div className="space-y-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <h2 className="text-4xl font-extrabold text-slate-900 font-serif">My Posts</h2>
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex flex-wrap justify-center gap-2">
                          {(['all', 'lost', 'found'] as const).map(tab => (
                            <button
                              key={tab}
                              onClick={() => setMyPostsFilter(tab)}
                              className={cn(
                                'px-8 py-2 rounded-2xl font-bold capitalize transition-all text-sm tracking-wide',
                                myPostsFilter === tab 
                                  ? 'bg-blue-700 text-blue-950 shadow-lg shadow-blue-200' 
                                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                              )}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setActiveCategory(cat)}
                              className={cn(
                                'px-4 py-1.5 rounded-full text-xs font-bold transition-all border',
                                activeCategory === cat
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentView === 'notifications' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h2 className="text-3xl font-bold text-slate-900 font-serif">Notifications</h2>
                        <p className="text-slate-500 text-sm">Stay updated with your activities</p>
                      </div>
                      {notifications.length > 0 && (
                        <button 
                          onClick={clearNotifications}
                          className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear all
                        </button>
                      )}
                    </div>
                    
                    {notifications.length > 0 ? (
                      <div className="space-y-3">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id}
                            onClick={() => {
                              if (notification.itemId) {
                                const item = items.find(i => i.id === notification.itemId);
                                if (item) {
                                  setSelectedItem(item);
                                  setCurrentView('home');
                                }
                              }
                            }}
                            className={cn(
                              "p-4 rounded-2xl border transition-all cursor-pointer flex gap-4",
                              notification.read 
                                ? "bg-white border-slate-100 opacity-75" 
                                : "bg-blue-50 border-blue-100 shadow-sm shadow-blue-50"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                              notification.type === 'post' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                            )}>
                              {notification.type === 'post' ? <Plus className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className={cn("text-sm leading-relaxed", notification.read ? "text-slate-600 font-medium" : "text-slate-900 font-bold")}>
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(notification.timestamp)}
                                </span>
                                {!notification.read && <span className="w-1.5 h-1.5 bg-blue-700 rounded-full" />}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 self-center" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-50">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                          <Bell className="w-8 h-8" />
                        </div>
                        <p className="text-slate-400 text-lg font-medium">You have no new notifications.</p>
                      </div>
                    )}
                  </div>
                )}

                {currentView === 'admin' && userRole === 'admin' && (
                  <div className="space-y-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-lg shadow-red-100">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h2 className="text-4xl font-extrabold text-slate-900 font-serif">Admin Dashboard</h2>
                      <p className="text-slate-500 max-w-md">Manage all posts across the platform. You can resolve or archive any item.</p>
                      
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex flex-wrap justify-center gap-2">
                          {(['all', 'active', 'resolved', 'archived'] as const).map(tab => (
                            <button
                              key={tab}
                              onClick={() => setAdminFilter(tab)}
                              className={cn(
                                'px-8 py-2 rounded-2xl font-bold capitalize transition-all text-sm tracking-wide',
                                adminFilter === tab 
                                  ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                              )}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items
                        .filter(item => adminFilter === 'all' || item.status === adminFilter)
                        .map(item => (
                          <motion.div 
                            key={item.id}
                            layoutId={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer"
                          >
                            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                              {item.image_urls && item.image_urls.length > 0 ? (
                                <img 
                                  src={item.image_urls[0]} 
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Camera className="w-12 h-12" />
                                </div>
                              )}
                              <div className="absolute top-4 left-4 flex gap-2">
                                <span className={cn(
                                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                  item.type === 'lost' ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                                )}>
                                  {item.type}
                                </span>
                                {item.status === 'resolved' && (
                                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-sm">
                                    Resolved
                                  </span>
                                )}
                                {item.status === 'archived' && (
                                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-900 text-white shadow-sm">
                                    Archived
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="p-6 space-y-4">
                              <div className="space-y-1">
                                <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                                <div className="flex items-center text-slate-400 text-xs font-medium gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {item.location}
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                  {item.author_photo ? (
                                    <img src={item.author_photo} className="w-6 h-6 rounded-full bg-slate-100" alt="" />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                      <User className="w-3 h-3 text-slate-400" />
                                    </div>
                                  )}
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.author_name}</span>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                  {formatDate(item.date)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}

                {currentView === 'profile' && (
                  <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        <img src={user.user_metadata.avatar_url || undefined} className="w-32 h-32 rounded-full border-4 border-blue-50 shadow-xl" alt="Profile" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-700 rounded-full border-4 border-white flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-950" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 font-serif">{user.user_metadata.full_name || user.email}</h2>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <p className="text-slate-500 font-medium">{user.email}</p>
                          {userRole === 'admin' && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100 flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-100">
                      <div className="bg-slate-50 p-6 rounded-3xl text-center">
                        <div className="text-2xl font-extrabold text-blue-700">
                          {items.filter(i => i.author_uid === user?.id).length}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Posts</div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl text-center">
                        <div className="text-2xl font-extrabold text-blue-700">
                          {items.filter(i => i.author_uid === user?.id && i.status === 'resolved').length}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolved</div>
                      </div>
                    </div>

                    <Button onClick={logout} variant="danger" className="w-full py-4 rounded-2xl">
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </Button>
                  </div>
                )}

                {/* Grid (only for Home and My Posts) */}
                {(currentView === 'home' || currentView === 'my-posts') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                      {filteredItems.map((item) => (
                        <motion.div
                          layout
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => setSelectedItem(item)}
                          className="group bg-white rounded-3xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300"
                        >
                          <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                            {item.image_urls && item.image_urls.length > 0 ? (
                              <img 
                                src={item.image_urls[0]} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                alt={item.title}
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Camera className="w-12 h-12" />
                              </div>
                            )}
                            <div className="absolute top-4 left-4">
                              <Badge variant={item.type}>{item.type}</Badge>
                            </div>
                            {item.status === 'resolved' && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <div className="bg-blue-700 text-blue-950 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg">
                                  <CheckCircle2 className="w-4 h-4" />
                                  RESOLVED
                                </div>
                              </div>
                            )}
                            {item.status === 'archived' && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <div className="bg-red-900 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg">
                                  <ShieldOff className="w-4 h-4" />
                                  ARCHIVED
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-5 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-bold text-lg line-clamp-1 text-slate-900">{item.title}</h3>
                              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-tighter">{formatDate(item.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-900">
                              <MapPin className="w-4 h-4 text-blue-800" />
                              <span className="line-clamp-1">{item.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-900">
                              <Tag className="w-4 h-4 text-blue-800" />
                              <span>{item.category}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {filteredItems.length === 0 && (currentView === 'home' || currentView === 'my-posts') && (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      <Info className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-lg font-medium">No items found matching your criteria.</p>
                  </div>
                )}

                {/* FAB */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="h-14 px-8 rounded-full shadow-2xl shadow-blue-700/30 text-lg font-bold"
                  >
                    <Plus className="w-6 h-6" />
                    Post Item
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Post Modal */}
    <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
            >
              <div className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-blue-950">Post an Item</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex p-1 bg-slate-100 rounded-2xl">
                    {(['lost', 'found'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                        className={cn(
                          'flex-1 py-3 rounded-xl font-bold capitalize transition-all',
                          formData.type === type ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Photos (Max 5)</label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {formData.image_urls.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group/img">
                            <img src={url} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {uploadingFiles.map((f) => (
                          <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden border border-blue-200 bg-slate-50">
                            <img src={f.preview} className="w-full h-full object-cover opacity-50 grayscale-[50%]" alt="Uploading" />
                            <div className="absolute inset-x-2 bottom-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${f.progress}%` }}
                                className="h-full bg-blue-700"
                              />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-blue-700 animate-spin" />
                            </div>
                          </div>
                        ))}
                        {formData.image_urls.length + uploadingFiles.length < 5 && (
                          <div className="relative aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:border-blue-300 transition-colors cursor-pointer">
                            <input 
                              type="file" 
                              multiple
                              accept="image/*" 
                              onChange={handleImageUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              disabled={isUploading}
                            />
                            <Plus className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                      {(isAnalyzing || isUploading) && (
                        <div className="flex items-center gap-2 text-blue-950 animate-pulse mt-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs font-bold">
                            {isUploading ? 'Uploading to Cloudinary...' : 'Gemini is analyzing...'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Title</label>
                        <Input 
                          placeholder="What did you find/lose?" 
                          required
                          value={formData.title}
                          onChange={(e: any) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Category</label>
                        <select 
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                          required
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        >
                          <option value="" disabled>Select Category</option>
                          {categories.filter(c => c !== 'All').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Description</label>
                      <textarea 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] text-slate-700 text-sm"
                        placeholder="Provide details (color, brand, unique marks)..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                          <Input 
                            className="pl-10"
                            placeholder="Where was it?" 
                            value={formData.location}
                            onChange={(e: any) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                          <Input 
                            type="date"
                            className="pl-10"
                            value={formData.date}
                            onChange={(e: any) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Contact Info</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                        <Input 
                          className="pl-10"
                          placeholder="Phone number or social media handle" 
                          value={formData.contact_info}
                          onChange={(e: any) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", formData.is_anonymous ? "bg-blue-100 text-blue-950" : "bg-slate-200 text-slate-500")}>
                          {formData.is_anonymous ? <Shield className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">Anonymous Post</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hide your identity</div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, is_anonymous: !prev.is_anonymous }))}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-colors duration-300",
                          formData.is_anonymous ? "bg-blue-700" : "bg-slate-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                          formData.is_anonymous ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>

                        <Button type="submit" disabled={isUploading} className="w-full py-4 rounded-2xl text-lg shadow-xl shadow-blue-100">
                          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Listing'}
                        </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left: Image Gallery */}
              <div className="md:w-1/2 bg-slate-100 relative flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                  {selectedItem.image_urls && selectedItem.image_urls.length > 0 ? (
                    <img 
                      src={selectedItem.image_urls[0]} 
                      className="w-full h-full object-cover" 
                      alt={selectedItem.title} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 min-h-[300px]">
                      <Camera className="w-16 h-16" />
                    </div>
                  )}
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-6 left-6 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-900 hover:text-blue-950 transition-colors md:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {selectedItem.image_urls && selectedItem.image_urls.length > 1 && (
                  <div className="p-4 bg-white/50 backdrop-blur-sm flex gap-2 overflow-x-auto">
                    {selectedItem.image_urls.map((url, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                        <img src={url} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Info & Actions */}
              <div className="md:w-1/2 flex flex-col bg-white overflow-hidden">
                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Badge variant={selectedItem.type}>{selectedItem.type}</Badge>
                      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight font-serif">{selectedItem.title}</h2>
                    </div>
                    <button onClick={() => setSelectedItem(null)} className="hidden md:block p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-slate-900">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-800" />
                      </div>
                      <span className="font-semibold text-xs line-clamp-1">{selectedItem.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-900">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-800" />
                      </div>
                      <span className="font-semibold text-xs">{formatDate(selectedItem.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-900">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-blue-800" />
                      </div>
                      <span className="font-semibold text-xs">{selectedItem.category}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-900">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-800" />
                      </div>
                      <span className="font-semibold text-xs">{formatDate(selectedItem.created_at)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {selectedItem.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Posted By</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {selectedItem.is_anonymous ? (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Shield className="w-5 h-5" />
                          </div>
                        ) : selectedItem.author_photo ? (
                          <img src={selectedItem.author_photo} className="w-10 h-10 rounded-full border-2 border-blue-50" alt="Author" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {selectedItem.is_anonymous ? "Anonymous User" : selectedItem.author_name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {selectedItem.is_anonymous ? "Identity Hidden" : "Student"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedItem.status === 'archived' && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                      <ShieldOff className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-red-900">This post is archived</p>
                        <p className="text-xs text-red-700/80 leading-relaxed">
                          This post has been archived by an administrator. It is no longer visible to the public and cannot be modified.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button 
                      onClick={() => window.location.href = `mailto:${selectedItem.contact_info || ''}`}
                      className="rounded-2xl py-3 text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Contact Poster
                    </Button>
                    <Button variant="secondary" className="rounded-2xl py-3 text-sm">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button variant="ghost" className="rounded-2xl py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Flag className="w-4 h-4" />
                      Report
                    </Button>
                    {(selectedItem.author_uid === user?.id || userRole === 'admin') && selectedItem.status === 'active' && (
                      <Button 
                        onClick={() => resolveItem(selectedItem.id)}
                        className="rounded-2xl py-3 text-sm bg-blue-700 text-blue-950 hover:bg-blue-800"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Resolved
                      </Button>
                    )}
                    {userRole === 'admin' && selectedItem.status !== 'archived' && (
                      <Button 
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Are you sure you want to archive this post?')) {
                            archiveItem(selectedItem.id);
                          }
                        }}
                        className="rounded-2xl py-3 text-sm text-red-600 hover:bg-red-50 font-bold col-span-2"
                      >
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Admin: Archive Post
                      </Button>
                    )}
                    {userRole === 'admin' && selectedItem.status === 'archived' && (
                      <Button 
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Are you sure you want to restore this post?')) {
                            resolveItem(selectedItem.id); // Or just set to active
                          }
                        }}
                        className="rounded-2xl py-3 text-sm text-emerald-600 hover:bg-emerald-50 font-bold col-span-2"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Admin: Restore Post
                      </Button>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div className="pt-8 border-t border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Comments & Q&A</h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{comments.length} Comments</span>
                    </div>

                    <form onSubmit={handleAddComment} className="flex gap-3">
                      <img src={user.user_metadata.avatar_url || undefined} className="w-8 h-8 rounded-full" alt="Me" />
                      <div className="flex-1 relative">
                        <Input 
                          placeholder="Ask a question or leave a comment..." 
                          className="text-xs py-2 pr-10"
                          value={commentText}
                          onChange={(e: any) => setCommentText(e.target.value)}
                          disabled={isSubmittingComment}
                        />
                        <button 
                          type="submit"
                          disabled={!commentText.trim() || isSubmittingComment}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-950 hover:text-blue-900 disabled:opacity-30"
                        >
                          {isSubmittingComment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {comment.author_photo ? (
                              <img src={comment.author_photo} className="w-8 h-8 rounded-full shrink-0" alt="" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div className="flex-1 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-tight">{comment.author_name}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{formatDate(comment.created_at)}</span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-400">No comments yet. Be the first to ask!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={cn(
              "fixed bottom-24 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2",
              toast.type === 'success' ? "bg-emerald-500 text-white" : "bg-red-600 text-white"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

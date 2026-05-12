/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { supabase, signInWithGoogle, logout } from './lib/supabase';
import { analyzeItemImage } from './lib/gemini';
import { cn, formatDate } from './lib/utils';
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
  MessageCircle,
  CornerDownRight,
  Shield,
  ShieldOff,
  Phone,
  Mail,
  Trash2,
  Edit2,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import imageCompression from 'browser-image-compression';

import introJs from 'intro.js';
import 'intro.js/introjs.css';

import { Toaster, toast as sonnerToast } from 'sonner';

import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { History as HistoryIcon } from 'lucide-react';
import { ResolvedHistory } from './pages/ResolvedHistory';
import { FilterBar } from './components/FilterBar';
import './styles/resolved-history.css';

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
  parent_id?: string;
}

interface AppNotification {
  id: string;
  type: 'post' | 'comment' | 'report';
  message: string;
  timestamp: string;
  read: boolean;
  itemId?: string;
}

// --- Components ---

const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-blue-700 text-blue-950 hover:bg-blue-600',
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
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState<React.ReactNode | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('app_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('app_items', JSON.stringify(items));
  }, [items]);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const [activeCategories, setActiveCategories] = useState<string[]>(['All']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [comments, setComments] = useState<ItemComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [showAuthorContactModal, setShowAuthorContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommentReportModal, setShowCommentReportModal] = useState(false);
  const [reportingComment, setReportingComment] = useState<ItemComment | null>(null);
  const [commentReportReason, setCommentReportReason] = useState('');
  const [isSubmittingCommentReport, setIsSubmittingCommentReport] = useState(false);
  const [reportedCommentIds, setReportedCommentIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('reported_comment_ids');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [commentReports, setCommentReports] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ label: string; description: string; onConfirm: () => void } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportedItemIds, setReportedItemIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('reported_item_ids');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [activeCommentMenuId, setActiveCommentMenuId] = useState<string | null>(null);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const itemsRef = useRef<Item[]>([]);
  const commentsRef = useRef<ItemComment[]>([]);
  const userRef = useRef<any>(null);
  const tourInstance = useRef<any>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string, preview: string, progress: number }[]>([]);
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'super_admin'>('user');
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'my-posts' | 'notifications' | 'profile' | 'admin' | 'resolved'>('home');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrentView('home');
    else if (path === '/my-posts') setCurrentView('my-posts');
    else if (path === '/notifications') setCurrentView('notifications');
    else if (path === '/profile') setCurrentView('profile');
    else if (path === '/admin') setCurrentView('admin');
    else if (path === '/resolved') setCurrentView('resolved');
  }, [location.pathname]);

  const handleNavClick = (view: typeof currentView) => {
    setCurrentView(view);
    if (view === 'home') navigate('/');
    else navigate(`/${view}`);
  };

  // Real-time comments listener
  useEffect(() => {
    // Only subscribe if we have Supabase credentials
    if ((import.meta as any).env.VITE_SUPABASE_URL === 'https://your-project-url.supabase.co') return;

    const channel = supabase
      .channel('realtime_comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        (payload: any) => {
          console.log("Realtime comment event:", payload.eventType, payload.new);
          if (payload.eventType === 'INSERT') {
            const newComment = payload.new as ItemComment;
            
            // 1. Update current item's comments if it's the one being viewed
            setSelectedItem(currentSelected => {
              if (currentSelected && newComment.item_id === currentSelected.id) {
                setComments(prev => {
                  if (prev.some(c => c.id === newComment.id)) return prev;
                  return [...prev, newComment];
                });
              }
              return currentSelected;
            });

            // 2. Show a pop-up notification
            // Use refs to avoid stale closure issues in the subscription
            const currentItems = itemsRef.current;
            const currentComments = commentsRef.current;
            const currentUser = userRef.current;
            
            if (currentUser?.id && newComment.author_uid !== currentUser.id) {
              const targetItem = currentItems.find(i => i.id === newComment.item_id);

              // Case A: Someone replied to a comment — only notify the parent comment's author
              if (newComment.parent_id) {
                // First check in-memory comments (fast path)
                const parentInMemory = currentComments.find(c => c.id === newComment.parent_id);
                if (parentInMemory) {
                  if (parentInMemory.author_uid === currentUser.id) {
                    sonnerToast.info(`${newComment.author_name} replied to your comment`, {
                      description: newComment.content.length > 60
                        ? newComment.content.substring(0, 60) + '...'
                        : newComment.content,
                      action: {
                        label: 'View',
                        onClick: () => {
                          setSelectedItem(targetItem || null);
                          setCurrentView('home');
                          navigate('/');
                        }
                      }
                    });
                    addNotification('comment', `${newComment.author_name} replied to your comment: "${newComment.content.substring(0, 30)}..."`, newComment.item_id);
                  }
                  // Parent found in memory — stop here regardless of ownership
                  return;
                }

                // Parent not in memory (e.g. Person B has item open but comment not loaded):
                // fetch from Supabase to check ownership before deciding to notify
                supabase
                  .from('comments')
                  .select('author_uid')
                  .eq('id', newComment.parent_id)
                  .single()
                  .then(({ data: parentData }) => {
                    if (parentData && parentData.author_uid === currentUser.id) {
                      sonnerToast.info(`${newComment.author_name} replied to your comment`, {
                        description: newComment.content.length > 60
                          ? newComment.content.substring(0, 60) + '...'
                          : newComment.content,
                        action: {
                          label: 'View',
                          onClick: () => {
                            setSelectedItem(targetItem || null);
                            setCurrentView('home');
                            navigate('/');
                          }
                        }
                      });
                      addNotification('comment', `${newComment.author_name} replied to your comment: "${newComment.content.substring(0, 30)}..."`, newComment.item_id);
                    }
                    // If parent belongs to someone else, do nothing — not our notification to show
                  });
                return; // Don't fall through to Case B for replies
              }

              // Case B: Top-level comment on YOUR post — only notify the post author
              if (targetItem && targetItem.author_uid === currentUser.id) {
                sonnerToast.info(`New comment from ${newComment.author_name}`, {
                  description: newComment.content.length > 60
                    ? newComment.content.substring(0, 60) + '...'
                    : newComment.content,
                  action: {
                    label: 'View',
                    onClick: () => {
                      setSelectedItem(targetItem);
                      setCurrentView('home');
                      navigate('/');
                    }
                  }
                });
                addNotification('comment', `${newComment.author_name} commented on your post "${targetItem.title}": "${newComment.content.substring(0, 30)}..."`, newComment.item_id);
              }
              // If neither case matches, this user has no relation to the comment — do nothing
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedComment = payload.new as ItemComment;
            setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
          } else if (payload.eventType === 'DELETE') {
            const deletedCommentId = payload.old.id;
            setComments(prev => prev.filter(c => c.id !== deletedCommentId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const [myPostsFilter, setMyPostsFilter] = useState<'all' | 'lost' | 'found' | 'resolved' | 'archived'>('all');
  const [adminFilter, setAdminFilter] = useState<'all' | 'active' | 'resolved' | 'archived'>('all');
  const [reports, setReports] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<'posts' | 'reports' | 'comment-reports' | 'users'>('posts');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchAllUsers = async () => {
    if (userRole !== 'super_admin') return;
    setUsersLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setAllUsers(data);
    setUsersLoading(false);
  };

  useEffect(() => {
    if (userRole === 'super_admin') fetchAllUsers();
  }, [userRole]);

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      sonnerToast.success(`User role updated to ${newRole}`);
    } else {
      sonnerToast.error('Failed to update role.');
    }
  };

  const toggleUserDisabled = async (userId: string, currentlyDisabled: boolean) => {
    const { error } = await supabase.from('users').update({ is_disabled: !currentlyDisabled }).eq('id', userId);
    if (!error) {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, is_disabled: !currentlyDisabled } : u));
      sonnerToast.success(currentlyDisabled ? 'User re-enabled.' : 'User disabled.');
    } else {
      sonnerToast.error('Failed to update user.');
    }
  };

  // Fetch comment reports for admin
  const fetchCommentReports = async () => {
    if (userRole !== 'admin' && userRole !== 'super_admin') return;
    const { data, error } = await supabase
      .from('comment_reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCommentReports(data);
    else if (error) console.error('fetchCommentReports error:', error);
  };

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'super_admin') return;
    fetchCommentReports();

    const commentReportsChannel = supabase
      .channel('admin_comment_reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_reports' }, async () => {
        await fetchCommentReports();
      })
      .subscribe();

    return () => { supabase.removeChannel(commentReportsChannel); };
  }, [userRole]);

  // Fetch reports for admin — always re-fetch fresh from DB
  const fetchReports = async () => {
    if (userRole !== 'admin' && userRole !== 'super_admin') return;
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setReports(data);
    } else if (error) {
      console.error('fetchReports error:', error);
    }
  };

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'super_admin') return;

    fetchReports();

    const reportsChannel = supabase
      .channel(`admin_reports_${userRole}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, async (payload: any) => {
        // Always re-fetch from DB on any change to ensure consistency
        await fetchReports();

        // Only show toast for new reports
        if (payload.eventType === 'INSERT') {
          const report = payload.new;
          sonnerToast.warning(`New report from ${report.reporter_name}`, {
            description: `"${report.item_title}" — ${report.reason}`,
            action: {
              label: 'View',
              onClick: () => {
                setAdminTab('reports');
                setCurrentView('admin');
                navigate('/admin');
              }
            }
          });
          addNotification('report', `${report.reporter_name} reported "${report.item_title}": ${report.reason}`);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(reportsChannel); };
  }, [userRole, navigate]);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load notifications from user-scoped key when user logs in/out
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`app_notifications_${user.id}`);
      setNotifications(saved ? JSON.parse(saved) : []);
    } else {
      setNotifications([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`app_notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

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

  // --- Tour Logic ---
  const startTour = async () => {
    if (isTourActive || !user || currentView !== 'home' || loading || hasSeenTour === true) return;

    // Small delay to ensure UI is settled
    setTimeout(() => {
      // Final check for active tour or overlay or if we already finished
      if (isTourActive || document.querySelector('.introjs-overlay')) return;

      setIsTourActive(true);
      const intro = introJs();
      tourInstance.current = intro;

      intro.setOptions({
        steps: [
          {
            element: '#tour-search',
            intro: 'Search for lost or found items by name, category, or location',
            position: 'bottom'
          },
          {
            element: '#tour-toggle',
            intro: 'Filter posts by status — All, Lost, or Found',
            position: 'bottom'
          },
          {
            element: '#tour-filters',
            intro: 'Filter by category to find specific items faster',
            position: 'bottom'
          },
          {
            element: '#tour-post-card',
            intro: 'Click a post to view full details and comments',
            position: 'top'
          },
          {
            element: '#tour-comments',
            intro: 'Leave a comment to help or claim an item',
            position: 'top'
          },
          {
            element: '#tour-add-button',
            intro: 'Found or lost something? Report it here',
            position: 'top'
          }
        ],
        showButtons: true,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        exitOnEsc: false,
        doneLabel: 'Finish',
        nextLabel: 'Next',
        prevLabel: 'Back',
        overlayOpacity: 0.8
      });

      // Insert custom Skip button into IntroJS buttons
      intro.onbeforechange(function(this: any) {
        // CLEANUP: Force remove any lingering tooltips to ensure ONLY ONE IS VISIBLE
        const tooltips = document.querySelectorAll('.introjs-tooltip');
        if (tooltips.length > 1) {
          // Remove all but the last one (introjs should be creating a new one)
          for (let i = 0; i < tooltips.length - 1; i++) {
            tooltips[i].remove();
          }
        }

        // Clean up any existing skip buttons before moving to next step to avoid duplicates
        document.querySelectorAll('.tour-skip-btn').forEach(btn => btn.remove());

        const step = this._currentStep;
        
        // Auto-open detailed view for step 5 (comments)
        if (step === 4) { // Step index 4 is the 5th step (comments)
          if (!selectedItem && filteredItems.length > 0) {
            setSelectedItem(filteredItems[0]);
          }
        }

        // Add Skip button if not present
        setTimeout(() => {
          const tooltipButtons = document.querySelector('.introjs-tooltipbuttons');
          if (tooltipButtons && !document.querySelector('.tour-skip-btn')) {
            const skipBtn = document.createElement('button');
            // Using extremely high z-index and ensuring it's not hidden
            skipBtn.className = 'tour-skip-btn introjs-button !bg-red-50 !text-red-600 !border-red-100 !mr-auto !relative !z-[10000001] pointer-events-auto';
            skipBtn.innerHTML = 'Skip';
            skipBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSkipModal(true);
            };
            tooltipButtons.prepend(skipBtn);
          }
        }, 50);

        return true;
      });

      const markTourAsSeen = async () => {
        setHasSeenTour(true);
        localStorage.setItem('hasSeenTour', 'true');
        try {
          await supabase.from('users').update({ has_seen_tour: true }).eq('id', user.id);
        } catch (e) {
          console.error("Failed to update user tour status", e);
        }
      };

      intro.oncomplete(async () => {
        setIsTourActive(false);
        await markTourAsSeen();
        setSelectedItem(null);
      });

      intro.onexit(() => {
        setIsTourActive(false);
      });

      intro.start();
    }, 1000);
  };

  useEffect(() => {
    if (user && currentView === 'home' && !loading && hasSeenTour === false) {
      startTour();
    }
    return () => {
      if (tourInstance.current) {
        tourInstance.current.exit(true);
      }
    };
  }, [user, currentView, loading, hasSeenTour]);

  const handlePermanentSkip = async () => {
    setShowSkipModal(false);
    setIsTourActive(false);
    setHasSeenTour(true);
    localStorage.setItem('hasSeenTour', 'true');
    
    try {
      await supabase.from('users').update({ has_seen_tour: true }).eq('id', user.id);
    } catch (e) {
      console.error("Failed to update user tour status on skip", e);
    }
    
    if (tourInstance.current) {
      tourInstance.current.exit(true);
    }
    setSelectedItem(null);
  };

  const handleContinueTour = () => {
    setShowSkipModal(false);
  };

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
      setActiveImageIndex(0);
      fetchComments(selectedItem.id);
    } else {
      setComments([]);
      setCommentText('');
    }
  }, [selectedItem?.id]);

  // Keep selectedItem in sync when items list updates (e.g. admin archives post)
  useEffect(() => {
    if (selectedItem) {
      const updatedItem = items.find(i => i.id === selectedItem.id);
      if (updatedItem && updatedItem.status !== selectedItem.status) {
        setSelectedItem(updatedItem);
      }
    }
  }, [items]);

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

    // STRONGER CHECK - Double-check archived status first
    if (selectedItem?.status === 'archived') {
      showToast('Cannot comment on archived posts', 'error');
      console.log("Comment blocked - post is archived");
      return;
    }

    const cleanComment = commentText.trim();
    console.log("handleAddComment called", { user: !!user, selectedItem: selectedItem?.id, cleanComment, isSubmittingComment, status: selectedItem?.status });
    if (!user || !selectedItem || !cleanComment || isSubmittingComment) {
      console.log("handleAddComment blocked", { user: !!user, selectedItem: selectedItem?.id, cleanComment: !!cleanComment, isSubmittingComment });
      return;
    }

    // 1. Create the optimistic comment object
    const commentId = Math.random().toString(36).substring(7);
    const optimisticComment: ItemComment = {
      id: commentId,
      item_id: selectedItem.id,
      author_uid: user.id,
      author_name: user.user_metadata.full_name || user.email,
      author_photo: user.user_metadata.avatar_url,
      content: cleanComment,
      created_at: new Date().toISOString(),
      parent_id: replyToId || undefined
    };

    // 2. Update UI INSTANTLY (but don't save to localStorage yet)
    setComments(prev => [...prev, optimisticComment]);
    setCommentText('');
    setReplyToId(null);
    
    // 3. Handle background sync
    setIsSubmittingComment(true);
    try {
      // ADD AN EXTRA CHECK before sending to Supabase
      if (selectedItem.status === 'archived') {
        // Remove the optimistic comment
        setComments(prev => prev.filter(c => c.id !== commentId));
        showToast('Cannot comment on archived posts', 'error');
        setIsSubmittingComment(false);
        return;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          item_id: optimisticComment.item_id,
          author_uid: optimisticComment.author_uid,
          author_name: optimisticComment.author_name,
          author_photo: optimisticComment.author_photo,
          content: optimisticComment.content,
          created_at: optimisticComment.created_at,
          parent_id: optimisticComment.parent_id
        })
        .select()
        .single();
      
      if (error) {
        console.log("Supabase insert error:", error);
        // Remove the optimistic comment from UI
        setComments(prev => prev.filter(c => c.id !== commentId));

        // Show appropriate error message
        if (error.message.includes("violates row-level security policy") ||
            error.message.includes("new row violates row-level security policy")) {
          showToast('Cannot comment on archived posts', 'error');
        } else if (error.message.includes("Could not find the table")) {
          showToast('Comment saved locally (Database not available)', 'success');
          // For offline mode, save to localStorage
          const currentLocal = JSON.parse(localStorage.getItem(`comments_${selectedItem.id}`) || '[]');
          localStorage.setItem(`comments_${selectedItem.id}`, JSON.stringify([...currentLocal, optimisticComment]));
          // Restore the comment in UI for offline mode
          setComments(prev => [...prev, optimisticComment]);
        } else {
          console.error("Supabase sync error:", error);
          showToast('Failed to save comment', 'error');
        }
      } else if (data) {
        // Replace optimistic ID with real database ID
        const realComment = data as ItemComment;
        setComments(prev => prev.map(c => c.id === commentId ? realComment : c));

        // Save to localStorage only after successful database insertion
        const currentLocal = JSON.parse(localStorage.getItem(`comments_${selectedItem.id}`) || '[]');
        localStorage.setItem(`comments_${selectedItem.id}`, JSON.stringify([...currentLocal, realComment]));
      }
    } catch (err: any) {
      console.error("Background sync catch error:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!user || !editingCommentText.trim() || isUpdatingComment || !selectedItem || selectedItem.status === 'archived') return;

    // Optimistic update
    const previousComments = [...comments];
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editingCommentText } : c));
    setEditingCommentId(null);
    setIsUpdatingComment(true);

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editingCommentText })
        .eq('id', commentId);

      if (error) {
        setComments(previousComments);
        const isPermissionError = error.message.toLowerCase().includes("security policy") ||
                                 error.message.toLowerCase().includes("not found") ||
                                 error.message.toLowerCase().includes("permission denied");

        if (isPermissionError) {
          showToast('Cannot modify comments on archived posts', 'error');
        } else {
          showToast('Failed to update comment', 'error');
        }
      } else {
        showToast('Comment updated', 'success');
        // Update local storage
        if (selectedItem) {
          localStorage.setItem(`comments_${selectedItem.id}`, JSON.stringify(
            previousComments.map(c => c.id === commentId ? { ...c, content: editingCommentText } : c)
          ));
        }
      }
    } catch (err) {
      console.error("Update comment error:", err);
      setComments(previousComments);
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string, fromAdmin = false) => {
    if (!user) return;
    
    // If called from post modal, block deletion on archived posts (unless admin)
    if (!fromAdmin && selectedItem && selectedItem.status === 'archived') return;

    // Optimistic delete — remove the comment and all its replies from the current view
    const previousComments = [...comments];
    setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));

    try {
      const { data: deleted, error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .select('id');

      if (error) {
        setComments(previousComments);
        console.error('Delete comment error:', error);
        showToast('Failed to delete comment: ' + error.message, 'error');
      } else if (!deleted || deleted.length === 0) {
        // RLS silently blocked the delete — roll back the optimistic update
        setComments(previousComments);
        showToast('You do not have permission to delete this comment.', 'error');
      } else {
        showToast('Comment deleted', 'success');
        if (selectedItem) {
          localStorage.setItem(`comments_${selectedItem.id}`, JSON.stringify(
            previousComments.filter(c => c.id !== commentId && c.parent_id !== commentId)
          ));
        }
      }
    } catch (err) {
      console.error("Delete comment error:", err);
      setComments(previousComments);
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
    // Force session recovery if hash is present (handles cases where Supabase auto-detect might miss it)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          // Clean up the URL hash but keep the current state
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
    }

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
      if (!user) return;
      
      const isAdminEmail = user.email === 'angellyn.tolentino@neu.edu.ph';
      const isSuperAdminEmail = user.email === 'angellyn.tolentino@neu.edu.ph';
      
      try {
        const { data: profile, error: fetchError } = await supabase
          .from('users')
          .select('role, has_seen_tour')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error("Error fetching user profile:", fetchError);
        }

        const roleToSet = isSuperAdminEmail && !profile?.role ? 'super_admin' : (profile?.role || (isAdminEmail ? 'admin' : 'user'));
        setUserRole(roleToSet as 'user' | 'admin' | 'super_admin');
        
        // Use the profile's has_seen_tour value if it exists, otherwise default to false
        const seenTour = profile ? profile.has_seen_tour : false;
        setHasSeenTour(seenTour);

        const { error: upsertError } = await supabase.from('users').upsert({
          id: user.id,
          display_name: user.user_metadata.full_name || user.email,
          email: user.email,
          avatar_url: user.user_metadata.avatar_url,
          role: roleToSet,
          // We include has_seen_tour so it doesn't get wiped if we upsert
          has_seen_tour: seenTour
        });
        
        if (upsertError) console.error("Error syncing user:", upsertError);
      } catch (err) {
        console.error("Sync user catch block:", err);
      }
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

  // Realtime listener — updates role instantly when super admin changes it
  useEffect(() => {
    if (!user) return;

    const roleChannel = supabase
      .channel('realtime_user_role')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload: any) => {
          const newRole = payload.new.role as 'user' | 'admin' | 'super_admin';
          if (newRole && newRole !== userRole) {
            setUserRole(newRole);
            if (newRole === 'super_admin') {
              sonnerToast.success('You have been promoted to Super Admin!');
            } else if (newRole === 'admin') {
              sonnerToast.success('You have been promoted to Admin!');
            } else if (newRole === 'user') {
              sonnerToast.info('Your role has been updated to User.');
              setCurrentView('home');
              navigate('/');
            }

            // If disabled, log them out
            if (payload.new.is_disabled) {
              sonnerToast.error('Your account has been disabled.');
              setTimeout(() => logout(), 2000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roleChannel);
    };
  }, [user, userRole, navigate]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      showToast('Cloudinary config missing. Please check your secrets.', 'error');
      return;
    }

    // Validate file sizes — videos max 50MB, images max 10MB
    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast(`${file.name} is too large. Max size: ${isVideo ? '50MB' : '10MB'}`, 'error');
        return;
      }
    }

    const newUploadingFiles = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      preview: file.type.startsWith('video/') ? '' : URL.createObjectURL(file),
      progress: 0,
      isVideo: file.type.startsWith('video/')
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
        const isVideo = file.type.startsWith('video/');
        
        try {
          let fileToUpload: File | Blob = file;

          // Only compress images
          if (!isVideo) {
            fileToUpload = await imageCompression(file, compressionOptions);
          }
          
          setUploadingFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress: 30 } : f
          ));

          const uploadFormData = new FormData();
          uploadFormData.append('file', fileToUpload);
          uploadFormData.append('upload_preset', uploadPreset);

          const resourceType = isVideo ? 'video' : 'image';
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            {
              method: 'POST',
              body: uploadFormData,
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

  const updateItem = async (itemId: string, updatedData: any) => {
    try {
      setIsUpdatingPost(true);
      const { error } = await supabase
        .from('items')
        .update(updatedData)
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updatedData } : item));
      setSelectedItem(prev => prev ? { ...prev, ...updatedData } : prev);
      setShowEditModal(false);
      sonnerToast.success('Post updated successfully!');
    } catch (err) {
      sonnerToast.error('Failed to update post.');
      console.error('Update post error:', err);
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategories.includes('All') || activeCategories.includes(item.category);

    if (currentView === 'my-posts') {
      const isMine = item.author_uid === user?.id;
      const matchesMyFilter = 
        myPostsFilter === 'all' ? item.status !== 'archived' :
        myPostsFilter === 'resolved' ? item.status === 'resolved' :
        myPostsFilter === 'archived' ? item.status === 'archived' :
        item.type === myPostsFilter && item.status !== 'archived';
      return matchesSearch && isMine && matchesMyFilter && matchesCategory;
    }
    
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab && matchesCategory && item.status !== 'archived' && item.status !== 'resolved';
  });

  const handleGoogleSignIn = async () => {
    setSignInError(null);
    setIsSigningIn(true);
    
    // Set a safety timeout - reduced to 30s as the redirect should be fast
    const timeout = setTimeout(() => setIsSigningIn(false), 30000);
    
    try {
      console.log("Starting Google sign-in process...");
      const { error } = await signInWithGoogle();
      if (error) {
        throw error;
      }
      console.log("Supabase OAuth call successful, redirecting...");
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      // More descriptive error handling
      let msg = "Failed to initiate sign-in with Google.";
      if (err.message?.includes("provider not enabled")) {
        msg = "Google Sign-in is not enabled in your Supabase dashboard.";
      } else if (err.message) {
        msg = `Sign-in error: ${err.message}`;
      }
      setSignInError(msg);
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
            <Loader2 className="w-10 h-10 text-blue-700 animate-spin" aria-hidden="true" />
            <p className="text-slate-600 font-medium animate-pulse">Initializing NEU Found Hub...</p>
          </div>
        </motion.div>
      ) : !user ? (
        <motion.div 
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-slate-950 overflow-hidden relative"
        >
          {/* Background Image with Dark Overlay */}
          <div 
            className="absolute inset-0 z-0 scale-105"
            style={{ 
              backgroundImage: 'url("/NEU.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Gradient overlay for depth and darkening */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 w-full max-w-md px-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] flex flex-col items-center space-y-8"
            >
              {/* Branding Section */}
              <div className="flex flex-col items-center text-center space-y-6 w-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full scale-125" />
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden border border-white/20 transition-transform hover:scale-105 duration-500">
                    <img 
                      src="https://neu.edu.ph/main/assets/images/webp/neulogo.webp" 
                      alt="NEU Logo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                
                <div className="space-y-3 w-full">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-serif leading-none drop-shadow-lg whitespace-nowrap">
                    NEU Found Hub
                  </h1>
                  <p className="hidden md:block text-slate-300/80 font-medium max-w-[280px] mx-auto text-center text-xs leading-relaxed">
                    Connecting Eagles to their lost belongings through a smart community platform.
                  </p>
                </div>
              </div>

              {/* Auth Section */}
              <div className="w-full max-w-[280px] space-y-6">
                <div className="space-y-4">
                  <Button 
                    onClick={handleGoogleSignIn} 
                    disabled={isSigningIn}
                    className="w-full py-4 text-sm md:text-base rounded-full shadow-xl shadow-blue-900/40 bg-blue-600 text-white hover:bg-blue-500 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 border-none"
                    id="google-signin-btn"
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-bold">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <div className="bg-white p-1 rounded-full w-7 h-7 flex items-center justify-center shadow-sm">
                          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-full h-full" alt="Google" />
                        </div>
                        <span className="font-bold">Sign in with Google</span>
                      </>
                    )}
                  </Button>
                  
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] text-center">
                    Use @neu.edu.ph account
                  </p>
                </div>

                {signInError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-950/40 backdrop-blur-md border border-red-500/20 rounded-xl text-red-200 text-[10px] font-medium flex gap-2 items-center shadow-lg"
                  >
                    <Info className="w-4 h-4 shrink-0 text-red-400" />
                    <p>{signInError}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Footer Branding - subtle */}
          <div className="absolute bottom-8 text-slate-500 text-[10px] font-bold tracking-[0.25em] uppercase text-center w-full">
            New Era University • digital hub
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
          <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-950" />
                </div>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-blue-900 font-serif">NEU Found Hub</span>
              </div>

              <nav className="hidden md:flex items-center gap-8">
                {([
                  { id: 'home', label: 'Home' },
                  { id: 'resolved', label: 'Resolved' },
                  { id: 'my-posts', label: 'My Post' },
                  { id: 'notifications', label: 'Notification' },
                  { id: 'profile', label: 'Profile' }
                ] as const).map(view => (
                  <button 
                    key={view.id}
                    onClick={() => handleNavClick(view.id)}
                    aria-current={currentView === view.id ? "page" : undefined}
                    className={cn(
                      "text-sm font-bold transition-all relative py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-md px-1", 
                      currentView === view.id ? "text-blue-900" : "text-slate-600 hover:text-blue-700"
                    )}
                  >
                    {view.label}
                    {view.id === 'notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                    {currentView === view.id && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-700 rounded-full"
                      />
                    )}
                  </button>
                ))}
                {(userRole === 'admin' || userRole === 'super_admin') && (
                  <button 
                    onClick={() => setCurrentView('admin')}
                    className={cn("text-sm font-bold transition-colors flex items-center gap-1.5", currentView === 'admin' ? "text-red-600" : "text-slate-500 hover:text-red-600")}
                  >
                    <Shield className="w-4 h-4" />
                    {userRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </button>
                )}
              </nav>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                  <img src={user.user_metadata.avatar_url || undefined} className="w-6 h-6 rounded-full" alt="Profile" />
                  <span className="text-sm font-semibold text-slate-700">{user.user_metadata.full_name || user.email}</span>
                </div>
                <Button variant="ghost" onClick={logout} aria-label="Log out" className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:ring-2 focus:ring-red-500 outline-none">
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </header>

          {/* Mobile Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 md:hidden z-50 px-2 pb-safe-area-inset-bottom shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between h-16">
              {[
                { id: 'home', icon: Home, label: 'Home' },
                { id: 'resolved', icon: HistoryIcon, label: 'Resolved' },
                { id: 'my-posts', icon: HistoryIcon, label: 'My Post' },
                { id: 'notifications', icon: Bell, label: 'Notification' },
                { id: 'profile', icon: User, label: 'Profile' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id as any)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-1 transition-all relative",
                    currentView === id ? "text-blue-700" : "text-slate-400"
                  )}
                >
                  <div className="relative">
                    <Icon className={cn("w-6 h-6 transition-transform", currentView === id && "scale-110")} />
                    {id === 'notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={cn("text-[10px] font-bold mt-1 transition-all", currentView === id ? "opacity-100" : "opacity-70")}>{label}</span>
                  {currentView === id && (
                    <motion.div 
                      layoutId="activeBottomNav"
                      className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-blue-700 rounded-full"
                    />
                  )}
                </button>
              ))}
              {(userRole === 'admin' || userRole === 'super_admin') && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-1 transition-all",
                    currentView === 'admin' ? "text-red-600" : "text-slate-400"
                  )}
                >
                  <Shield className="w-6 h-6" />
                  <span className="text-[10px] font-bold mt-1">{userRole === 'super_admin' ? 'S.Admin' : 'Admin'}</span>
                </button>
              )}
            </div>
          </nav>

          {currentView === 'home' && (
            <FilterBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeCategories={activeCategories}
              setActiveCategories={setActiveCategories}
              categories={categories}
            />
          )}

          <main className="max-w-6xl mx-auto px-6 py-8">
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
                    {/* Content */}
                  </div>
                )}

                {currentView === 'my-posts' && (
                  <div className="space-y-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <h2 className="text-4xl font-extrabold text-slate-900 font-serif">My Posts</h2>
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex flex-wrap justify-center gap-2">
                          {(['all', 'lost', 'found', 'resolved', 'archived'] as const).map(tab => (
                            <button
                              key={tab}
                              onClick={() => setMyPostsFilter(tab)}
                              className={cn(
                                'px-8 py-2 rounded-2xl font-bold capitalize transition-all text-sm tracking-wide flex items-center gap-1.5',
                                tab === 'archived'
                                  ? myPostsFilter === 'archived'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                    : 'bg-white text-red-500 border border-red-200 hover:bg-red-50'
                                  : myPostsFilter === tab
                                    ? 'bg-blue-700 text-blue-950 shadow-lg shadow-blue-200 hover:bg-blue-600'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                              )}
                            >
                              {tab === 'archived' && <ShieldOff className="w-3.5 h-3.5" />}
                              {tab}
                              {tab === 'archived' && (
                                <span className={cn(
                                  'text-[9px] font-black px-1.5 py-0.5 rounded-full',
                                  myPostsFilter === 'archived' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                                )}>
                                  {items.filter(i => i.author_uid === user?.id && i.status === 'archived').length}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => {
                                if (cat === 'All') {
                                  setActiveCategories(['All']);
                                  return;
                                }
                                const next = activeCategories.includes(cat)
                                  ? activeCategories.filter(c => c !== cat)
                                  : [...activeCategories.filter(c => c !== 'All'), cat];
                                setActiveCategories(next.length === 0 ? ['All'] : next);
                              }}
                              className={cn(
                                'px-4 py-1.5 rounded-full text-xs font-bold transition-all border',
                                activeCategories.includes(cat)
                                  ? 'bg-blue-700 text-white border-blue-700 shadow-md transform scale-105 z-10'
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

                {currentView === 'resolved' && (
                  <ResolvedHistory user={user} />
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

                {currentView === 'admin' && (userRole === 'admin' || userRole === 'super_admin') && (
                  <div className="space-y-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-lg shadow-red-100">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h2 className="text-4xl font-extrabold text-slate-900 font-serif">Admin Dashboard</h2>
                      <p className="text-slate-500 max-w-md">Manage all posts across the platform. You can resolve or archive any item.</p>

                      {/* Admin Tab Switcher */}
                      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                        <button
                          onClick={() => setAdminTab('posts')}
                          className={cn('flex-1 px-6 py-2.5 rounded-xl font-bold text-sm transition-all', adminTab === 'posts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                        >
                          Posts
                        </button>
                        <button
                          onClick={() => setAdminTab('reports')}
                          className={cn('flex-1 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2', adminTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                        >
                          Reports
                          {reports.length > 0 && (
                            <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-full', adminTab === 'reports' ? 'bg-red-100 text-red-600' : 'bg-red-500 text-white')}>
                              {reports.length}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => { setAdminTab('comment-reports'); fetchCommentReports(); }}
                          className={cn('flex-1 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2', adminTab === 'comment-reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                        >
                          Comments
                          {commentReports.filter(r => !r.is_resolved).length > 0 && (
                            <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-full', adminTab === 'comment-reports' ? 'bg-red-100 text-red-600' : 'bg-red-500 text-white')}>
                              {commentReports.filter(r => !r.is_resolved).length}
                            </span>
                          )}
                        </button>
                        {userRole === 'super_admin' && (
                          <button
                            onClick={() => { setAdminTab('users'); fetchAllUsers(); }}
                            className={cn('flex-1 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2', adminTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                          >
                            Users
                            <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-full', adminTab === 'users' ? 'bg-blue-100 text-blue-600' : 'bg-slate-300 text-slate-600')}>
                              {allUsers.length}
                            </span>
                          </button>
                        )}
                      </div>

                      {adminTab === 'posts' && (
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
                      )}
                    </div>

                    {/* Reports Tab */}
                    {adminTab === 'reports' && (
                      <div className="space-y-4">
                        {/* Filter tabs for reports */}
                        <div className="flex items-center justify-between">
                        <button
                          onClick={fetchReports}
                          className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl transition-colors"
                        >
                          <Loader2 className="w-3 h-3" />
                          Refresh
                        </button>
                        </div>
                        <div className="flex gap-2">
                          {(['all', 'pending', 'resolved'] as const).map(tab => (
                            <button
                              key={tab}
                              onClick={() => setReportFilter(tab)}
                              className={cn(
                                'px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all border',
                                reportFilter === tab
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                              )}
                            >
                              {tab}
                              <span className="ml-1.5 text-[9px]">
                                ({tab === 'all' ? reports.length : tab === 'pending' ? reports.filter(r => !r.is_resolved).length : reports.filter(r => r.is_resolved).length})
                              </span>
                            </button>
                          ))}
                        </div>

                        {reports.filter(r => reportFilter === 'all' ? true : reportFilter === 'pending' ? !r.is_resolved : r.is_resolved).length === 0 ? (
                          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
                            <Flag className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">No reports here.</p>
                          </div>
                        ) : (
                          reports
                            .filter(r => reportFilter === 'all' ? true : reportFilter === 'pending' ? !r.is_resolved : r.is_resolved)
                            .map(report => (
                            <div key={report.id} className={cn("bg-white rounded-2xl border p-5 shadow-sm space-y-3 transition-all", report.is_resolved ? "border-emerald-100 opacity-60" : "border-slate-100")}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-slate-900 text-sm">{report.item_title}</p>
                                    {report.is_resolved && (
                                      <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wide flex items-center gap-1">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full inline-block">{report.reason}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight whitespace-nowrap">{formatDate(report.created_at)}</span>
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500">Reported by <span className="font-bold text-slate-700">{report.reporter_name}</span></p>
                                  {report.is_resolved && report.resolved_by && (
                                    <p className="text-xs text-emerald-600">Resolved by <span className="font-bold">{report.resolved_by}</span>{report.resolved_at ? ` • ${formatDate(report.resolved_at)}` : ''}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      const item = items.find(i => i.id === report.item_id);
                                      if (item) { setSelectedItem(item); setAdminTab('posts'); }
                                      else sonnerToast.error('Post not found.');
                                    }}
                                    className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl transition-colors border border-slate-200"
                                  >
                                    View Post
                                  </button>
                                  {!report.is_resolved ? (
                                    <button
                                      onClick={async () => {
                                        const { error } = await supabase.from('reports').update({ is_resolved: true }).eq('id', report.id);
                                        if (!error) {
                                          setReports(prev => prev.map(r => r.id === report.id ? { ...r, is_resolved: true } : r));
                                          sonnerToast.success('Report marked as resolved.');
                                        }
                                      }}
                                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl transition-colors border border-emerald-200"
                                    >
                                      Mark Resolved
                                    </button>
                                  ) : (
                                    <button
                                      onClick={async () => {
                                        const { error } = await supabase.from('reports').update({ is_resolved: false, resolved_by: null, resolved_at: null }).eq('id', report.id);
                                        if (!error) {
                                          setReports(prev => prev.map(r => r.id === report.id ? { ...r, is_resolved: false, resolved_by: null, resolved_at: null } : r));
                                          sonnerToast.info('Report reopened.');
                                        }
                                      }}
                                      className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl transition-colors border border-slate-200"
                                    >
                                      Reopen
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Comment Reports Tab */}
                    {adminTab === 'comment-reports' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-500">Reported comments from users. Review and delete if necessary.</p>
                          <button onClick={fetchCommentReports} className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl transition-colors">
                            <Loader2 className="w-3 h-3" />
                            Refresh
                          </button>
                        </div>
                        {commentReports.length === 0 ? (
                          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
                            <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">No comment reports yet.</p>
                          </div>
                        ) : (
                          commentReports.map(cr => (
                            <div key={cr.id} className={cn("bg-white rounded-2xl border p-5 shadow-sm space-y-3", cr.is_resolved ? "border-emerald-100 opacity-60" : "border-slate-100")}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">On post: {cr.item_title}</p>
                                    {cr.is_resolved && <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full uppercase flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Resolved</span>}
                                  </div>
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-700 italic">"{cr.comment_content}"</p>
                                    <p className="text-[10px] text-slate-400 mt-1">— {cr.comment_author}</p>
                                  </div>
                                  <p className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full inline-block">{cr.reason}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight whitespace-nowrap">{formatDate(cr.created_at)}</span>
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <div className="space-y-0.5">
                                  <p className="text-xs text-slate-500">Reported by <span className="font-bold text-slate-700">{cr.reporter_name}</span></p>
                                  {cr.is_resolved && cr.resolved_by && (
                                    <p className="text-xs text-emerald-600">Resolved by <span className="font-bold">{cr.resolved_by}</span></p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {!cr.is_resolved && (
                                    <button
                                      onClick={async () => {
                                        await handleDeleteComment(cr.comment_id, true);
                                        const resolvedBy = user.user_metadata.full_name || user.email;
                                        await supabase.from('comment_reports').update({ is_resolved: true, resolved_by: resolvedBy }).eq('id', cr.id);
                                        await fetchCommentReports();
                                        sonnerToast.success('Comment deleted and report resolved.');
                                      }}
                                      className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl transition-colors border border-red-200"
                                    >
                                      Delete Comment
                                    </button>
                                  )}
                                  {!cr.is_resolved && (
                                    <button
                                      onClick={async () => {
                                        const resolvedBy = user.user_metadata.full_name || user.email;
                                        await supabase.from('comment_reports').update({ is_resolved: true, resolved_by: resolvedBy }).eq('id', cr.id);
                                        await fetchCommentReports();
                                        sonnerToast.success('Report dismissed.');
                                      }}
                                      className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl transition-colors border border-slate-200"
                                    >
                                      Dismiss
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Users Tab */}
                    {adminTab === 'users' && userRole === 'super_admin' && (
                      <div className="space-y-4">
                        {usersLoading ? (
                          <div className="py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                          </div>
                        ) : allUsers.length === 0 ? (
                          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
                            <User className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">No users found.</p>
                          </div>
                        ) : (
                          allUsers.map(u => (
                            <div key={u.id} className={cn("bg-white rounded-2xl border p-5 shadow-sm space-y-3 transition-all", u.is_disabled ? "border-red-100 opacity-60" : "border-slate-100")}>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  {u.avatar_url ? (
                                    <img src={u.avatar_url} className="w-10 h-10 rounded-full border border-slate-100" alt="" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                      <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-slate-900 text-sm">{u.display_name || u.email}</p>
                                    <p className="text-xs text-slate-400">{u.email}</p>
                                  </div>
                                </div>
                                <span className={cn(
                                  'text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide',
                                  u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                                  u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                  'bg-slate-100 text-slate-600'
                                )}>
                                  {u.role || 'user'}
                                </span>
                              </div>
                              {u.id !== user?.id && (
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50">
                                  {u.role !== 'super_admin' && (
                                    <button
                                      onClick={() => updateUserRole(u.id, 'super_admin')}
                                      className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl transition-colors border border-purple-200"
                                    >
                                      Make Super Admin
                                    </button>
                                  )}
                                  {u.role !== 'admin' && (
                                    <button
                                      onClick={() => updateUserRole(u.id, 'admin')}
                                      className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl transition-colors border border-red-200"
                                    >
                                      Make Admin
                                    </button>
                                  )}
                                  {u.role !== 'user' && (
                                    <button
                                      onClick={() => updateUserRole(u.id, 'user')}
                                      className="text-xs font-bold text-slate-600 hover:text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl transition-colors border border-slate-200"
                                    >
                                      Demote to User
                                    </button>
                                  )}
                                  <button
                                    onClick={() => toggleUserDisabled(u.id, u.is_disabled)}
                                    className={cn(
                                      "text-xs font-bold px-3 py-1.5 rounded-xl transition-colors border ml-auto",
                                      u.is_disabled
                                        ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                                        : "text-red-600 bg-red-50 border-red-200"
                                    )}
                                  >
                                    {u.is_disabled ? 'Re-enable' : 'Disable'}
                                  </button>
                                </div>
                              )}
                              {u.id === user?.id && (
                                <p className="text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-50">This is you</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {adminTab === 'posts' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    </div>}
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
                          {(userRole === 'admin' || userRole === 'super_admin') && (
                            <span className={cn(
                              "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-1",
                              userRole === 'super_admin' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-red-50 text-red-600 border-red-100"
                            )}>
                              <Shield className="w-3 h-3" />
                              {userRole === 'super_admin' ? 'Super Admin' : 'Admin'}
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
                      {filteredItems.map((item, index) => (
                        <motion.div
                          layout
                          key={item.id}
                          id={index === 0 ? "tour-post-card" : undefined}
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
                {currentView !== 'notifications' && currentView !== 'resolved' && (
                  <div id="tour-add-button" className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-3rem)] max-w-xs md:w-auto">
                    <Button 
                      onClick={() => setIsModalOpen(true)}
                      aria-label="Post a new lost or found item"
                      className="w-full md:w-auto h-14 px-8 rounded-full shadow-2xl shadow-blue-700/30 text-base md:text-lg font-bold"
                    >
                      <Plus className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
                      Post Item
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Edit Post Modal */}
    <AnimatePresence>
      {showEditModal && editFormData && selectedItem && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
          >
            <div className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-extrabold text-blue-950">Edit Post</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  {(['lost', 'found'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEditFormData((prev: any) => ({ ...prev, type }))}
                      className={cn('flex-1 py-3 rounded-xl font-bold capitalize transition-all', editFormData.type === type ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-600')}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest">Title</label>
                    <Input
                      placeholder="Title"
                      value={editFormData.title}
                      onChange={(e: any) => setEditFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest">Category</label>
                    <select
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                    >
                      {['Electronics', 'Clothing', 'ID/Cards', 'Keys', 'Jewelry', 'Others'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest">Description</label>
                  <textarea
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] text-slate-700 text-sm"
                    placeholder="Description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                      <Input
                        className="pl-10"
                        placeholder="Location"
                        value={editFormData.location}
                        onChange={(e: any) => setEditFormData((prev: any) => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest">Contact Info</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                      <Input
                        className="pl-10"
                        placeholder="Phone or social media"
                        value={editFormData.contact_info}
                        onChange={(e: any) => setEditFormData((prev: any) => ({ ...prev, contact_info: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Anonymous toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", editFormData.is_anonymous ? "bg-blue-100 text-blue-950" : "bg-slate-200 text-slate-500")}>
                      {editFormData.is_anonymous ? <Shield className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Anonymous Post</div>
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        {editFormData.is_anonymous ? 'Identity is hidden' : 'Identity is visible'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditFormData((prev: any) => ({ ...prev, is_anonymous: !prev.is_anonymous }))}
                    className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", editFormData.is_anonymous ? "bg-blue-700" : "bg-slate-300")}
                  >
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300", editFormData.is_anonymous ? "left-7" : "left-1")} />
                  </button>
                </div>

                {/* Contact info warning */}
                {!editFormData.is_anonymous && !editFormData.contact_info?.trim() && (
                  <p className="text-xs text-red-500 font-medium">Contact info is required unless posting anonymously.</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowEditModal(false)} className="flex-1 py-4 rounded-2xl">
                  Cancel
                </Button>
                <Button
                  disabled={isUpdatingPost || !editFormData.title.trim() || (!editFormData.is_anonymous && !editFormData.contact_info?.trim())}
                  onClick={() => updateItem(selectedItem.id, editFormData)}
                  className="flex-1 py-4 rounded-2xl"
                >
                  {isUpdatingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Confirm Action Modal */}
    <AnimatePresence>
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 text-center space-y-6"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <ShieldOff className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 font-serif">{confirmAction.label}?</h3>
              <p className="text-slate-500 text-sm">{confirmAction.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 rounded-2xl">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  confirmAction.onConfirm();
                  setShowConfirmModal(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white"
              >
                Confirm
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Comment Report Modal */}
    <AnimatePresence>
      {showCommentReportModal && reportingComment && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCommentReportModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                  <Flag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Report Comment</h3>
                  <p className="text-xs text-slate-500">Help us keep conversations respectful</p>
                </div>
              </div>

              {/* Show the comment being reported */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-600 italic">"{reportingComment.content}"</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">— {reportingComment.author_name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Reason</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Spam', 'Harassment', 'Inappropriate language', 'Misinformation', 'Off-topic', 'Other'].map(reason => (
                    <button
                      key={reason}
                      onClick={() => setCommentReportReason(reason)}
                      className={cn('px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left', commentReportReason === reason ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:border-red-200')}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Add more details (optional)..."
                  onChange={(e) => setCommentReportReason(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-red-400 min-h-[60px] resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowCommentReportModal(false)} className="flex-1 py-3 rounded-2xl">Cancel</Button>
                <Button
                  disabled={!commentReportReason.trim() || isSubmittingCommentReport}
                  onClick={async () => {
                    if (!commentReportReason.trim() || isSubmittingCommentReport) return;
                    setIsSubmittingCommentReport(true);
                    try {
                      await supabase.from('comment_reports').insert({
                        comment_id: reportingComment.id,
                        comment_content: reportingComment.content,
                        comment_author: reportingComment.author_name,
                        comment_author_uid: reportingComment.author_uid,
                        item_id: selectedItem?.id,
                        item_title: selectedItem?.title,
                        reporter_uid: user.id,
                        reporter_name: user.user_metadata.full_name || user.email,
                        reason: commentReportReason.trim(),
                        created_at: new Date().toISOString(),
                      });
                      const newReported = new Set(reportedCommentIds).add(reportingComment.id);
                      setReportedCommentIds(newReported);
                      localStorage.setItem('reported_comment_ids', JSON.stringify([...newReported]));
                      sonnerToast.success('Comment reported.', { description: 'Our admin team will review it shortly.' });
                    } catch (err) {
                      console.error('Comment report error:', err);
                      sonnerToast.error('Failed to submit report.');
                    } finally {
                      setIsSubmittingCommentReport(false);
                      setShowCommentReportModal(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white"
                >
                  {isSubmittingCommentReport ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Report'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Report Modal */}
    <AnimatePresence>
      {showReportModal && selectedItem && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReportModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                  <Flag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Report Post</h3>
                  <p className="text-xs text-slate-500">Help us keep the community safe</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Reason for reporting</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Spam', 'Fake listing', 'Inappropriate content', 'Already found/returned', 'Offensive language', 'Other'].map(reason => (
                    <button
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className={cn(
                        'px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left',
                        reportReason === reason
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:border-red-200'
                      )}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Add more details (optional)..."
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-red-400 min-h-[70px] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowReportModal(false)} className="flex-1 py-3 rounded-2xl">
                  Cancel
                </Button>
                <Button
                  disabled={!reportReason.trim() || isSubmittingReport}
                  onClick={async () => {
                    if (!reportReason.trim() || isSubmittingReport) return;
                    setIsSubmittingReport(true);
                    const reportData = {
                      item_id: selectedItem.id,
                      item_title: selectedItem.title,
                      reporter_uid: user.id,
                      reporter_name: user.user_metadata.full_name || user.email,
                      reason: reportReason.trim(),
                      created_at: new Date().toISOString(),
                    };
                    try {
                      const { error } = await supabase.from('reports').insert(reportData);
                      if (error) console.error('Report error:', error);
                    } catch (err) {
                      console.error('Report catch:', err);
                    }
                    const newReported = new Set(reportedItemIds).add(selectedItem.id);
                    setReportedItemIds(newReported);
                    localStorage.setItem('reported_item_ids', JSON.stringify([...newReported]));
                    setIsSubmittingReport(false);
                    setShowReportModal(false);
                    sonnerToast.success('Report submitted.', {
                      description: 'Our admin team will review this post shortly.'
                    });
                  }}
                  className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white"
                >
                  {isSubmittingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Report'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Author Contact Modal */}
    <AnimatePresence>
      {showAuthorContactModal && selectedItem && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAuthorContactModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
          >
            {/* Modal Header/Profile */}
            <div className="bg-blue-600 p-8 text-center space-y-4">
              <div className="relative inline-block">
                {selectedItem.is_anonymous ? (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto border-4 border-white/20">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                ) : selectedItem.author_photo ? (
                  <img src={selectedItem.author_photo} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg mx-auto" alt="Author" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto border-4 border-white/20">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-blue-600 shadow-sm" />
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-bold font-serif">
                  {selectedItem.is_anonymous ? 'Anonymous User' : selectedItem.author_name}
                </h3>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Post Author</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Provided Contact Info</span>
                  <p className="text-slate-900 font-medium break-all">{selectedItem.contact_info}</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                    onClick={() => {
                      const info = selectedItem.contact_info?.trim();
                      if (info) {
                        navigator.clipboard.writeText(info);
                        sonnerToast.success('Contact info copied!');
                      }
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Copy Contact Info
                  </Button>
                </div>
              </div>

              <button 
                onClick={() => setShowAuthorContactModal(false)}
                className="w-full py-3 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Skip Tour Confirmation Modal */}
    <AnimatePresence>
      {showSkipModal && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-slate-100 text-center space-y-6"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <Info className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 font-serif">Skip tutorial?</h3>
              <p className="text-slate-500 text-sm">Are you sure you want to skip the tutorial? You won't see this again.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handlePermanentSkip} variant="danger" className="w-full py-3 rounded-xl font-bold">
                Yes, Skip
              </Button>
              <Button onClick={handleContinueTour} className="w-full py-3 rounded-xl font-bold">
                Continue Tour
              </Button>
            </div>
          </motion.div>
        </div>
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
              role="dialog"
              aria-modal="true"
              aria-labelledby="post-modal-title"
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 focus:outline-none"
            >
              <div className="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h2 id="post-modal-title" className="text-2xl font-extrabold text-blue-950">Post an Item</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    aria-label="Close modal"
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex p-1 bg-slate-100 rounded-2xl" role="radiogroup" aria-label="Item type">
                    {(['lost', 'found'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                        aria-checked={formData.type === type}
                        role="radio"
                        className={cn(
                          'flex-1 py-3 rounded-xl font-bold capitalize transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none',
                          formData.type === type ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-600'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="item-photos" className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest">Photos & Videos (Max 5)</label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {formData.image_urls.map((url, idx) => {
                          const isVideo = url.includes('/video/') || url.match(/\.(mp4|mov|avi|webm)$/i);
                          return (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group/img bg-slate-100">
                              {isVideo ? (
                                <video src={url} className="w-full h-full object-cover" muted />
                              ) : (
                                <img src={url} className="w-full h-full object-cover" alt="Preview" />
                              )}
                              {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-slate-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                  </div>
                                </div>
                              )}
                              <button 
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
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
                              accept="image/*,video/*" 
                              onChange={handleMediaUpload}
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
                        <label htmlFor="item-title" className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest flex items-center gap-1">Title <span className="text-red-500">*</span></label>
                        <Input 
                          id="item-title"
                          placeholder="What did you find/lose?"
                          required
                          value={formData.title}
                          onChange={(e: any) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="item-category" className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest flex items-center gap-1">Category <span className="text-red-500">*</span></label>
                        <select 
                          id="item-category"
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
                      <label htmlFor="item-description" className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest flex items-center gap-1">Description <span className="text-red-500">*</span></label>
                      <textarea 
                        id="item-description"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] text-slate-700 text-sm"
                        placeholder="Provide details (color, brand, unique marks)..."
                        required
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="item-location" className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest flex items-center gap-1">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" aria-hidden="true" />
                          <Input 
                            id="item-location"
                            className="pl-10"
                            placeholder="Where was it?"
                            required
                            value={formData.location}
                            onChange={(e: any) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="item-date" className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest flex items-center gap-1">Date <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" aria-hidden="true" />
                          <Input 
                            id="item-date"
                            type="date"
                            className="pl-10"
                            value={formData.date}
                            onChange={(e: any) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="item-contact" className="text-[10px] font-bold text-slate-600 uppercase ml-2 tracking-widest flex items-center gap-1">
                        Contact Info
                        {!formData.is_anonymous && <span className="text-red-500">*</span>}
                        {formData.is_anonymous && <span className="text-slate-400 normal-case font-medium tracking-normal">(optional when anonymous)</span>}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" aria-hidden="true" />
                        <Input 
                          id="item-contact"
                          className="pl-10"
                          placeholder={formData.is_anonymous ? "Optional — phone or social media handle" : "Required — phone number or social media handle"}
                          required={!formData.is_anonymous}
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
                          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Hide your identity</div>
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

                        <Button type="submit" disabled={isUploading || (!formData.is_anonymous && !formData.contact_info.trim()) || !formData.location.trim() || !formData.title.trim() || !formData.description.trim() || !formData.category || !formData.date} className="w-full py-4 rounded-2xl text-lg shadow-xl shadow-blue-100">
                          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Listing'}
                        </Button>
                        {!formData.is_anonymous && !formData.contact_info.trim() && (
                          <p className="text-center text-xs text-red-500 font-medium -mt-2">Contact info is required unless posting anonymously.</p>
                        )}
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
              role="dialog"
              aria-modal="true"
              aria-labelledby="detail-modal-title"
              className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] focus:outline-none"
            >
              {/* Left: Image Gallery */}
              <div className="md:w-1/2 bg-slate-100 relative flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                  {selectedItem.image_urls && selectedItem.image_urls.length > 0 ? (
                    <img 
                      src={selectedItem.image_urls[activeImageIndex]} 
                      className="w-full h-full object-cover transition-all duration-300" 
                      alt={selectedItem.title} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 min-h-[300px]">
                      <Camera className="w-16 h-16" aria-hidden="true" />
                    </div>
                  )}
                  <button 
                    onClick={() => setSelectedItem(null)}
                    aria-label="Close details"
                    className="absolute top-6 left-6 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-900 hover:text-blue-950 transition-colors md:hidden focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                {selectedItem.image_urls && selectedItem.image_urls.length > 1 && (
                  <div className="p-4 bg-white/50 backdrop-blur-sm flex gap-2 overflow-x-auto" role="list" aria-label="Item images">
                    {selectedItem.image_urls.map((url, idx) => {
                      const isVideo = url.includes('/video/') || url.match(/\.(mp4|mov|avi|webm)$/i);
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={cn(
                            "w-16 h-16 rounded-xl overflow-hidden border-2 shadow-sm flex-shrink-0 transition-all relative bg-slate-100",
                            activeImageIndex === idx ? "border-blue-500 scale-105 shadow-md" : "border-white hover:border-blue-300"
                          )}
                          role="listitem"
                          aria-label={`View media ${idx + 1}`}
                        >
                          {isVideo ? (
                            <>
                              <video src={url} className="w-full h-full object-cover" muted />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              </div>
                            </>
                          ) : (
                            <img src={url} className="w-full h-full object-cover" alt={`Media preview ${idx + 1}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: Info & Actions */}
              <div className="md:w-1/2 flex flex-col bg-white overflow-hidden">
                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Badge variant={selectedItem.type}>{selectedItem.type}</Badge>
                      <h2 id="detail-modal-title" className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight font-serif">{selectedItem.title}</h2>
                    </div>
                    <button 
                      onClick={() => setSelectedItem(null)} 
                      aria-label="Close details"
                      className="hidden md:block p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <X className="w-6 h-6" aria-hidden="true" />
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
                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Description</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {selectedItem.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Posted By</h4>
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
                          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
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
                      onClick={() => {
                        if (!selectedItem.contact_info) {
                          if (selectedItem.is_anonymous) {
                            sonnerToast.error('This post is anonymous and no contact info was provided.');
                          } else {
                            sonnerToast.error('No contact information provided by the author.');
                          }
                          return;
                        }
                        setShowAuthorContactModal(true);
                      }}
                      className="rounded-2xl py-3 text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Contact Author
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="rounded-2xl py-3 text-sm"
                      onClick={() => {
                        const shareData = {
                          title: `Lost/Found: ${selectedItem.title}`,
                          text: `Check out this ${selectedItem.type} item: ${selectedItem.title} at ${selectedItem.location}`,
                          url: window.location.href,
                        };

                        if (navigator.share) {
                          navigator.share(shareData).catch(err => {
                            if (err.name !== 'AbortError') {
                              console.error('Share failed:', err);
                            }
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          sonnerToast.success('Link copied to clipboard!');
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="rounded-2xl py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                      disabled={reportedItemIds.has(selectedItem.id)}
                      onClick={() => {
                        if (reportedItemIds.has(selectedItem.id)) return;
                        setReportReason('');
                        setShowReportModal(true);
                      }}
                    >
                      <Flag className="w-4 h-4" />
                      {reportedItemIds.has(selectedItem.id) ? 'Reported' : 'Report'}
                    </Button>
                    {(selectedItem.author_uid === user?.id || userRole === 'admin' || userRole === 'super_admin') && selectedItem.status === 'active' && (
                      <Button 
                        onClick={() => resolveItem(selectedItem.id)}
                        className="rounded-2xl py-3 text-sm bg-blue-700 text-blue-950 hover:bg-blue-600"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Resolved
                      </Button>
                    )}
                    {selectedItem.author_uid === user?.id && selectedItem.status === 'active' && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditFormData({
                            title: selectedItem.title,
                            description: selectedItem.description,
                            category: selectedItem.category,
                            location: selectedItem.location,
                            contact_info: selectedItem.contact_info,
                            type: selectedItem.type,
                            is_anonymous: selectedItem.is_anonymous,
                          });
                          setShowEditModal(true);
                        }}
                        className="rounded-2xl py-3 text-sm col-span-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Post
                      </Button>
                    )}
                    {(userRole === 'admin' || userRole === 'super_admin') && selectedItem.status !== 'archived' && (
                      <Button 
                        variant="ghost"
                        onClick={() => {
                          setConfirmAction({
                            label: 'Archive Post',
                            description: 'This post will be hidden from the public and comments will be disabled.',
                            onConfirm: () => archiveItem(selectedItem.id)
                          });
                          setShowConfirmModal(true);
                        }}
                        className="rounded-2xl py-3 text-sm text-red-600 hover:bg-red-50 font-bold col-span-2"
                      >
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Admin: Archive Post
                      </Button>
                    )}
                    {(userRole === 'admin' || userRole === 'super_admin') && selectedItem.status === 'archived' && (
                      <Button 
                        variant="ghost"
                        onClick={() => {
                          setConfirmAction({
                            label: 'Restore Post',
                            description: 'This post will be made visible to the public again.',
                            onConfirm: () => resolveItem(selectedItem.id)
                          });
                          setShowConfirmModal(true);
                        }}
                        className="rounded-2xl py-3 text-sm text-emerald-600 hover:bg-emerald-50 font-bold col-span-2"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Admin: Restore Post
                      </Button>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div id="tour-comments" className="pt-8 border-t border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Comments & Q&A</h4>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{comments.length} Comments</span>
                    </div>

                    {selectedItem?.status === 'archived' ? (
                      <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700 font-bold">
                        <ShieldOff className="w-4 h-4 shrink-0" />
                        Comments are disabled — this post has been archived by an administrator.
                      </div>
                    ) : (
                      <form onSubmit={handleAddComment} className="flex flex-col gap-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        {replyToId && (
                          <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border-b border-blue-100 text-[10px] fade-in animate-in">
                            <div className="flex items-center gap-1.5 text-blue-700 font-bold uppercase tracking-tight">
                              <CornerDownRight className="w-3 h-3" />
                              Replying to {comments.find(c => c.id === replyToId)?.author_name}
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setReplyToId(null)}
                              className="text-blue-500 hover:text-blue-700 font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      <div className="flex items-center gap-3 p-2 pl-3">
                        <img src={user.user_metadata.avatar_url || undefined} className="w-8 h-8 rounded-full border border-slate-100" alt="My profile picture" />
                        <div className="flex-1 relative">
                          <Input 
                            placeholder={replyToId ? "Write your reply..." : "Ask a question or leave a comment..."}
                            className="text-xs py-2 pr-10 border-none bg-transparent shadow-none"
                            value={commentText}
                            onChange={(e: any) => setCommentText(e.target.value)}
                            disabled={isSubmittingComment}
                            aria-label="Add a comment"
                          />
                          <button 
                            type="submit"
                            disabled={!commentText.trim() || isSubmittingComment}
                            aria-label="Submit comment"
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-950 hover:text-blue-900 disabled:opacity-30 p-1.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            {isSubmittingComment ? (
                              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Plus className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                    )}

                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {comments.length > 0 ? (
                        (() => {
                          const rootComments = comments.filter(c => !c.parent_id);
                          const repliesByParentId = comments.reduce((acc, c) => {
                            if (c.parent_id) {
                              if (!acc[c.parent_id]) acc[c.parent_id] = [];
                              acc[c.parent_id].push(c);
                            }
                            return acc;
                          }, {} as Record<string, ItemComment[]>);

                          const renderComment = (comment: ItemComment, isReply = false) => (
                            <div key={comment.id} className={cn("space-y-3", isReply ? "ml-8 mt-3 pb-1" : "pb-2")}>
                              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {comment.author_photo ? (
                                  <img src={comment.author_photo} className={cn("rounded-full shrink-0 border border-slate-100", isReply ? "w-7 h-7" : "w-9 h-9")} alt="" />
                                ) : (
                                  <div className={cn("rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200", isReply ? "w-7 h-7" : "w-9 h-9")}>
                                    <User className={cn("text-slate-600", isReply ? "w-3.5 h-3.5" : "w-4.5 h-4.5")} aria-hidden="true" />
                                  </div>
                                )}
                                <div className={cn(
                                  "flex-1 p-3.5 rounded-[1.5rem] rounded-tl-none border shadow-sm",
                                  isReply ? "bg-white border-slate-100" : "bg-slate-50 border-slate-200"
                                )}>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] font-bold text-blue-900 uppercase tracking-tight">{comment.author_name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{formatDate(comment.created_at)}</span>
                                  </div>
                                  {editingCommentId === comment.id ? (
                                    <div className="space-y-2">
                                      <textarea
                                        className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[70px] shadow-inner"
                                        value={editingCommentText}
                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                        autoFocus
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button 
                                          onClick={() => setEditingCommentId(null)}
                                          className="text-[10px] font-bold text-slate-500 hover:text-slate-700 px-3 py-1.5"
                                        >
                                          Cancel
                                        </button>
                                        <button 
                                          onClick={() => handleUpdateComment(comment.id)}
                                          disabled={isUpdatingComment || !editingCommentText.trim()}
                                          className="text-[10px] font-bold text-blue-700 hover:text-blue-900 px-3 py-1.5 bg-blue-50 rounded-lg disabled:opacity-50"
                                        >
                                          {isUpdatingComment ? 'Saving...' : 'Save Changes'}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                      <div className="flex justify-start items-center gap-3 mt-3 pt-2.5 border-t border-slate-200/40">
                                        {/* Reply button — only on root comments */}
                                        {!isReply && user && selectedItem.status !== 'archived' && (
                                          <button 
                                            onClick={() => {
                                              setReplyToId(comment.id);
                                              const input = document.querySelector('input[aria-label="Add a comment"]') as HTMLInputElement;
                                              if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                                            }}
                                            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
                                          >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            Reply
                                          </button>
                                        )}

                                        {/* Triple dot dropdown — for all other actions */}
                                        {user && (
                                          <div className="relative ml-auto">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveCommentMenuId(activeCommentMenuId === comment.id ? null : comment.id);
                                              }}
                                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                              aria-label="More actions"
                                            >
                                              <MoreVertical className="w-3.5 h-3.5" />
                                            </button>

                                            <AnimatePresence>
                                              {activeCommentMenuId === comment.id && (
                                                <>
                                                  <div className="fixed inset-0 z-[100]" onClick={() => setActiveCommentMenuId(null)} />
                                                  <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className="absolute right-0 bottom-full mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[101] overflow-hidden min-w-[130px]"
                                                  >
                                                    {/* Edit — only own comments */}
                                                    {comment.author_uid === user.id && selectedItem.status !== 'archived' && (
                                                      <button
                                                        onClick={() => {
                                                          setEditingCommentId(comment.id);
                                                          setEditingCommentText(comment.content);
                                                          setActiveCommentMenuId(null);
                                                        }}
                                                        className="flex items-center gap-2.5 w-full px-4 py-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors border-b border-slate-100"
                                                      >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                        Edit
                                                      </button>
                                                    )}

                                                    {/* Delete — own comment or admin */}
                                                    {(comment.author_uid === user.id || userRole === 'admin' || userRole === 'super_admin') && (
                                                      <button
                                                        onClick={() => {
                                                          handleDeleteComment(comment.id);
                                                          setActiveCommentMenuId(null);
                                                        }}
                                                        className="flex items-center gap-2.5 w-full px-4 py-3 text-[10px] font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors border-b border-slate-100"
                                                      >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                      </button>
                                                    )}

                                                    {/* Report — only other users' comments */}
                                                    {comment.author_uid !== user.id && (
                                                      <button
                                                        onClick={() => {
                                                          setActiveCommentMenuId(null);
                                                          if (reportedCommentIds.has(comment.id)) {
                                                            sonnerToast.info('You have already reported this comment.');
                                                            return;
                                                          }
                                                          setReportingComment(comment);
                                                          setCommentReportReason('');
                                                          setShowCommentReportModal(true);
                                                        }}
                                                        className={cn(
                                                          "flex items-center gap-2.5 w-full px-4 py-3 text-[10px] font-bold transition-colors",
                                                          reportedCommentIds.has(comment.id)
                                                            ? "text-slate-300 cursor-not-allowed"
                                                            : "text-slate-600 hover:bg-red-50 hover:text-red-600"
                                                        )}
                                                      >
                                                        <Flag className="w-3.5 h-3.5" />
                                                        {reportedCommentIds.has(comment.id) ? 'Already Reported' : 'Report'}
                                                      </button>
                                                    )}
                                                  </motion.div>
                                                </>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              {repliesByParentId[comment.id]?.map(reply => renderComment(reply, true))}
                            </div>
                          );

                          return rootComments.map(c => renderComment(c));
                        })()
                      ) : (
                        <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-600">No comments yet. Be the first to ask!</p>
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
        <Toaster position="top-center" richColors />
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

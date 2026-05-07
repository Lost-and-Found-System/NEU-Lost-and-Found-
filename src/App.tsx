import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  PlusCircle,
  User,
  Bell,
  Home,
  Settings,
  HelpCircle,
  LogIn,
  LogOut,
  Package,
  MessageCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  Star,
  Clock,
  Award
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { supabase, signInWithGoogle, logout, getCurrentUser } from './lib/supabase';
import clsx from 'clsx';

// ── Operation type for structured error logging ─────────────────────
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST   = 'list',
  GET    = 'get',
  WRITE  = 'write',
}

export interface SupabaseErrorInfo {
  error:         string;
  operationType: OperationType;
  path:          string | null;
  authInfo:      { userId?: string; email?: string | null; }
}

// ── Structured Error Handler ─────────────────────────────────────────
export function handleSupabaseError(
  error: any,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: SupabaseErrorInfo = {
    error: error?.message || String(error),
    authInfo: { userId: undefined, email: undefined },
    operationType,
    path
  };
  console.error('Supabase Error: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// ── Core knowledge record interfaces ─────────────────────────────────
export interface Item {
  id:           string;
  type:         'lost' | 'found';
  title:        string;
  description:  string;
  category:     string;
  location:     string;
  date:         any;
  image_urls:   string[];
  author_uid:   string;
  author_name:  string;
  author_photo?: string;
  status:       'active' | 'resolved' | 'archived';
  created_at:   any;
  contact_info: string;
  is_anonymous: boolean;
}

export interface ItemComment {
  id:          string;
  item_id:     string;
  author_uid:  string;
  author_name: string;
  author_photo?: string;
  content:     string;
  created_at:  string;
  parent_id?:  string;
}

export interface AppNotification {
  id:        string;
  type:      'post' | 'comment';
  message:   string;
  timestamp: string;
  read:      boolean;
  itemId?:   string;
}

// ── Type Guards ────────────────────────────────────────────────────
export function isItem(obj: any): obj is Item {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string';
}

export function isItemComment(obj: any): obj is ItemComment {
  return obj && typeof obj.id === 'string' && typeof obj.item_id === 'string';
}

export function isAppNotification(obj: any): obj is AppNotification {
  return obj && typeof obj.id === 'string' && typeof obj.type === 'string';
}

// ── Shared UI Components ─────────────────────────────────────────────
const cn = clsx;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const variants = {
    primary:   'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
    ghost:     'bg-transparent text-slate-600 hover:bg-slate-100',
    danger:    'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
  };
  return (
    <button className={cn(
      'px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2',
      variants[variant],
      className
    )} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={cn(
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition',
          error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-slate-200 focus:ring-blue-200 focus:border-blue-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'lost' | 'found' | 'resolved' | 'success' | 'warning';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const variants = {
    default:  'bg-slate-100 text-slate-600',
    lost:     'bg-blue-100 text-blue-700',
    found:    'bg-green-100 text-green-700',
    resolved: 'bg-purple-100 text-purple-700',
    success:  'bg-emerald-100 text-emerald-700',
    warning:  'bg-orange-100 text-orange-700',
  };
  return (
    <span className={cn(
      'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest',
      variants[variant]
    )}>
      {children}
    </span>
  );
};

// ── Error Boundary — catches runtime errors and shows recovery UI ──
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      let errorMessage = this.state.error?.message || 'Something went wrong.';
      const isConfigError = errorMessage.includes('Supabase URL') || 
                           errorMessage.includes('credentials missing');
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-900">
              {isConfigError ? '⚠️ Configuration Required' : '😢 Oops! Something went wrong'}
            </h2>
            <p className="text-slate-600 mt-3 text-center">{errorMessage}</p>
            <div className="mt-6 space-y-3">
              <button onClick={() => window.location.reload()} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                🔄 Reload Application
              </button>
              <button onClick={() => window.location.href = '/'} className="w-full py-2.5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300">
                🏠 Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Views (Pages) ────────────────────────────────────────────────────

// Home View - Discover lost & found items
const HomeView = () => {
  const [items, setItems] = useState<Item[]>([]);
  
  // Mock data for demo
  useEffect(() => {
    setItems([
      { id: '1', type: 'lost', title: 'MacBook Pro', description: 'Silver MacBook Pro 14"', category: 'Electronics', location: 'Library', date: new Date(), image_urls: [], author_uid: 'user1', author_name: 'John Doe', status: 'active', created_at: new Date(), contact_info: 'john@neu.edu.ph', is_anonymous: false },
      { id: '2', type: 'found', title: 'Student ID', description: 'NEU ID Card - Juan Dela Cruz', category: 'ID/Cards', location: 'Canteen', date: new Date(), image_urls: [], author_uid: 'user2', author_name: 'Jane Smith', status: 'active', created_at: new Date(), contact_info: 'jane@neu.edu.ph', is_anonymous: false },
    ]);
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Discover Items</h2>
        <div className="flex gap-2">
          <Badge variant="lost">Lost</Badge>
          <Badge variant="found">Found</Badge>
          <Badge variant="resolved">Resolved</Badge>
        </div>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={item.type === 'lost' ? 'lost' : 'found'}>{item.type}</Badge>
                  <span className="text-xs text-slate-400">{item.location}</span>
                </div>
              </div>
              <Button variant="ghost" className="text-blue-600">View →</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// My Posts View
const MyPostsView = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">My Posts</h2>
      <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
        <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500">You haven't posted any items yet.</p>
        <Button variant="primary" className="mt-4">Report Lost Item</Button>
      </div>
    </div>
  );
};

// Resolved History View
const ResolvedHistory = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Resolved Items</h2>
      <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
        <CheckCircle className="w-12 h-12 mx-auto text-green-300 mb-3" />
        <p className="text-slate-500">No resolved items yet.</p>
      </div>
    </div>
  );
};

// Notifications View
const NotificationsView = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
      <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
        <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500">No new notifications.</p>
      </div>
    </div>
  );
};

// Profile View
const ProfileView = () => {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Profile</h2>
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user?.email || 'Not signed in'}</p>
            <p className="text-sm text-slate-500">NEU Student</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin View
const AdminView = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="text-2xl font-bold text-blue-600">156</div>
          <div className="text-sm text-slate-500">Total Items</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="text-2xl font-bold text-green-600">42</div>
          <div className="text-sm text-slate-500">Resolved Items</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="text-2xl font-bold text-purple-600">89</div>
          <div className="text-sm text-slate-500">Active Users</div>
        </div>
      </div>
    </div>
  );
};

// ── Main App Component with Routing ───────────────────────────────────
function AppContent() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isNEUEmail = (email: string | undefined | null): boolean => {
    if (!email) return false;
    return email.endsWith('@neu.edu.ph');
  };

  const syncUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const userEmail = currentUser?.email;
      
      if (currentUser && !isNEUEmail(userEmail)) {
        toast.error('Access Restricted', {
          description: 'Only @neu.edu.ph email addresses are allowed.',
          duration: 5000,
        });
        await logout();
        setUser(null);
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      handleSupabaseError(error, OperationType.GET, 'syncUser');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        try {
          if (event === 'SIGNED_IN') {
            const user = session?.user;
            const userEmail = user?.email;
            
            if (user && !isNEUEmail(userEmail)) {
              toast.error('Access Restricted', {
                description: 'Only @neu.edu.ph email addresses are allowed.',
                duration: 5000,
              });
              await logout();
              setUser(null);
            } else {
              setUser(user);
              if (userEmail) {
                toast.success(`Welcome, ${userEmail}!`, {
                  description: 'You have successfully signed in.',
                  duration: 3000,
                });
              }
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            toast.info('Signed out', {
              description: 'You have been signed out successfully.',
              duration: 3000,
            });
          }
        } catch (error) {
          handleSupabaseError(error, OperationType.WRITE, 'authStateChange');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleNavClick = (view: string) => {
    navigate(view === 'home' ? '/' : `/${view}`);
  };

  const startTour = () => {
    const intro = introJs();
    intro.setOptions({
      steps: [
        { title: '🏫 Welcome', intro: 'Welcome to NEU Lost & Found!' },
        { title: '🔐 Sign In', intro: 'Sign in with your @neu.edu.ph email', element: document.querySelector('#auth-btn') },
        { title: '📝 Report', intro: 'Report lost or found items', element: document.querySelector('#report-btn') },
      ],
      showProgress: true,
      exitOnOverlayClick: true,
    });
    intro.start();
  };

  const handleReportLost = () => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'Please sign in to report items.',
        duration: 4000,
      });
      return;
    }
    toast.info('Report Lost Item', { description: 'Feature coming in PR #009!', duration: 4000 });
  };

  const handleBrowseFound = () => {
    toast.info('Browse Items', { description: 'Browse and search coming in PR #009!', duration: 4000 });
  };

  const handleAuth = async () => {
    if (user) {
      await logout();
    } else {
      setLoading(true);
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error('Sign in failed', { description: error.message, duration: 4000 });
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster position="top-right" richColors closeButton />
      
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Package className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NEU Lost & Found
              </h1>
            </div>
            
            <div className="flex gap-1">
              <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">Home</Button>
              <Button variant="ghost" onClick={() => navigate('/my-posts')} className="text-sm">My Posts</Button>
              <Button variant="ghost" onClick={() => navigate('/resolved')} className="text-sm">Resolved</Button>
              <Button variant="ghost" onClick={() => navigate('/notifications')} className="text-sm relative">
                <Bell className="w-4 h-4" />
                {false && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/profile')} className="text-sm">
                <User className="w-4 h-4" />
              </Button>
            </div>
            
            <Button variant={user ? 'danger' : 'primary'} onClick={handleAuth} className="text-sm">
              {user ? <><LogOut className="w-4 h-4" /> Sign Out</> : <><LogIn className="w-4 h-4" /> Sign In</>}
            </Button>
          </div>
        </div>
      </nav>

      {user && user.email && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-sm text-green-700 text-center">
          ✅ Signed in as: <strong>{user.email}</strong>
        </div>
      )}

      {/* Main Content with Routes */}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/my-posts" element={<MyPostsView />} />
          <Route path="/resolved" element={<ResolvedHistory />} />
          <Route path="/notifications" element={<NotificationsView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/admin" element={<AdminView />} />
        </Routes>
      </main>
    </div>
  );
}

// ── Root export with ErrorBoundary and BrowserRouter ───────────────────
export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

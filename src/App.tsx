import { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { supabase, signInWithGoogle, logout, getCurrentUser } from './lib/supabase';

function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check NEU domain restriction - FIXED: handle undefined email
  const isNEUEmail = (email: string | undefined | null): boolean => {
    if (!email) return false;
    return email.endsWith('@neu.edu.ph');
  };

  // Sync user state - FIXED: handle undefined email
  const syncUser = async () => {
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
    setLoading(false);
  };

  // Auth state listener - FIXED: handle undefined email
  useEffect(() => {
    syncUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
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
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const startTour = () => {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: '🏫 Welcome to NEU Lost & Found',
          intro: 'Your centralized system for reporting and recovering lost items at NEU.',
        },
        {
          title: '🔐 Sign In with Google',
          intro: 'Sign in using your @neu.edu.ph email address to report items.',
          element: document.querySelector('#auth-btn'),
        },
        {
          title: '📝 Report Lost Items',
          intro: 'Click here to report a lost item.',
          element: document.querySelector('#report-btn'),
        },
        {
          title: '🔍 Browse Items',
          intro: 'Search through found items that match your lost belongings.',
          element: document.querySelector('#browse-btn'),
        },
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: true,
      tooltipPosition: 'bottom',
    });
    intro.start();
  };

  const handleReportLost = () => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'Please sign in with your @neu.edu.ph email to report items.',
        duration: 4000,
      });
      return;
    }
    toast.info('Report Lost Item', {
      description: 'This feature will be available soon!',
      duration: 4000,
    });
  };

  const handleBrowseFound = () => {
    toast.info('Browse Found Items', {
      description: 'Browse and search functionality coming soon!',
      duration: 4000,
    });
  };

  const handleAuth = async () => {
    if (user) {
      await logout();
    } else {
      setLoading(true);
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error('Sign in failed', {
          description: error.message,
          duration: 4000,
        });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster 
        position="top-right" 
        richColors 
        expand={false}
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
      
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NEU Lost & Found
            </h1>
          </motion.div>
          
          <div className="flex gap-3 items-center">
            {/* Auth Button */}
            <motion.button
              id="auth-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuth}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                background: user ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white'
              }}
            >
              {user ? (
                <>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In with Google
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Home className="w-5 h-5 text-slate-600 cursor-pointer hover:text-blue-600 transition" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Search className="w-5 h-5 text-slate-600 cursor-pointer hover:text-blue-600 transition" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-slate-100 transition relative"
            >
              <Bell className="w-5 h-5 text-slate-600 cursor-pointer hover:text-blue-600 transition" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <User className="w-5 h-5 text-slate-600 cursor-pointer hover:text-blue-600 transition" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Settings className="w-5 h-5 text-slate-600 cursor-pointer hover:text-blue-600 transition" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startTour}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <HelpCircle className="w-5 h-5 text-slate-600 cursor-pointer hover:text-purple-600 transition" />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* User Info Bar (if signed in) */}
      {user && user.email && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-sm text-green-700 text-center">
          ✅ Signed in as: <strong>{user.email}</strong>
        </div>
      )}

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <Package className="w-20 h-20 mx-auto text-blue-600" />
          </motion.div>
          
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to NEU Lost & Found
          </h2>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            A knowledge management system for NEU students to post lost and found items, 
            comment, and resolve issues efficiently.
          </p>

          {/* Auth Status Message */}
          {!user && (
            <div className="mb-8 p-4 bg-blue-100 rounded-lg max-w-md mx-auto">
              <p className="text-blue-700">
                🔐 Please sign in with your <strong>@neu.edu.ph</strong> email to report items
              </p>
            </div>
          )}
          
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button
              id="report-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReportLost}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Report Lost Item
            </motion.button>
            
            <motion.button
              id="browse-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBrowseFound}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Browse Found Items
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.success('Feature coming soon!')}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Community Board
            </motion.button>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">150+</div>
              <div className="text-sm text-slate-600">Items Reported</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">85+</div>
              <div className="text-sm text-slate-600">Successfully Resolved</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">200+</div>
              <div className="text-sm text-slate-600">Active Students</div>
            </div>
          </motion.div>

          {/* Demo Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-md max-w-md mx-auto"
          >
            <p className="text-slate-700 mb-3 font-semibold">⚡ Test React State:</p>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCount((c) => c + 1);
                toast.success(`Button clicked ${count + 1} times!`, {
                  duration: 1500,
                  icon: '🎯',
                });
              }}
              className="px-6 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition font-semibold shadow-md"
            >
              Clicked {count} {count === 1 ? 'time' : 'times'}
            </motion.button>
          </motion.div>

          {/* Tech Stack Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-slate-200"
          >
            <div className="text-sm text-slate-500">
              <p className="font-semibold mb-2">Built with Modern Stack:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">Vite 6</span>
                <span className="px-2 py-1 bg-cyan-100 rounded text-cyan-700">React 19</span>
                <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">TypeScript</span>
                <span className="px-2 py-1 bg-purple-100 rounded text-purple-700">Tailwind CSS 3</span>
                <span className="px-2 py-1 bg-green-100 rounded text-green-700">Supabase</span>
                <span className="px-2 py-1 bg-yellow-100 rounded text-yellow-700">Google GenAI</span>
                <span className="px-2 py-1 bg-indigo-100 rounded text-indigo-700">React Router</span>
                <span className="px-2 py-1 bg-pink-100 rounded text-pink-700">Framer Motion</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;

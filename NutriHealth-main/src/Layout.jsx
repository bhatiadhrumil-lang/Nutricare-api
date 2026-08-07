import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Menu, X, Stethoscope, HeartPulse, MessageSquare, 
  LogOut, UploadCloud, Sparkles, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auto logout after 5 minutes of inactivity
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Clear any remaining Cognito/Amplify tokens and redirect to the login page
  const performLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      console.error('[Logout]', err);
    }
    // Safety net: remove any persisted auth credentials still sitting in localStorage
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && /cognito|amplify/i.test(key)) {
        authKeys.push(key);
      }
    }
    authKeys.forEach((key) => localStorage.removeItem(key));
    navigate('/');
  }, [logout, navigate]);

  // Auto logout after 5 minutes of inactivity
  useEffect(() => {
    let timer = null;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void performLogout();
      }, INACTIVITY_TIMEOUT_MS);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'wheel', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [performLogout]);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Reset mobile drawer on desktop resize
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer on navigation
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/upload': return 'Upload Medical Report';
      case '/recovery': return 'AI Consultation & Results';
      case '/health-tips': return 'Personalized Health Insights';
      case '/assistant': return 'NutriHealth AI Assistant';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans antialiased relative">
      
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.div 
            initial={isMobile ? { x: -300, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: -300, opacity: 0 } : false}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`
              bg-white/95 backdrop-blur-2xl border-r border-slate-200/80 flex flex-col pt-6 pb-6 flex-shrink-0 z-40
              ${isMobile 
                ? 'fixed inset-y-0 left-0 w-[280px] h-full shadow-2xl' 
                : 'static w-[280px] h-full shadow-xl'
              }
            `}
          >
            {/* Logo */}
            <div className="flex items-center justify-between px-6 mb-8">
              <Link to="/upload" className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-all">
                  <Activity className="text-white w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 tracking-tight">
                    NutriHealth
                  </h1>
                  <span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase flex items-center gap-1">
                    AI Medical Platform <Sparkles className="w-2.5 h-2.5" />
                  </span>
                </div>
              </Link>
              {isMobile && (
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 px-4 space-y-1.5 w-full overflow-hidden">
              <SidebarItem to="/upload" icon={<UploadCloud className="w-5 h-5" />} label="Upload Report" currentPath={location.pathname} />
              <SidebarItem to="/recovery" icon={<Stethoscope className="w-5 h-5" />} label="AI Consultation" currentPath={location.pathname} />
              <SidebarItem to="/health-tips" icon={<HeartPulse className="w-5 h-5" />} label="Health Insights" currentPath={location.pathname} />
              <SidebarItem to="/assistant" icon={<MessageSquare className="w-5 h-5" />} label="AI Assistant" currentPath={location.pathname} />
            </nav>

            {/* User Profile / Logout */}
            <div className="px-4 mt-auto w-full overflow-hidden space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  NH
                </div>
                <div className="flex-1 truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">Patient Account</p>
                  <p className="text-[10px] text-teal-600 font-semibold truncate">Pro Tier Active</p>
                </div>
              </div>

              <button
                onClick={() => void performLogout()}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all text-sm font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50 relative">
        
        {/* Universal Ambient Gradients */}
        <div className="absolute top-[-15%] right-[-5%] w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-teal-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

        {/* Top Navbar Header */}
        <header className="h-16 px-4 sm:px-6 flex items-center justify-between z-30 w-full shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/90 shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
                aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 truncate">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/upload" className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200 transition-all flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center">
          <div className="w-full max-w-[1200px] mx-auto flex-1 flex flex-col justify-start items-center p-4 sm:p-6 pb-16">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

function SidebarItem({ to, icon, label, currentPath, onClick }) {
  const active = currentPath === to || (currentPath.includes('/recovery') && to === '/recovery');
  return (
    <Link to={to} onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm ${
      active 
        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20" 
        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
    }`}>
      <span className={active ? "text-white" : "text-slate-400"}>{icon}</span>
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="w-4 h-4 text-white/80" />}
    </Link>
  );
}

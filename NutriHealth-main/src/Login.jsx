import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, ArrowRight, Activity, Sparkles, ShieldCheck,
  Check, HeartPulse, User, UserPlus, AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Animation variants for consistent motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  // Health indicators for form validation
  const healthIndicators = [
    { id: 'email', label: 'Email verified', icon: Mail },
    { id: 'password', label: 'Password secured', icon: Lock },
    { id: 'password', label: 'Strong password', icon: ShieldCheck }
  ];

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === 'email') {
      if (!value) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = 'Please enter a valid email';
      } else {
        delete newErrors.email;
      }
    }

    if (name === 'password') {
      if (!value) {
        newErrors.password = 'Password is required';
      } else if (value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else {
        delete newErrors.password;
      }
    }

    if (name === 'confirmPassword' && isRegister) {
      if (!value) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (value !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    if (name === 'name' && isRegister) {
      if (!value) {
        newErrors.name = 'Name is required';
      } else if (value.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      } else {
        delete newErrors.name;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    if (!isValid) return;

    try {
      if (isRegister) {
        await signup(formData.email, formData.password);
        navigate('/verify-email', {
          state: { email: formData.email },
        });
      } else {
        await login(formData.email, formData.password);
        navigate('/upload');
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email: error.message,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">

      {/* Ambient background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-teal-500/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />

      {/* Floating health badges */}
      <AnimatePresence>
        {isRegister && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-6 right-6 hidden lg:block bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full p-3 shadow-lg"
          >
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-medium">New user registration</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side - Logo and Welcome */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center text-center lg:text-left px-4 lg:px-0"
      >
        {/* Logo */}
        <div className="mb-8 lg:mb-12">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-all">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 tracking-tight">
                NutriHealth
              </h1>
              <span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase flex items-center gap-1">
                AI Healthcare Platform <Sparkles className="w-2.5 h-2.5" />
              </span>
            </div>
          </Link>
        </div>

        {/* Welcome Message */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {isRegister ? 'Create Your Health Account' : 'Welcome Back'}
            <span className="block text-teal-600 mt-1">
              {isRegister ? 'Start your personalized health journey' : 'Access your health insights'}
            </span>
          </h2>

          <p className="text-slate-500 text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
            {isRegister
              ? 'Join thousands of users who trust our AI-powered health platform for accurate analysis and personalized nutrition guidance.'
              : 'Sign in to access your lab analysis, AI consultations, and personalized nutrition recommendations.'
            }
          </p>
        </div>

        {/* Health Trust Badges */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 lg:mb-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HeartPulse className="w-4 h-4 text-teal-500" />
            <span>AI-Powered Analysis</span>
          </div>
        </div>
      </motion.div>

      {/* Right side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="w-full lg:w-1/2 bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-200/80"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toggle between Login/Register */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center bg-slate-100 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                  !isRegister
                    ? 'bg-white shadow-sm text-teal-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                  isRegister
                    ? 'bg-white shadow-sm text-teal-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Name field (Register only) */}
          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="space-y-2"
              >
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="name">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 text-slate-900 ${
                      errors.name ? 'border-rose-300 focus:ring-rose-500/40' : 'border-slate-200/90 focus:ring-teal-500/40'
                    }`}
                    placeholder="John Doe"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-rose-600 flex items-center gap-1.5"
                    id="name-error"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 text-slate-900 ${
                  errors.email ? 'border-rose-300 focus:ring-rose-500/40' : 'border-slate-200/90 focus:ring-teal-500/40'
                }`}
                placeholder="name@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-600 flex items-center gap-1.5"
                id="email-error"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email}
              </motion.p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 text-slate-900 ${
                  errors.password ? 'border-rose-300 focus:ring-rose-500/40' : 'border-slate-200/90 focus:ring-emerald-500/40'
                }`}
                placeholder="••••••••"
                autoComplete={isRegister ? "new-password" : "current-password"}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-600 flex items-center gap-1.5"
                id="password-error"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.password}
              </motion.p>
            )}
          </div>

          {/* Confirm Password field (Register only) */}
          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="space-y-2"
              >
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 text-slate-900 ${
                      errors.confirmPassword ? 'border-rose-300 focus:ring-rose-500/40' : 'border-slate-200/90 focus:ring-emerald-500/40'
                    }`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  />
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-rose-600 flex items-center gap-1.5"
                    id="confirmPassword-error"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Remember me / Forgot password (Login only) */}
          <AnimatePresence>
            {!isRegister && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between text-xs font-medium"
              >
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    className="w-4 h-4 rounded border-slate-300 bg-white focus:ring-teal-500 text-teal-600 cursor-pointer"
                  />
                  <span className="text-slate-500 group-hover:text-slate-700 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link to="/forgot-password" className="text-teal-600 hover:text-teal-500 transition-colors font-semibold">
                  Forgot password?
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-4 px-6 flex items-center justify-center gap-3 text-white font-bold text-base rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                {isRegister ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {isRegister ? 'Create Account' : 'Sign In to NutriHealth'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Social login (Login only) */}
        <AnimatePresence>
          {!isRegister && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 text-slate-400 bg-white font-medium">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/upload')}
                  className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm rounded-2xl transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Switch between login and register */}
        <div className="mt-8 text-center text-xs text-slate-500">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-teal-600 hover:text-teal-500 font-semibold underline-offset-4 hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-teal-600 hover:text-teal-500 font-semibold underline-offset-4 hover:underline"
              >
                Register
              </button>
            </p>
          )}
        </div>

        {/* Security note */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>End-to-End Encrypted Medical Platform</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

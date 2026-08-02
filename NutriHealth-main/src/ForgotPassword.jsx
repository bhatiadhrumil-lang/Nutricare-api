import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  HeartPulse,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    try {
      const normalizedEmail = email.trim();
      await forgotPassword(normalizedEmail);
      navigate('/reset-password', { state: { email: normalizedEmail } });
    } catch (authError) {
      setError(authError.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-teal-500/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center text-center lg:text-left px-4 lg:px-0"
      >
        <div className="mb-8 lg:mb-12">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-all">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 tracking-tight">NutriHealth</h1>
              <span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase flex items-center gap-1">AI Healthcare Platform <Sparkles className="w-2.5 h-2.5" /></span>
            </div>
          </Link>
        </div>

        <div className="mb-8 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            Reset Your Password
            <span className="block text-teal-600 mt-1">Secure access to your health insights</span>
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto lg:mx-0 leading-relaxed">Enter the email address associated with your account and we will send you a verification code.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 lg:mb-0">
          <div className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>End-to-End Encrypted</span></div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span>HIPAA Compliant</span></div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><HeartPulse className="w-4 h-4 text-teal-500" /><span>AI-Powered Analysis</span></div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="w-full lg:w-1/2 bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-200/80"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-teal-50 flex items-center justify-center"><Mail className="w-7 h-7 text-teal-600" /></div>
          <h3 className="text-2xl font-bold text-slate-900">Forgot your password?</h3>
          <p className="mt-2 text-sm text-slate-500">We will email you a verification code.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="email">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors"><Mail className="w-5 h-5" /></div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 text-slate-900 ${error ? 'border-rose-300 focus:ring-rose-500/40' : 'border-slate-200/90 focus:ring-teal-500/40'}`}
                placeholder="name@example.com"
                autoComplete="email"
                aria-invalid={Boolean(error)}
              />
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-4 px-6 flex items-center justify-center gap-3 text-white font-bold text-base rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending Code...' : <><span>Send Verification Code</span><ArrowRight className="w-5 h-5" /></>}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">Remember your password? <Link to="/" className="text-teal-600 hover:text-teal-500 font-semibold underline-offset-4 hover:underline">Sign In</Link></div>
        <div className="mt-6 pt-4 border-t border-slate-100"><div className="flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>End-to-End Encrypted Medical Platform</span></div></div>
      </motion.div>
    </div>
  );
}

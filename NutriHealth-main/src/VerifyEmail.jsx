import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Activity, AlertCircle, ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmSignup, loading } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email) return setError('Email is required');
    if (!code) return setError('Verification code is required');

    try {
      await confirmSignup(email, code);
      navigate('/');
    } catch (authError) {
      setError(authError.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-teal-500/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-200/80 relative">
        <Link to="/" className="flex items-center justify-center gap-3 cursor-pointer group mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30"><Activity className="text-white w-6 h-6" /></div>
          <div><h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 tracking-tight">NutriHealth</h1><span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase flex items-center gap-1">AI Healthcare Platform <Sparkles className="w-2.5 h-2.5" /></span></div>
        </Link>
        <div className="text-center mb-8"><div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-teal-50 flex items-center justify-center"><Mail className="w-7 h-7 text-teal-600" /></div><h2 className="text-3xl font-bold text-slate-900 mb-3">Verify your email</h2><p className="text-slate-500 text-sm leading-relaxed">Enter the verification code sent to your email address to activate your account.</p></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2"><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="email">Email Address</label><input type="email" id="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm text-slate-900" placeholder="name@example.com" autoComplete="email" /></div>
          <div className="space-y-2"><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="code">Verification Code</label><input type="text" id="code" value={code} onChange={(event) => setCode(event.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm text-slate-900" placeholder="Enter your code" autoComplete="one-time-code" /></div>
          {error && <p className="text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
          <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="w-full py-4 px-6 flex items-center justify-center gap-3 text-white font-bold text-base rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Verifying...' : <><span>Verify Email</span><ArrowRight className="w-5 h-5" /></>}</motion.button>
        </form>
        <div className="mt-6 pt-4 border-t border-slate-100"><div className="flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>End-to-End Encrypted Medical Platform</span></div></div>
      </motion.div>
    </div>
  );
}

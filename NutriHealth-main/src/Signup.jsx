import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  HeartPulse,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { loading, signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!formData.email) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      await signup(formData.email, formData.password);
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (error) {
      setErrors({ form: error.message });
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
            Create Your Health Account
            <span className="block text-teal-600 mt-1">Start your personalized health journey</span>
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto lg:mx-0 leading-relaxed">Join thousands of users who trust our AI-powered health platform for accurate analysis and personalized nutrition guidance.</p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="name">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors"><User className="w-5 h-5" /></div>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm placeholder:text-slate-400 text-slate-900" placeholder="John Doe" autoComplete="name" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="email">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors"><Mail className="w-5 h-5" /></div>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 text-slate-900 ${errors.email ? 'border-rose-300 focus:ring-rose-500/40' : 'border-slate-200/90 focus:ring-teal-500/40'}`} placeholder="name@example.com" autoComplete="email" />
            </div>
            {errors.email && <p className="text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="password">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors"><Lock className="w-5 h-5" /></div>
              <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 text-slate-900 ${errors.password ? 'border-rose-300 focus:ring-rose-500/40' : 'border-slate-200/90 focus:ring-emerald-500/40'}`} placeholder="••••••••" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-teal-600 transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
            {errors.password && <p className="text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors"><ShieldCheck className="w-5 h-5" /></div>
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 text-slate-900 ${errors.confirmPassword ? 'border-rose-300 focus:ring-rose-500/40' : 'border-slate-200/90 focus:ring-emerald-500/40'}`} placeholder="••••••••" autoComplete="new-password" />
              <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-teal-600 transition-colors" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{errors.confirmPassword}</p>}
          </div>

          {errors.form && <p className="text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{errors.form}</p>}

          <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="w-full py-4 px-6 flex items-center justify-center gap-3 text-white font-bold text-base rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Creating Account...' : <><span>Create Account</span><ArrowRight className="w-5 h-5" /></>}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">Already have an account? <Link to="/" className="text-teal-600 hover:text-teal-500 font-semibold underline-offset-4 hover:underline">Sign In</Link></div>
        <div className="mt-6 pt-4 border-t border-slate-100"><div className="flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>End-to-End Encrypted Medical Platform</span></div></div>
      </motion.div>
    </div>
  );
}

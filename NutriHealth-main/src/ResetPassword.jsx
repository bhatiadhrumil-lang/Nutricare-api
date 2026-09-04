import { useEffect, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
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
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function getResetErrorMessage(error) {
  switch (error?.name) {
    case 'CodeMismatchException':
      return 'The verification code is incorrect. Please try again.';
    case 'ExpiredCodeException':
      return 'The verification code has expired. Please request a new one.';
    case 'LimitExceededException':
      return 'Too many attempts. Please wait a while before trying again.';
    case 'InvalidPasswordException':
      return 'Your password does not meet the required security requirements.';
    case 'UserNotFoundException':
      return 'No account was found with this email address.';
    default:
      return 'Unable to reset your password. Please try again.';
  }
}

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmResetPassword, loading } = useAuth();
  const email = location.state?.email;
  const redirectTimer = useRef(null);
  const [formData, setFormData] = useState({
    code: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => () => {
    if (redirectTimer.current) clearTimeout(redirectTimer.current);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.code.trim()) {
      setError('Verification code is required');
      return;
    }

    if (!formData.password) {
      setError('New password is required');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm your new password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await confirmResetPassword(email, formData.code.trim(), formData.password);
      setSuccess(true);
      redirectTimer.current = setTimeout(() => navigate('/', { replace: true }), 2000);
    } catch (authError) {
      setError(getResetErrorMessage(authError));
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-teal-500/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />

      <Motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center text-center lg:text-left px-4 lg:px-0"
      >
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 tracking-tight">NutriHealth</h1>
              <span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase flex items-center gap-1">AI Healthcare Platform <Sparkles className="w-2.5 h-2.5" /></span>
            </div>
          </div>
        </div>

        <div className="mb-8 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            Create a New Password
            <span className="block text-teal-600 mt-1">Restore access to your health insights</span>
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto lg:mx-0 leading-relaxed">Enter the verification code we sent to your email, then choose a secure new password.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 lg:mb-0">
          <div className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>End-to-End Encrypted</span></div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span>HIPAA Compliant</span></div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><HeartPulse className="w-4 h-4 text-teal-500" /><span>AI-Powered Analysis</span></div>
        </div>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="w-full lg:w-1/2 bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-200/80"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-teal-50 flex items-center justify-center"><Lock className="w-7 h-7 text-teal-600" /></div>
          <h3 className="text-2xl font-bold text-slate-900">Reset your password</h3>
          <p className="mt-2 text-sm text-slate-500">Set a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="email">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400"><Mail className="w-5 h-5" /></div>
              <input type="email" id="email" value={email} readOnly disabled={loading} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm text-slate-500 cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="code">Verification Code</label>
            <input type="text" id="code" name="code" value={formData.code} onChange={handleChange} disabled={loading || success} autoFocus autoComplete="one-time-code" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm text-slate-900 disabled:opacity-60" placeholder="Enter your code" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="password">New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors"><Lock className="w-5 h-5" /></div>
              <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} disabled={loading || success} autoComplete="new-password" className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all text-sm text-slate-900 disabled:opacity-60" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} disabled={loading || success} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-teal-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed" aria-label={showPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors"><ShieldCheck className="w-5 h-5" /></div>
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} disabled={loading || success} autoComplete="new-password" className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all text-sm text-slate-900 disabled:opacity-60" placeholder="••••••••" />
              <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} disabled={loading || success} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
          </div>

          {error && <p role="alert" className="text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
          {success && <p role="status" aria-live="polite" className="text-xs text-emerald-600 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />Password updated successfully.</p>}

          <Motion.button type="submit" disabled={loading || success} whileHover={{ scale: loading || success ? 1 : 1.01 }} whileTap={{ scale: loading || success ? 1 : 0.98 }} className="w-full py-4 px-6 flex items-center justify-center gap-3 text-white font-bold text-base rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting Password...</> : <><span>Reset Password</span><ArrowRight className="w-5 h-5" /></>}
          </Motion.button>

          <button type="button" onClick={() => navigate('/')} disabled={loading || success} className="w-full text-sm text-teal-600 hover:text-teal-500 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">Back to Login</button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100"><div className="flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>End-to-End Encrypted Medical Platform</span></div></div>
      </Motion.div>
    </div>
  );
}

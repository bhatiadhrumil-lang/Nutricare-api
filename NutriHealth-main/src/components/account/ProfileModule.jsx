import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { User, CheckCircle2, AlertCircle, Loader2, Edit2, Save, X } from 'lucide-react';
import { getProfile, updateProfile } from '../../api/apiClient';

export default function ProfileModule({ currentUser, onProfileUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Prefer not to say',
    height: '',
    weight: '',
    activityLevel: 'Moderate',
  });

  const [initialForm, setInitialForm] = useState({});

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProfile();
      if (res?.success && res?.profile) {
        const p = res.profile;
        const loadedData = {
          fullName: p.fullName || '',
          email: p.email || currentUser?.username || currentUser?.signInDetails?.loginId || '',
          phone: p.phone || '',
          dob: p.dob || '',
          gender: p.gender || 'Prefer not to say',
          height: p.height || '',
          weight: p.weight || '',
          activityLevel: p.activityLevel || 'Moderate',
        };
        setForm(loadedData);
        setInitialForm(loadedData);
      }
    } catch (err) {
      console.error('[ProfileModule] Error fetching profile:', err);
      // Fallback to auth details
      const fallbackEmail = currentUser?.username || currentUser?.signInDetails?.loginId || '';
      setForm((prev) => ({ ...prev, email: fallbackEmail }));
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validation
    if (form.height !== '' && (isNaN(form.height) || Number(form.height) <= 0 || Number(form.height) > 300)) {
      setError('Please enter a valid height in cm (1 - 300).');
      return;
    }
    if (form.weight !== '' && (isNaN(form.weight) || Number(form.weight) <= 0 || Number(form.weight) > 500)) {
      setError('Please enter a valid weight in kg (1 - 500).');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
        activityLevel: form.activityLevel,
      };

      const res = await updateProfile(payload);
      if (res?.success) {
        setSuccessMsg('Profile updated successfully!');
        setInitialForm(form);
        setIsEditing(false);
        if (onProfileUpdated) onProfileUpdated();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(res?.error || 'Failed to update profile. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setIsEditing(false);
    setError(null);
  };

  const age = calculateAge(form.dob);

  const getInitials = (name) => {
    if (!name) return 'NH';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-center min-h-[240px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Loading Profile Data...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Personal Profile</h3>
            <p className="text-xs text-slate-500">Your core health and identity details</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Overview Card Header */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-100 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-teal-500/20 flex-shrink-0">
          {getInitials(form.fullName)}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-base font-bold text-slate-900">{form.fullName || 'Health Patient'}</h4>
          <p className="text-xs text-slate-500">{form.email || 'Authenticated User'}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            {form.gender && form.gender !== 'Prefer not to say' && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[11px] font-semibold">
                {form.gender}
              </span>
            )}
            {age !== null && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[11px] font-semibold">
                {age} yrs
              </span>
            )}
            {form.height && (
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-semibold">
                {form.height} cm
              </span>
            )}
            {form.weight && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                {form.weight} kg
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              disabled={!isEditing}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Email Address (Cognito Authenticated) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address <span className="text-[10px] text-slate-400 font-normal">(Verified via Cognito)</span>
            </label>
            <input
              type="email"
              disabled
              value={form.email}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-medium text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              disabled={!isEditing}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 XXXXX XXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              disabled={!isEditing}
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
            <select
              disabled={!isEditing}
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            >
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Height (cm) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
            <input
              type="number"
              min="1"
              max="300"
              disabled={!isEditing}
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              placeholder="e.g. 175"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Weight (kg) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              min="1"
              max="500"
              disabled={!isEditing}
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              placeholder="e.g. 72"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Activity Level</label>
            <select
              disabled={!isEditing}
              value={form.activityLevel}
              onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            >
              <option value="Sedentary">Sedentary (Little or no exercise)</option>
              <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
              <option value="Moderate">Moderate (3-5 days/week)</option>
              <option value="Very Active">Very Active (6-7 days/week)</option>
              <option value="Extra Active">Extra Active (Intense training/physical job)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </motion.div>
  );
}

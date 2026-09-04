import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Info, CheckCircle2, AlertCircle, Loader2, Save, Plus, X } from 'lucide-react';
import { getMedicalInformation, updateMedicalInformation } from '../../api/apiClient';

export default function MedicalInfoModule({ onMedicalInfoUpdated }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [form, setForm] = useState({
    conditions: [],
    allergies: [],
    medications: [],
    notes: '',
  });

  const [inputs, setInputs] = useState({
    condition: '',
    allergy: '',
    medication: '',
  });

  useEffect(() => {
    fetchMedicalInfo();
  }, []);

  const fetchMedicalInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMedicalInformation();
      if (res?.success && res?.medicalInformation) {
        const m = res.medicalInformation;
        setForm({
          conditions: m.conditions || [],
          allergies: m.allergies || [],
          medications: m.medications || [],
          notes: m.notes || '',
        });
      }
    } catch (err) {
      console.error('[MedicalInfoModule] Error fetching medical info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (category, fieldName, tagList) => {
    const val = inputs[category]?.trim();
    if (!val) return;
    if (!tagList.includes(val)) {
      setForm((prev) => ({
        ...prev,
        [fieldName]: [...tagList, val],
      }));
    }
    setInputs((prev) => ({ ...prev, [category]: '' }));
  };

  const handleRemoveTag = (fieldName, itemToRemove) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((item) => item !== itemToRemove),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      const res = await updateMedicalInformation(form);
      if (res?.success) {
        setSuccessMsg('Medical information updated securely.');
        if (onMedicalInfoUpdated) onMedicalInfoUpdated();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(res?.error || 'Failed to save medical information.');
      }
    } catch (err) {
      setError(err?.message || 'Unable to save medical information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-center min-h-[240px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Loading Medical Information...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Medical Information</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Optional
              </span>
            </div>
            <p className="text-xs text-slate-500">Sensitive medical details for enhanced safety checks</p>
          </div>
        </div>
      </div>

      {/* Required UX Healthcare Notice */}
      <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900 font-medium leading-relaxed">
          Medical information helps NutriHealth provide more relevant nutritional insights. Always consult a qualified healthcare professional for medical decisions.
        </p>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Existing Conditions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Existing Health Conditions</label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {form.conditions.map((condition) => (
              <span
                key={condition}
                className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {condition}
                <button
                  type="button"
                  onClick={() => handleRemoveTag('conditions', condition)}
                  className="p-0.5 rounded-md hover:bg-amber-200/50 text-amber-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={inputs.condition}
              onChange={(e) => setInputs({ ...inputs, condition: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('condition', 'conditions', form.conditions);
                }
              }}
              placeholder="e.g. Diabetes, Hypertension..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag('condition', 'conditions', form.conditions)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Known Allergies */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Known Medical / Drug Allergies</label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {form.allergies.map((allergy) => (
              <span
                key={allergy}
                className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {allergy}
                <button
                  type="button"
                  onClick={() => handleRemoveTag('allergies', allergy)}
                  className="p-0.5 rounded-md hover:bg-rose-200/50 text-rose-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={inputs.allergy}
              onChange={(e) => setInputs({ ...inputs, allergy: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('allergy', 'allergies', form.allergies);
                }
              }}
              placeholder="e.g. Penicillin, Latex, Aspirin..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag('allergy', 'allergies', form.allergies)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Current Medications */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Medications</label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {form.medications.map((med) => (
              <span
                key={med}
                className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {med}
                <button
                  type="button"
                  onClick={() => handleRemoveTag('medications', med)}
                  className="p-0.5 rounded-md hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={inputs.medication}
              onChange={(e) => setInputs({ ...inputs, medication: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('medication', 'medications', form.medications);
                }
              }}
              placeholder="e.g. Metformin 500mg, Vitamin D3..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag('medication', 'medications', form.medications)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Important Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Important Medical Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Add any additional context or clinical considerations your healthcare provider has recommended..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Info...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Medical Info</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

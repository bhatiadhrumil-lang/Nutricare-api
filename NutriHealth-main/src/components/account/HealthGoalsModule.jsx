import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Check, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';
import { getHealthGoals, updateHealthGoals } from '../../api/apiClient';

const GOAL_OPTIONS = [
  { id: 'improve_nutrition', label: 'Improve overall nutrition', emoji: '🥗', desc: 'Optimize daily vitamin, mineral & macronutrient intake' },
  { id: 'improve_immunity', label: 'Improve immunity', emoji: '🛡', desc: 'Strengthen body defenses with key micronutrients' },
  { id: 'manage_weight', label: 'Manage weight', emoji: '⚖', desc: 'Maintain or reduce weight through tailored caloric balance' },
  { id: 'gain_muscle', label: 'Gain muscle', emoji: '💪', desc: 'Support hypertrophy with optimal protein & nutrient timing' },
  { id: 'improve_energy', label: 'Improve energy', emoji: '⚡', desc: 'Sustain natural vitality and eliminate afternoon fatigue' },
  { id: 'improve_diet_quality', label: 'Improve diet quality', emoji: '🍎', desc: 'Shift to whole, nutrient-dense foods & fiber' },
  { id: 'address_deficiencies', label: 'Address nutritional deficiencies', emoji: '💊', desc: 'Target blood report deficiency markers' },
  { id: 'improve_heart_health', label: 'Improve heart health', emoji: '❤️', desc: 'Support healthy cholesterol, lipid & blood pressure profiles' },
  { id: 'improve_digestive_health', label: 'Improve digestive health', emoji: '🧬', desc: 'Enhance gut microbiome, gut motility & digestion' },
];

export default function HealthGoalsModule({ onGoalsUpdated }) {
  const [selectedGoals, setSelectedGoals] = useState(['improve_nutrition', 'improve_immunity']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHealthGoals();
      if (res?.success && Array.isArray(res?.healthGoals)) {
        setSelectedGoals(res.healthGoals);
      }
    } catch (err) {
      console.error('[HealthGoalsModule] Error fetching health goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goalId) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      const res = await updateHealthGoals(selectedGoals);
      if (res?.success) {
        setSuccessMsg('Health goals updated successfully!');
        if (onGoalsUpdated) onGoalsUpdated();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(res?.error || 'Failed to save health goals.');
      }
    } catch (err) {
      setError(err?.message || 'Unable to save health goals.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-center min-h-[240px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Loading Health Goals...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Health Goals</h3>
            <p className="text-xs text-slate-500">What are you trying to achieve? Select all that apply.</p>
          </div>
        </div>
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

      {/* Visually Attractive Selectable Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 my-4">
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <motion.button
              type="button"
              key={goal.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleGoal(goal.id)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-white border-teal-500 ring-2 ring-teal-500/20 shadow-md shadow-teal-500/10'
                  : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/90 text-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-2xl">{goal.emoji}</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isSelected ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{goal.label}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">{goal.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer / Submit */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''} selected
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Goals...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Health Goals</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

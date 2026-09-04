import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, CheckCircle2, AlertCircle, Loader2, Save, Plus, X } from 'lucide-react';
import { getPreferences, updatePreferences } from '../../api/apiClient';

const DIET_TYPES = ['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Vegetarian', 'Other'];
const EXERCISE_FREQUENCIES = ['Rarely', '1-2 times/week', '3-4 times/week', '5+ times/week', 'Daily'];

export default function PreferencesModule({ onPreferencesUpdated }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [form, setForm] = useState({
    dietType: 'Vegetarian',
    preferredCuisines: ['Indian', 'Mediterranean'],
    favoriteFoods: [],
    foodsToAvoid: [],
    foodAllergies: ['Peanuts'],
    dietaryRestrictions: ['Dairy-free'],
    exerciseFrequency: '3-4 times/week',
    sleepDuration: 7.5,
    waterGoal: 2.5,
  });

  // Inputs for adding new tags
  const [inputs, setInputs] = useState({
    cuisine: '',
    favoriteFood: '',
    avoidFood: '',
    allergy: '',
    restriction: '',
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPreferences();
      if (res?.success && res?.preferences) {
        const p = res.preferences;
        setForm({
          dietType: p.dietType || 'Vegetarian',
          preferredCuisines: p.preferredCuisines || [],
          favoriteFoods: p.favoriteFoods || [],
          foodsToAvoid: p.foodsToAvoid || [],
          foodAllergies: p.foodAllergies || [],
          dietaryRestrictions: p.dietaryRestrictions || [],
          exerciseFrequency: p.exerciseFrequency || '3-4 times/week',
          sleepDuration: p.sleepDuration || 7.5,
          waterGoal: p.waterGoal || 2.5,
        });
      }
    } catch (err) {
      console.error('[PreferencesModule] Error fetching preferences:', err);
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

  const handleRemoveTag = (fieldName, tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((t) => t !== tagToRemove),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    try {
      const res = await updatePreferences(form);
      if (res?.success) {
        setSuccessMsg('Nutrition preferences saved successfully!');
        if (onPreferencesUpdated) onPreferencesUpdated();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(res?.error || 'Failed to save preferences.');
      }
    } catch (err) {
      setError(err?.message || 'Unable to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-center min-h-[240px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Loading Nutrition Preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Health & Nutrition Preferences</h3>
            <p className="text-xs text-slate-500">Dietary patterns, allergies, and lifestyle targets</p>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dietary Preference (Pill selector) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Dietary Preference</label>
          <div className="flex flex-wrap gap-2">
            {DIET_TYPES.map((type) => {
              const active = form.dietType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, dietType: type })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    active
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-transparent shadow-md shadow-teal-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Food Allergies */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Food Allergies</label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {form.foodAllergies.map((allergy) => (
              <span
                key={allergy}
                className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5"
              >
                {allergy}
                <button
                  type="button"
                  onClick={() => handleRemoveTag('foodAllergies', allergy)}
                  className="p-0.5 rounded-md hover:bg-rose-200/50 text-rose-500 cursor-pointer"
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
                  handleAddTag('allergy', 'foodAllergies', form.foodAllergies);
                }
              }}
              placeholder="e.g. Peanuts, Dairy, Shellfish..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag('allergy', 'foodAllergies', form.foodAllergies)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Dietary Restrictions</label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {form.dietaryRestrictions.map((restriction) => (
              <span
                key={restriction}
                className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {restriction}
                <button
                  type="button"
                  onClick={() => handleRemoveTag('dietaryRestrictions', restriction)}
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
              value={inputs.restriction}
              onChange={(e) => setInputs({ ...inputs, restriction: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('restriction', 'dietaryRestrictions', form.dietaryRestrictions);
                }
              }}
              placeholder="e.g. Gluten-free, Low sodium, Low sugar..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag('restriction', 'dietaryRestrictions', form.dietaryRestrictions)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Foods to Avoid */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Foods to Avoid</label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {form.foodsToAvoid.map((food) => (
              <span
                key={food}
                className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                {food}
                <button
                  type="button"
                  onClick={() => handleRemoveTag('foodsToAvoid', food)}
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
              value={inputs.avoidFood}
              onChange={(e) => setInputs({ ...inputs, avoidFood: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('avoidFood', 'foodsToAvoid', form.foodsToAvoid);
                }
              }}
              placeholder="e.g. Processed sugar, Fried food..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag('avoidFood', 'foodsToAvoid', form.foodsToAvoid)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Preferred Cuisines */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Cuisines</label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {form.preferredCuisines.map((cuisine) => (
              <span
                key={cuisine}
                className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {cuisine}
                <button
                  type="button"
                  onClick={() => handleRemoveTag('preferredCuisines', cuisine)}
                  className="p-0.5 rounded-md hover:bg-teal-200/50 text-teal-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={inputs.cuisine}
              onChange={(e) => setInputs({ ...inputs, cuisine: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('cuisine', 'preferredCuisines', form.preferredCuisines);
                }
              }}
              placeholder="e.g. Indian, Mediterranean, Asian..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag('cuisine', 'preferredCuisines', form.preferredCuisines)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Lifestyle: Exercise, Sleep & Hydration */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Exercise Frequency */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Exercise Frequency</label>
            <select
              value={form.exerciseFrequency}
              onChange={(e) => setForm({ ...form, exerciseFrequency: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {EXERCISE_FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>

          {/* Sleep Duration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Sleep Duration</label>
              <span className="text-xs font-bold text-teal-600">{form.sleepDuration} hrs</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              value={form.sleepDuration}
              onChange={(e) => setForm({ ...form, sleepDuration: Number(e.target.value) })}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>

          {/* Daily Water Goal */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Daily Water Goal</label>
              <span className="text-xs font-bold text-teal-600">{form.waterGoal} L</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="0.25"
              value={form.waterGoal}
              onChange={(e) => setForm({ ...form, waterGoal: Number(e.target.value) })}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

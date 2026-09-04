import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Circle, ArrowRight, Loader2 } from 'lucide-react';
import { getAiPersonalization } from '../../api/apiClient';

export default function AiPersonalizationModule({ onCompleteProfileClick }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    completionPercentage: 0,
    completed: [],
    incomplete: [],
    summary: 'Complete your profile to unlock max AI personalization.',
  });

  useEffect(() => {
    fetchPersonalization();
  }, []);

  const fetchPersonalization = async () => {
    setLoading(true);
    try {
      const res = await getAiPersonalization();
      if (res?.success && res?.personalization) {
        setData(res.personalization);
      }
    } catch (err) {
      console.error('[AiPersonalizationModule] Error fetching AI personalization:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-center min-h-[240px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Calculating AI Personalization...</span>
        </div>
      </div>
    );
  }

  const pct = data.completionPercentage || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-900/40 relative overflow-hidden flex flex-col justify-between"
    >
      {/* Background Glow Effect */}
      <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold border border-teal-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Personalization</h3>
              <p className="text-xs text-teal-200/70">NutriHealth AI Engine profile strength</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black border border-teal-500/30">
            {pct}% Complete
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-semibold mb-2 text-teal-100">
            <span>Profile Completeness</span>
            <span className="font-bold text-teal-300">{pct}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full shadow-lg shadow-teal-500/50"
            />
          </div>
        </div>

        {/* AI Profile Summary */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
          <p className="text-xs font-medium text-teal-100 leading-relaxed">
            "{data.summary || 'Your recommendations become more personalized when you complete your profile.'}"
          </p>
        </div>

        {/* Completed vs Incomplete List */}
        <div className="space-y-4 mb-6 text-xs">
          {data.completed && data.completed.length > 0 && (
            <div>
              <span className="font-bold text-emerald-400 block mb-2 uppercase text-[10px] tracking-wider">
                Completed Factors ({data.completed.length})
              </span>
              <div className="space-y-1.5">
                {data.completed.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-slate-200 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.incomplete && data.incomplete.length > 0 && (
            <div>
              <span className="font-bold text-amber-400 block mb-2 uppercase text-[10px] tracking-wider">
                Incomplete Factors ({data.incomplete.length})
              </span>
              <div className="space-y-1.5">
                {data.incomplete.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-slate-400 font-medium">
                    <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action CTA Button */}
      {pct < 100 && (
        <button
          type="button"
          onClick={onCompleteProfileClick}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-xs hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-teal-400/30"
        >
          <span>Complete My Profile</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

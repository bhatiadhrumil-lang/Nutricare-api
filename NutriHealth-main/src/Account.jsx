import React, { useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Sparkles, HeartPulse } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import ProfileModule from './components/account/ProfileModule';
import PreferencesModule from './components/account/PreferencesModule';
import HealthGoalsModule from './components/account/HealthGoalsModule';
import MedicalInfoModule from './components/account/MedicalInfoModule';
import UploadedReportsModule from './components/account/UploadedReportsModule';
import AiPersonalizationModule from './components/account/AiPersonalizationModule';

export default function Account() {
  const { currentUser } = useAuth();

  const profileRef = useRef(null);
  const preferencesRef = useRef(null);
  const goalsRef = useRef(null);

  // Trigger refresh on dependent components when updates happen
  const [aiKey, setAiKey] = useState(0);

  const handleUpdateTrigger = () => {
    setAiKey((prev) => prev + 1);
  };

  const handleCompleteProfileClick = () => {
    if (preferencesRef.current) {
      preferencesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (goalsRef.current) {
      goalsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (profileRef.current) {
      profileRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Top Banner Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 text-white shadow-lg shadow-teal-500/10 relative overflow-hidden"
      >
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> My Health Profile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
            Account & Nutrition Settings
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-2xl">
            Manage your personal details, dietary preferences, health goals, and medical history to power your NutriHealth AI recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-teal-700 flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">AI Engine Active</p>
              <p className="text-[10px] text-teal-200">Personalized Guidance</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid Layout (Responsive 2-column desktop / 1-column mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Profile, Preferences, Goals, Medical Info) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          <div ref={profileRef}>
            <ProfileModule currentUser={currentUser} onProfileUpdated={handleUpdateTrigger} />
          </div>

          <div ref={preferencesRef}>
            <PreferencesModule onPreferencesUpdated={handleUpdateTrigger} />
          </div>

          <div ref={goalsRef}>
            <HealthGoalsModule onGoalsUpdated={handleUpdateTrigger} />
          </div>

          <div>
            <MedicalInfoModule onMedicalInfoUpdated={handleUpdateTrigger} />
          </div>
        </div>

        {/* Right Column (AI Personalization, Reports Overview) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 lg:sticky lg:top-6">
          
          <AiPersonalizationModule
            key={aiKey}
            onCompleteProfileClick={handleCompleteProfileClick}
          />

          <UploadedReportsModule />

        </div>

      </div>
    </div>
  );
}

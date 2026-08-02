import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useReport } from './context/ReportContext';
import AIConsultationFlow from './components/consultation/AIConsultationFlow';

// ── Static fallback data (shown if no API result is available) ──────────────
const STATIC_VALUES = [
  { id: 1, name: 'Hemoglobin', value: '13.5 g/dL', status: 'normal', normalRange: '13.0-17.0', explanation: 'Your hemoglobin is within the healthy range.' },
  { id: 2, name: 'Fasting Blood Sugar', value: '115 mg/dL', status: 'high', normalRange: '70-100', explanation: 'Slightly elevated — pre-diabetic range.' },
  { id: 3, name: 'LDL Cholesterol', value: '145 mg/dL', status: 'high', normalRange: '< 100', explanation: 'High LDL increases cardiovascular risk.' },
  { id: 4, name: 'Vitamin D', value: '30 ng/mL', status: 'normal', normalRange: '30-100', explanation: 'At the lower end of normal.' },
  { id: 5, name: 'Triglycerides', value: '110 mg/dL', status: 'normal', normalRange: '< 150', explanation: 'Within normal limits.' },
];

const STATIC_FOODS_EAT = ['Oats & Berries', 'Almonds & Walnuts', 'Spinach & Lentils', 'Avocado', 'Whole grains'];
const STATIC_FOODS_AVOID = ['White bread', 'Sugary drinks', 'Fried foods', 'Processed meats'];
const STATIC_NUTRIENTS = ['Fiber', 'Omega-3', 'Magnesium', 'Vitamin D'];
const STATIC_LIFESTYLE = [
  '30 minutes of brisk walking daily',
  'Reduce refined carbohydrates',
  'Stay hydrated — 8 glasses of water daily',
  'Prioritize 7-8 hours of sleep',
];

export default function Results() {
  const { analysisResult, analysisError, uploadedFile } = useReport();

  const hasRealData = !!analysisResult && typeof analysisResult === 'object';

  const bloodParams = hasRealData && Array.isArray(analysisResult.bloodParameters) && analysisResult.bloodParameters.length > 0
    ? analysisResult.bloodParameters
    : STATIC_VALUES;
  const nutrients = hasRealData && Array.isArray(analysisResult.nutrients) && analysisResult.nutrients.length > 0
    ? analysisResult.nutrients
    : STATIC_NUTRIENTS;
  const allFoodsEat = hasRealData && Array.isArray(analysisResult.foodsToEat) && analysisResult.foodsToEat.length > 0
    ? analysisResult.foodsToEat
    : STATIC_FOODS_EAT;
  const foodsAvoid = hasRealData && Array.isArray(analysisResult.foodsToAvoid) && analysisResult.foodsToAvoid.length > 0
    ? analysisResult.foodsToAvoid
    : STATIC_FOODS_AVOID;
  const lifestyle = hasRealData && Array.isArray(analysisResult.lifestyle) && analysisResult.lifestyle.length > 0
    ? analysisResult.lifestyle
    : STATIC_LIFESTYLE;
  const summary = hasRealData && analysisResult.summary
    ? analysisResult.summary
    : 'Overall health baseline is stable, but attention is required regarding your lipid profile and fasting sugar levels.';
  const disease = hasRealData && analysisResult.disease
    ? analysisResult.disease
    : 'Lipid & Glycemic Markers';
  const confidence = hasRealData && analysisResult.confidence
    ? analysisResult.confidence
    : 'High';
  const disclaimer = hasRealData && analysisResult.disclaimer ? analysisResult.disclaimer : null;

  return (
    <div className="w-full space-y-6">
      
      {/* Error banner — shown if analysis failed but user landed here */}
      {analysisError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl"
        >
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-rose-800 font-semibold text-sm">Analysis notice — displaying baseline sample profile</p>
            <p className="text-rose-700 text-sm mt-0.5">{analysisError}</p>
          </div>
        </motion.div>
      )}

      {/* AI Consultation Interactive Flow */}
      <AIConsultationFlow
        analysisResult={analysisResult}
        uploadedFile={uploadedFile}
        bloodParams={bloodParams}
        nutrients={nutrients}
        allFoodsEat={allFoodsEat}
        foodsAvoid={foodsAvoid}
        lifestyle={lifestyle}
        summary={summary}
        disease={disease}
        confidence={confidence}
        disclaimer={disclaimer}
      />

    </div>
  );
}

import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { UploadCloud, FileText, ArrowRight, ShieldCheck, FileCheck2, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReport } from './context/ReportContext';
import { analyzeReport } from './api/apiClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);

  const {
    setUploadedFile,
    setIsAnalyzing,
    setAnalysisResult,
    setAnalysisError,
    resetReport,
    setReportData,
  } = useReport();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    resetReport();
    setUploadedFile(file);
    setIsAnalyzing(true);
    setAnalysisError(null);

    navigate('/processing');

    try {
      const result = await analyzeReport(file);
      if (result && typeof result === 'object') {
        setReportData(result);
      } else {
        throw new Error('The AI service returned an invalid result format.');
      }
    } catch (err) {
      console.error('[Dashboard] Analysis failed:', err.message);
      setAnalysisError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-auto py-8 sm:py-12 flex flex-col items-center justify-center">
      <div className="w-full flex flex-col items-center">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            <span>AI OCR & Clinical Gemini Parsing</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Upload Blood Test Report
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
            Upload your laboratory blood test PDF or scan. Our AI engine instantly extracts biomarkers and crafts a personalized health consultation.
          </p>
        </motion.div>

        {/* Upload Dropzone Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full"
        >
          <label 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center w-full h-80 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden p-8
              ${isDragging 
                ? "border-teal-500 bg-teal-50/70 shadow-[0_0_40px_-10px_rgba(20,184,166,0.25)] scale-[1.01]" 
                : "border-slate-300/80 bg-white hover:border-teal-500/50 hover:bg-slate-50/80 shadow-xl shadow-slate-200/50"}
            `}
          >
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,image/*" 
              onChange={handleFileChange}
            />
            
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center pointer-events-none z-10"
              animate={{ y: isDragging ? -8 : 0, scale: isDragging ? 1.03 : 1 }}
            >
              <div className={`p-5 rounded-2xl transition-all duration-300 ${
                isDragging || file 
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30" 
                  : "bg-slate-100 text-teal-600 border border-slate-200"
              }`}>
                {file ? (
                  <FileCheck2 className="w-10 h-10" />
                ) : (
                  <UploadCloud className="w-10 h-10" />
                )}
              </div>
              
              <div className="space-y-1">
                {file ? (
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 truncate max-w-xs">{file.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-md border border-teal-200">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for Analysis
                    </span>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-slate-800">
                      Drag & Drop or <span className="text-teal-600 font-extrabold underline underline-offset-4">Click to browse</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Supports PDF, PNG, JPG medical scans (Max 15MB)
                    </p>
                  </>
                )}
              </div>
            </motion.div>
            
            {/* Floating background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
          </label>
        </motion.div>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 w-full flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            disabled={!file}
            whileHover={file ? { scale: 1.02 } : {}}
            whileTap={file ? { scale: 0.98 } : {}}
            onClick={handleAnalyze}
            className={`px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 w-full sm:w-auto min-w-[220px] cursor-pointer
              ${file 
                ? "text-white bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 ring-2 ring-transparent focus:ring-teal-400/50" 
                : "bg-slate-200/80 text-slate-400 border border-slate-200 cursor-not-allowed"}
            `}
          >
            <span>Start AI Consultation</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Privacy Note */}
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>HIPAA-aligned 256-bit encryption • Files processed in real-time</span>
        </div>

      </div>
    </div>
  );
}

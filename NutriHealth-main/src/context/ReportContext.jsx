/**
 * ReportContext.jsx
 * Global state for the analyzed blood report result and uploaded file.
 * Wraps the entire app so any page can read/write analysis data.
 */

import React, { createContext, useContext, useState } from 'react';

const ReportContext = createContext(null);

export function ReportProvider({ children }) {
  // The full JSON returned from POST /api/analyze-report
  const [analysisResult, setAnalysisResult] = useState(null);

  // The File object the user selected (kept for display purposes)
  const [uploadedFile, setUploadedFile] = useState(null);

  // Loading state: true while the backend is processing
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Any error from the backend
  const [analysisError, setAnalysisError] = useState(null);

  // Chat conversation history (array of { role: 'user'|'model', text: string })
  const [chatHistory, setChatHistory] = useState([]);

  const resetReport = () => {
    setAnalysisResult(null);
    setUploadedFile(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setChatHistory([]);
  };

  const setReportData = (payload) => {
    if (payload && typeof payload === 'object') {
      setAnalysisResult(payload);
      setAnalysisError(null);
    }
  };

  return (
    <ReportContext.Provider
      value={{
        analysisResult,
        setAnalysisResult,
        uploadedFile,
        setUploadedFile,
        isAnalyzing,
        setIsAnalyzing,
        analysisError,
        setAnalysisError,
        chatHistory,
        setChatHistory,
        resetReport,
        setReportData,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

/**
 * Hook to consume the report context.
 * Usage: const { analysisResult, isAnalyzing } = useReport();
 */
export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error('useReport must be used inside <ReportProvider>');
  return ctx;
}

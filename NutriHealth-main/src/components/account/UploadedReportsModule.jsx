import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight, UploadCloud, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getReportsSummary } from '../../api/apiClient';

export default function UploadedReportsModule() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalReports: 0,
    latestReportName: null,
    latestUploadDate: null,
    latestStatus: null,
    analyzedReportsCount: 0,
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await getReportsSummary();
      if (res?.success && res?.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('[UploadedReportsModule] Error fetching reports summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Analysis Complete':
        return (
          <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Analysis Complete</span>
          </span>
        );
      case 'Processing':
      case 'Analysis in progress':
      case 'Uploading':
        return (
          <span className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>{status || 'Processing'}</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 w-fit">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold w-fit">
            {status || 'No Status'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Loading Reports Summary...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Uploaded Reports</h3>
            <p className="text-xs text-slate-500">Summary of your medical lab reports</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start justify-center">
          <span className="text-2xl font-black text-slate-900">{summary.totalReports}</span>
          <span className="text-xs font-semibold text-slate-500 mt-1">Total Reports</span>
        </div>
        <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex flex-col items-start justify-center">
          <span className="text-2xl font-black text-teal-700">{summary.analyzedReportsCount}</span>
          <span className="text-xs font-semibold text-teal-600 mt-1">Analyzed Reports</span>
        </div>
      </div>

      {/* Latest Report Details */}
      {summary.latestReportName ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-200/80 mb-6 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latest Report</span>
              <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-full">
                {summary.latestReportName}
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">{formatDate(summary.latestUploadDate)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Status</span>
            {renderStatusBadge(summary.latestStatus)}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center mb-6">
          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">No reports uploaded yet</p>
          <p className="text-[11px] text-slate-500 mt-1">Upload a blood or lab report for instant AI analysis.</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          to="/recovery"
          className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1"
        >
          <span>View All Results</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          to="/upload"
          className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200 transition-all flex items-center gap-1.5"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Report</span>
        </Link>
      </div>
    </motion.div>
  );
}

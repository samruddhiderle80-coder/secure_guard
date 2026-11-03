import React, { useState, useEffect } from 'react';
import { ShieldQuestion, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export const RiskAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any>('/api/admin/analytics')
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error('Failed to load risk analytics from database:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const riskLevels = data?.distributions?.riskLevel || { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
  const catAverages = data?.distributions?.categoryAverages || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            Security Vulnerability Audit
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Risk & Findings Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Aggregated risk level distributions directly computed from database assessments.</p>
        </div>
        <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
          {loading ? <Loader2 size={28} className="animate-spin" /> : <ShieldQuestion size={28} />}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Risk Distribution Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase block">Low Risk</span>
            <span className="text-2xl font-black text-emerald-900 mt-1 block">{riskLevels.LOW || 0} Assessments</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-xs font-bold text-amber-800 uppercase block">Moderate Risk</span>
            <span className="text-2xl font-black text-amber-900 mt-1 block">{riskLevels.MODERATE || 0} Assessments</span>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
            <span className="text-xs font-bold text-orange-800 uppercase block">High Risk</span>
            <span className="text-2xl font-black text-orange-900 mt-1 block">{riskLevels.HIGH || 0} Assessments</span>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-xs font-bold text-rose-800 uppercase block">Critical Risk</span>
            <span className="text-2xl font-black text-rose-900 mt-1 block">{riskLevels.CRITICAL || 0} Assessments</span>
          </div>
        </div>
      </div>

      {Object.keys(catAverages).length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Domain Vulnerability Averages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(catAverages).map(([cat, avg]: [string, any]) => (
              <div key={cat} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">{cat}</span>
                <span className={`font-mono font-extrabold ${avg >= 70 ? 'text-emerald-600' : avg >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {avg}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

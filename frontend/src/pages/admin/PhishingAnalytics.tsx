import React, { useState, useEffect } from 'react';
import { Fish, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export const PhishingAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any>('/api/admin/analytics')
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error('Failed to load phishing analytics from database:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const total = data?.metrics?.phishingTestsCompleted || 0;
  const successRate = data?.metrics?.phishingSuccessRate || 0;
  const correct = Math.round((total * successRate) / 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            Admin Phishing Metrics
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Phishing Awareness Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Simulation accuracy rates directly computed from database records.</p>
        </div>
        <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
          {loading ? <Loader2 size={28} className="animate-spin" /> : <Fish size={28} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Attempts</span>
          <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{total}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Correct Responses</span>
          <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">{correct}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Phishing Defense Rate</span>
          <span className="text-3xl font-extrabold text-brand-600 mt-1 block">{successRate}%</span>
        </div>
      </div>
    </div>
  );
};

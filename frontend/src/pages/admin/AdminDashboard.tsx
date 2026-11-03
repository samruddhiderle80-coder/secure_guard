import React, { useEffect, useState } from 'react';
import { BarChart3, Users, ShieldAlert, AlertTriangle, Fish, MessageSquareHeart, GraduationCap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchApi } from '../../lib/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetchApi<any>('/api/admin/analytics');
        setData(res);
      } catch (err) {
        console.error('Failed to load admin analytics from database:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) return <LoadingSpinner label="Compiling Admin Platform Analytics..." />;

  const m = data?.metrics || {};
  const dist = data?.distributions || {};

  const categoryChartData = Object.keys(dist.categoryAverages || {}).map(k => ({
    category: k.toUpperCase(),
    score: dist.categoryAverages[k] || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-amber-500/10 border border-amber-300 p-6 rounded-2xl flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded">
            Administrative Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            System & Security Risk Analytics
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Aggregated database statistics, user vulnerability metrics, and platform usage reports.
          </p>
        </div>
        <div className="p-3 bg-amber-200 text-amber-900 rounded-2xl">
          <BarChart3 size={28} />
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{m.totalUsers || 0}</span>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Assessments</p>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{m.totalAssessments || 0}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ShieldAlert size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Security Score</p>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{m.averageScore || 0} / 100</span>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <BarChart3 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported Incidents</p>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{m.totalIncidents || 0}</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phishing Tests Passed</p>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{m.phishingSuccessRate || 0}%</span>
            <span className="text-[11px] text-slate-400 font-mono">({m.phishingTestsCompleted || 0} total attempts)</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Fish size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Training Completions</p>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{m.trainingCompletions || 0}</span>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Feedback Rating</p>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{m.avgRating || 'N/A'} ★</span>
            <span className="text-[11px] text-slate-400 font-mono">({m.totalFeedback || 0} responses)</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <MessageSquareHeart size={24} />
          </div>
        </div>
      </div>

      {/* Category Averages Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Average Security Score Per Category
        </h2>
        {m.totalAssessments === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No data available yet.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="score" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, Calendar, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchApi } from '../../lib/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { EmptyState } from '../../components/common/EmptyState';

export const SecurityHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetchApi<any>('/api/security/history');
        setHistory(res.history || []);
      } catch (err) {
        console.error('Failed to load history from database:', err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const chartData = history.map((item: any) => ({
    date: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent',
    score: item.total_score || item.score || 0,
  })).reverse();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
          <History size={28} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            Historical Progression
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Security Score Evolution & History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track security score improvements over time across completed assessments.
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Assessment History Found"
          description="Complete a security assessment to begin tracking your score progress over time."
          actionLabel="Take Assessment Now"
          actionPath="/assessment"
        />
      ) : (
        <>
          {/* Recharts Progress Graph */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Score Improvement Trend
            </h2>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="score" stroke="#0284c7" strokeWidth={3} dot={{ r: 5, fill: '#0284c7' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Past Assessments Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Assessment Log Records ({history.length})
            </h2>

            <div className="space-y-3">
              {history.map((item: any, i: number) => {
                const itemScore = item.total_score || item.score || 0;
                const itemRisk = item.risk_level || item.riskLevel || 'MODERATE';
                const dateStr = item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent Assessment';

                return (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-900">{dateStr}</span>
                      </div>
                      <p className="text-slate-500">ID: {item.id}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-slate-900 block leading-tight">{itemScore} / 100</span>
                        <RiskBadge level={itemRisk} size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

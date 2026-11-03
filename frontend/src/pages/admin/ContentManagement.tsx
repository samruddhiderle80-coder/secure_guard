import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Fish, HelpCircle, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export const ContentManagement: React.FC = () => {
  const [counts, setCounts] = useState<{
    assessmentQuestionsCount: number;
    phishingScenariosCount: number;
    trainingModulesCount: number;
  }>({
    assessmentQuestionsCount: 0,
    phishingScenariosCount: 0,
    trainingModulesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any>('/api/admin/content-summary')
      .then(res => {
        if (res) {
          setCounts({
            assessmentQuestionsCount: res.assessmentQuestionsCount || 0,
            phishingScenariosCount: res.phishingScenariosCount || 0,
            trainingModulesCount: res.trainingModulesCount || 0,
          });
        }
      })
      .catch(err => {
        console.error('Failed to load content summary from database:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            Admin Content Registry
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Security Content Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Live content inventory verified directly in PostgreSQL database.</p>
        </div>
        <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
          {loading ? <Loader2 size={28} className="animate-spin" /> : <BookOpen size={28} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Assessment Questions</span>
            <HelpCircle size={18} className="text-brand-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{counts.assessmentQuestionsCount} Active Questions</span>
          <p className="text-[11px] text-slate-500">Across 7 security categories in database</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Phishing Scenarios</span>
            <Fish size={18} className="text-brand-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{counts.phishingScenariosCount} Simulator Scenarios</span>
          <p className="text-[11px] text-slate-500">Easy, Medium & Hard difficulties in database</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Training Modules</span>
            <GraduationCap size={18} className="text-brand-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{counts.trainingModulesCount} Active Modules</span>
          <p className="text-[11px] text-slate-500">Phishing, Passwords, MFA & Privacy in database</p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { EyeOff, ShieldCheck, AlertCircle, CheckCircle, Save, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export const PrivacyCheck: React.FC = () => {
  const [answers, setAnswers] = useState({
    phonePublic: false,
    emailPublic: false,
    birthdayPublic: false,
    locationGeotagged: false,
    friendsPublic: false,
    oldPostsPublic: false,
    bioPersonalDetails: false,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchApi<{ assessment: any }>('/api/privacy')
      .then(res => {
        if (res.assessment && res.assessment.details) {
          const details = typeof res.assessment.details === 'string'
            ? JSON.parse(res.assessment.details)
            : res.assessment.details;
          setAnswers(prev => ({ ...prev, ...details }));
        }
      })
      .catch(err => {
        console.error('Failed to load privacy assessment from database:', err);
      });
  }, []);

  const handleToggle = (key: keyof typeof answers) => {
    setSaveSuccess(false);
    setAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const exposedCount = Object.values(answers).filter(v => v).length;
  const exposureScore = Math.max(0, 100 - exposedCount * 14);

  let exposureLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  let levelText = 'Low Exposure Risk';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (exposedCount >= 4) {
    exposureLevel = 'HIGH';
    levelText = 'High Exposure Risk';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (exposedCount >= 2) {
    exposureLevel = 'MODERATE';
    levelText = 'Moderate Exposure Risk';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const handleSaveToDatabase = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      await fetchApi('/api/privacy', {
        method: 'POST',
        body: JSON.stringify({
          exposureScore,
          exposureLevel,
          details: answers,
        }),
      });
      setSaveSuccess(true);
    } catch (err: any) {
      alert(`Failed to save to database: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
            <EyeOff size={28} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Privacy Self-Assessment
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Digital Footprint & Privacy Exposure Check
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assess publicly visible profile parameters and persist verification in the database.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveToDatabase}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Save to Database'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          <span>Privacy self-assessment successfully recorded in database!</span>
        </div>
      )}

      {/* Score Summary Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Privacy Exposure Score</span>
          <span className="text-3xl font-extrabold text-slate-900">{exposureScore} / 100</span>
          <p className="text-xs text-slate-500 mt-1">
            {exposedCount === 0 ? 'Optimal profile privacy configuration.' : `${exposedCount} potential OSINT risk factors enabled.`}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full border text-xs font-extrabold ${badgeColor}`}>
          {levelText}
        </span>
      </div>

      {/* Survey Toggle Grid */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Check All Parameters Currently Publicly Visible on Your Profiles
        </h3>

        {[
          { key: 'phonePublic', label: 'Phone Number is publicly visible on bio or contact buttons' },
          { key: 'emailPublic', label: 'Personal Email Address is visible in profile bio or search' },
          { key: 'birthdayPublic', label: 'Full Birth Year & Date of Birth are publicly displayed' },
          { key: 'locationGeotagged', label: 'Real-time location tags frequently added to public posts' },
          { key: 'friendsPublic', label: 'Full Friend / Connection list is visible to the public' },
          { key: 'oldPostsPublic', label: 'Historical posts and photos remain set to Public' },
          { key: 'bioPersonalDetails', label: 'High school, pet names, or family relations listed in bio' },
        ].map(item => {
          const isChecked = answers[item.key as keyof typeof answers];
          return (
            <div
              key={item.key}
              onClick={() => handleToggle(item.key as keyof typeof answers)}
              className={`p-4 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                isChecked
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{item.label}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                isChecked ? 'bg-rose-200 text-rose-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {isChecked ? 'PUBLIC (RISK)' : 'HIDDEN (SAFE)'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

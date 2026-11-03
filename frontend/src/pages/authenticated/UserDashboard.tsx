import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  KeyRound,
  Globe,
  Fish,
  CheckSquare,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { ScoreRing } from '../../components/common/ScoreRing';
import { RiskBadge } from '../../components/common/RiskBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const UserDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetchApi<any>('/api/security/dashboard');
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard from database:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) return <LoadingSpinner label="Compiling Security Control Center metrics..." />;

  const hasAssessment = data?.hasAssessment && data?.securityScore !== null;
  const score = data?.securityScore || 0;
  const riskLevel = data?.riskLevel || 'MODERATE';
  const categoryScores = data?.categoryScores || {
    password: 0, mfa: 0, privacy: 0, phishing: 0, applications: 0, recovery: 0, awareness: 0
  };
  const openFindings = data?.openFindings || [];

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Security Control Center
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Account Security Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time evaluation of security posture, active risks, and open recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all hover:-translate-y-0.5"
          >
            <ShieldAlert size={16} />
            <span>{hasAssessment ? 'Retake Assessment' : 'Start Assessment'}</span>
          </Link>
        </div>
      </div>

      {!hasAssessment ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Security Assessment Records Found"
          description="Complete your first 7-domain security assessment to calculate your real security score, detect active vulnerabilities, and receive custom protection recommendations."
          actionLabel="Start Your First Assessment"
          actionPath="/assessment"
        />
      ) : (
        <>
          {/* Main Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Security Score */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Score</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">{score}</span>
                  <span className="text-xs font-semibold text-slate-400">/ 100</span>
                </div>
                <span className="inline-block mt-2 text-[11px] font-semibold text-slate-500">
                  Calculated from risk engine
                </span>
              </div>
              <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl border border-brand-100">
                <ShieldCheck size={28} />
              </div>
            </div>

            {/* Card 2: Risk Level */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Risk Level</p>
                <div className="mt-2">
                  <RiskBadge level={riskLevel} size="md" />
                </div>
                <span className="inline-block mt-2 text-[11px] font-semibold text-slate-500">
                  {riskLevel === 'LOW' ? 'Optimal Safeguards' : 'Action Required'}
                </span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <AlertTriangle size={28} />
              </div>
            </div>

            {/* Card 3: Open Recommendations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Findings</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">{openFindings.length}</span>
                  <span className="text-xs text-slate-500">actionable</span>
                </div>
                <span className="inline-block mt-2 text-[11px] font-semibold text-slate-500">
                  {openFindings.filter((f: any) => f.severity === 'HIGH').length} High Severity
                </span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <ShieldAlert size={28} />
              </div>
            </div>

            {/* Card 4: Phishing Lab Score */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phishing Lab Score</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {data.phishingScore !== null ? `${data.phishingScore}%` : 'N/A'}
                  </span>
                </div>
                <span className="inline-block mt-2 text-[11px] font-semibold text-slate-500">
                  {data.phishingScore !== null ? 'Simulation Accuracy' : 'Take a Phishing Simulation'}
                </span>
              </div>
              <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
                <Fish size={28} />
              </div>
            </div>
          </div>

          {/* Central Score Analysis & Category Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Score Gauge & Explanation */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Security Posture Breakdown
              </h2>

              <ScoreRing score={score} size={170} strokeWidth={14} label="Overall Score" />

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-brand-600" /> Assessment Summary
                </p>
                <p>
                  {score >= 80
                    ? 'Your assessment indicates strong security practices across most key categories, with routine maintenance recommended.'
                    : score >= 60
                    ? 'Your assessment indicates several good security practices, with additional improvements recommended in privacy and phishing awareness.'
                    : 'Your security posture faces heightened vulnerability due to missing multi-factor authentication or weak password habits.'}
                </p>
              </div>
            </div>

            {/* Right: Category Breakdown Bars */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Category Risk Breakdown
                </h2>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight %</span>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Password Security', key: 'password', weight: '20%', val: categoryScores.password },
                  { name: 'Account Protection (MFA)', key: 'mfa', weight: '20%', val: categoryScores.mfa },
                  { name: 'Privacy Exposure', key: 'privacy', weight: '15%', val: categoryScores.privacy },
                  { name: 'Phishing Awareness', key: 'phishing', weight: '20%', val: categoryScores.phishing },
                  { name: 'Third-Party Applications', key: 'applications', weight: '10%', val: categoryScores.applications },
                  { name: 'Recovery Security', key: 'recovery', weight: '10%', val: categoryScores.recovery },
                  { name: 'General Awareness', key: 'awareness', weight: '5%', val: categoryScores.awareness },
                ].map(cat => {
                  let barColor = 'bg-emerald-500';
                  if (cat.val < 40) barColor = 'bg-rose-500';
                  else if (cat.val < 70) barColor = 'bg-amber-500';

                  return (
                    <div key={cat.key} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{cat.name}</span>
                        <div className="space-x-2">
                          <span className="font-extrabold text-slate-900">{cat.val} / 100</span>
                          <span className="text-slate-400 font-mono">({cat.weight})</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-700`}
                          style={{ width: `${cat.val}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actionable Findings Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> Actionable Security Findings
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {openFindings.length} Total Issues Detected
              </span>
            </div>

            {openFindings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                No active security findings detected! Your current configuration aligns with security best practices.
              </div>
            ) : (
              <div className="space-y-3">
                {openFindings.map((finding: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                          finding.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                          finding.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-200 text-slate-800'
                        }`}>
                          {finding.severity} SEVERITY
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{finding.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600">{finding.recommendation}</p>
                    </div>

                    <Link
                      to="/tools/mfa-checklist"
                      className="px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg shrink-0 flex items-center gap-1"
                    >
                      Resolve <ChevronRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Launchers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/tools/password-security"
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                <KeyRound size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Password Checker</h4>
                <p className="text-[11px] text-slate-500">Test client-side entropy</p>
              </div>
            </Link>

            <Link
              to="/tools/url-analyzer"
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                <Globe size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">URL Threat Inspector</h4>
                <p className="text-[11px] text-slate-500">Analyze suspicious links</p>
              </div>
            </Link>

            <Link
              to="/awareness/phishing-lab"
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                <Fish size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Phishing Lab</h4>
                <p className="text-[11px] text-slate-500">Simulate scam scenarios</p>
              </div>
            </Link>

            <Link
              to="/tools/mfa-checklist"
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                <CheckSquare size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">MFA Checklists</h4>
                <p className="text-[11px] text-slate-500">Verify 2FA settings</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

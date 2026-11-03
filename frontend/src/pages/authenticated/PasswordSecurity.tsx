import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Check, X, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { analyzePassword, PasswordAnalysis } from '../../lib/passwordAnalyzer';

export const PasswordSecurity: React.FC = () => {
  const [password, setPassword] = useState('');
  const analysis: PasswordAnalysis = analyzePassword(password);

  let barColor = 'bg-rose-500';
  if (analysis.label === 'Very Strong') barColor = 'bg-emerald-500';
  else if (analysis.label === 'Strong') barColor = 'bg-teal-500';
  else if (analysis.label === 'Moderate') barColor = 'bg-amber-500';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
            <KeyRound size={28} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Zero-Knowledge Tool
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Client-Side Password Security Analyzer
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Test password entropy and rule checks in real-time. Passwords are never sent over the network or stored anywhere.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span><strong>Privacy Guarantee:</strong> All analysis executes 100% locally in your browser memory.</span>
        </div>
      </div>

      {/* Main Analyzer Input & Visual Meter */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Enter Password or Passphrase to Analyze
          </label>
          <div className="relative">
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Type a sample password (e.g. battery-staple-correct-horse)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            />
            <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
          </div>
        </div>

        {/* Strength Meter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500 uppercase tracking-wider">Estimated Strength</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
              analysis.label === 'Very Strong' ? 'bg-emerald-100 text-emerald-800' :
              analysis.label === 'Strong' ? 'bg-teal-100 text-teal-800' :
              analysis.label === 'Moderate' ? 'bg-amber-100 text-amber-800' :
              'bg-rose-100 text-rose-800'
            }`}>
              {analysis.label} ({analysis.score} / 100)
            </span>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-300 ease-out`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>

          <p className="text-[11px] font-mono text-slate-400">
            Calculated Entropy: {analysis.entropyBits} bits of crack-resistance
          </p>
        </div>

        {/* Requirements Checklist Grid */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            analysis.checks.lengthCheck ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span>At least 12–16 characters long</span>
            {analysis.checks.lengthCheck ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-slate-400" />}
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            analysis.checks.uppercaseCheck ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span>Contains uppercase letter (A–Z)</span>
            {analysis.checks.uppercaseCheck ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-slate-400" />}
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            analysis.checks.lowercaseCheck ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span>Contains lowercase letter (a–z)</span>
            {analysis.checks.lowercaseCheck ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-slate-400" />}
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            analysis.checks.numberCheck ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span>Contains number (0–9)</span>
            {analysis.checks.numberCheck ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-slate-400" />}
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            analysis.checks.specialCheck ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span>Contains special symbol (!@#$)</span>
            {analysis.checks.specialCheck ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-slate-400" />}
          </div>

          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            analysis.checks.noRepeatCheck ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <span>No repeated character clusters</span>
            {analysis.checks.noRepeatCheck ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-rose-600" />}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles size={16} className="text-brand-600" /> Security Guidance:
          </span>
          <ul className="space-y-1 list-disc list-inside text-slate-600">
            {analysis.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

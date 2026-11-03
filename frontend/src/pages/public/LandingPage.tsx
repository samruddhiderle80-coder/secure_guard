import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  Fish,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  Layers,
  GraduationCap
} from 'lucide-react';
import { ScoreRing } from '../../components/common/ScoreRing';
import { RiskBadge } from '../../components/common/RiskBadge';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60 pt-16 pb-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-xs">
                <Shield size={14} className="text-brand-600" />
                <span>Next-Gen Security Awareness Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                SOCIAL GUARD
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-sky-600 to-blue-700 mt-2">
                  Understand. Detect. Protect.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Assess your social-media security posture, identify hidden exposure risks, analyze suspicious links, and master real-world phishing defenses without surrendering passwords.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 gap-2"
                >
                  <span>Start Security Assessment</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/threats"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition-all"
                >
                  Explore Security Tools
                </Link>
              </div>

              {/* Guarantees */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>No Password Required</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>100% Zero-Knowledge</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Actionable Guidance</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Dashboard Preview */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 space-y-6 relative overflow-hidden backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-slate-400 ml-2">Social Guard Dashboard</span>
                  </div>
                  <RiskBadge level="MODERATE" size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <ScoreRing score={78} size={140} strokeWidth={12} label="" />
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category Baseline</p>
                    <div className="space-y-1.5 text-xs font-medium">
                      <div className="flex justify-between">
                        <span>Password Security</span>
                        <span className="font-bold text-slate-800">85%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[85%]" />
                      </div>

                      <div className="flex justify-between pt-1">
                        <span>MFA Coverage</span>
                        <span className="font-bold text-slate-800">90%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[90%]" />
                      </div>

                      <div className="flex justify-between pt-1">
                        <span>Privacy Exposure</span>
                        <span className="font-bold text-slate-800">65%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[65%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Active Recommendation:</span> Public contact phone details exposed on secondary profile.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Complete Security Suite
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
              Powerful Tools to Safeguard Your Digital Identity
            </h2>
            <p className="text-slate-600 text-base">
              Social Guard provides multi-layered defenses and security tools built around user privacy and risk awareness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tool 1 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:shadow-card-hover transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
                <Lock size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Local Password Analyzer</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Test password strength with instant entropy and pattern checks directly inside your browser. No passwords are ever sent to servers.
              </p>
            </div>

            {/* Tool 2 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:shadow-card-hover transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
                <Globe size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">URL Threat Inspector</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Analyze suspicious direct message links, typosquatting domains, IP hostnames, and shortened URLs with detailed indicators.
              </p>
            </div>

            {/* Tool 3 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:shadow-card-hover transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
                <Fish size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Phishing Simulator Lab</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Interactive real-world scenarios teaching you how to recognize fake copyright DMs, urgency traps, and verification scams.
              </p>
            </div>

            {/* Tool 4 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:shadow-card-hover transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
                <EyeOff size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Privacy Self-Assessment</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Evaluate your OSINT footprint: publicly visible phone numbers, friend lists, and geotags that enable targeted impersonation.
              </p>
            </div>

            {/* Tool 5 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:shadow-card-hover transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
                <Smartphone size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Platform MFA Guidance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Platform-specific setup checklists for Instagram, Facebook, X, LinkedIn, TikTok, and WhatsApp to confirm your 2FA status.
              </p>
            </div>

            {/* Tool 6 */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:shadow-card-hover transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Interactive Security Training</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Short modular lessons covering SIM swapping, OAuth third-party app permissions, passphrases, and social engineering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Social Guard Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How Social Guard Works</h2>
            <p className="text-slate-600">3 simple steps to elevate your social media security posture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center mx-auto text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Take Assessment</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Answer security awareness questions covering password habits, MFA methods, privacy settings, and active session habits.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center mx-auto text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Receive Transparent Score</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our backend risk engine evaluates your answers across 7 weighted categories and delivers actionable findings.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center mx-auto text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Execute Actionable Remediation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Follow step-by-step security recommendations, run link analyzers, and track your security score over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <Shield className="w-12 h-12 text-brand-400 mx-auto stroke-[2]" />
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Protect Your Digital Footprint?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-base">
            Take your first assessment in under 3 minutes. Free, non-intrusive, and 100% focused on security education.
          </p>
          <div>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

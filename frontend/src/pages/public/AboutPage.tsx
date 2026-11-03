import React from 'react';
import { Shield, Lock, Eye, Terminal, Server, FileCheck2, Cpu } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
            <Shield size={14} /> Mission & Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About Social Guard
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Understand. Detect. Protect. Building accessible, trustworthy cybersecurity awareness for modern social media users.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-brand-600" /> Platform Mission
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Social Guard was designed to bridge the gap between complex cybersecurity concepts and everyday social media usage. Rather than requiring users to surrender their passwords, account access tokens, or install invasive software, Social Guard focuses on zero-knowledge threat education, behavioral risk assessments, heuristics analysis, and interactive phishing simulation.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong>Mandatory Security & Privacy Guarantee:</strong> Social Guard is strictly an educational security-awareness platform and does not request, store, or access user social media login credentials, passwords, or private account data.
          </div>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero-Knowledge Credentials</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Password analysis is performed 100% locally in your browser via client-side JavaScript. Plaintext credentials are never transmitted over HTTP or saved.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Cpu size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Transparent Risk Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scoring is calculated deterministically across 7 weighted security domains (Password 20%, MFA 20%, Privacy 15%, Phishing 20%, Apps 10%, Recovery 10%, Awareness 5%).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <FileCheck2 size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Explainable Threat Indicators</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              URL inspections deliver clear, non-cryptic security indicators explaining why specific domains pose potential phishing or brand impersonation risks.
            </p>
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Server className="text-brand-600" /> Full-Stack Architecture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <span className="font-bold text-slate-800 block text-sm">Frontend Engineering</span>
              <ul className="list-disc list-inside space-y-1">
                <li>React 18 & TypeScript for type-safe rendering</li>
                <li>Tailwind CSS for custom design system</li>
                <li>TanStack Query & React Router v6</li>
                <li>Recharts for dynamic security trend visualization</li>
                <li>Local client-side entropy evaluation algorithms</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <span className="font-bold text-slate-800 block text-sm">Backend & Database Security</span>
              <ul className="list-disc list-inside space-y-1">
                <li>Fastify Node.js server with Pino structured logging</li>
                <li>Strict Zod parameter & schema validation</li>
                <li>Helmet HTTP security headers & Rate Limiting</li>
                <li>Supabase PostgreSQL database with Row Level Security (RLS)</li>
                <li>Strict admin RBAC policy enforcement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

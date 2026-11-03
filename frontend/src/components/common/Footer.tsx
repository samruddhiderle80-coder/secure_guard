import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
                <Shield className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                SOCIAL GUARD
              </span>
            </div>
            <p className="text-xs font-medium text-brand-400 uppercase tracking-widest">
              Understand. Detect. Protect.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Social Guard helps users identify social-media security risks, improve their security practices, and build stronger security awareness.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Security Awareness
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/education" className="hover:text-white transition-colors">
                  Security Education
                </Link>
              </li>
              <li>
                <Link to="/threats" className="hover:text-white transition-colors">
                  Top Social Threats
                </Link>
              </li>
              <li>
                <Link to="/tools/password-security" className="hover:text-white transition-colors">
                  Password Strength Checker
                </Link>
              </li>
              <li>
                <Link to="/tools/url-analyzer" className="hover:text-white transition-colors">
                  URL Threat Analyzer
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Platform & Tools
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/assessment" className="hover:text-white transition-colors">
                  Security Assessment
                </Link>
              </li>
              <li>
                <Link to="/awareness/phishing-lab" className="hover:text-white transition-colors">
                  Phishing Simulator Lab
                </Link>
              </li>
              <li>
                <Link to="/tools/mfa-checklist" className="hover:text-white transition-colors">
                  MFA Setup Checklist
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Social Guard
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer (Section 41) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Educational Notice
            </h4>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-400 leading-relaxed">
              Social Guard is an educational security-awareness platform and does not access or control third-party social-media accounts.
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Social Guard Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-slate-400">Privacy & Terms</Link>
            <Link to="/about" className="hover:text-slate-400">Security Disclaimers</Link>
            <Link to="/feedback" className="hover:text-slate-400">Feedback</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { BookOpen, CheckCircle, ShieldCheck, ArrowRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EducationPage: React.FC = () => {
  const articles = [
    {
      title: 'The Anatomy of a Social Media Phishing Campaign',
      readTime: '4 min read',
      tag: 'Phishing',
      summary: 'Learn how cybercriminals use typosquatting domain names, SSL certificates, and panic urgency to steal Instagram and X logins.',
    },
    {
      title: 'Why 16-Character Passphrases Beat Short Complex Passwords',
      readTime: '5 min read',
      tag: 'Password Security',
      summary: 'Understanding mathematical entropy: why multi-word passphrases like "battery-staple-horse" protect against GPU brute-force clusters.',
    },
    {
      title: 'SMS 2FA vs Authenticator Apps vs Security Keys',
      readTime: '6 min read',
      tag: 'MFA',
      summary: 'Comprehensive evaluation of Multi-Factor Authentication factors and why carrier SIM swapping renders SMS codes vulnerable.',
    },
    {
      title: 'Minimizing Your Digital OSINT Footprint',
      readTime: '5 min read',
      tag: 'Privacy',
      summary: 'How publicly accessible date-of-birth, family relationships, and vacation check-ins feed social engineering attacks.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Educational Resource Library
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Security Awareness & Best Practices
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Master the core concepts of social media defense with practical, research-backed guides.
          </p>
        </div>

        {/* Featured Educational Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    {art.tag}
                  </span>
                  <span className="text-slate-400">{art.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{art.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{art.summary}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/awareness/training"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  Start Training Module <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Essential Rules Checklist */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="text-amber-500" /> Golden Rules of Social Media Hygiene
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block mb-1">Rule 1: Never Click Credential Links in DMs</span>
                <p className="text-slate-600">Official platforms notify users inside official settings, never via external appeal URLs sent in direct messages.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block mb-1">Rule 2: Upgrade to TOTP Authenticator Apps</span>
                <p className="text-slate-600">Replace SMS verification with an authenticator app (Google Authenticator, 1Password) to eliminate SIM swap vulnerability.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block mb-1">Rule 3: Enforce Unique Passwords Per Platform</span>
                <p className="text-slate-600">Never reuse a password across platforms. Reused passwords lead to immediate credential stuffing cascade takeovers.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block mb-1">Rule 4: Conduct Monthly Session & OAuth Audits</span>
                <p className="text-slate-600">Regularly inspect active devices and revoke permissions for third-party apps you no longer actively use.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

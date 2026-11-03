import React from 'react';
import { ShieldAlert, Smartphone, Key, Globe, Eye, Users, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ThreatsPage: React.FC = () => {
  const threats = [
    {
      icon: ShieldAlert,
      title: 'Copyright & Verification DM Phishing',
      category: 'Phishing',
      severity: 'CRITICAL',
      description: 'Attackers send direct messages or emails posing as Meta, Instagram, or X support claiming your account breached copyright rules or is eligible for a blue badge. Embedded links redirect to typosquatted login forms that steal passwords and 2FA tokens.',
      mitigation: 'Always inspect browser address bar domains. Official platform notices appear inside app Account Status settings, never via external appeal forms in DMs.',
    },
    {
      icon: Smartphone,
      title: 'SIM Swapping & Port-Out Fraud',
      category: 'Account Takeover',
      severity: 'CRITICAL',
      description: 'Cybercriminals trick or bribe mobile carrier staff into assigning your phone number to an attacker-controlled SIM card. Once ported, the attacker receives all SMS-based 2FA authentication codes and performs password resets.',
      mitigation: 'Switch from SMS 2FA to TOTP Authenticator Apps (Google Authenticator, 1Password) or hardware keys (YubiKey). Set a verbal carrier PIN on your phone plan.',
    },
    {
      icon: Key,
      title: 'OAuth Third-Party Application Access Exploitation',
      category: 'Permission Abuse',
      severity: 'HIGH',
      description: 'When users grant third-party quiz, follower tracker, or scheduling tools permission via "Log in with Facebook/X", those apps receive long-lived access tokens. If the app is breached or malicious, attackers control profile actions.',
      mitigation: 'Audit connected apps monthly in your account security settings ("Apps & Websites") and revoke permissions for any service you no longer actively use.',
    },
    {
      icon: Eye,
      title: 'Open Source Intelligence (OSINT) & Impersonation',
      category: 'Social Engineering',
      severity: 'HIGH',
      description: 'Attackers harvest publicly visible details—like birth year, childhood pet names, mother maiden names, and high school names—from public social posts to answer account recovery security questions or create convincing clone accounts.',
      mitigation: 'Set profile birthdates to hide birth year, restrict friend lists to private, and refrain from posting answers to viral "get to know me" trend questionnaires.',
    },
    {
      icon: Globe,
      title: 'Credential Stuffing & Password Reuse Cascades',
      category: 'Automated Attacks',
      severity: 'HIGH',
      description: 'Automated botnets take billions of username/password pairs exposed in historical data breaches and continuously attempt login across Instagram, X, Facebook, and LinkedIn. Reused passwords lead to immediate multi-platform takeovers.',
      mitigation: 'Use unique passphrases (16+ characters) for every social account and manage them inside a zero-knowledge password manager vault.',
    },
    {
      icon: Users,
      title: 'Urgent Friend Emergency Zelle/Crypto Scams',
      category: 'Social Engineering',
      severity: 'MEDIUM',
      description: 'Once a hacker takes over a friend account, they message connections claiming to be stranded at an airport or in a medical emergency needing urgent money transfers via Zelle, Venmo, or crypto.',
      mitigation: 'Never send money based on a direct message alone. Call or video chat your friend on a secondary phone line to confirm their identity before transferring funds.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Threat Intelligence Guide
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Common Social Media Security Threats
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Detailed breakdown of modern attack vectors, social engineering tactics, and practical counter-measures.
          </p>
        </div>

        {/* Threat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {threats.map((threat, idx) => {
            const Icon = threat.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4 hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
                      <Icon size={22} className="stroke-[2]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {threat.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{threat.title}</h3>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-extrabold rounded-full ${
                    threat.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    threat.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {threat.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {threat.description}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-brand-700 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Recommended Mitigation:
                  </div>
                  <p className="text-slate-600">{threat.mitigation}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="p-8 bg-brand-600 rounded-3xl text-white text-center space-y-4 shadow-xl">
          <h2 className="text-2xl font-bold">Assess Your Own Exposure Level</h2>
          <p className="text-brand-100 text-sm max-w-xl mx-auto">
            Take our guided 7-domain security assessment to check if your accounts are vulnerable to these threats.
          </p>
          <Link
            to="/signup"
            className="inline-block px-6 py-3 bg-white text-brand-700 font-bold rounded-xl shadow-md hover:bg-slate-100 transition-all text-sm"
          >
            Start Free Security Assessment
          </Link>
        </div>
      </div>
    </div>
  );
};

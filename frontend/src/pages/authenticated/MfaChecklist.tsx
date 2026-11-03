import React, { useState, useEffect } from 'react';
import { CheckSquare, ShieldCheck, Instagram, Facebook, Twitter, Linkedin, MessageCircle, Shield, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

const PLATFORMS = [
  { id: 'Instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { id: 'Facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'X', name: 'X (Twitter)', icon: Twitter, color: 'text-slate-900' },
  { id: 'LinkedIn', name: 'LinkedIn', icon: Linkedin, color: 'text-sky-700' },
  { id: 'WhatsApp', name: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-600' },
  { id: 'Generic', name: 'Generic Account', icon: Shield, color: 'text-slate-700' },
];

const CHECKLIST_ITEMS = [
  { id: 'mfa_enabled', title: 'Two-Factor Authentication (2FA) Enabled', desc: 'Activated via Authenticator App (Google Authenticator, 1Password) in security settings.' },
  { id: 'backup_codes', title: 'Backup Recovery Codes Saved', desc: 'Generated 8–10 backup recovery codes and saved them in an offline encrypted vault.' },
  { id: 'login_alerts', title: 'Unrecognized Login Alerts Enabled', desc: 'Received push notifications or emails whenever a login occurs on a new device.' },
  { id: 'session_audit', title: 'Active Login Sessions Reviewed', desc: 'Inspected "Where You\'re Logged In" and logged out of unknown or old devices.' },
  { id: 'oauth_apps', title: 'Connected Apps & Web Permissions Audited', desc: 'Revoked access for third-party quiz apps, follower trackers, and old integrations.' },
  { id: 'recovery_email', title: 'Recovery Email Secured with MFA', desc: 'Confirmed the primary recovery email account itself has 2FA enabled.' },
];

export const MfaChecklist: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState('Instagram');
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchApi<{ platform: string; completedItems: string[] }>(`/api/mfa/${activePlatform}`)
      .then(res => {
        setCompletedItems(res.completedItems || []);
      })
      .catch(err => {
        console.error('Failed to load MFA checklist from database:', err);
        setCompletedItems([]);
      })
      .finally(() => setLoading(false));
  }, [activePlatform]);

  const handleToggleItem = async (itemId: string) => {
    let next: string[];
    if (completedItems.includes(itemId)) {
      next = completedItems.filter(id => id !== itemId);
    } else {
      next = [...completedItems, itemId];
    }
    setCompletedItems(next);

    try {
      await fetchApi('/api/mfa', {
        method: 'POST',
        body: JSON.stringify({ platform: activePlatform, completedItems: next }),
      });
    } catch (err) {
      console.error('Failed to save MFA checklist to database:', err);
    }
  };

  const progressPercent = Math.round((completedItems.length / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
          <CheckSquare size={28} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            Platform Verification Checklists
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            MFA & Account Safeguard Checklists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step verification checklists saved directly in the PostgreSQL database.
          </p>
        </div>
      </div>

      {/* Platform Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PLATFORMS.map(p => {
          const Icon = p.icon;
          const isActive = activePlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : p.color} />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Checklist Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{activePlatform} Security Safeguards</span>
              {loading && <Loader2 size={16} className="text-brand-600 animate-spin" />}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {completedItems.length} of {CHECKLIST_ITEMS.length} measures verified in database
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-brand-600 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-brand-700 font-mono">{progressPercent}%</span>
          </div>
        </div>

        <div className="space-y-3">
          {CHECKLIST_ITEMS.map(item => {
            const isChecked = completedItems.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                  isChecked
                    ? 'bg-emerald-50/60 border-emerald-200/90 text-emerald-950'
                    : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <ShieldCheck size={14} className="stroke-[3]" />}
                </div>

                <div className="space-y-0.5">
                  <h4 className={`text-xs font-bold ${isChecked ? 'text-emerald-900 line-through opacity-85' : 'text-slate-900'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

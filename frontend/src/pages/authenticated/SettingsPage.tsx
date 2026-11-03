import React, { useState } from 'react';
import { Settings, User, Lock, Shield, CheckCircle2, AlertCircle, Save, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  // Profile form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setProfileLoading(true);
    setProfileMsg(null);

    try {
      const res = await fetchApi<{ message: string; user: any }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ fullName }),
      });
      setProfileMsg({ type: 'success', text: res.message || 'Profile updated successfully in database.' });
      // Update local storage
      const stored = localStorage.getItem('socialguard_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.full_name = fullName;
          localStorage.setItem('socialguard_user', JSON.stringify(parsed));
        } catch {}
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetchApi<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPassMsg({ type: 'success', text: res.message || 'Password changed successfully in database.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
          <Settings size={28} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            Account Preferences
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Profile & Security Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your account identity, security preferences, and roles persisted in PostgreSQL.
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <User size={18} className="text-brand-600" /> Account Profile Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-400 block mb-1">Email Address</span>
            <span className="font-extrabold text-slate-900 text-sm">{user?.email || 'N/A'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-400 block mb-1">Account Role</span>
            <span className={`inline-block px-2 py-0.5 font-extrabold rounded-md text-[11px] ${
              user?.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-800'
            }`}>
              {(user?.role || 'user').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Update Full Name Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
          {profileMsg && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              profileMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your Full Name"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={profileLoading || !fullName.trim()}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                <span>{profileLoading ? 'Saving...' : 'Update Name'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security Actions Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Lock size={18} className="text-brand-600" /> Security Controls & Password Change
        </h2>

        {passMsg && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            passMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {passMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{passMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passLoading || !currentPassword || !newPassword}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <KeyRound size={16} />
            <span>{passLoading ? 'Updating Password...' : 'Change Password in Database'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

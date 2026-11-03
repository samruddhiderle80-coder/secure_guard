import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export const UserAnalytics: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<{ users: any[] }>('/api/admin/users')
      .then(res => {
        setUsers(res.users || []);
      })
      .catch(err => {
        console.error('Failed to load users from database:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            Admin User Audit
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">User Analytics & Roles</h1>
          <p className="text-xs text-slate-500 mt-0.5">Live list of active registered accounts from PostgreSQL database.</p>
        </div>
        <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
          {loading ? <Loader2 size={28} className="animate-spin" /> : <Users size={28} />}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>Registered System Users ({users.length})</span>
          <span className="text-xs text-slate-400 font-normal">Stored in auth.users & public.profiles</span>
        </h2>

        {users.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No users found in database.</p>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 text-sm block">{u.fullName || u.email.split('@')[0]}</span>
                  <span className="text-slate-500 font-mono">{u.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px] font-mono">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                  <span className={`px-2.5 py-1 font-extrabold rounded-md uppercase text-[10px] ${
                    u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-800'
                  }`}>
                    {u.role || 'USER'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

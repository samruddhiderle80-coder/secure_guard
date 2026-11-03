import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Filter, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export const IncidentManagement: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      const res = await fetchApi<any>('/api/admin/incidents');
      setIncidents(res.incidents || []);
    } catch (err) {
      console.error('Failed to load incidents from database:', err);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetchApi(`/api/admin/incidents/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      loadIncidents();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            Admin Incident Response
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Incident Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review user-reported security breaches and update resolution status in database.</p>
        </div>
        <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
          <AlertTriangle size={28} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <span>Reported Incident Tickets ({incidents.length})</span>
          {loading && <Loader2 size={16} className="animate-spin text-amber-600" />}
        </h2>

        {incidents.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No incidents recorded in database.</p>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc: any, i: number) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-800 rounded">{inc.platform}</span>
                    <span>{inc.incident_type || inc.incidentType}</span>
                    <span className="text-slate-400 font-mono">({inc.severity || 'MEDIUM'})</span>
                    {inc.userName && <span className="text-slate-500 text-[11px] font-normal">by {inc.userName}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={inc.status || 'PENDING'}
                      onChange={e => handleStatusChange(inc.id, e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>

                <p className="text-slate-600">{inc.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                  <span>Reported: {inc.incidentDate || inc.incident_date}</span>
                  {inc.accessLost && <span className="text-rose-600 font-bold">Access Lost</span>}
                  {inc.credentialsShared && <span className="text-rose-600 font-bold">Credentials Shared</span>}
                  {inc.financialLoss && <span className="text-rose-600 font-bold">Financial Loss</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

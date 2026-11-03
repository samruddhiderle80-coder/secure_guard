import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { EmptyState } from '../../components/common/EmptyState';

export const IncidentReporting: React.FC = () => {
  const [platform, setPlatform] = useState('Instagram');
  const [incidentType, setIncidentType] = useState('PHISHING');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [accessLost, setAccessLost] = useState(false);
  const [credentialsShared, setCredentialsShared] = useState(false);
  const [financialLoss, setFinancialLoss] = useState(false);
  const [severity, setSeverity] = useState('MEDIUM');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      const res = await fetchApi<any>('/api/incidents');
      setIncidents(res.incidents || []);
    } catch (err) {
      console.error('Failed to load incidents from database:', err);
      setIncidents([]);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    const payload = {
      platform,
      incidentType,
      description,
      incidentDate,
      accessLost,
      credentialsShared,
      financialLoss,
      severity,
    };

    try {
      await fetchApi('/api/incidents', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSuccessMsg('Security incident report successfully recorded in database.');
      setDescription('');
      loadIncidents();
    } catch (err: any) {
      alert(`Failed to submit incident: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
          <AlertTriangle size={28} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Incident Log & Advisory
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Report a Security Incident
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log security threats, suspicious account activity, phishing messages, or unauthorized access attempts.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Incident Form */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          New Incident Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Platform
              </label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="X">X (Twitter)</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="TikTok">TikTok</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Other">Other Platform</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Incident Classification
              </label>
              <select
                value={incidentType}
                onChange={e => setIncidentType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
              >
                <option value="PHISHING">Phishing Link / DM</option>
                <option value="ACCOUNT_TAKEOVER">Account Takeover Attempt</option>
                <option value="FAKE_PROFILE">Impersonation / Fake Profile</option>
                <option value="MALICIOUS_LINK">Malicious Link Received</option>
                <option value="SCAM">Financial / Zelle Scam</option>
                <option value="PRIVACY_EXPOSURE">Privacy Exposure</option>
                <option value="SUSPICIOUS_LOGIN">Unrecognized Login Activity</option>
                <option value="OTHER">Other Threat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date of Incident
              </label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={e => setIncidentDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
              >
                <option value="LOW">Low Impact</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Severity</option>
                <option value="CRITICAL">Critical Breach</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Incident Description & Details
            </label>
            <textarea
              required
              rows={4}
              minLength={10}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what occurred, suspicious URLs received, or unusual login prompts..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Impact Checkboxes */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block mb-1">Impact Checklist:</span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessLost}
                  onChange={e => setAccessLost(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Account Access Lost</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={credentialsShared}
                  onChange={e => setCredentialsShared(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Credentials / Password Entered</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={financialLoss}
                  onChange={e => setFinancialLoss(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Financial Loss Incurred</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Submitting Report...' : 'Submit Incident Report'}
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* Reported Incidents History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Your Reported Incidents History ({incidents.length})
        </h3>

        {incidents.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No Incidents Reported"
            description="You have not submitted any security incident reports yet."
          />
        ) : (
          <div className="space-y-3">
            {incidents.map((inc: any, i: number) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-800 rounded">{inc.platform}</span>
                    <span>{inc.incident_type || inc.incidentType}</span>
                  </div>
                  <span className={`px-2 py-0.5 font-extrabold rounded-full text-[10px] ${
                    inc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    STATUS: {inc.status || 'PENDING'}
                  </span>
                </div>
                <p className="text-slate-600">{inc.description}</p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Date: {inc.incident_date || inc.incidentDate}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

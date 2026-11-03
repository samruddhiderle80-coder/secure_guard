import React, { useState } from 'react';
import { Globe, Search, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { analyzeUrl, URLAnalysisResult } from '../../lib/urlAnalyzerClient';
import { RiskBadge } from '../../components/common/RiskBadge';

export const UrlAnalyzer: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<URLAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetchApi<URLAnalysisResult>('/api/url/analyze', {
        method: 'POST',
        body: JSON.stringify({ url: urlInput }),
      });
      setResult(res);
    } catch (err: any) {
      // Local fallback execution if backend server is unreachable
      try {
        const clientRes = analyzeUrl(urlInput);
        setResult(clientRes);
      } catch (clientErr: any) {
        setError(clientErr.message || 'The submitted URL is not valid.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
          <Globe size={28} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            Threat Heuristics Engine
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            URL Security Threat Analyzer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect direct message links, typosquatting domains, IP hostnames, and shortened URLs for phishing indicators.
          </p>
        </div>
      </div>

      {/* URL Input Form */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Enter Target Link / Address to Inspect
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://instagram-verify-appeals-center.com/auth"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
              <Globe size={18} className="absolute left-3 top-3.5 text-slate-400" />
            </div>

            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {loading ? 'Analyzing...' : 'Analyze URL'}
              <Search size={16} />
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Hostname</span>
              <span className="text-lg font-mono font-bold text-slate-900 flex items-center gap-1.5">
                {result.hostname} <ExternalLink size={14} className="text-slate-400" />
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 font-mono">Score: {result.score}/100</span>
              <RiskBadge level={result.riskLevel} size="lg" />
            </div>
          </div>

          {/* Quick Attributes */}
          <div className="grid grid-cols-3 gap-3 text-xs font-medium">
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              result.isHttps ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <span>HTTPS Encrypted</span>
              {result.isHttps ? <CheckCircle size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-rose-600" />}
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              !result.isIpHost ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <span>Registered Domain</span>
              {!result.isIpHost ? <CheckCircle size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-rose-600" />}
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              !result.isShortener ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <span>Direct Link</span>
              {!result.isShortener ? <CheckCircle size={16} className="text-emerald-600" /> : <Info size={16} className="text-amber-600" />}
            </div>
          </div>

          {/* Indicators List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Detected Threat Indicators ({result.indicators.length})
            </h3>
            {result.indicators.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <span>No suspicious threat indicators were detected by the checks performed.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {result.indicators.map((ind, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        ind.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        ind.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ind.severity}
                      </span>
                      <span className="font-bold text-slate-900">{ind.message}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{ind.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-600 border border-slate-200 leading-relaxed font-mono">
            <strong>Security Disclaimer:</strong> {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};

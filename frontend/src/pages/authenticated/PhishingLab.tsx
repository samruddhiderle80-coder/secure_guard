import React, { useState, useEffect } from 'react';
import { Fish, CheckCircle2, XCircle, AlertCircle, HelpCircle, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export interface PhishingScenario {
  id: string;
  title: string;
  contextType: string;
  messageSender: string;
  messageContent: string;
  optionChoices: { id: string; text: string }[] | string;
  correctOptionId: string;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const PhishingLab: React.FC = () => {
  const [scenarios, setScenarios] = useState<PhishingScenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApi<{ scenarios: any[] }>('/api/phishing/scenarios')
      .then(res => {
        if (res.scenarios && res.scenarios.length > 0) {
          const parsed = res.scenarios.map(s => ({
            ...s,
            sender: s.messageSender || s.sender,
            content: s.messageContent || s.content,
            optionChoices: typeof s.optionChoices === 'string' ? JSON.parse(s.optionChoices) : s.optionChoices || s.options,
          }));
          setScenarios(parsed);
        }
      })
      .catch(err => {
        console.error('Failed to load phishing scenarios from database:', err);
      })
      .finally(() => setLoadingScenarios(false));
  }, []);

  if (loadingScenarios) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading Phishing Scenarios from Database...</p>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl border border-slate-200">
        <Fish className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">No Phishing Scenarios Found</h3>
        <p className="text-sm text-slate-500 mt-1">Check back later for new simulation exercises.</p>
      </div>
    );
  }

  const scenario = scenarios[currentIdx];
  const options = Array.isArray(scenario.optionChoices) 
    ? scenario.optionChoices 
    : typeof scenario.optionChoices === 'string' 
      ? JSON.parse(scenario.optionChoices) 
      : [];

  const handleSelectOption = async (optionId: string) => {
    if (selectedOpt) return;
    setSelectedOpt(optionId);
    setLoading(true);

    try {
      const res = await fetchApi<any>('/api/phishing/attempt', {
        method: 'POST',
        body: JSON.stringify({ scenarioId: scenario.id, selectedOptionId: optionId }),
      });
      setResult(res);
    } catch (err: any) {
      console.error('Error submitting attempt to database:', err);
      const isCorrect = scenario.correctOptionId === optionId;
      setResult({
        scenarioId: scenario.id,
        selectedOptionId: optionId,
        isCorrect,
        correctOptionId: scenario.correctOptionId,
        explanation: scenario.explanation,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextScenario = () => {
    setSelectedOpt(null);
    setResult(null);
    setCurrentIdx((currentIdx + 1) % scenarios.length);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <Fish size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Phishing Simulation Lab</h1>
            <p className="text-xs font-semibold text-slate-500">Test your ability to spot live phishing tactics</p>
          </div>
        </div>
        <span className="text-xs font-bold font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg">
          Scenario {currentIdx + 1} of {scenarios.length}
        </span>
      </div>

      {/* Scenario Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Scenario Header */}
        <div className="p-6 bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-800">
              {scenario.contextType}
            </span>
            <span className="text-xs font-bold text-slate-400">Difficulty: {scenario.difficulty}</span>
          </div>
          <h2 className="text-lg font-bold">{scenario.title}</h2>
          <div className="text-xs text-slate-300 font-mono bg-slate-800/80 p-3 rounded-lg border border-slate-700/80 break-all">
            <span className="text-slate-400 font-sans font-bold">From: </span>{scenario.messageSender}
          </div>
        </div>

        {/* Message Body Simulation */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans shadow-xs whitespace-pre-line">
            {scenario.messageContent}
          </div>
        </div>

        {/* Action Choices */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">What would you do?</h3>
          <div className="grid gap-3">
            {options.map((opt: any) => {
              const isSelected = selectedOpt === opt.id;
              let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

              if (result) {
                if (opt.id === result.correctOptionId) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                } else if (isSelected && !result.isCorrect) {
                  btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-500';
                }
              } else if (isSelected) {
                btnStyle = 'border-brand-600 bg-brand-50 text-brand-900';
              }

              return (
                <button
                  key={opt.id}
                  disabled={!!selectedOpt}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt.text}</span>
                  {result && opt.id === result.correctOptionId && (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 ml-2" />
                  )}
                  {result && isSelected && !result.isCorrect && (
                    <XCircle size={18} className="text-rose-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result & Explanation Banner */}
        {result && (
          <div className={`p-6 border-t ${result.isCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-base">
                {result.isCorrect ? (
                  <>
                    <CheckCircle2 size={20} className="text-emerald-600" />
                    <span className="text-emerald-900">Correct Decision! Excellent Threat Recognition.</span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} className="text-rose-600" />
                    <span className="text-rose-900">Security Warning: High Risk Action Selected.</span>
                  </>
                )}
              </div>

              <div className="p-4 bg-white rounded-xl border text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line shadow-xs">
                <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-brand-600" /> Security Analysis & Red Flags:
                </span>
                <p>{result.explanation}</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextScenario}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md"
                >
                  Next Scenario <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

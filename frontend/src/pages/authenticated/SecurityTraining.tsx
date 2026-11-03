import React, { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle2, Clock, BookOpen, ArrowRight, Award, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export interface TrainingModule {
  id: string;
  title: string;
  category: string;
  estimatedMinutes: number;
  summary: string;
  content: {
    sections: { title: string; body?: string; items?: string[] }[];
  } | string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[] | any;
}

export const SecurityTraining: React.FC = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [progressState, setProgressState] = useState<Record<string, { completed: boolean; score: number }>>({});

  useEffect(() => {
    // Fetch user progress from database
    fetchApi<{ progress: Record<string, { completed: boolean; score: number }> }>('/api/training/progress')
      .then(res => {
        if (res.progress) setProgressState(res.progress);
      })
      .catch(err => {
        console.error('Failed to load training progress from database:', err);
      });

    fetchApi<{ modules: any[] }>('/api/training')
      .then(res => {
        if (res.modules && res.modules.length > 0) {
          const parsed = res.modules.map(m => ({
            ...m,
            estimatedMinutes: m.estimatedMinutes || m.estimated_minutes || 5,
            content: typeof m.content === 'string' ? JSON.parse(m.content) : m.content,
            quiz: typeof m.quiz === 'string' ? JSON.parse(m.quiz) : m.quiz,
          }));
          setModules(parsed);
          setActiveModuleId(parsed[0].id);
        }
      })
      .catch(err => {
        console.error('Failed to load training modules from database:', err);
      })
      .finally(() => setLoadingModules(false));
  }, []);

  if (loadingModules) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading Training Modules from Database...</p>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl border border-slate-200">
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">No Training Modules Available</h3>
        <p className="text-sm text-slate-500 mt-1">Check back later for new awareness courses.</p>
      </div>
    );
  }

  const activeModule = modules.find(m => m.id === activeModuleId) || modules[0];
  const isCompleted = !!progressState[activeModule.id]?.completed;

  const contentSections = typeof activeModule.content === 'object' && activeModule.content?.sections
    ? activeModule.content.sections
    : [];

  const quizObj = Array.isArray(activeModule.quiz) ? activeModule.quiz[0] : activeModule.quiz;

  const handleSelectQuiz = (idx: number) => {
    if (quizSubmitted) return;
    setQuizAnswer(idx);
  };

  const handleSubmitQuiz = async () => {
    if (quizAnswer === null || !quizObj) return;
    setQuizSubmitted(true);

    const isCorrect = quizAnswer === quizObj.correctIndex;
    const score = isCorrect ? 100 : 50;

    setProgressState(prev => ({
      ...prev,
      [activeModule.id]: { completed: true, score },
    }));

    try {
      await fetchApi('/api/training/progress', {
        method: 'POST',
        body: JSON.stringify({ moduleId: activeModule.id, completed: true, score }),
      });
    } catch (err) {
      console.error('Failed to save progress to database:', err);
    }
  };

  const handleModuleSelect = (id: string) => {
    setActiveModuleId(id);
    setQuizAnswer(null);
    setQuizSubmitted(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Cyber Hygiene Academy</h1>
            <p className="text-xs font-semibold text-slate-500">Interactive educational modules to fortify your social presence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Progress:</span>
          <span className="text-xs font-extrabold font-mono bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100">
            {Object.keys(progressState).length} / {modules.length} Modules Completed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Module Sidebar Navigator */}
        <div className="space-y-3 lg:col-span-1">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">Training Modules</h2>
          <div className="space-y-2.5">
            {modules.map(mod => {
              const active = mod.id === activeModule.id;
              const comp = !!progressState[mod.id]?.completed;

              return (
                <button
                  key={mod.id}
                  onClick={() => handleModuleSelect(mod.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all space-y-2 ${
                    active
                      ? 'border-brand-600 bg-brand-50/70 shadow-xs ring-1 ring-brand-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {mod.category}
                    </span>
                    {comp ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 font-mono">
                        <Clock size={12} /> {mod.estimatedMinutes}m
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{mod.title}</h3>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Module Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
            {/* Header */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                  {activeModule.category}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1">
                  <Clock size={12} /> {activeModule.estimatedMinutes} Min Read
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{activeModule.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{activeModule.summary}</p>
            </div>

            {/* Reading Content Sections */}
            <div className="space-y-6">
              {contentSections.map((sec: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen size={18} className="text-brand-600" />
                    {sec.title}
                  </h3>
                  {sec.body && (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-6">
                      {sec.body}
                    </p>
                  )}
                  {sec.items && Array.isArray(sec.items) && (
                    <ul className="pl-6 space-y-1.5 text-sm text-slate-700 list-disc">
                      {sec.items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Quiz Knowledge Check */}
            {quizObj && (
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-indigo-600" />
                  <h3 className="text-base font-extrabold text-slate-900">Module Knowledge Check</h3>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <p className="text-sm font-bold text-slate-800">{quizObj.question}</p>

                  <div className="space-y-2.5">
                    {quizObj.options.map((opt: string, idx: number) => {
                      const isSelected = quizAnswer === idx;
                      let optionStyle = 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700';

                      if (quizSubmitted) {
                        if (idx === quizObj.correctIndex) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                        } else if (isSelected && quizAnswer !== quizObj.correctIndex) {
                          optionStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-500';
                        }
                      } else if (isSelected) {
                        optionStyle = 'border-brand-600 bg-brand-50 text-brand-900 ring-1 ring-brand-500';
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectQuiz(idx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && idx === quizObj.correctIndex && (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      disabled={quizAnswer === null}
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/20"
                    >
                      Submit Answer <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div className="p-4 bg-white rounded-xl border text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block">Explanation:</span>
                      <p>{quizObj.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

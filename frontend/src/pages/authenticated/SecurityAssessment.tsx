import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, HelpCircle } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { RawAnswerInput } from '../../lib/riskEngineClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface AssessmentQuestion {
  id: string;
  category: 'password' | 'mfa' | 'privacy' | 'phishing' | 'applications' | 'recovery' | 'awareness';
  categoryLabel?: string;
  questionText: string;
  explanation: string;
  options: {
    id: string;
    text: string;
    scoreValue: number;
    riskIndicator?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'NONE';
    findingTitle?: string;
    findingRecommendation?: string;
  }[];
}

export const SecurityAssessment: React.FC = () => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, { optionId: string; option: any }>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApi<{ questions: AssessmentQuestion[] }>('/api/assessment/questions')
      .then(res => {
        if (res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
        } else {
          setFetchError('No assessment questions found in the database.');
        }
      })
      .catch(err => {
        setFetchError(err.message || 'Failed to load assessment questions from database.');
      })
      .finally(() => setLoadingQuestions(false));
  }, []);

  if (loadingQuestions) {
    return <LoadingSpinner label="Loading live assessment questions from database..." />;
  }

  if (fetchError || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-card text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Unable to Load Assessment</h2>
        <p className="text-xs text-slate-500">{fetchError || 'No questions available.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectOption = (option: any) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: { optionId: option.id, option },
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const answersPayload: RawAnswerInput[] = questions.map(q => {
      const selected = selectedAnswers[q.id];
      const opt = selected ? selected.option : q.options[q.options.length - 1];
      return {
        questionId: q.id,
        optionId: opt.id,
        category: q.category,
        scoreEarned: opt.scoreValue || opt.score || 0,
        riskIndicator: opt.riskIndicator,
        findingTitle: opt.findingTitle,
        findingRecommendation: opt.findingRecommendation,
        questionText: q.questionText,
      };
    });

    try {
      const result = await fetchApi<any>('/api/assessment/calculate', {
        method: 'POST',
        body: JSON.stringify({ answers: answersPayload }),
      });

      navigate(`/assessment/results/${result.id}`, { state: { result } });
    } catch (err: any) {
      alert(`Assessment submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isCurrentAnswered = !!selectedAnswers[currentQ.id];
  const allAnswered = Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Security Assessment Wizard
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-2">
              Question {currentIndex + 1} of {questions.length}
            </h1>
          </div>
          <span className="text-sm font-extrabold text-slate-700 font-mono">
            {progressPercent}% Complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Category: {currentQ.categoryLabel || currentQ.category.toUpperCase()}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQ.questionText}
          </h2>
        </div>

        {/* Explanation Helper */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
          <HelpCircle size={16} className="text-brand-600 shrink-0 mt-0.5" />
          <p>{currentQ.explanation}</p>
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map(option => {
            const isSelected = selectedAnswers[currentQ.id]?.optionId === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/70 text-brand-900 shadow-xs ring-1 ring-brand-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{option.text}</span>
                {isSelected && <CheckCircle2 size={18} className="text-brand-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Wizard Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isCurrentAnswered}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 transition-all shadow-md shadow-brand-600/20 flex items-center gap-1.5"
            >
              Next Question <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !allAnswered}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              {submitting ? 'Calculating Risk Scores...' : 'Submit & Calculate Risk'}
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

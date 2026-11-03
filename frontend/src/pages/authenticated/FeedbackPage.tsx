import React, { useState } from 'react';
import { MessageSquareHeart, Star, Send, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export const FeedbackPage: React.FC = () => {
  const [rating, setRating] = useState(5);
  const [easeOfUse, setEaseOfUse] = useState(5);
  const [usefulness, setUsefulness] = useState(5);
  const [mostUsefulFeature, setMostUsefulFeature] = useState('URL Threat Inspector');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [comments, setComments] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      rating,
      easeOfUse,
      usefulness,
      mostUsefulFeature,
      wouldRecommend,
      comments,
    };

    try {
      await fetchApi('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(`Feedback submission failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
          <MessageSquareHeart size={28} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            Platform Feedback
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            User Experience & Feedback
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Help us improve Social Guard tools, scoring algorithms, and security educational content.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Thank You for Your Feedback!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your evaluation has been recorded and submitted to our engineering and threat intelligence teams.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs"
          >
            Submit Another Response
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card space-y-6 text-xs">
          {/* Overall Rating */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider">
              Overall Platform Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    rating >= star ? 'bg-amber-50 border-amber-300 text-amber-500' : 'bg-slate-50 border-slate-200 text-slate-300'
                  }`}
                >
                  <Star size={20} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Ratings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ease of Use (1 to 5)
              </label>
              <select
                value={easeOfUse}
                onChange={e => setEaseOfUse(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
              >
                <option value={5}>5 - Very Intuitive</option>
                <option value={4}>4 - Easy to navigate</option>
                <option value={3}>3 - Moderate</option>
                <option value={2}>2 - Somewhat confusing</option>
                <option value={1}>1 - Difficult</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Usefulness of Guidance (1 to 5)
              </label>
              <select
                value={usefulness}
                onChange={e => setUsefulness(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
              >
                <option value={5}>5 - Extremely Helpful</option>
                <option value={4}>4 - Very Useful</option>
                <option value={3}>3 - Moderate Value</option>
                <option value={2}>2 - Slightly Useful</option>
                <option value={1}>1 - Not Useful</option>
              </select>
            </div>
          </div>

          {/* Most Useful Feature */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Most Useful Feature
            </label>
            <select
              value={mostUsefulFeature}
              onChange={e => setMostUsefulFeature(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
            >
              <option value="Security Assessment Wizard">7-Domain Security Assessment Wizard</option>
              <option value="Password Security Analyzer">Client-Side Password Security Analyzer</option>
              <option value="URL Threat Inspector">URL Threat Inspector</option>
              <option value="Phishing Simulator Lab">Phishing Simulator Lab</option>
              <option value="MFA Platform Checklists">Platform MFA Checklists</option>
              <option value="Privacy Self-Assessment">Privacy Self-Assessment</option>
            </select>
          </div>

          {/* Would Recommend */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">Would you recommend Social Guard to colleagues?</span>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                <input
                  type="radio"
                  name="recommend"
                  checked={wouldRecommend}
                  onChange={() => setWouldRecommend(true)}
                />
                <span>Yes</span>
              </label>

              <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                <input
                  type="radio"
                  name="recommend"
                  checked={!wouldRecommend}
                  onChange={() => setWouldRecommend(false)}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Additional Suggestions & Comments
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Share feature requests or feedback..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Feedback Response'}
            <Send size={14} />
          </button>
        </form>
      )}
    </div>
  );
};

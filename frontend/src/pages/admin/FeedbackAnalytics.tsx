import React, { useState, useEffect } from 'react';
import { MessageSquareHeart, Star, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export const FeedbackAnalytics: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<{ feedback: any[] }>('/api/feedback')
      .then(res => {
        setFeedbackList(res.feedback || []);
      })
      .catch(err => {
        console.error('Failed to load feedback from database:', err);
        setFeedbackList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            Admin Feedback Report
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Feedback Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">User satisfaction ratings and comments from database records.</p>
        </div>
        <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
          <MessageSquareHeart size={28} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <span>Submitted Feedback ({feedbackList.length})</span>
          {loading && <Loader2 size={16} className="animate-spin text-amber-600" />}
        </h2>

        {feedbackList.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No feedback responses recorded in database yet.</p>
        ) : (
          <div className="space-y-3">
            {feedbackList.map((fb: any, i: number) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                    {fb.rating} ★ Rating
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {fb.createdAt || fb.created_at ? new Date(fb.createdAt || fb.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                {fb.userName && <p className="text-slate-500 font-semibold">User: {fb.userName}</p>}
                <p className="text-slate-700"><strong>Most Useful Feature:</strong> {fb.mostUsefulFeature || fb.most_useful_feature || 'N/A'}</p>
                {fb.comments && <p className="text-slate-600 italic">"{fb.comments}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

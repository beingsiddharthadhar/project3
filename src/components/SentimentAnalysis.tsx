/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Star, MessageSquareCode, Sparkles, Send, Skull, ShieldEllipsis, ShieldAlert, BadgeCheck, UtensilsCrossed } from 'lucide-react';
import { CustomerReview } from '../types';

export default function SentimentAnalysis() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [restaurantName, setRestaurantName] = useState('Burger House');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to query reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: 'Siddharth Dhar',
          restaurantName,
          rating,
          comment
        })
      });

      if (response.ok) {
        setComment('');
        await fetchReviews();
      }
    } catch (err) {
      console.error('Failed to submit new feedback review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for stars
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < count ? 'text-amber-450 fill-amber-450' : 'text-zinc-200'}`} />
    ));
  };

  if (loading) {
    return (
      <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-widest">Compiling Customer Reviews Feed...</p>
      </div>
    );
  }

  // Sentiment distribution calculations
  const positives = reviews.filter(r => r.sentiment === 'Positive').length;
  const neutrals = reviews.filter(r => r.sentiment === 'Neutral').length;
  const negatives = reviews.filter(r => r.sentiment === 'Negative').length;
  const total = reviews.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Middle column: interactive submission Form */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="mb-4">
            <h3 className="text-base font-bold text-zinc-950 font-display">Simulate Customer Review Submission</h3>
            <p className="text-[10px] text-zinc-400 font-mono uppercase">Triggers automatic real-time Gemini sentiment classification</p>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 tracking-wide uppercase mb-1.5">Target Restaurant</label>
              <select
                id="select-review-restaurant"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full text-xs font-semibold font-display bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="Burger House">Burger House</option>
                <option value="Zaatar & Zeytouna">Zaatar & Zeytouna</option>
                <option value="Pizzeria Bella">Pizzeria Bella</option>
                <option value="The Green Bowl">The Green Bowl</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 tracking-wide uppercase mb-1.5">Your Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className="p-1 px-2.5 rounded bg-zinc-50 border border-zinc-200 flex items-center gap-1 hover:bg-zinc-100 transition-all text-xs font-bold font-mono"
                  >
                    <Star className={`w-3.5 h-3.5 ${val <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'}`} />
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 tracking-wide uppercase mb-1.5">Your Experience Comment</label>
              <textarea
                id="review-comment-textarea"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your meal (e.g. 'the hot chicken slider was incredibly cold, waited 40 mins!' or 'Absolutely stellar fast delivery!')"
                className="w-full text-xs font-sans bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-zinc-400 leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="w-full brand-gradient hover:brand-gradient-hover text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Submit Review & Run Analysis
            </button>
          </form>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-150/40">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/50 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping mt-1 shrink-0" />
            <p className="text-[10px] text-zinc-505 font-medium leading-relaxed">
              Every review creates an automated request to the **Gemini 3.5 Flash** model for semantic analysis and immediate corrective operational recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Column: reviews stream */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Sentiment breakdown banner */}
        <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-950 font-display">Sentiment Assessment Breakdown</h3>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wide">AGGREGATING LIVE FEEDBACK METRICS</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-center">
              <span className="text-xs font-extrabold text-emerald-600 block">{positives}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">Positive</span>
            </div>
            <div className="text-center border-l border-zinc-200 pl-4">
              <span className="text-xs font-extrabold text-amber-500 block">{neutrals}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">Neutral</span>
            </div>
            <div className="text-center border-l border-zinc-200 pl-4">
              <span className="text-xs font-extrabold text-rose-500 block">{negatives}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">Negative</span>
            </div>
          </div>
        </div>

        {/* List scroll stage */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {reviews.map((rev) => {
            const isPos = rev.sentiment === 'Positive';
            const isNeg = rev.sentiment === 'Negative';
            const isNeu = rev.sentiment === 'Neutral';

            return (
              <div key={rev.review_id} className="bg-white rounded-xl border border-zinc-150/60 p-5 shadow-sm transition-all hover:shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-50 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-extrabold text-zinc-600 font-display uppercase">
                      {rev.customer_name.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 font-display leading-tight">{rev.customer_name}</h4>
                      <p className="text-[10px] text-zinc-400">{rev.restaurant_name} • {new Date(rev.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isPos ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' :
                      isNeg ? 'bg-rose-50 text-rose-600 border border-rose-200/50' :
                      'bg-amber-50 text-amber-600 border border-amber-200/50'
                    }`}>
                      {rev.sentiment || 'Classifying...'}
                    </span>
                    <div className="flex items-center">
                      {renderStars(rev.rating)}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed italic font-sans px-2 border-l-2 border-zinc-100 mb-3 block">
                  "{rev.comment}"
                </p>

                {/* AI generated Corrective Action Card */}
                {rev.ai_insight && (
                  <div className="bg-gradient-to-tr from-violet-50/50 to-indigo-50/50 rounded-lg p-3 border border-indigo-150/40 flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      isNeg ? 'bg-rose-100 text-rose-600' :
                      isPos ? 'bg-emerald-100 text-emerald-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      {isNeg ? <ShieldAlert className="w-3.5 h-3.5" /> : 
                       isPos ? <BadgeCheck className="w-3.5 h-3.5" /> : 
                       <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold font-mono tracking-widest text-indigo-700 block uppercase mb-0.5">Automated AI Recovery Insight</span>
                      <p className="text-[11px] text-zinc-650 font-medium font-sans leading-relaxed">{rev.ai_insight}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

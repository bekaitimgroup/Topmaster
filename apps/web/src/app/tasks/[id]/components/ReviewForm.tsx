'use client';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  taskId: string;
  onSubmitted: () => void;
}

const STARS = [1, 2, 3, 4, 5];

export default function ReviewForm({ taskId, onSubmitted }: Props) {
  const { t } = useLanguage();
  const rf = t.reviewForm;

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (rating === 0) { setError(rf.ratingError); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ taskId, rating, text: text || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? rf.errorGeneric);
      }
      onSubmitted();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 space-y-4">
      <h3 className="font-bold text-[#0D0D1A]">{rf.title}</h3>

      <div className="flex gap-2 justify-center py-2">
        {STARS.map((s) => (
          <button key={s}
            onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(s)}
            className="text-3xl transition-transform hover:scale-110">
            <span className={(hovered || rating) >= s ? 'text-amber-400' : 'text-zinc-200'}>★</span>
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-center text-sm text-zinc-500">
          {(rf.ratingLabels as Record<number, string>)[rating]}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {rf.quickTexts.map((qt) => (
          <button key={qt}
            onClick={() => setText((prev) => prev ? `${prev} ${qt}` : qt)}
            className="text-xs px-3 py-1.5 rounded-full border-2 border-zinc-200 hover:border-[#A78BFA] hover:text-[#7C3AED] transition-colors">
            + {qt}
          </button>
        ))}
      </div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
        placeholder={rf.placeholder}
        className="w-full rounded-2xl border-2 border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all resize-none" />

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3">{error}</p>}

      <button onClick={submit} disabled={loading || rating === 0}
        className="w-full py-4 rounded-2xl text-white font-bold disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
        {loading ? t.common.loading : rf.submitBtn}
      </button>
    </div>
  );
}

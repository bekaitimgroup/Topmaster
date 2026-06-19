'use client';
import { useState } from 'react';

interface Props {
  taskId: string;
  onSubmitted: () => void;
}

const STARS = [1, 2, 3, 4, 5];
const QUICK_TEXTS = [
  "Ishni sifatli va o'z vaqtida bajardi",
  'Muloqoti yaxshi, professional',
  'Narxi ishga mos keldi',
  "Tavsiya qilaman",
];

export default function ReviewForm({ taskId, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (rating === 0) { setError("Yulduz bering"); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ taskId, rating, text: text || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Xatolik');
      }
      onSubmitted();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-4">
      <h3 className="font-semibold">Baho qoldiring</h3>

      {/* Star selector */}
      <div className="flex gap-2 justify-center py-2">
        {STARS.map((s) => (
          <button
            key={s}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(s)}
            className="text-3xl transition-transform hover:scale-110"
          >
            <span className={(hovered || rating) >= s ? 'text-amber-400' : 'text-zinc-200'}>
              ★
            </span>
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-center text-sm text-zinc-500">
          {['', "Juda yomon", "Yomon", "O'rtacha", "Yaxshi", "Ajoyib"][rating]}
        </p>
      )}

      {/* Quick-fill chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_TEXTS.map((t) => (
          <button
            key={t}
            onClick={() => setText((prev) => prev ? `${prev} ${t}` : t)}
            className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            + {t}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Izoh yozing (ixtiyoriy)..."
        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        onClick={submit}
        disabled={loading || rating === 0}
        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {loading ? 'Yuborilmoqda...' : 'Baho yuborish'}
      </button>
    </div>
  );
}

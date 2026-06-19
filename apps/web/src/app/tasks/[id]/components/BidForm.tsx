'use client';
import { useState } from 'react';

const DURATIONS = [
  { value: 60,  label: '1 soat' },
  { value: 120, label: '2 soat' },
  { value: 180, label: '3 soat' },
  { value: 240, label: '4 soat' },
  { value: 480, label: 'Yarim kun' },
  { value: 960, label: 'Butun kun' },
];

interface Props {
  taskId: string;
  budgetUzs: number | null;
  onSubmitted: () => void;
}

export default function BidForm({ taskId, budgetUzs, onSubmitted }: Props) {
  const [price, setPrice] = useState(budgetUzs ? String(budgetUzs) : '');
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!price || Number(price) < 1000) {
      setError('Narxni kiriting (kamida 1 000 so\'m)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          taskId,
          priceUzs: Number(price),
          message: message || undefined,
          estimatedDurationMins: duration ? Number(duration) : undefined,
        }),
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
      <h3 className="font-semibold">Taklif berish</h3>

      <div>
        <label className="block text-sm font-medium mb-1.5">Narxingiz (so'm)</label>
        <div className="relative">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={budgetUzs ? `${budgetUzs.toLocaleString()} gacha` : 'Narxni kiriting'}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">so'm</span>
        </div>
        {budgetUzs && Number(price) > budgetUzs && (
          <p className="text-xs text-amber-600 mt-1">Mijozning byudjetidan yuqori</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Taxminiy muddat <span className="text-zinc-400 font-normal">(ixtiyoriy)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(duration === String(d.value) ? '' : String(d.value))}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                duration === String(d.value)
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Xabar <span className="text-zinc-400 font-normal">(ixtiyoriy)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Nima uchun siz eng yaxshi tanlov ekanligingizni yozing..."
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {loading ? 'Yuborilmoqda...' : 'Taklif berish'}
      </button>
    </div>
  );
}

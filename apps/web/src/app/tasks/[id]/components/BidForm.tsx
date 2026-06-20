'use client';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  taskId: string;
  budgetUzs: number | null;
  onSubmitted: () => void;
}

export default function BidForm({ taskId, budgetUzs, onSubmitted }: Props) {
  const { t } = useLanguage();
  const bf = t.bidForm;

  const [price, setPrice] = useState(budgetUzs ? String(budgetUzs) : '');
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!price || Number(price) < 1000) {
      setError(bf.priceError);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          taskId,
          priceUzs: Number(price),
          message: message || undefined,
          estimatedDurationMins: duration ? Number(duration) : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? bf.errorGeneric);
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
      <h3 className="font-bold text-[#0D0D1A]">{bf.title}</h3>

      <div>
        <label className="block text-sm font-semibold mb-1.5">{bf.priceLabel} ({t.currency})</label>
        <div className="relative">
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
            placeholder={budgetUzs ? `${budgetUzs.toLocaleString()} ${bf.upTo}` : bf.pricePlaceholder}
            className="w-full rounded-2xl border-2 border-zinc-200 px-4 py-3 pr-16 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">{t.currency}</span>
        </div>
        {budgetUzs && Number(price) > budgetUzs && (
          <p className="text-xs text-amber-600 mt-1">{bf.overBudget}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">
          {bf.durationLabel} <span className="text-zinc-400 font-normal">({t.common.optional})</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {bf.durations.map((d) => (
            <button key={d.value}
              onClick={() => setDuration(duration === String(d.value) ? '' : String(d.value))}
              className={`px-3 py-1.5 rounded-xl border-2 text-sm font-medium transition-all ${
                duration === String(d.value)
                  ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]'
                  : 'border-zinc-200 hover:border-[#A78BFA] text-zinc-600'
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">
          {bf.messageLabel} <span className="text-zinc-400 font-normal">({t.common.optional})</span>
        </label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
          placeholder={bf.messagePlaceholder}
          className="w-full rounded-2xl border-2 border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all resize-none" />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3">{error}</p>}

      <button onClick={submit} disabled={loading}
        className="w-full py-4 rounded-2xl text-white font-bold disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
        {loading ? t.common.loading : bf.submitBtn}
      </button>
    </div>
  );
}

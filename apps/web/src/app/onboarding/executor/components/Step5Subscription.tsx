'use client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Plan {
  id: string;
  label: string;
  bids: number | null;
  days: number;
  priceUzs: number;
}

interface Props {
  categoryNames: string[];
  onActivate: () => void;
  onBack: () => void;
  loading: boolean;
  error: string;
}

const PLANS: Plan[] = [
  { id: 'base_25',      label: 'Base S',       bids: 25,   days: 30, priceUzs: 120000 },
  { id: 'base_50',      label: 'Base M',       bids: 50,   days: 30, priceUzs: 200000 },
  { id: 'base_100',     label: 'Base L',       bids: 100,  days: 30, priceUzs: 320000 },
  { id: 'unlimited_15', label: 'Unlimited 15', bids: null, days: 15, priceUzs: 150000 },
  { id: 'unlimited_30', label: 'Unlimited 30', bids: null, days: 30, priceUzs: 250000 },
  { id: 'unlimited_90', label: 'Unlimited 90', bids: null, days: 90, priceUzs: 600000 },
];

export default function Step5Subscription({ categoryNames, onActivate, onBack, loading, error }: Props) {
  const { t } = useLanguage();
  const s = t.onboarding.step5;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
        <p className="text-sm text-zinc-500">{s.subtitle}</p>
      </div>

      <div className="rounded-2xl border-2 border-[#7C3AED] bg-[#F5F3FF] p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-extrabold text-[#5B21B6] text-lg">{s.freeTrial}</span>
          <span className="bg-[#7C3AED] text-white text-xs font-bold px-2.5 py-1 rounded-full">{s.recommended}</span>
        </div>
        <p className="text-sm text-[#4C1D95] mb-1">{s.freeTrialDesc}</p>
        <p className="text-xs text-[#7C3AED]">{s.categories}: {categoryNames.join(', ')}</p>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        <button onClick={onActivate} disabled={loading}
          className="mt-4 w-full py-4 rounded-2xl text-white font-bold disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          {loading ? t.common.loading : s.activateBtn}
        </button>
      </div>

      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">{s.afterTrialLabel}</p>
        <div className="grid grid-cols-2 gap-2">
          {PLANS.map((p) => (
            <div key={p.id} className="rounded-2xl border-2 border-zinc-200 p-3 opacity-60">
              <p className="font-bold text-sm">{p.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {p.bids ? `${p.bids} ${s.bids}` : s.unlimited} · {p.days} {s.days}
              </p>
              <p className="text-sm font-bold mt-1">{p.priceUzs.toLocaleString()} {t.currency}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-400 mt-2 text-center">{s.paymentNote}</p>
      </div>

      <button onClick={onBack}
        className="w-full py-4 rounded-2xl border-2 border-zinc-200 font-bold text-sm hover:bg-zinc-50 transition-colors">
        {t.common.back}
      </button>
    </div>
  );
}

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
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-extrabold text-ink mb-1">{s.title}</h2>
        <p className="text-sm text-muted">{s.subtitle}</p>
      </div>

      {/* Free trial hero — the reward for finishing the profile */}
      <div className="rounded-2xl bg-gradient-brand-deep p-6 text-white glow-violet">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="font-display font-extrabold text-xl">{s.freeTrial}</span>
          <span className="bg-gradient-gold text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
            {s.recommended}
          </span>
        </div>
        <p className="text-sm text-white/85 mb-2">{s.freeTrialDesc}</p>
        <div className="flex flex-wrap gap-1.5 mb-1">
          <span className="text-xs text-white/70 mr-0.5 self-center">{s.categories}:</span>
          {categoryNames.map((name) => (
            <span key={name} className="text-xs font-semibold bg-white/12 border border-white/15 px-2.5 py-1 rounded-full">
              {name}
            </span>
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-white bg-error/80 border border-error-tint/30 rounded-xl px-3 py-2.5">
            {error}
          </p>
        )}

        <button onClick={onActivate} disabled={loading}
          className="mt-4 w-full min-h-[52px] py-4 rounded-2xl bg-white text-brand-dark font-bold disabled:opacity-60 btn-press">
          {loading ? t.common.loading : s.activateBtn}
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{s.afterTrialLabel}</p>
        <div className="grid grid-cols-2 gap-2">
          {PLANS.map((p) => (
            <div key={p.id} className="rounded-2xl border-2 border-zinc-200 bg-surface p-3 opacity-70">
              <p className="font-bold text-sm text-ink">{p.label}</p>
              <p className="text-xs text-muted mt-0.5">
                {p.bids ? `${p.bids} ${s.bids}` : s.unlimited} · {p.days} {s.days}
              </p>
              <p className="text-sm font-bold text-ink mt-1">{p.priceUzs.toLocaleString()} {t.currency}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-2 text-center">{s.paymentNote}</p>
      </div>

      <button onClick={onBack}
        className="w-full min-h-[52px] py-4 rounded-2xl border-2 border-zinc-200 bg-surface font-bold text-sm text-ink hover:bg-zinc-50 transition-colors">
        {t.common.back}
      </button>
    </div>
  );
}

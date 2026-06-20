'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function credOpts(extra?: HeadersInit): RequestInit {
  return { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(extra ?? {}) } };
}

interface Subscription {
  id: string;
  categoryId: string;
  category?: { id: string; nameUz: string };
  planType: string;
  bidsTotal: number;
  bidsUsed: number;
  bidsRemaining: number | null;
  priceUzs: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  isExpired: boolean;
  daysLeft: number;
  isUnlimited: boolean;
}

interface Plan {
  id: string;
  label: string;
  bids: number | null;
  days: number;
  priceUzs: number;
}

const PLAN_COLORS: Record<string, string> = {
  base_25:      'border-zinc-200',
  base_50:      'border-[#DDD6FE]',
  base_100:     'border-[#A78BFA]',
  unlimited_15: 'border-amber-200',
  unlimited_30: 'border-amber-400',
  unlimited_90: 'border-amber-500',
};

const PLAN_BADGES: Record<string, { label: string; color: string }> = {
  base_25:      { label: 'S',  color: 'bg-zinc-100 text-zinc-600' },
  base_50:      { label: 'M',  color: 'bg-[#EDE9FE] text-[#5B21B6]' },
  base_100:     { label: 'L',  color: 'bg-[#DDD6FE] text-[#4C1D95]' },
  unlimited_15: { label: '∞',  color: 'bg-amber-100 text-amber-700' },
  unlimited_30: { label: '∞',  color: 'bg-amber-200 text-amber-800' },
  unlimited_90: { label: '∞⭐', color: 'bg-amber-300 text-amber-900' },
};

function SubCard({ sub, subs }: { sub: Subscription; subs: ReturnType<typeof useLanguage>['t']['subscriptions'] }) {
  const badge = PLAN_BADGES[sub.planType] ?? { label: '?', color: 'bg-zinc-100 text-zinc-600' };
  const pct = sub.isUnlimited ? null : Math.round((sub.bidsUsed / sub.bidsTotal) * 100);

  return (
    <div className={`bg-white rounded-2xl border-2 p-4 space-y-3 ${sub.isActive && !sub.isExpired ? PLAN_COLORS[sub.planType] ?? 'border-zinc-200' : 'border-zinc-100 opacity-60'}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
            <p className="font-semibold text-sm">{sub.category?.nameUz ?? sub.categoryId}</p>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{sub.planType.replace('_', ' ').toUpperCase()}</p>
        </div>
        <div className="text-right">
          {sub.isExpired ? (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-600">{subs.statusExpired}</span>
          ) : sub.isActive ? (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">{subs.statusActive} · {sub.daysLeft} {subs.days}</span>
          ) : (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-zinc-100 text-zinc-500">{subs.statusPending}</span>
          )}
        </div>
      </div>

      {sub.isUnlimited ? (
        <p className="text-sm text-zinc-600">{subs.unlimited}</p>
      ) : (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{sub.bidsUsed} {subs.bidsUsed}</span>
            <span>{sub.bidsRemaining} {subs.bidsLeft} / {sub.bidsTotal}</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${(pct ?? 0) > 80 ? 'bg-red-400' : 'bg-[#7C3AED]'}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-400">
        {new Date(sub.startsAt).toLocaleDateString('uz-UZ')} — {new Date(sub.expiresAt).toLocaleDateString('uz-UZ')}
      </p>
    </div>
  );
}

function PlanCard({ plan, selected, onSelect, subs }: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
  subs: ReturnType<typeof useLanguage>['t']['subscriptions'];
}) {
  const isUnlimited = plan.id.startsWith('unlimited');
  const badge = PLAN_BADGES[plan.id] ?? { label: '?', color: 'bg-zinc-100 text-zinc-600' };
  const { t } = useLanguage();

  return (
    <button onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
        selected ? 'border-[#7C3AED] bg-[#F5F3FF]' : `${PLAN_COLORS[plan.id] ?? 'border-zinc-200'} hover:border-[#A78BFA] bg-white`
      }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
          <span className="font-bold text-sm">{plan.label}</span>
        </div>
        <span className="font-bold text-sm">{plan.priceUzs.toLocaleString()} {t.currency}</span>
      </div>
      <p className="text-xs text-zinc-500">
        {isUnlimited ? subs.unlimited : `${plan.bids} ${subs.bids}`} · {plan.days} {subs.days}
      </p>
      {selected && <p className="text-xs text-[#7C3AED] font-bold mt-2">{subs.planSelected}</p>}
    </button>
  );
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const sub = t.subscriptions;

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<{ id: string; nameUz: string }[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [plansData, setPlansData] = useState<{ current: Subscription | null; plans: Plan[] } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/subscriptions/my`, credOpts()).then(r => r.json()),
      fetch(`${API}/api/categories`, credOpts()).then(r => r.json()),
    ]).then(([subsData, catsData]) => {
      setSubs(Array.isArray(subsData) ? subsData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
      setLoading(false);
    }).catch(() => router.replace('/'));
  }, []);

  useEffect(() => {
    if (!selectedCat) { setPlansData(null); return; }
    fetch(`${API}/api/subscriptions/plans?categoryId=${selectedCat}`, credOpts())
      .then(r => r.json()).then(setPlansData);
    setSelectedPlan('');
  }, [selectedCat]);

  async function handlePurchase() {
    if (!selectedCat || !selectedPlan) return;
    setPurchasing(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/subscriptions/purchase`, {
        method: 'POST',
        ...credOpts(),
        body: JSON.stringify({ categoryId: selectedCat, planId: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? sub.errorGeneric);
      window.location.href = data.checkoutUrl;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPurchasing(false);
    }
  }

  const activeSubs = subs.filter(s => s.isActive && !s.isExpired);
  const expiredSubs = subs.filter(s => !s.isActive || s.isExpired);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors">
            ←
          </button>
          <h1 className="font-bold text-[#0D0D1A] flex-1">{sub.title}</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-8">
        {activeSubs.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{sub.activeTitle}</p>
            {activeSubs.map(s => <SubCard key={s.id} sub={s} subs={sub} />)}
          </section>
        )}

        {activeSubs.length === 0 && (
          <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4">
            <p className="font-bold text-amber-800 mb-1">{sub.noActive}</p>
            <p className="text-sm text-amber-700">{sub.noActiveDesc}</p>
          </div>
        )}

        <section className="bg-white rounded-2xl border-2 border-zinc-100 p-5 space-y-4">
          <p className="font-bold text-[#0D0D1A]">{sub.buyTitle}</p>

          <div>
            <label className="block text-sm font-semibold mb-1.5">{sub.categoryLabel}</label>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)}
              className="w-full border-2 border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C3AED] transition-all">
              <option value="">{sub.categoryPlaceholder}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nameUz}</option>)}
            </select>
          </div>

          {plansData?.current && (
            <div className="bg-[#F5F3FF] border-2 border-[#DDD6FE] rounded-2xl px-4 py-3 text-sm text-[#4C1D95]">
              <p className="font-bold">{sub.currentPlan}: {plansData.current.planType.replace('_', ' ').toUpperCase()}</p>
              <p className="text-xs mt-0.5">
                {plansData.current.isUnlimited ? sub.unlimited : `${plansData.current.bidsRemaining} ${sub.bidsLeft}`}
                {' · '}
                {plansData.current.daysLeft} {sub.days} {sub.daysLeft}
              </p>
            </div>
          )}

          {plansData && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold">{sub.planLabel}</label>
              <div className="grid grid-cols-1 gap-2">
                {plansData.plans.map(p => (
                  <PlanCard key={p.id} plan={p} selected={selectedPlan === p.id}
                    onSelect={() => setSelectedPlan(p.id)} subs={sub} />
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3">{error}</p>}

          <button onClick={handlePurchase} disabled={!selectedCat || !selectedPlan || purchasing}
            className="w-full py-4 rounded-2xl text-white font-bold disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
            {purchasing
              ? sub.paying
              : selectedPlan && plansData
                ? `${sub.payBtn} — ${plansData.plans.find(p => p.id === selectedPlan)?.priceUzs.toLocaleString()} ${t.currency}`
                : sub.selectPlan}
          </button>
        </section>

        {expiredSubs.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{sub.expiredTitle}</p>
            {expiredSubs.map(s => <SubCard key={s.id} sub={s} subs={sub} />)}
          </section>
        )}
      </main>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' };
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
  base_50:      'border-blue-200',
  base_100:     'border-blue-400',
  unlimited_15: 'border-amber-200',
  unlimited_30: 'border-amber-400',
  unlimited_90: 'border-amber-500',
};

const PLAN_BADGES: Record<string, { label: string; color: string }> = {
  base_25:      { label: 'S',  color: 'bg-zinc-100 text-zinc-600' },
  base_50:      { label: 'M',  color: 'bg-blue-100 text-blue-700' },
  base_100:     { label: 'L',  color: 'bg-blue-200 text-blue-800' },
  unlimited_15: { label: '∞',  color: 'bg-amber-100 text-amber-700' },
  unlimited_30: { label: '∞',  color: 'bg-amber-200 text-amber-800' },
  unlimited_90: { label: '∞⭐', color: 'bg-amber-300 text-amber-900' },
};

function SubCard({ sub }: { sub: Subscription }) {
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
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">Muddati o'tdi</span>
          ) : sub.isActive ? (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Faol · {sub.daysLeft} kun</span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">Kutilmoqda</span>
          )}
        </div>
      </div>

      {sub.isUnlimited ? (
        <p className="text-sm text-zinc-600">Cheksiz takliflar</p>
      ) : (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{sub.bidsUsed} ishlatildi</span>
            <span>{sub.bidsRemaining} qoldi / {sub.bidsTotal} ta</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${(pct ?? 0) > 80 ? 'bg-red-400' : 'bg-blue-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-400">
        {new Date(sub.startsAt).toLocaleDateString('uz-UZ')} — {new Date(sub.expiresAt).toLocaleDateString('uz-UZ')}
      </p>
    </div>
  );
}

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}) {
  const isUnlimited = plan.id.startsWith('unlimited');
  const badge = PLAN_BADGES[plan.id] ?? { label: '?', color: 'bg-zinc-100 text-zinc-600' };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
        selected ? 'border-blue-600 bg-blue-50' : `${PLAN_COLORS[plan.id] ?? 'border-zinc-200'} hover:border-zinc-300 bg-white`
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
          <span className="font-semibold text-sm">{plan.label}</span>
        </div>
        <span className="font-bold text-sm">{plan.priceUzs.toLocaleString()} so'm</span>
      </div>
      <p className="text-xs text-zinc-500">
        {isUnlimited ? 'Cheksiz takliflar' : `${plan.bids} ta taklif`}
        {' · '}
        {plan.days} kun
      </p>
      {selected && (
        <p className="text-xs text-blue-600 font-medium mt-2">✓ Tanlangan</p>
      )}
    </button>
  );
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<{ id: string; nameUz: string }[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [plansData, setPlansData] = useState<{ current: Subscription | null; plans: Plan[] } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/'); return; }

    Promise.all([
      fetch(`${API}/api/subscriptions/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([subsData, catsData]) => {
      setSubs(Array.isArray(subsData) ? subsData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedCat) { setPlansData(null); return; }
    fetch(`${API}/api/subscriptions/plans?categoryId=${selectedCat}`, { headers: authHeader() })
      .then(r => r.json())
      .then(setPlansData);
    setSelectedPlan('');
  }, [selectedCat]);

  async function handlePurchase() {
    if (!selectedCat || !selectedPlan) return;
    setPurchasing(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/subscriptions/purchase`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ categoryId: selectedCat, planId: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Xatolik');
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-700">←</button>
          <h1 className="font-semibold text-zinc-900">Obunalar</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-8">

        {/* Active subscriptions */}
        {activeSubs.length > 0 && (
          <section className="space-y-3">
            <p className="text-sm font-medium text-zinc-700">Faol obunalar</p>
            {activeSubs.map(s => <SubCard key={s.id} sub={s} />)}
          </section>
        )}

        {activeSubs.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Faol obunangiz yo'q</p>
            <p>Tarif sotib olib, yangi vazifalar bo'yicha taklif bering.</p>
          </div>
        )}

        {/* Purchase new plan */}
        <section className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-4">
          <p className="font-semibold">Tarif sotib olish</p>

          {/* Category selector */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Kategoriya</label>
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Kategoriyani tanlang</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nameUz}</option>
              ))}
            </select>
          </div>

          {/* Current sub for selected category */}
          {plansData?.current && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
              <p className="font-medium">Joriy obuna: {plansData.current.planType.replace('_', ' ').toUpperCase()}</p>
              <p className="text-xs mt-0.5">
                {plansData.current.isUnlimited ? 'Cheksiz' : `${plansData.current.bidsRemaining} ta taklif qoldi`}
                {' · '}
                {plansData.current.daysLeft} kun qoldi
              </p>
            </div>
          )}

          {/* Plan grid */}
          {plansData && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Tarif tanlang</label>
              <div className="grid grid-cols-1 gap-2">
                {plansData.plans.map(p => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    selected={selectedPlan === p.id}
                    onSelect={() => setSelectedPlan(p.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            onClick={handlePurchase}
            disabled={!selectedCat || !selectedPlan || purchasing}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {purchasing
              ? "Yo'naltirilmoqda..."
              : selectedPlan && plansData
                ? `Payme orqali to'lash — ${plansData.plans.find(p => p.id === selectedPlan)?.priceUzs.toLocaleString()} so'm`
                : "Tarif tanlang"}
          </button>
        </section>

        {/* Expired / inactive */}
        {expiredSubs.length > 0 && (
          <section className="space-y-3">
            <p className="text-sm font-medium text-zinc-400">Eski obunalar</p>
            {expiredSubs.map(s => <SubCard key={s.id} sub={s} />)}
          </section>
        )}
      </main>
    </div>
  );
}

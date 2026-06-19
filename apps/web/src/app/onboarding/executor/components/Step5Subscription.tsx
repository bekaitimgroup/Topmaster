'use client';

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
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Obuna & faollashtirish</h2>
        <p className="text-sm text-zinc-500">
          Hozir bepul boshlang — 90 kun cheksiz takliflar
        </p>
      </div>

      {/* Free trial CTA — primary action */}
      <div className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-blue-700 text-lg">90 kun BEPUL</span>
          <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Tavsiya etiladi
          </span>
        </div>
        <p className="text-sm text-blue-800 mb-1">Cheksiz takliflar · Karta shart emas</p>
        <p className="text-xs text-blue-600">
          Kategoriyalar: {categoryNames.join(', ')}
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          onClick={onActivate}
          disabled={loading}
          className="mt-4 w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Faollashtirilmoqda...' : 'Bepul boshlash →'}
        </button>
      </div>

      {/* Paid plans preview */}
      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-3">
          Bepul muddat tugagach — to'lov rejalari
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-200 p-3 opacity-60"
            >
              <p className="font-semibold text-sm">{p.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {p.bids ? `${p.bids} taklif` : 'Cheksiz'} · {p.days} kun
              </p>
              <p className="text-sm font-medium mt-1">
                {p.priceUzs.toLocaleString()} so'm
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-400 mt-2 text-center">
          To'lov tez orada Payme orqali bo'ladi
        </p>
      </div>

      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl border border-zinc-200 font-medium text-sm hover:bg-zinc-50 transition-colors"
      >
        Orqaga
      </button>
    </div>
  );
}

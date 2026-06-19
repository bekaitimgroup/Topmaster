'use client';

const PRESETS = [50000, 100000, 150000, 250000];

interface Props {
  value: { budgetUzs: string; paymentMethod: string };
  onChange: (v: { budgetUzs: string; paymentMethod: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatUzs(n: number) {
  return n.toLocaleString('uz-UZ') + ' so\'m';
}

export default function Step5Budget({ value, onChange, onNext, onBack }: Props) {
  const PAYMENT_METHODS = [
    {
      id: 'safe_deal',
      label: 'Xavfsiz to\'lov',
      desc: 'Pul platforma hisobida saqlanadi — ish tugagach ustaga o\'tkaziladi. Komissiya: 10% + 5 000 so\'m',
    },
    {
      id: 'direct',
      label: 'To\'g\'ridan-to\'g\'ri to\'lov',
      desc: 'Naqd yoki to\'g\'ridan-to\'g\'ri o\'tkazma. Platforma komissiyasi yo\'q.',
    },
    {
      id: 'b2b',
      label: 'B2B (Aktlar bilan)',
      desc: 'Yopuvchi hujjatlar bilan. Yuridik shaxslar uchun.',
    },
  ];

  const canNext = value.paymentMethod;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Byudjet va to'lov</h2>
        <p className="text-sm text-zinc-500">Usta siz belgilagan narxda yoki pastroqda taklif beradi</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Byudjet <span className="text-zinc-400 font-normal">(ixtiyoriy)</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => onChange({ ...value, budgetUzs: String(p) })}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                value.budgetUzs === String(p)
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {formatUzs(p)}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="number"
            value={value.budgetUzs}
            onChange={(e) => onChange({ ...value, budgetUzs: e.target.value })}
            placeholder="Boshqa miqdor kiriting"
            min={0}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">so'm</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">To'lov usuli</label>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => onChange({ ...value, paymentMethod: m.id })}
              className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                value.paymentMethod === m.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <p className="font-medium text-sm">{m.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-zinc-200 font-medium text-sm hover:bg-zinc-50 transition-colors"
        >
          Orqaga
        </button>
        <button
          disabled={!canNext}
          onClick={onNext}
          className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Davom etish
        </button>
      </div>
    </div>
  );
}

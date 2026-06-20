'use client';
import { useLanguage } from '@/contexts/LanguageContext';

const PRESETS = [50000, 100000, 200000, 500000];

interface Props {
  value: { budgetUzs: string; paymentMethod: string };
  onChange: (v: { budgetUzs: string; paymentMethod: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

function fmt(n: number, currency: string) {
  return n.toLocaleString('uz-UZ') + ' ' + currency;
}

export default function Step5Budget({ value, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const s = t.postTask.step5;

  const METHODS = Object.entries(s.methods) as [string, { icon: string; label: string; desc: string }][];

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
        <p className="text-sm text-zinc-500">{s.subtitle}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-3">
          {s.budgetLabel} <span className="text-zinc-400 font-normal">({t.common.optional})</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => onChange({ ...value, budgetUzs: String(p) })}
              className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                value.budgetUzs === String(p)
                  ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-[#A78BFA]'
              }`}>
              {fmt(p, t.currency)}
            </button>
          ))}
        </div>
        <div className="relative">
          <input type="number" value={value.budgetUzs}
            onChange={(e) => onChange({ ...value, budgetUzs: e.target.value })}
            placeholder={s.budgetOther} min={0}
            className="w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3.5 pr-16 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium">{t.currency}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-3">{s.paymentLabel}</label>
        <div className="space-y-2">
          {METHODS.map(([id, m]) => (
            <button key={id} onClick={() => onChange({ ...value, paymentMethod: id })}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                value.paymentMethod === id ? 'border-[#7C3AED] bg-[#F5F3FF]' : 'border-zinc-200 bg-white hover:border-[#A78BFA]'
              }`}>
              <p className={`font-bold text-sm ${value.paymentMethod === id ? 'text-[#5B21B6]' : 'text-[#0D0D1A]'}`}>
                {m.icon} {m.label}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-2xl border-2 border-zinc-200 font-bold text-sm text-zinc-600 hover:bg-zinc-50 transition-all">
          {t.common.back}
        </button>
        <button disabled={!value.paymentMethod} onClick={onNext}
          className="flex-1 py-4 rounded-2xl text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          {t.common.next}
        </button>
      </div>
    </div>
  );
}

'use client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  value: { addressA: string; addressB: string; isRemote: boolean };
  onChange: (v: { addressA: string; addressB: string; isRemote: boolean }) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Location({ value, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const s = t.postTask.step2;
  const INPUT = 'w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all';
  const canNext = value.isRemote || value.addressA.trim().length >= 5;

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
        <p className="text-sm text-zinc-500">{s.subtitle}</p>
      </div>

      <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
        value.isRemote ? 'border-[#7C3AED] bg-[#F5F3FF]' : 'border-zinc-200 bg-white hover:border-[#A78BFA]'
      }`}>
        <input type="checkbox" checked={value.isRemote}
          onChange={(e) => onChange({ ...value, isRemote: e.target.checked })}
          className="w-4 h-4 accent-[#7C3AED]" />
        <div>
          <p className="font-semibold text-sm text-[#0D0D1A]">{s.remoteLabel}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{s.remoteDesc}</p>
        </div>
      </label>

      {!value.isRemote && (
        <>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">{s.addressA}</label>
            <input type="text" value={value.addressA}
              onChange={(e) => onChange({ ...value, addressA: e.target.value })}
              placeholder={s.addressAPlaceholder} className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">
              {s.addressB} <span className="text-zinc-400 font-normal">({t.common.optional})</span>
            </label>
            <input type="text" value={value.addressB}
              onChange={(e) => onChange({ ...value, addressB: e.target.value })}
              placeholder={s.addressBPlaceholder} className={INPUT} />
          </div>
        </>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-2xl border-2 border-zinc-200 font-bold text-sm text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-all">
          {t.common.back}
        </button>
        <button disabled={!canNext} onClick={onNext}
          className="flex-1 py-4 rounded-2xl text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          {t.common.next}
        </button>
      </div>
    </div>
  );
}

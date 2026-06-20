'use client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  value: { bio: string; experienceYears: string };
  onChange: (v: { bio: string; experienceYears: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Skills({ value, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const s = t.onboarding.step3;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
        <p className="text-sm text-zinc-500">{s.subtitle}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">
          {s.bioLabel} <span className="text-zinc-400 font-normal">({t.common.optional})</span>
        </label>
        <textarea value={value.bio}
          onChange={(e) => onChange({ ...value, bio: e.target.value })}
          rows={5} maxLength={1000} placeholder={s.bioPlaceholder}
          className="w-full rounded-2xl border-2 border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 resize-none" />
        <p className="text-xs text-zinc-400 mt-1">{value.bio.length}/1000</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-3">{s.expLabel}</label>
        <div className="flex flex-wrap gap-2">
          {s.expOptions.map((opt, i) => {
            const val = String(i === 0 ? 0 : i === s.expOptions.length - 1 ? 10 : i);
            return (
              <button key={opt} onClick={() => onChange({ ...value, experienceYears: val })}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  value.experienceYears === val
                    ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]'
                    : 'border-zinc-200 hover:border-[#A78BFA] text-zinc-600'
                }`}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-4 rounded-2xl border-2 border-zinc-200 font-bold text-sm hover:bg-zinc-50 transition-colors">
          {t.common.back}
        </button>
        <button onClick={onNext}
          className="flex-1 py-4 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          {t.common.next}
        </button>
      </div>
    </div>
  );
}

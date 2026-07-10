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
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-extrabold text-ink mb-1">{s.title}</h2>
        <p className="text-sm text-muted">{s.subtitle}</p>
      </div>

      <div>
        <label htmlFor="ob-bio" className="block text-sm font-semibold text-ink mb-2">
          {s.bioLabel} <span className="text-muted font-normal">({t.common.optional})</span>
        </label>
        <textarea id="ob-bio" value={value.bio}
          onChange={(e) => onChange({ ...value, bio: e.target.value })}
          rows={5} maxLength={1000} placeholder={s.bioPlaceholder}
          className="w-full rounded-2xl border-2 border-zinc-200 bg-surface px-4 py-3 text-sm text-ink focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 resize-none transition-all" />
        <p className="text-xs text-muted mt-1 text-right tabular-nums">{value.bio.length}/1000</p>
      </div>

      <fieldset>
        <legend className="block text-sm font-semibold text-ink mb-3">{s.expLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {s.expOptions.map((opt, i) => {
            const val = String(i === 0 ? 0 : i === s.expOptions.length - 1 ? 10 : i);
            const active = value.experienceYears === val;
            return (
              <button key={opt} onClick={() => onChange({ ...value, experienceYears: val })}
                aria-pressed={active}
                className={`min-h-[44px] px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  active
                    ? 'border-brand bg-brand-tint text-brand-dark font-semibold'
                    : 'border-zinc-200 bg-surface hover:border-brand-light text-zinc-600'
                }`}>
                {opt}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 min-h-[52px] py-4 rounded-2xl border-2 border-zinc-200 bg-surface font-bold text-sm text-ink hover:bg-zinc-50 transition-colors">
          {t.common.back}
        </button>
        <button onClick={onNext}
          className="flex-1 min-h-[52px] py-4 rounded-2xl bg-gradient-brand text-white font-bold text-sm btn-press">
          {t.common.next}
        </button>
      </div>
    </div>
  );
}

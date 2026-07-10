'use client';
import { useEffect, useState } from 'react';
import { api, Category } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onCategoriesLoaded?: (cats: Category[]) => void;
}

export default function Step2Categories({ value, onChange, onNext, onBack, onCategoriesLoaded }: Props) {
  const { t, lang } = useLanguage();
  const s = t.onboarding.step2;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.list().then((cats) => {
      setCategories(cats);
      onCategoriesLoaded?.(cats);
    }).finally(() => setLoading(false));
  }, []);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else if (value.length < 3) {
      onChange([...value, id]);
    }
  }

  const canNext = value.length >= 1;

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="text-2xl font-extrabold text-ink mb-1">{s.title}</h2>
        <p className="text-sm text-muted">{s.subtitle}</p>
      </div>

      {loading ? (
        <div className="space-y-2" aria-hidden>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            const selected = value.includes(cat.id);
            const disabled = !selected && value.length >= 3;
            const primaryName = lang === 'ru' ? cat.nameRu : cat.nameUz;
            const secondaryName = lang === 'ru' ? cat.nameUz : cat.nameRu;
            return (
              <button key={cat.id} onClick={() => toggle(cat.id)} disabled={disabled}
                aria-pressed={selected}
                className={`w-full min-h-[64px] flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  selected ? 'border-brand bg-brand-tint'
                  : disabled ? 'border-zinc-100 opacity-40 cursor-not-allowed'
                  : 'border-zinc-200 bg-surface hover:border-brand-light'
                }`}>
                <span aria-hidden
                  className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                    selected ? 'bg-brand border-brand text-white' : 'border-zinc-300 text-transparent'
                  }`}>
                  ✓
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-sm text-ink truncate">{primaryName}</span>
                  <span className="block text-xs text-muted truncate">{secondaryName}</span>
                </span>
                <span className="text-right shrink-0">
                  <span className="block text-xs text-muted">{cat.subscriptionPriceUzs.toLocaleString()} {t.currency}/{s.perMonth}</span>
                  {selected && <span className="block text-xs text-brand-dark font-bold mt-0.5">{s.selected}</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-sm text-muted text-center" aria-live="polite">{value.length}/3 {s.selectedCount}</p>
      )}

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 min-h-[52px] py-4 rounded-2xl border-2 border-zinc-200 bg-surface font-bold text-sm text-ink hover:bg-zinc-50 transition-colors">
          {t.common.back}
        </button>
        <button disabled={!canNext} onClick={onNext}
          className={`flex-1 min-h-[52px] py-4 rounded-2xl font-bold text-sm btn-press disabled:cursor-not-allowed ${
            canNext ? 'bg-gradient-brand text-white' : 'bg-zinc-200 text-zinc-500'
          }`}>
          {t.common.next}
        </button>
      </div>
    </div>
  );
}

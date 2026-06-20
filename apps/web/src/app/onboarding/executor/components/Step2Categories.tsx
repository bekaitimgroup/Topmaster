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
  const { t } = useLanguage();
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
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
        <p className="text-sm text-zinc-500">{s.subtitle}</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            const selected = value.includes(cat.id);
            const disabled = !selected && value.length >= 3;
            return (
              <button key={cat.id} onClick={() => toggle(cat.id)} disabled={disabled}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                  selected ? 'border-[#7C3AED] bg-[#F5F3FF]'
                  : disabled ? 'border-zinc-100 opacity-40 cursor-not-allowed'
                  : 'border-zinc-200 hover:border-[#A78BFA]'
                }`}>
                <div>
                  <p className="font-semibold text-sm text-[#0D0D1A]">{cat.nameUz}</p>
                  <p className="text-xs text-zinc-400">{cat.nameRu}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">{cat.subscriptionPriceUzs.toLocaleString()} {t.currency}/{s.perMonth}</p>
                  {selected && <span className="text-xs text-[#7C3AED] font-bold">{s.selected}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-sm text-zinc-500 text-center">{value.length}/3 {s.selectedCount}</p>
      )}

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-4 rounded-2xl border-2 border-zinc-200 font-bold text-sm hover:bg-zinc-50 transition-colors">
          {t.common.back}
        </button>
        <button disabled={!canNext} onClick={onNext}
          className="flex-1 py-4 rounded-2xl text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          {t.common.next}
        </button>
      </div>
    </div>
  );
}

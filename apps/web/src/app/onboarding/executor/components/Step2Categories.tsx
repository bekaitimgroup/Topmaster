'use client';
import { useEffect, useState } from 'react';
import { api, Category } from '@/lib/api';

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onCategoriesLoaded?: (cats: Category[]) => void;
}

export default function Step2Categories({ value, onChange, onNext, onBack, onCategoriesLoaded }: Props) {
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
        <h2 className="text-xl font-semibold mb-1">Kategoriyalar</h2>
        <p className="text-sm text-zinc-500">
          1 dan 3 tagacha tanlang. Har bir kategoriya alohida obuna talab qiladi.
        </p>
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
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? 'border-blue-600 bg-blue-50'
                    : disabled
                    ? 'border-zinc-100 opacity-40 cursor-not-allowed'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div>
                  <p className="font-medium text-sm">{cat.nameUz}</p>
                  <p className="text-xs text-zinc-400">{cat.nameRu}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">
                    {cat.subscriptionPriceUzs.toLocaleString()} so'm/oy
                  </p>
                  {selected && (
                    <span className="text-xs text-blue-600 font-medium">✓ Tanlandi</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-sm text-zinc-500 text-center">
          {value.length}/3 kategoriya tanlandi
        </p>
      )}

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

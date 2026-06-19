'use client';
import { useEffect, useState } from 'react';
import { api, Category } from '@/lib/api';

interface Props {
  value: { categoryId: string; title: string };
  onChange: (v: { categoryId: string; title: string }) => void;
  onNext: () => void;
}

export default function Step1Category({ value, onChange, onNext }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.list().then(setCategories).finally(() => setLoading(false));
  }, []);

  const canNext = value.categoryId && value.title.trim().length >= 5;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Kategoriya va sarlavha</h2>
        <p className="text-sm text-zinc-500">Qanday yordam kerak?</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChange({ ...value, categoryId: cat.id })}
              className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                value.categoryId === cat.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <span className="font-medium text-sm">{cat.nameUz}</span>
              <span className="text-xs text-zinc-400 mt-0.5">
                {cat.executorCount > 0
                  ? `${cat.executorCount.toLocaleString()} usta`
                  : cat.nameRu}
              </span>
            </button>
          ))}
        </div>
      )}

      {value.categoryId && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Vazifa sarlavhasi
          </label>
          <input
            type="text"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder="Masalan, uy tozalash kerak"
            maxLength={500}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-zinc-400 mt-1">{value.title.length}/500</p>
        </div>
      )}

      <button
        disabled={!canNext}
        onClick={onNext}
        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        Davom etish
      </button>
    </div>
  );
}

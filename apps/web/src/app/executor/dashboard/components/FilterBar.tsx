'use client';
import { useEffect, useState } from 'react';
import { api, Category } from '@/lib/api';
import { FeedFilters } from '@/hooks/useTaskFeed';

const DISTRICTS = [
  'Chilonzor', 'Yunusobod', 'Mirzo Ulug\'bek', 'Shayxontohur',
  'Uchtepa', 'Olmazor', 'Bektemir', 'Sergeli',
  'Yakkasaroy', 'Yashnobod', 'Mirobod', 'Hamza',
];

interface Props {
  filters: FeedFilters;
  onChange: (f: FeedFilters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {/* Category filter */}
      <select
        value={filters.categoryId ?? ''}
        onChange={(e) => onChange({ ...filters, categoryId: e.target.value || undefined })}
        className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Barcha kategoriyalar</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.nameUz}</option>
        ))}
      </select>

      {/* District filter */}
      <select
        value={filters.district ?? ''}
        onChange={(e) => onChange({ ...filters, district: e.target.value || undefined })}
        className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Barcha tumanlar</option>
        {DISTRICTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Budget filter */}
      <select
        value={filters.budgetMax ? String(filters.budgetMax) : ''}
        onChange={(e) => {
          const v = e.target.value;
          onChange({ ...filters, budgetMax: v ? Number(v) : undefined });
        }}
        className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Istalgan narx</option>
        <option value="100000">100 000 so'm gacha</option>
        <option value="200000">200 000 so'm gacha</option>
        <option value="500000">500 000 so'm gacha</option>
        <option value="1000000">1 000 000 so'm gacha</option>
      </select>

      {/* Clear filters */}
      {(filters.categoryId || filters.district || filters.budgetMax) && (
        <button
          onClick={() => onChange({})}
          className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700"
        >
          ✕ Tozalash
        </button>
      )}
    </div>
  );
}

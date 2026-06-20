'use client';
import { useEffect, useState } from 'react';
import { api, Category } from '@/lib/api';
import { FeedFilters } from '@/hooks/useTaskFeed';
import { useLanguage } from '@/contexts/LanguageContext';

const DISTRICTS = [
  "Chilonzor", "Yunusobod", "Mirzo Ulug'bek", "Shayxontohur",
  "Uchtepa", "Olmazor", "Bektemir", "Sergeli",
  "Yakkasaroy", "Yashnobod", "Mirobod", "Hamza",
];

interface Props { filters: FeedFilters; onChange: (f: FeedFilters) => void; }

const SELECT = 'shrink-0 rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#7C3AED] transition-colors appearance-none cursor-pointer';

export default function FilterBar({ filters, onChange }: Props) {
  const { t } = useLanguage();
  const f = t.dashboard.filters;
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { api.categories.list().then(setCategories); }, []);

  const hasFilters = filters.categoryId || filters.district || filters.budgetMax;
  const active = { borderColor: '#7C3AED', color: '#5B21B6', background: '#F5F3FF' };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <select value={filters.categoryId ?? ''} className={SELECT}
        style={filters.categoryId ? active : {}}
        onChange={(e) => onChange({ ...filters, categoryId: e.target.value || undefined })}>
        <option value="">{f.allCategories}</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.nameUz}</option>)}
      </select>

      <select value={filters.district ?? ''} className={SELECT}
        style={filters.district ? active : {}}
        onChange={(e) => onChange({ ...filters, district: e.target.value || undefined })}>
        <option value="">{f.allDistricts}</option>
        {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      <select value={filters.budgetMax ? String(filters.budgetMax) : ''} className={SELECT}
        style={filters.budgetMax ? active : {}}
        onChange={(e) => onChange({ ...filters, budgetMax: e.target.value ? Number(e.target.value) : undefined })}>
        <option value="">{f.anyPrice}</option>
        {f.budgetOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {hasFilters && (
        <button onClick={() => onChange({})}
          className="shrink-0 rounded-xl border-2 border-[#DDD6FE] bg-[#F5F3FF] px-3 py-2 text-sm font-bold text-[#7C3AED] hover:bg-[#EDE9FE] transition-colors">
          {f.clear}
        </button>
      )}
    </div>
  );
}

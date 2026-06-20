'use client';
import { useEffect, useState } from 'react';
import { api, CarMake, CarModel } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface CarValue {
  carMakeId: string;
  carMakeName: string;
  carModelId: string;
  carModelName: string;
  carYear: string;
}

interface Props {
  value: CarValue;
  onChange: (v: CarValue) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

function buildYears(model: CarModel | null): number[] {
  const from = model?.yearFrom ?? 1990;
  const to   = model?.yearTo   ?? CURRENT_YEAR;
  const years: number[] = [];
  for (let y = to; y >= from; y--) years.push(y);
  return years;
}

export default function CarPicker({ value, onChange }: Props) {
  const { lang } = useLanguage();
  const [makes, setMakes]   = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [loadingMakes,  setLoadingMakes]  = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    api.cars.makes()
      .then(setMakes)
      .finally(() => setLoadingMakes(false));
  }, []);

  useEffect(() => {
    if (!value.carMakeId) { setModels([]); return; }
    setLoadingModels(true);
    api.cars.models(value.carMakeId)
      .then(setModels)
      .finally(() => setLoadingModels(false));
  }, [value.carMakeId]);

  function onMakeChange(makeId: string) {
    const make = makes.find((m) => m.id === makeId);
    onChange({ carMakeId: makeId, carMakeName: make?.name ?? '', carModelId: '', carModelName: '', carYear: '' });
  }

  function onModelChange(modelId: string) {
    const model = models.find((m) => m.id === modelId);
    onChange({ ...value, carModelId: modelId, carModelName: model?.name ?? '', carYear: '' });
  }

  function onYearChange(year: string) {
    onChange({ ...value, carYear: year });
  }

  const selectedModel = models.find((m) => m.id === value.carModelId) ?? null;
  const years = buildYears(selectedModel);

  const selectClass = 'w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all appearance-none';

  return (
    <div className="space-y-4">
      {/* Make */}
      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">
          {lang === 'uz' ? 'Avtomobil markasi' : 'Марка автомобиля'}
        </label>
        {loadingMakes ? (
          <div className="h-14 bg-zinc-100 rounded-2xl animate-pulse" />
        ) : (
          <div className="relative">
            <select value={value.carMakeId} onChange={(e) => onMakeChange(e.target.value)} className={selectClass}>
              <option value="">{lang === 'uz' ? '— Markani tanlang —' : '— Выберите марку —'}</option>
              {/* Local brands first with flag */}
              {makes.filter((m) => m.isLocal).length > 0 && (
                <optgroup label={lang === 'uz' ? '🇺🇿 Mahalliy markalar' : '🇺🇿 Местные марки'}>
                  {makes.filter((m) => m.isLocal).map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
              )}
              <optgroup label={lang === 'uz' ? 'Xitoy markalari' : 'Китайские марки'}>
                {makes.filter((m) => !m.isLocal && m.sortOrder < 30).map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
              <optgroup label={lang === 'uz' ? 'Boshqa xalqaro markalar' : 'Другие марки'}>
                {makes.filter((m) => !m.isLocal && m.sortOrder >= 30).map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
          </div>
        )}
      </div>

      {/* Model */}
      {value.carMakeId && (
        <div>
          <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">
            {lang === 'uz' ? 'Model' : 'Модель'}
          </label>
          {loadingModels ? (
            <div className="h-14 bg-zinc-100 rounded-2xl animate-pulse" />
          ) : (
            <div className="relative">
              <select value={value.carModelId} onChange={(e) => onModelChange(e.target.value)} className={selectClass}>
                <option value="">{lang === 'uz' ? '— Modelni tanlang —' : '— Выберите модель —'}</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.yearFrom ? ` (${m.yearFrom}${m.yearTo ? `–${m.yearTo}` : '–'})` : ''}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
            </div>
          )}
        </div>
      )}

      {/* Year */}
      {value.carModelId && (
        <div>
          <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">
            {lang === 'uz' ? 'Yil' : 'Год выпуска'}
          </label>
          <div className="relative">
            <select value={value.carYear} onChange={(e) => onYearChange(e.target.value)} className={selectClass}>
              <option value="">{lang === 'uz' ? '— Yilni tanlang —' : '— Выберите год —'}</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
          </div>
        </div>
      )}
    </div>
  );
}

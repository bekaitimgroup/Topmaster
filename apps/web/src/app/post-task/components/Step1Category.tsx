'use client';
import React, { useEffect, useState } from 'react';
import { api, Category, SubCategory } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import CarPicker from './CarPicker';

const V = "0 0 24 24";
const S = { fill: "none", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const W = 20;

interface CatCfg { bg: string; Icon: () => React.ReactElement }

const CAT_CFG: Record<string, CatCfg> = {
  "Usta xizmatlar": { bg: "bg-violet-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-violet-600">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  )},
  "Yuk tashish": { bg: "bg-blue-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-blue-600">
      <rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )},
  "Ko'chish va yuk ortish": { bg: "bg-amber-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-amber-700">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )},
  "Avto ta'mir": { bg: "bg-slate-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-slate-600">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-1"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
    </svg>
  )},
  "Tadbirlar va foto/video": { bg: "bg-pink-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-pink-600">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
  )},
  "Huquqiy va moliyaviy": { bg: "bg-indigo-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-indigo-600">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  )},
  "Tozalash": { bg: "bg-cyan-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-cyan-600">
      <path d="M12 3l-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z"/>
    </svg>
  )},
  "Bog'dorchilik": { bg: "bg-green-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-green-600">
      <path d="M17 8C8 10 5.9 16.17 3.82 22.08c2.33.27 4.68-.41 6.48-1.78C12.14 17.91 13 12.96 9.5 10c5.5-.5 7.5 3 6.41 7C17.36 14.87 18 11.43 18 8z"/><path d="M3 22c0-8 4-14 10.5-15"/>
    </svg>
  )},
  "Enaga va parvarishchi": { bg: "bg-rose-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-rose-600">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )},
  "Kuryer": { bg: "bg-orange-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-orange-600">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )},
  "Go'zallik": { bg: "bg-fuchsia-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-fuchsia-600">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  )},
  "Sport va fitnes": { bg: "bg-lime-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-lime-700">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )},
  "Repetitor": { bg: "bg-sky-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-sky-600">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )},
  "Oshpaz va keytering": { bg: "bg-red-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-red-600">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  )},
  "Kompyuter yordam": { bg: "bg-purple-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-purple-600">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )},
  "Texnika ta'miri": { bg: "bg-zinc-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-zinc-600">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )},
  "Dizayn va IT frilansi": { bg: "bg-emerald-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-emerald-600">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  )},
  "Tarjima xizmatlari": { bg: "bg-teal-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-teal-600">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )},
  "Hayvonlarga xizmat": { bg: "bg-yellow-100", Icon: () => (
    <svg width={W} height={W} viewBox={V} {...S} className="text-yellow-700">
      <ellipse cx="12" cy="15.5" rx="4" ry="2.5"/><circle cx="7.5" cy="11.5" r="1.5"/><circle cx="16.5" cy="11.5" r="1.5"/><circle cx="10" cy="8.5" r="1.5"/><circle cx="14" cy="8.5" r="1.5"/>
    </svg>
  )},
};

function DefaultIcon() {
  return (
    <svg width={W} height={W} viewBox={V} {...S} className="text-zinc-400">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}

interface Step1Value {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  title: string;
  carMakeId: string;
  carMakeName: string;
  carModelId: string;
  carModelName: string;
  carYear: string;
}

interface Props {
  value: Step1Value;
  onChange: (v: Step1Value) => void;
  onNext: () => void;
}

export default function Step1Category({ value, onChange, onNext }: Props) {
  const { t, lang } = useLanguage();
  const s = t.postTask.step1;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'category' | 'detail'>(value.categoryId ? 'detail' : 'category');

  useEffect(() => {
    api.categories.list().then(setCategories).finally(() => setLoading(false));
  }, []);

  const selectedCat = categories.find((c) => c.id === value.categoryId) ?? null;
  const isAutoService = selectedCat?.nameRu === 'Автосервис';
  const children: SubCategory[] = selectedCat?.children ?? [];

  function catLabel(cat: Category) {
    return lang === 'ru' ? cat.nameRu : cat.nameUz;
  }

  function subLabel(sub: SubCategory) {
    return lang === 'ru' ? sub.nameRu : sub.nameUz;
  }

  function selectCategory(cat: Category) {
    onChange({
      categoryId: cat.id,
      categoryName: catLabel(cat),
      subcategoryId: '', subcategoryName: '',
      title: '',
      carMakeId: '', carMakeName: '',
      carModelId: '', carModelName: '',
      carYear: '',
    });
    setPhase('detail');
  }

  function backToCategory() {
    onChange({
      categoryId: '', categoryName: '',
      subcategoryId: '', subcategoryName: '',
      title: '',
      carMakeId: '', carMakeName: '',
      carModelId: '', carModelName: '',
      carYear: '',
    });
    setPhase('category');
  }

  function buildAutoTitle(
    makeName: string, modelName: string, year: string, serviceName: string,
  ): string {
    return [makeName, modelName, year, serviceName].filter(Boolean).join(' · ');
  }

  function onSubChange(sub: SubCategory) {
    const subName = subLabel(sub);
    const title = isAutoService && value.carMakeId && value.carModelId && value.carYear
      ? buildAutoTitle(value.carMakeName, value.carModelName, value.carYear, subName)
      : value.title;
    onChange({ ...value, subcategoryId: sub.id, subcategoryName: subName, title });
  }

  function onCarChange(car: Omit<Step1Value, 'categoryId' | 'categoryName' | 'subcategoryId' | 'subcategoryName' | 'title'>) {
    const title = value.subcategoryId && car.carMakeId && car.carModelId && car.carYear
      ? buildAutoTitle(car.carMakeName, car.carModelName, car.carYear, value.subcategoryName)
      : value.title;
    onChange({ ...value, ...car, title });
  }

  const hasSubcategory = children.length === 0 || !!value.subcategoryId;
  const hasCarDetails  = !isAutoService || (!!value.carMakeId && !!value.carModelId && !!value.carYear);
  const hasTitle       = value.title.trim().length >= 5;
  const canNext        = !!value.categoryId && hasSubcategory && hasCarDetails && hasTitle;

  const selectClass = 'w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all';

  // ── Phase: category grid ──────────────────────────────────────────────────
  if (phase === 'category') {
    return (
      <div className="space-y-7">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
          <p className="text-sm text-zinc-500">{s.subtitle}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-zinc-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat)}
                className="flex flex-col items-start p-4 rounded-2xl border-2 border-zinc-200 bg-white hover:border-[#A78BFA] hover:bg-[#FAFAFF] text-left transition-all duration-200"
              >
                {(() => { const cfg = CAT_CFG[cat.nameUz]; return (
                  <div className={`w-10 h-10 rounded-xl ${cfg?.bg ?? 'bg-zinc-100'} flex items-center justify-center mb-2.5`}>
                    {cfg ? <cfg.Icon /> : <DefaultIcon />}
                  </div>
                ); })()}
                <span className="font-semibold text-sm leading-tight text-[#0D0D1A]">{catLabel(cat)}</span>
                <span className="text-xs text-zinc-400 mt-0.5">
                  {cat.executorCount > 0
                    ? `${cat.executorCount}+ ${s.executors}`
                    : (lang === 'ru' ? cat.nameUz : cat.nameRu)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Phase: detail (subcategory / car picker + title) ─────────────────────
  const showTitle = value.subcategoryId || (children.length === 0 && !isAutoService);

  return (
    <div className="space-y-7">
      <div>
        <button
          onClick={backToCategory}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#7C3AED] mb-4 hover:opacity-80 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {value.categoryName}
        </button>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">
          {lang === 'uz' ? 'Xizmat turini belgilang' : 'Уточните вид услуги'}
        </h2>
        <p className="text-sm text-zinc-500">
          {lang === 'uz' ? 'Kerakli xizmatni tanlang' : 'Выберите нужную услугу'}
        </p>
      </div>

      {/* Car picker — only for Avto ta'mir */}
      {isAutoService && (
        <CarPicker
          value={{
            carMakeId: value.carMakeId, carMakeName: value.carMakeName,
            carModelId: value.carModelId, carModelName: value.carModelName,
            carYear: value.carYear,
          }}
          onChange={onCarChange}
        />
      )}

      {/* Subcategory chips */}
      {children.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[#0D0D1A] mb-3">
            {lang === 'uz' ? 'Xizmat turi' : 'Тип услуги'}
          </label>
          <div className="flex flex-wrap gap-2">
            {children.map((sub) => {
              const active = value.subcategoryId === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => onSubChange(sub)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    active
                      ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-[#A78BFA]'
                  }`}
                >
                  {subLabel(sub)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Title */}
      {showTitle && (
        <div>
          <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">{s.titleLabel}</label>
          <input
            type="text"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder={s.titlePlaceholder}
            maxLength={500}
            className={selectClass}
          />
          <p className="text-xs text-zinc-400 mt-1.5">{value.title.length}/500</p>
        </div>
      )}

      <button
        disabled={!canNext}
        onClick={onNext}
        className="w-full py-4 rounded-2xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: canNext ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : '#E4E4E7',
          color: canNext ? '#fff' : '#A1A1AA',
        }}
      >
        {t.common.next}
      </button>
    </div>
  );
}

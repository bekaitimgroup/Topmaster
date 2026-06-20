'use client';
import { useEffect, useState } from 'react';
import { api, Category, SubCategory } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import CarPicker from './CarPicker';

const EMOJI_MAP: Record<string, string> = {
  "Usta xizmatlar": '🔨',
  "Yuk tashish": '🚛',
  "Tozalash": '🧹',
  "Kuryer": '📦',
  "Repetitor": '📚',
  "Go'zallik": '💄',
  "IT va kompyuter": '💻',
  "Texnika ta'miri": '⚙️',
  "Avto ta'mir": '🚗',
  "Hayvonlar parvarishi": '🐾',
  "Fotografiya": '📷',
  "Dizayn": '🎨',
  "Tadbirlar": '🎉',
  "Sog'liqni saqlash": '❤️',
  "Huquqiy xizmatlar": '⚖️',
  "Moliyaviy xizmatlar": '💰',
  "Qishloq xo'jaligi": '🌾',
  "Bola parvarishi": '👶',
  "Sport va fitness": '🏋️',
};

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
                <span className="text-2xl mb-2">{EMOJI_MAP[cat.nameUz] ?? '🛠️'}</span>
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

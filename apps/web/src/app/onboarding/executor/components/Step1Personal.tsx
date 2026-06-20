'use client';
import { useLanguage } from '@/contexts/LanguageContext';

const DISTRICTS = [
  "Chilonzor", "Yunusobod", "Mirzo Ulug'bek", "Shayxontohur",
  "Uchtepa", "Olmazor", "Bektemir", "Sergeli",
  "Yakkasaroy", "Yashnobod", "Mirobod", "Hamza",
];

interface Props {
  value: { fullName: string; city: string; dateOfBirth: string; email: string };
  onChange: (v: { fullName: string; city: string; dateOfBirth: string; email: string }) => void;
  onNext: () => void;
}

const INPUT_CLS = 'w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all';

export default function Step1Personal({ value, onChange, onNext }: Props) {
  const { t } = useLanguage();
  const s = t.onboarding.step1;

  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().slice(0, 10);
  const minDob = new Date(today.getFullYear() - 70, today.getMonth(), today.getDate()).toISOString().slice(0, 10);
  const canNext = value.fullName.trim().length >= 2 && value.city && value.dateOfBirth;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
        <p className="text-sm text-zinc-500">{s.subtitle}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">{s.fullNameLabel}</label>
        <input type="text" value={value.fullName}
          onChange={(e) => onChange({ ...value, fullName: e.target.value })}
          placeholder={s.fullNamePlaceholder} className={INPUT_CLS} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">{s.cityLabel}</label>
        <select value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} className={INPUT_CLS}>
          <option value="">{s.cityPlaceholder}</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">{s.dobLabel}</label>
        <input type="date" value={value.dateOfBirth} max={maxDob} min={minDob}
          onChange={(e) => onChange({ ...value, dateOfBirth: e.target.value })} className={INPUT_CLS} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">
          {s.emailLabel} <span className="text-zinc-400 font-normal">({t.common.optional})</span>
        </label>
        <input type="email" value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="email@example.com" className={INPUT_CLS} />
      </div>

      <button disabled={!canNext} onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: canNext ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : '#E4E4E7', color: canNext ? '#fff' : '#A1A1AA' }}>
        {t.common.next} →
      </button>
    </div>
  );
}

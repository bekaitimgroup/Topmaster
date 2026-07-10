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

const INPUT_CLS = 'w-full min-h-[48px] rounded-2xl border-2 border-zinc-200 bg-surface px-4 py-3.5 text-sm text-ink focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all';
const LABEL_CLS = 'block text-sm font-semibold text-ink mb-2';

export default function Step1Personal({ value, onChange, onNext }: Props) {
  const { t } = useLanguage();
  const s = t.onboarding.step1;

  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().slice(0, 10);
  const minDob = new Date(today.getFullYear() - 70, today.getMonth(), today.getDate()).toISOString().slice(0, 10);
  const canNext = value.fullName.trim().length >= 2 && value.city && value.dateOfBirth;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-extrabold text-ink mb-1">{s.title}</h2>
        <p className="text-sm text-muted">{s.subtitle}</p>
      </div>

      <div>
        <label htmlFor="ob-fullname" className={LABEL_CLS}>{s.fullNameLabel}</label>
        <input id="ob-fullname" type="text" value={value.fullName} autoComplete="name"
          onChange={(e) => onChange({ ...value, fullName: e.target.value })}
          placeholder={s.fullNamePlaceholder} className={INPUT_CLS} />
      </div>

      <div>
        <label htmlFor="ob-city" className={LABEL_CLS}>{s.cityLabel}</label>
        <select id="ob-city" value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} className={INPUT_CLS}>
          <option value="">{s.cityPlaceholder}</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="ob-dob" className={LABEL_CLS}>{s.dobLabel}</label>
        <input id="ob-dob" type="date" value={value.dateOfBirth} max={maxDob} min={minDob} autoComplete="bday"
          onChange={(e) => onChange({ ...value, dateOfBirth: e.target.value })} className={INPUT_CLS} />
      </div>

      <div>
        <label htmlFor="ob-email" className={LABEL_CLS}>
          {s.emailLabel} <span className="text-muted font-normal">({t.common.optional})</span>
        </label>
        <input id="ob-email" type="email" value={value.email} autoComplete="email"
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="email@example.com" className={INPUT_CLS} />
      </div>

      <button disabled={!canNext} onClick={onNext}
        className={`w-full min-h-[52px] py-4 rounded-2xl font-bold text-sm btn-press disabled:cursor-not-allowed ${
          canNext ? 'bg-gradient-brand text-white' : 'bg-zinc-200 text-zinc-500'
        }`}>
        {t.common.next}
      </button>
    </div>
  );
}

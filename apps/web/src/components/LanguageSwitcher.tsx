'use client';
import { useLanguage } from '@/contexts/LanguageContext';
import type { LangCode } from '@/lib/i18n';

const LANGS: { code: LangCode; flag: string; label: string }[] = [
  { code: 'uz', flag: '🇺🇿', label: "O'z" },
  { code: 'ru', flag: '🇷🇺', label: 'Ru' },
];

interface Props {
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'light' }: Props) {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center rounded-full overflow-hidden border"
      style={{ borderColor: variant === 'dark' ? 'rgba(255,255,255,0.15)' : '#E4E4E7' }}
    >
      {LANGS.map(({ code, flag, label }) => {
        const active = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold transition-all"
            style={{
              background: active
                ? variant === 'dark' ? 'rgba(255,255,255,0.15)' : '#7C3AED'
                : 'transparent',
              color: active
                ? variant === 'dark' ? '#fff' : '#fff'
                : variant === 'dark' ? 'rgba(255,255,255,0.5)' : '#71717A',
            }}
          >
            <span>{flag}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

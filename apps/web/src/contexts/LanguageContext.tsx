'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, LangCode, Lang } from '@/lib/i18n';

interface LanguageContextType {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: Lang;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'uz',
  setLang: () => {},
  t: translations.uz,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('uz');

  useEffect(() => {
    const saved = (localStorage.getItem('lang') ?? 'uz') as LangCode;
    if (saved === 'ru' || saved === 'uz') setLangState(saved);
  }, []);

  function setLang(l: LangCode) {
    setLangState(l);
    localStorage.setItem('lang', l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

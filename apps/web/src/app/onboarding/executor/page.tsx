'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Step1Personal from './components/Step1Personal';
import Step2Categories from './components/Step2Categories';
import Step3Skills from './components/Step3Skills';
import Step4Portfolio from './components/Step4Portfolio';
import Step5Subscription from './components/Step5Subscription';
import { api, Category } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface FormState {
  fullName: string;
  city: string;
  dateOfBirth: string;
  email: string;
  categoryIds: string[];
  categoryNames: string[];
  bio: string;
  experienceYears: string;
  portfolio: File[];
}

const INITIAL: FormState = {
  fullName: '', city: '', dateOfBirth: '', email: '',
  categoryIds: [], categoryNames: [],
  bio: '', experienceYears: '',
  portfolio: [],
};

export default function ExecutorOnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function next() { setStep((s) => Math.min(s + 1, 5)); }
  function back() { setStep((s) => Math.max(s - 1, 1)); }
  function patch<K extends keyof FormState>(updates: Pick<FormState, K>) {
    setForm((f) => ({ ...f, ...updates }));
  }

  function handleCategoryChange(ids: string[], allCategories: Category[]) {
    const names = ids.map((id) => allCategories.find((c) => c.id === id)?.nameUz ?? '');
    patch({ categoryIds: ids, categoryNames: names });
  }

  async function activate() {
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('city', form.city);
      fd.append('dateOfBirth', form.dateOfBirth);
      if (form.email) fd.append('email', form.email);
      form.categoryIds.forEach((id) => fd.append('categoryIds[]', id));
      if (form.bio) fd.append('bio', form.bio);
      if (form.experienceYears) fd.append('experienceYears', form.experienceYears);
      form.portfolio.forEach((f) => fd.append('portfolio', f));

      await api.executor.register(fd);
      router.push('/executor/dashboard');
    } catch (e: any) {
      setError(e.message ?? t.onboarding.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col">
      <header className="bg-white border-b border-zinc-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => step === 1 ? router.back() : back()}
              className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors text-sm">
              ←
            </button>
            <span className="flex-1 text-center">
              <span className="font-extrabold text-[#7C3AED]">top</span>
              <span className="font-extrabold text-[#F59E0B]">master</span>
              <span className="text-zinc-400 text-sm ml-2">— {t.onboarding.becomeMaster}</span>
            </span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <span className="text-xs font-semibold text-zinc-400">{step}/5</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {t.onboarding.steps.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-500"
                style={{
                  background: i + 1 < step ? 'linear-gradient(90deg, #7C3AED, #5B21B6)' :
                              i + 1 === step ? 'linear-gradient(90deg, #7C3AED, #A78BFA)' : '#E4E4E7',
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {step === 1 && (
          <Step1Personal
            value={{ fullName: form.fullName, city: form.city, dateOfBirth: form.dateOfBirth, email: form.email }}
            onChange={(v) => patch(v)}
            onNext={next}
          />
        )}
        {step === 2 && (
          <Step2CategoriesWrapper
            value={form.categoryIds}
            onChange={handleCategoryChange}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && (
          <Step3Skills
            value={{ bio: form.bio, experienceYears: form.experienceYears }}
            onChange={(v) => patch(v)}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 4 && (
          <Step4Portfolio
            value={form.portfolio}
            onChange={(files) => patch({ portfolio: files })}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 5 && (
          <Step5Subscription
            categoryNames={form.categoryNames}
            onActivate={activate}
            onBack={back}
            loading={loading}
            error={error}
          />
        )}
      </main>
    </div>
  );
}

// Wrapper to thread category names back up to parent state
function Step2CategoriesWrapper({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string[];
  onChange: (ids: string[], all: Category[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [all, setAll] = useState<Category[]>([]);
  return (
    <Step2Categories
      value={value}
      onChange={(ids) => onChange(ids, all)}
      onNext={onNext}
      onBack={onBack}
      onCategoriesLoaded={setAll}
    />
  );
}

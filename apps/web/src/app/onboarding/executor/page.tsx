'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '../../post-task/components/ProgressBar';
import Step1Personal from './components/Step1Personal';
import Step2Categories from './components/Step2Categories';
import Step3Skills from './components/Step3Skills';
import Step4Portfolio from './components/Step4Portfolio';
import Step5Subscription from './components/Step5Subscription';
import { api, Category } from '@/lib/api';

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

const STEP_LABELS = ['Shaxsiy', 'Kategoriya', 'Ko\'nikmalar', 'Portfolio', 'Obuna'];
const PCT = [0, 20, 40, 60, 80, 100];

export default function ExecutorOnboardingPage() {
  const router = useRouter();
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
      setError(e.message ?? 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => step === 1 ? router.back() : back()}
              className="text-zinc-500 hover:text-zinc-700 text-sm"
            >
              ← Orqaga
            </button>
            <span className="text-sm font-medium text-zinc-700 ml-auto">
              {step}/5 — {STEP_LABELS[step - 1]}
            </span>
          </div>
          <div className="w-full">
            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${PCT[step]}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
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

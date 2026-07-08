'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from './components/ProgressBar';
import Step1Category from './components/Step1Category';
import Step2Location from './components/Step2Location';
import Step3DateTime from './components/Step3DateTime';
import Step4Details from './components/Step4Details';
import Step5Budget from './components/Step5Budget';
import Step6Review from './components/Step6Review';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from '@/components/Logo';
import { useRequireAuth } from '@/hooks/useRequireAuth';

function LogoutButton() {
  const router = useRouter();
  const { lang } = useLanguage();
  async function logout() {
    try { await api.auth.logout(); } catch {}
    router.replace('/auth');
  }
  return (
    <button
      onClick={logout}
      className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-red-500 border border-zinc-200 hover:border-red-300 rounded-full px-3 py-1.5 transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      {lang === 'ru' ? 'Выйти' : 'Chiqish'}
    </button>
  );
}

interface FormState {
  // Step 1 — category + service type
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  title: string;
  // Step 1 — car details (only for Avto ta'mir)
  carMakeId: string;
  carMakeName: string;
  carModelId: string;
  carModelName: string;
  carYear: string;
  // Step 2
  addressA: string;
  addressB: string;
  isRemote: boolean;
  // Step 3
  date: string;
  time: string;
  // Step 4
  description: string;
  privateInfo: string;
  photos: File[];
  // Step 5
  budgetUzs: string;
  paymentMethod: string;
}

const DRAFT_KEY = 'topmaster_draft';

const INITIAL: FormState = {
  categoryId: '', categoryName: '', subcategoryId: '', subcategoryName: '', title: '',
  carMakeId: '', carMakeName: '', carModelId: '', carModelName: '', carYear: '',
  addressA: '', addressB: '', isRemote: false,
  date: '', time: '',
  description: '', privateInfo: '', photos: [],
  budgetUzs: '', paymentMethod: '',
};

export default function PostTaskPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { checked } = useRequireAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Restore draft from localStorage on mount (photos are not persisted)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        setForm((f) => ({ ...f, ...draft, photos: [] }));
      }
    } catch {}
  }, []);

  // Save draft to localStorage on change (debounced, without File objects)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, photos: undefined }));
      } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [form]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
      </div>
    );
  }

  function next() { setStep((s) => Math.min(s + 1, 6)); }
  function back() { setStep((s) => Math.max(s - 1, 1)); }
  function patch<K extends keyof FormState>(updates: Pick<FormState, K>) {
    setForm((f) => ({ ...f, ...updates }));
  }

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('categoryId', form.subcategoryId || form.categoryId);
      fd.append('title', form.title);
      fd.append('startAt', new Date(`${form.date}T${form.time}`).toISOString());
      fd.append('paymentMethod', form.paymentMethod);
      if (form.addressA) fd.append('addressA', form.addressA);
      if (form.addressB) fd.append('addressB', form.addressB);
      fd.append('isRemote', String(form.isRemote));
      if (form.description) fd.append('description', form.description);
      if (form.privateInfo) fd.append('privateInfo', form.privateInfo);
      if (form.budgetUzs) fd.append('budgetUzs', form.budgetUzs);
      if (form.carMakeId) fd.append('carMakeId', form.carMakeId);
      if (form.carModelId) fd.append('carModelId', form.carModelId);
      if (form.carYear) fd.append('carYear', form.carYear);
      form.photos.forEach((f) => fd.append('photos', f));

      const task = await api.tasks.create(fd);
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      router.push(`/tasks/${task.id}?new=1`);
    } catch (e: any) {
      setError(e.message ?? 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col">
      <header className="bg-white border-b border-zinc-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => step === 1 ? router.back() : back()}
              className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors text-sm"
            >
              ←
            </button>
            <span className="flex-1 flex justify-center">
              <Logo size="sm" />
            </span>
            <LanguageSwitcher />
            <LogoutButton />
            <span className="text-xs font-semibold text-zinc-400 w-6 text-right">
              {step}/6
            </span>
          </div>
          <ProgressBar step={step} />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {step === 1 && (
          <Step1Category
            value={{
              categoryId: form.categoryId, categoryName: form.categoryName,
              subcategoryId: form.subcategoryId, subcategoryName: form.subcategoryName,
              title: form.title,
              carMakeId: form.carMakeId, carMakeName: form.carMakeName,
              carModelId: form.carModelId, carModelName: form.carModelName,
              carYear: form.carYear,
            }}
            onChange={(v) => patch(v)}
            onNext={next}
          />
        )}
        {step === 2 && (
          <Step2Location
            value={{ addressA: form.addressA, addressB: form.addressB, isRemote: form.isRemote }}
            onChange={(v) => patch(v)}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && (
          <Step3DateTime
            value={{ date: form.date, time: form.time }}
            onChange={(v) => patch(v)}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 4 && (
          <Step4Details
            value={{
              description: form.description,
              privateInfo: form.privateInfo,
              photos: form.photos,
            }}
            onChange={(v) => patch(v)}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 5 && (
          <Step5Budget
            value={{ budgetUzs: form.budgetUzs, paymentMethod: form.paymentMethod }}
            onChange={(v) => patch(v)}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 6 && (
          <Step6Review
            data={{ ...form }}
            onSubmit={submit}
            onBack={back}
            loading={loading}
            error={error}
          />
        )}
      </main>
    </div>
  );
}

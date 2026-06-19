'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from './components/ProgressBar';
import Step1Category from './components/Step1Category';
import Step2Location from './components/Step2Location';
import Step3DateTime from './components/Step3DateTime';
import Step4Details from './components/Step4Details';
import Step5Budget from './components/Step5Budget';
import Step6Review from './components/Step6Review';
import { api } from '@/lib/api';

interface FormState {
  // Step 1
  categoryId: string;
  categoryName: string;
  title: string;
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
  collectMoney: boolean;
  photos: File[];
  // Step 5
  budgetUzs: string;
  paymentMethod: string;
}

const INITIAL: FormState = {
  categoryId: '', categoryName: '', title: '',
  addressA: '', addressB: '', isRemote: false,
  date: '', time: '',
  description: '', privateInfo: '', collectMoney: false, photos: [],
  budgetUzs: '', paymentMethod: '',
};

export default function PostTaskPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      fd.append('categoryId', form.categoryId);
      fd.append('title', form.title);
      fd.append('startAt', new Date(`${form.date}T${form.time}`).toISOString());
      fd.append('paymentMethod', form.paymentMethod);
      if (form.addressA) fd.append('addressA', form.addressA);
      if (form.addressB) fd.append('addressB', form.addressB);
      fd.append('isRemote', String(form.isRemote));
      if (form.description) fd.append('description', form.description);
      if (form.privateInfo) fd.append('privateInfo', form.privateInfo);
      fd.append('collectMoney', String(form.collectMoney));
      if (form.budgetUzs) fd.append('budgetUzs', form.budgetUzs);
      form.photos.forEach((f) => fd.append('photos', f));

      const task = await api.tasks.create(fd);
      router.push(`/tasks/${task.id}?new=1`);
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
              {step}/6 qadam
            </span>
          </div>
          <ProgressBar step={step} />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {step === 1 && (
          <Step1Category
            value={{ categoryId: form.categoryId, title: form.title }}
            onChange={(v) => patch({
              categoryId: v.categoryId,
              title: v.title,
              // find name when category changes
            })}
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
              collectMoney: form.collectMoney,
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

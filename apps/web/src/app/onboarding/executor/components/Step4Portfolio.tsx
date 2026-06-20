'use client';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  value: File[];
  onChange: (files: File[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Portfolio({ value, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const s = t.onboarding.step4;
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    onChange([...value, ...files].slice(0, 10));
  }

  function remove(i: number) {
    const next = [...value];
    next.splice(i, 1);
    onChange(next);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
        <p className="text-sm text-zinc-500">{s.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {value.map((f, i) => (
          <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-zinc-200">
            <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
            <button onClick={() => remove(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center">
              ×
            </button>
          </div>
        ))}
        {value.length < 10 && (
          <button onClick={() => fileRef.current?.click()}
            className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 hover:border-[#A78BFA] hover:text-[#7C3AED] transition-colors">
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs mt-1">{s.addPhoto}</span>
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

      {value.length === 0 && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-sm text-amber-800">{s.skipNote}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-4 rounded-2xl border-2 border-zinc-200 font-bold text-sm hover:bg-zinc-50 transition-colors">
          {t.common.back}
        </button>
        <button onClick={onNext}
          className="flex-1 py-4 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          {t.common.next}
        </button>
      </div>
    </div>
  );
}

'use client';
import { useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  value: { description: string; privateInfo: string; photos: File[] };
  onChange: (v: { description: string; privateInfo: string; photos: File[] }) => void;
  onNext: () => void;
  onBack: () => void;
}

const TEXTAREA = 'w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all resize-none';

export default function Step4Details({ value, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const s = t.postTask.step4;
  const fileRef = useRef<HTMLInputElement>(null);
  const [showPrivate, setShowPrivate] = useState(false);

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    onChange({ ...value, photos: [...value.photos, ...files].slice(0, 5) });
  }
  function removePhoto(i: number) {
    const next = [...value.photos]; next.splice(i, 1);
    onChange({ ...value, photos: next });
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
        <p className="text-sm text-zinc-500">{s.subtitle}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">
          {s.descLabel} <span className="text-zinc-400 font-normal">({t.common.optional})</span>
        </label>
        <textarea value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          rows={4} placeholder={s.descPlaceholder} className={TEXTAREA} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">
          {s.photosLabel} <span className="text-zinc-400 font-normal">({s.photosHint})</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {value.photos.map((f, i) => (
            <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-zinc-200">
              <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/80 transition-colors">
                ×
              </button>
            </div>
          ))}
          {value.photos.length < 5 && (
            <button onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#A78BFA] flex items-center justify-center text-[#7C3AED] hover:border-[#7C3AED] hover:bg-[#F5F3FF] transition-all">
              <span className="text-2xl font-light">+</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
      </div>

      <button onClick={() => setShowPrivate((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-[#7C3AED] hover:text-[#5B21B6] transition-colors">
        <span>{showPrivate ? '▼' : '▶'}</span>
        {s.privateBtn}
      </button>
      {showPrivate && (
        <textarea value={value.privateInfo}
          onChange={(e) => onChange({ ...value, privateInfo: e.target.value })}
          rows={2} placeholder={s.privatePlaceholder} className={TEXTAREA} />
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-2xl border-2 border-zinc-200 font-bold text-sm text-zinc-600 hover:bg-zinc-50 transition-all">
          {t.common.back}
        </button>
        <button onClick={onNext}
          className="flex-1 py-4 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          {t.common.next}
        </button>
      </div>
    </div>
  );
}

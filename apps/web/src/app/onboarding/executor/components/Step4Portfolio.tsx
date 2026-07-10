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
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-extrabold text-ink mb-1">{s.title}</h2>
        <p className="text-sm text-muted">{s.subtitle}</p>
      </div>

      {value.length === 0 ? (
        /* Empty: one large, inviting dropzone instead of a tiny "+" tile */
        <button onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-brand-border bg-brand-tint/50 px-6 py-10 flex flex-col items-center text-center hover:border-brand hover:bg-brand-tint transition-colors btn-press">
          <svg width="96" height="72" viewBox="0 0 96 72" fill="none" aria-hidden className="mb-4">
            <rect x="14" y="18" width="68" height="46" rx="8" fill="#fff" stroke="#DDD6FE" strokeWidth="2"/>
            <path d="M36 18l4-7h16l4 7" stroke="#DDD6FE" strokeWidth="2" strokeLinejoin="round" fill="#fff"/>
            <circle cx="48" cy="41" r="13" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2.5"/>
            <circle cx="48" cy="41" r="5" fill="#7C3AED"/>
            <circle cx="72" cy="28" r="3" fill="#F59E0B"/>
            <path d="M20 58l12-11 8 7 12-12 24 22" stroke="#DDD6FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold text-sm text-brand-dark">{s.addPhotosCta}</span>
          <span className="text-xs text-muted mt-1">{s.addPhotosHint}</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {value.map((f, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-zinc-200 bg-zinc-50">
              <img src={URL.createObjectURL(f)} alt={`${s.addPhoto} ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold text-white bg-black/55 px-2 py-0.5 rounded-full">
                  {s.coverLabel}
                </span>
              )}
              <button onClick={() => remove(i)} aria-label={`${s.removeLabel} ${i + 1}`}
                className="absolute top-1.5 right-1.5 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full text-base flex items-center justify-center transition-colors">
                ×
              </button>
            </div>
          ))}
          {value.length < 10 && (
            <button onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-zinc-300 bg-surface flex flex-col items-center justify-center text-muted hover:border-brand hover:text-brand transition-colors">
              <span className="text-2xl leading-none" aria-hidden>+</span>
              <span className="text-xs mt-1 font-medium">{s.addPhoto}</span>
              <span className="text-[10px] mt-0.5 tabular-nums">{value.length}/10</span>
            </button>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

      {/* Tip: what kind of photos convert */}
      <div className="flex items-start gap-3 bg-gold-tint rounded-2xl p-4 border border-gold-light/60">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 mt-0.5">
          <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.7c-.6.5-1 1.3-1 2.3h-6c0-1-.4-1.8-1-2.3A7 7 0 0 1 12 2z"/>
        </svg>
        <p className="text-sm text-warning-strong">{value.length === 0 ? s.skipNote : s.tip}</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 min-h-[52px] py-4 rounded-2xl border-2 border-zinc-200 bg-surface font-bold text-sm text-ink hover:bg-zinc-50 transition-colors">
          {t.common.back}
        </button>
        <button onClick={onNext}
          className="flex-1 min-h-[52px] py-4 rounded-2xl bg-gradient-brand text-white font-bold text-sm btn-press">
          {t.common.next}
        </button>
      </div>
    </div>
  );
}

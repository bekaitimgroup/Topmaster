'use client';
import { useRef } from 'react';

interface Props {
  value: File[];
  onChange: (files: File[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Portfolio({ value, onChange, onNext, onBack }: Props) {
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
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Portfolio</h2>
        <p className="text-sm text-zinc-500">
          Bajargan ishlaringizning rasmlari — mijozlar ishonchini oshiradi
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {value.map((f, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-200">
            <img
              src={URL.createObjectURL(f)}
              alt=""
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
        {value.length < 10 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-400 transition-colors"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs mt-1">Rasm</span>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {value.length === 0 && (
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            Portfolio bo'lmasa ham davom etishingiz mumkin — keyinroq qo'shish mumkin
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-zinc-200 font-medium text-sm hover:bg-zinc-50 transition-colors"
        >
          Orqaga
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Davom etish
        </button>
      </div>
    </div>
  );
}

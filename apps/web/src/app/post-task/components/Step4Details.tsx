'use client';
import { useRef, useState } from 'react';

interface Props {
  value: { description: string; privateInfo: string; collectMoney: boolean; photos: File[] };
  onChange: (v: { description: string; privateInfo: string; collectMoney: boolean; photos: File[] }) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Details({ value, onChange, onNext, onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showPrivate, setShowPrivate] = useState(false);

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    onChange({ ...value, photos: [...value.photos, ...files].slice(0, 5) });
  }

  function removePhoto(i: number) {
    const next = [...value.photos];
    next.splice(i, 1);
    onChange({ ...value, photos: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Tafsilotlar</h2>
        <p className="text-sm text-zinc-500">Usta ko'proq ma'lumot bilsa, yaxshiroq taklif beradi</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Tavsif <span className="text-zinc-400 font-normal">(ixtiyoriy)</span>
        </label>
        <textarea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          rows={4}
          placeholder="Masalan: 2 xonali uy, 60 kv.m., quruq tozalash kerak..."
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Rasmlar <span className="text-zinc-400 font-normal">(ixtiyoriy, max 5)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {value.photos.map((f, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200">
              <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          {value.photos.length < 5 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-zinc-400 transition-colors"
            >
              <span className="text-2xl">+</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotos}
        />
      </div>

      <div>
        <button
          onClick={() => setShowPrivate((v) => !v)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <span>{showPrivate ? '▼' : '▶'}</span>
          Maxfiy ma'lumot qo'shish (kirish kodi va h.k.)
        </button>
        {showPrivate && (
          <textarea
            value={value.privateInfo}
            onChange={(e) => onChange({ ...value, privateInfo: e.target.value })}
            rows={2}
            placeholder="Faqat tanlangan usta ko'radi"
            className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        )}
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={value.collectMoney}
          onChange={(e) => onChange({ ...value, collectMoney: e.target.checked })}
          className="w-4 h-4 accent-blue-600"
        />
        <span className="text-sm">Usta pul yig'ib keladi (e-tijorat yetkazish)</span>
      </label>

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

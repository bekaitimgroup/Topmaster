'use client';

interface Props {
  value: { bio: string; experienceYears: string };
  onChange: (v: { bio: string; experienceYears: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

const YEARS = ['1 yildan kam', '1–2', '3–5', '5–10', '10+'];

export default function Step3Skills({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Ko'nikmalar</h2>
        <p className="text-sm text-zinc-500">
          Yaxshi tavsif yozgan ustalar 3x ko'p buyurtma oladi
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          O'zingiz haqingizda <span className="text-zinc-400 font-normal">(ixtiyoriy)</span>
        </label>
        <textarea
          value={value.bio}
          onChange={(e) => onChange({ ...value, bio: e.target.value })}
          rows={5}
          maxLength={1000}
          placeholder="Masalan: 8 yillik tajribali elektrik ustaman. Toshkentning barcha tumanlarida ishlayman. Sifat va muddatga kafolat beraman..."
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-zinc-400 mt-1">{value.bio.length}/1000</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tajriba</label>
        <div className="flex flex-wrap gap-2">
          {YEARS.map((y, i) => (
            <button
              key={y}
              onClick={() => onChange({ ...value, experienceYears: String(i === 0 ? 0 : i === 4 ? 10 : parseInt(y)) })}
              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                value.experienceYears === String(i === 0 ? 0 : i === 4 ? 10 : parseInt(y))
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {y} yil
            </button>
          ))}
        </div>
      </div>

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

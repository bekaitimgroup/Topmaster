'use client';

const DISTRICTS = [
  'Chilonzor', 'Yunusobod', 'Mirzo Ulug\'bek', 'Shayxontohur',
  'Uchtepa', 'Olmazor', 'Bektemir', 'Sergeli',
  'Yakkasaroy', 'Yashnobod', 'Mirobod', 'Hamza',
];

interface Props {
  value: { fullName: string; city: string; dateOfBirth: string; email: string };
  onChange: (v: { fullName: string; city: string; dateOfBirth: string; email: string }) => void;
  onNext: () => void;
}

export default function Step1Personal({ value, onChange, onNext }: Props) {
  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString().slice(0, 10);
  const minDob = new Date(today.getFullYear() - 70, today.getMonth(), today.getDate())
    .toISOString().slice(0, 10);

  const canNext = value.fullName.trim().length >= 2 && value.city && value.dateOfBirth;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Shaxsiy ma'lumotlar</h2>
        <p className="text-sm text-zinc-500">Mijozlar profilingizni ko'radi</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">To'liq ism</label>
        <input
          type="text"
          value={value.fullName}
          onChange={(e) => onChange({ ...value, fullName: e.target.value })}
          placeholder="Ism Familiya"
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Shahar / tuman</label>
        <select
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Tumanni tanlang</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Tug'ilgan sana</label>
        <input
          type="date"
          value={value.dateOfBirth}
          max={maxDob}
          min={minDob}
          onChange={(e) => onChange({ ...value, dateOfBirth: e.target.value })}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Email <span className="text-zinc-400 font-normal">(ixtiyoriy)</span>
        </label>
        <input
          type="email"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="email@example.com"
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        disabled={!canNext}
        onClick={onNext}
        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        Davom etish
      </button>
    </div>
  );
}

'use client';

interface Props {
  value: { addressA: string; addressB: string; isRemote: boolean };
  onChange: (v: { addressA: string; addressB: string; isRemote: boolean }) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Location({ value, onChange, onNext, onBack }: Props) {
  const canNext = value.isRemote || value.addressA.trim().length >= 5;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Manzil</h2>
        <p className="text-sm text-zinc-500">Vazifa qayerda bajariladi?</p>
      </div>

      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-zinc-200 cursor-pointer hover:border-zinc-300">
        <input
          type="checkbox"
          checked={value.isRemote}
          onChange={(e) => onChange({ ...value, isRemote: e.target.checked })}
          className="w-4 h-4 accent-blue-600"
        />
        <div>
          <p className="font-medium text-sm">Masofadan bajarish mumkin</p>
          <p className="text-xs text-zinc-400">Jismoniy borish shart emas</p>
        </div>
      </label>

      {!value.isRemote && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Manzil A — bosh joyi / ketib chiqish
            </label>
            <input
              type="text"
              value={value.addressA}
              onChange={(e) => onChange({ ...value, addressA: e.target.value })}
              placeholder="Toshkent, Chilonzor, Bunyodkor 12"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Manzil B — yetkazish manzili{' '}
              <span className="text-zinc-400 font-normal">(ixtiyoriy)</span>
            </label>
            <input
              type="text"
              value={value.addressB}
              onChange={(e) => onChange({ ...value, addressB: e.target.value })}
              placeholder="Toshkent, Yunusobod, Amir Temur 108"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-zinc-200 font-medium text-sm hover:bg-zinc-50 transition-colors"
        >
          Orqaga
        </button>
        <button
          disabled={!canNext}
          onClick={onNext}
          className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Davom etish
        </button>
      </div>
    </div>
  );
}

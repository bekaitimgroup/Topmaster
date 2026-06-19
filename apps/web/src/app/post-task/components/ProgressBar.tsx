'use client';

const STEPS = [
  { n: 1, label: 'Kategoriya' },
  { n: 2, label: 'Manzil' },
  { n: 3, label: 'Vaqt' },
  { n: 4, label: 'Tafsilotlar' },
  { n: 5, label: 'Narx' },
  { n: 6, label: 'Tekshirish' },
];
const PCT = [0, 17, 33, 50, 67, 83, 100];

export default function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-zinc-500 mb-1">
        <span>{STEPS[step - 1]?.label}</span>
        <span>{PCT[step]}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${PCT[step]}%` }}
        />
      </div>
    </div>
  );
}

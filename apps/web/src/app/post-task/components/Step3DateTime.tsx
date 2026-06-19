'use client';
import { useState } from 'react';

interface Props {
  value: { date: string; time: string };
  onChange: (v: { date: string; time: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

function toLocalDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}
function toLocalTimeString(d: Date) {
  return d.toTimeString().slice(0, 5);
}

export default function Step3DateTime({ value, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState('');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  function validate() {
    if (!value.date || !value.time) {
      setError('Sana va vaqtni tanlang');
      return false;
    }
    const chosen = new Date(`${value.date}T${value.time}`);
    const minStart = new Date(Date.now() + 30 * 60 * 1000);
    if (chosen < minStart) {
      setError('Vazifa boshlanish vaqti kamida 30 daqiqa bo\'lishi kerak!');
      return false;
    }
    setError('');
    return true;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  const canNext = value.date && value.time;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Sana va vaqt</h2>
        <p className="text-sm text-zinc-500">Qachon boshlash kerak?</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onChange({ ...value, date: toLocalDateString(today) })}
          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
            value.date === toLocalDateString(today)
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          Bugun
        </button>
        <button
          onClick={() => onChange({ ...value, date: toLocalDateString(tomorrow) })}
          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
            value.date === toLocalDateString(tomorrow)
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          Ertaga
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Sana</label>
          <input
            type="date"
            value={value.date}
            min={toLocalDateString(today)}
            onChange={(e) => { onChange({ ...value, date: e.target.value }); setError(''); }}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Vaqt</label>
          <input
            type="time"
            value={value.time}
            onChange={(e) => { onChange({ ...value, time: e.target.value }); setError(''); }}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
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
          onClick={handleNext}
          className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Davom etish
        </button>
      </div>
    </div>
  );
}

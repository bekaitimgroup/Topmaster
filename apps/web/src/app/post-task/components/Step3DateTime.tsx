'use client';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  value: { date: string; time: string };
  onChange: (v: { date: string; time: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

function toLocal(d: Date) { return d.toISOString().slice(0, 10); }
const INPUT  = 'w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all';
const SELECT = 'w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all appearance-none cursor-pointer';

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

export default function Step3DateTime({ value, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const s = t.postTask.step3;
  const [error, setError] = useState('');
  const [hour, setHour]   = useState(() => value.time?.split(':')[0] ?? '');
  const [minute, setMin]  = useState(() => value.time?.split(':')[1] ?? '');

  function applyTime(h: string, m: string) {
    const time = h && m ? `${h}:${m}` : '';
    onChange({ ...value, time });
    setError('');
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  function validate() {
    if (!value.date || !value.time) { setError(s.errorRequired); return false; }
    if (new Date(`${value.date}T${value.time}`) < new Date(Date.now() + 30 * 60_000)) {
      setError(s.errorTooSoon); return false;
    }
    setError(''); return true;
  }

  const QUICK = [
    { label: s.today,   val: toLocal(today) },
    { label: s.tomorrow, val: toLocal(tomorrow) },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
        <p className="text-sm text-zinc-500">{s.subtitle}</p>
      </div>

      <div className="flex gap-3">
        {QUICK.map((d) => (
          <button key={d.val} onClick={() => { onChange({ ...value, date: d.val }); setError(''); }}
            className={`flex-1 py-3 rounded-2xl border-2 text-sm font-semibold transition-all ${
              value.date === d.val ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]' : 'border-zinc-200 bg-white text-zinc-600 hover:border-[#A78BFA]'
            }`}>
            {d.label}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">{s.date}</label>
        <input type="date" value={value.date} min={toLocal(today)}
          onChange={(e) => { onChange({ ...value, date: e.target.value }); setError(''); }}
          className={INPUT} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">{s.time}</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <select
              value={hour}
              onChange={(e) => { setHour(e.target.value); applyTime(e.target.value, minute); }}
              className={SELECT}
            >
              <option value="">{s.hour ?? 'Soat'}</option>
              {HOURS.map((h) => <option key={h} value={h}>{h}:00</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
          </div>
          <div className="relative">
            <select
              value={minute}
              onChange={(e) => { setMin(e.target.value); applyTime(hour, e.target.value); }}
              className={SELECT}
            >
              <option value="">{s.minute ?? 'Daqiqa'}</option>
              {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3">{error}</p>}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-2xl border-2 border-zinc-200 font-bold text-sm text-zinc-600 hover:bg-zinc-50 transition-all">
          {t.common.back}
        </button>
        <button disabled={!value.date || !value.time} onClick={() => { if (validate()) onNext(); }}
          className="flex-1 py-4 rounded-2xl text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          {t.common.next}
        </button>
      </div>
    </div>
  );
}

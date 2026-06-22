'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/Logo';

export default function AccessPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setError('Noto\'g\'ri kirish kodi');
        return;
      }
      router.replace('/auth');
    } catch {
      setError('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10 flex flex-col items-center gap-3">
          <LogoMark size={56} />
          <p className="text-white/40 text-sm">Beta • Yopiq kirish</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Kirish kodi"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-white/30 text-sm outline-none focus:border-[#7C3AED] transition-colors"
            autoFocus
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!code || loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}
          >
            {loading ? '...' : 'Kirish →'}
          </button>
        </form>
      </div>
    </div>
  );
}

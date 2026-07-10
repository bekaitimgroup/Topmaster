'use client';
import { useEffect, useState } from 'react';

/**
 * SuccessBurst — celebration moment for completed key actions
 * (task posted, task completed, master approved).
 *
 * Zero dependencies: CSS confetti + spring pop, honors
 * prefers-reduced-motion via globals.css. Renders a checkmark badge
 * with a radiating ring and 14 confetti pieces, then the confetti
 * self-cleans after the animation ends.
 *
 * Usage:
 *   <SuccessBurst size={72} />               — inline badge + confetti
 *   <SuccessBurst size={72} label="..." />   — with announcement text below
 */

const CONFETTI_COLORS = ['#7C3AED', '#A78BFA', '#F59E0B', '#FCD34D', '#34D399', '#0EA5E9'];

// Deterministic spread — no Math.random so SSR/CSR markup matches.
const PIECES = Array.from({ length: 14 }, (_, i) => ({
  left: 8 + ((i * 37) % 84),                       // % across the container
  delay: (i % 5) * 70,                              // ms
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  drift: ((i % 3) - 1) * 24,                        // px horizontal drift
}));

export default function SuccessBurst({ size = 72, label }: { size?: number; label?: string }) {
  const [confettiDone, setConfettiDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setConfettiDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col items-center" role="status">
      {/* Confetti layer */}
      {!confettiDone && (
        <div className="absolute -top-4 inset-x-0 h-0 pointer-events-none" aria-hidden>
          {PIECES.map((p, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${p.left}%`,
                background: p.color,
                animationDelay: `${p.delay}ms`,
                marginLeft: p.drift,
              }}
            />
          ))}
        </div>
      )}

      {/* Radiating ring */}
      <span
        aria-hidden
        className="absolute success-ring rounded-full border-2 border-emerald-400"
        style={{ width: size, height: size, top: 0 }}
      />

      {/* Check badge */}
      <span
        className="success-pop rounded-full flex items-center justify-center text-white"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #34D399, #059669)',
          boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
        }}
      >
        <svg width={size * 0.44} height={size * 0.44} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>

      {label && (
        <p className="mt-4 font-bold text-lg text-center animate-fade-up d-2">{label}</p>
      )}
    </div>
  );
}

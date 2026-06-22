import React from 'react';

/* ─── Icon mark ─────────────────────────────────────────────────────────────
   Rounded square, purple gradient, bold white T, amber "foot" accent.
   Scales cleanly from 20 px (favicon) to 256 px (splash).
──────────────────────────────────────────────────────────────────────────── */
export function LogoMark({ size = 40 }: { size?: number }) {
  const s = size;
  const rx = s * 0.24;          // corner radius
  const barX = s * 0.16;        // crossbar left
  const barW = s * 0.68;        // crossbar width
  const barY = s * 0.24;        // crossbar top
  const barH = s * 0.19;        // crossbar height
  const barR = barH / 2;        // crossbar pill radius
  const stemW = s * 0.18;       // stem width
  const stemX = (s - stemW) / 2;
  const stemTop = barY + barH - barR;   // overlap pill so there's no gap
  const stemBot = s * 0.84;
  const stemH = stemBot - stemTop;
  const footH = s * 0.10;       // amber foot height
  const footW = stemW * 1.8;    // foot slightly wider than stem
  const footX = (s - footW) / 2;
  const footY = stemBot - footH;

  const uid = `lm${s}`;         // unique gradient id per size

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}bg`} x1="0" y1="0" x2={s} y2={s} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9333EA"/>
          <stop offset="100%" stopColor="#4C1D95"/>
        </linearGradient>
        <linearGradient id={`${uid}am`} x1={footX} y1={footY} x2={footX + footW} y2={footY} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D"/>
          <stop offset="100%" stopColor="#F59E0B"/>
        </linearGradient>
        <filter id={`${uid}sh`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy={s * 0.025} stdDeviation={s * 0.04} floodColor="#4C1D95" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* Background */}
      <rect width={s} height={s} rx={rx} fill={`url(#${uid}bg)`} filter={`url(#${uid}sh)`}/>

      {/* Subtle inner shine */}
      <rect width={s} height={s * 0.5} rx={rx} fill="white" opacity="0.06"/>

      {/* T crossbar */}
      <rect x={barX} y={barY} width={barW} height={barH} rx={barR} fill="white"/>

      {/* T stem */}
      <rect x={stemX} y={stemTop} width={stemW} height={stemH} rx={stemW / 2} fill="white"/>

      {/* Amber foot — "master's mark" / trophy base */}
      <rect x={footX} y={footY} width={footW} height={footH} rx={footH / 2} fill={`url(#${uid}am)`}/>
    </svg>
  );
}

/* ─── Wordmark ───────────────────────────────────────────────────────────── */
export function LogoWordmark({
  fontSize = 22,
  variant = 'light',
  className = '',
}: {
  fontSize?: number;
  variant?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        fontSize,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      <span style={{ color: variant === 'dark' ? '#ffffff' : '#7C3AED' }}>top</span>
      <span style={{ color: '#F59E0B' }}>master</span>
    </span>
  );
}

/* ─── Full horizontal lockup ─────────────────────────────────────────────── */
interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  className?: string;
}

const SIZES = {
  xs: { mark: 24, text: 14, gap: 7 },
  sm: { mark: 32, text: 18, gap: 9 },
  md: { mark: 40, text: 22, gap: 11 },
  lg: { mark: 52, text: 28, gap: 13 },
  xl: { mark: 68, text: 36, gap: 16 },
};

export default function Logo({ size = 'md', variant = 'light', className = '' }: LogoProps) {
  const { mark, text, gap } = SIZES[size];
  return (
    <div className={`flex items-center select-none ${className}`} style={{ gap }}>
      <LogoMark size={mark} />
      <LogoWordmark fontSize={text} variant={variant} />
    </div>
  );
}

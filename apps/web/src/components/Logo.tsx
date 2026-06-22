import React from 'react';

/* ─── Icon mark ─────────────────────────────────────────────────────────────
   CSS gradient on wrapper div (no SVG defs/IDs that can conflict in DOM).
   Scales cleanly from 20 px (favicon) to 256 px (splash).
──────────────────────────────────────────────────────────────────────────── */
export function LogoMark({ size = 40 }: { size?: number }) {
  const s = size;
  const rx = Math.round(s * 0.24);
  const barX = s * 0.16;
  const barW = s * 0.68;
  const barY = s * 0.24;
  const barH = s * 0.19;
  const barR = barH / 2;
  const stemW = s * 0.18;
  const stemX = (s - stemW) / 2;
  const stemTop = barY + barH - barR;
  const stemBot = s * 0.84;
  const stemH = stemBot - stemTop;
  const footH = s * 0.10;
  const footW = stemW * 1.8;
  const footX = (s - footW) / 2;
  const footY = stemBot - footH;

  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: rx,
        background: 'linear-gradient(135deg, #9333EA 0%, #4C1D95 100%)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top shine */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, transparent 55%)',
        borderRadius: rx,
      }} />
      <svg
        width={s} height={s}
        viewBox={`0 0 ${s} ${s}`}
        fill="none"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* T crossbar */}
        <rect x={barX} y={barY} width={barW} height={barH} rx={barR} fill="white"/>
        {/* T stem */}
        <rect x={stemX} y={stemTop} width={stemW} height={stemH} rx={stemW / 2} fill="white"/>
        {/* Amber foot */}
        <rect x={footX} y={footY} width={footW} height={footH} rx={footH / 2} fill="#F59E0B"/>
      </svg>
    </div>
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

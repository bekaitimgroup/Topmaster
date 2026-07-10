'use client';
import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

export type RevealVariant =
  | 'fade-up'
  | 'fade-in'
  | 'scale-in'
  | 'slide-left'
  | 'slide-right';

interface RevealProps {
  children: ReactNode;
  /** Animation style. Default 'fade-up' (translateY 24px → 0 + fade). */
  variant?: RevealVariant;
  /** Transition delay in ms, clamped 0–600. Use for stagger. */
  delay?: number;
  /** Transition duration in ms. Default 600. */
  duration?: number;
  /** IntersectionObserver threshold. Default 0.15 */
  threshold?: number;
  className?: string;
}

/**
 * Scroll-triggered reveal wrapper. Pure IntersectionObserver + CSS
 * transitions (classes live in globals.css under "Reveal component").
 * Respects prefers-reduced-motion via the CSS media query — content is
 * always visible, never animated, for those users.
 */
export default function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.15,
  className,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold });

  const style = {
    '--rv-delay': `${Math.min(Math.max(delay, 0), 600)}ms`,
    '--rv-dur': `${Math.max(duration, 0)}ms`,
  } as CSSProperties;

  const classes = [
    'rv',
    `rv-${variant}`,
    inView ? 'rv-in' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} style={style}>
      {children}
    </div>
  );
}

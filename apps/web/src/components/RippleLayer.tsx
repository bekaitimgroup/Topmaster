'use client';
import { useEffect } from 'react';

/**
 * Global click-ripple for primary actions. Mount once per page; it
 * delegates a single document click listener to any element carrying
 * `.btn-press` (the sanctioned primary-action class), so no per-button
 * wiring is needed. Keyframe + .ripple-ink styles live in globals.css.
 *
 * - Keyboard activation (e.detail === 0) ripples from the center, so
 *   keyboard users get the same feedback as mouse users.
 * - Skipped entirely under prefers-reduced-motion.
 */
export default function RippleLayer() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.('.btn-press');
      if (!(target instanceof HTMLElement)) return;

      const rect = target.getBoundingClientRect();
      const d = Math.max(rect.width, rect.height) * 2;
      // Keyboard "clicks" report detail 0 and (0,0) coords — center those.
      const fromKeyboard = e.detail === 0;
      const x = fromKeyboard ? rect.width / 2 : e.clientX - rect.left;
      const y = fromKeyboard ? rect.height / 2 : e.clientY - rect.top;

      const ink = document.createElement('span');
      ink.className = 'ripple-ink';
      ink.style.width = ink.style.height = `${d}px`;
      ink.style.left = `${x - d / 2}px`;
      ink.style.top = `${y - d / 2}px`;
      target.appendChild(ink);
      ink.addEventListener('animationend', () => ink.remove(), { once: true });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}

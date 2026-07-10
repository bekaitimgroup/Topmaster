'use client';
import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  /** Portion of the element that must be visible before triggering. Default 0.15 */
  threshold?: number;
  /** IntersectionObserver rootMargin, e.g. '0px 0px -10% 0px' */
  rootMargin?: string;
  /** Fire once and disconnect (default). Set false to toggle on exit. */
  once?: boolean;
}

/**
 * Reusable IntersectionObserver hook — 0KB of dependencies.
 * Returns a ref to attach and a boolean that flips when the element
 * enters the viewport. SSR-safe: no-ops until mounted; if the browser
 * lacks IntersectionObserver, content is shown immediately (never hide
 * content behind a failed observer).
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
) {
  const { threshold = 0.15, rootMargin = '0px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Graceful degradation: no observer support → show content.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}

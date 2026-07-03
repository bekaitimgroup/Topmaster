'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from '@/components/Logo';
import { api } from '@/lib/api';

/* ─── Hooks ──────────────────────────────────────────────────────────────── */

function useCountUp(end: number, decimals = 0) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = () => {
      if (ran.current) return;
      ran.current = true;
      const dur = 1800;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(parseFloat((eased * end).toFixed(decimals)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      start();
      return;
    }
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      start();
      obs.disconnect();
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, decimals]);
  return { val, ref };
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('reveal');
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Live ticker data ───────────────────────────────────────────────────── */

const TICKER = {
  uz: [
    { who: "Jasur B.",    task: "Kran ta'mirlash",       ago: "hozir",   bids: 3 },
    { who: "Malika X.",   task: "Uy tozalash (3 xona)",  ago: "4 min",   bids: 5 },
    { who: "Sardor K.",   task: "Yuk ko'chirish",         ago: "7 min",   bids: 4 },
    { who: "Nozima A.",   task: "Soch kesish",            ago: "12 min",  bids: 6 },
    { who: "Bobur T.",    task: "Kompyuter ta'miri",      ago: "15 min",  bids: 2 },
    { who: "Gulnora S.",  task: "Matematika repetitori",  ago: "19 min",  bids: 7 },
  ],
  ru: [
    { who: "Жасур Б.",   task: "Ремонт крана",           ago: "только что", bids: 3 },
    { who: "Малика Х.",  task: "Уборка (3 комн.)",       ago: "4 мин.",     bids: 5 },
    { who: "Сардор К.",  task: "Грузоперевозки",         ago: "7 мин.",     bids: 4 },
    { who: "Нозима А.",  task: "Стрижка",                ago: "12 мин.",    bids: 6 },
    { who: "Бобур Т.",   task: "Ремонт компьютера",      ago: "15 мин.",    bids: 2 },
    { who: "Гульнора С.", task: "Репетитор математика",  ago: "19 мин.",    bids: 7 },
  ],
};

function LiveTicker() {
  const { lang } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  const items = TICKER[lang as keyof typeof TICKER] ?? TICKER.uz;
  const item  = items[idx];

  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setIdx(i => (i + 1) % items.length); setShow(true); }, 350);
    }, 3200);
    return () => clearInterval(t);
  }, [items.length]);

  const bidsLabel = lang === 'ru'
    ? `${item.bids} предл.`
    : `${item.bids} taklif`;

  return (
    <div className="relative mb-7 glass rounded-full pl-3.5 pr-5 py-2 text-xs sm:text-sm max-w-[92vw] sm:max-w-none overflow-hidden">
      <div className="flex items-center gap-2" style={{ opacity: show ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <span className="font-semibold text-white/90 whitespace-nowrap">{item.who}</span>
        <span className="text-white/25">·</span>
        <span className="text-white/60 truncate">{item.task}</span>
        <span className="text-white/25 hidden sm:inline">·</span>
        <span className="text-white/40 whitespace-nowrap hidden sm:inline">{item.ago}</span>
        <span className="text-white/25">·</span>
        <span className="text-emerald-400 font-semibold whitespace-nowrap">{bidsLabel}</span>
      </div>
    </div>
  );
}

/* ─── Sticky mobile CTA ──────────────────────────────────────────────────── */

function StickyMobileCTA() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-30 md:hidden transition-all duration-300 pointer-events-none ${show ? 'opacity-100' : 'opacity-0 translate-y-2'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="px-4 pt-6 pb-4 pointer-events-auto" style={{ background: 'linear-gradient(to top, #0B0B18 55%, transparent)' }}>
        <Link
          href="/post-task"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-base glow-violet active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
        >
          {t.nav.postTask} →
        </Link>
      </div>
    </div>
  );
}

/* ─── Category icons (SVG, no emoji) ────────────────────────────────────── */

function IconRepair({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}
function IconTruck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 4v4h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}
function IconSparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75z"/>
      <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5z"/>
    </svg>
  );
}
function IconPackage({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
    </svg>
  );
}
function IconBook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
function IconScissors({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>
    </svg>
  );
}
function IconMonitor({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  );
}
function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

const CAT_CONFIG = [
  { Icon: IconRepair,   bg: 'bg-amber-50',   iconCls: 'text-amber-600',  hoverBorder: 'group-hover:border-amber-200'  },
  { Icon: IconTruck,    bg: 'bg-sky-50',      iconCls: 'text-sky-600',    hoverBorder: 'group-hover:border-sky-200'    },
  { Icon: IconSparkles, bg: 'bg-teal-50',     iconCls: 'text-teal-600',   hoverBorder: 'group-hover:border-teal-200'   },
  { Icon: IconPackage,  bg: 'bg-violet-50',   iconCls: 'text-violet-600', hoverBorder: 'group-hover:border-violet-200' },
  { Icon: IconBook,     bg: 'bg-indigo-50',   iconCls: 'text-indigo-600', hoverBorder: 'group-hover:border-indigo-200' },
  { Icon: IconScissors, bg: 'bg-rose-50',     iconCls: 'text-rose-600',   hoverBorder: 'group-hover:border-rose-200'   },
  { Icon: IconMonitor,  bg: 'bg-slate-50',    iconCls: 'text-slate-600',  hoverBorder: 'group-hover:border-slate-200'  },
  { Icon: IconSettings, bg: 'bg-orange-50',   iconCls: 'text-orange-600', hoverBorder: 'group-hover:border-orange-200' },
];

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

function Navbar() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api.auth.me().then(() => setLoggedIn(true)).catch(() => setLoggedIn(false));
  }, []);

  async function logout() {
    try { await api.auth.logout(); } catch {}
    setLoggedIn(false);
    router.replace('/auth');
  }

  // Close on scroll
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [mobileOpen]);

  const navLinks = [t.nav.howItWorks, t.nav.categories, t.nav.forMasters];

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 py-3.5 md:px-12 md:py-4">
        <div className="absolute inset-0 bg-[#0B0B18]/80 backdrop-blur-md border-b border-white/5" />
        <Logo size="sm" variant="dark" />

        {/* Desktop links — absolutely centered on the full nav width */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 text-sm text-white/55">
          {navLinks.map((l) => (
            <a key={l} href={`#${l}`} className="hover:text-white transition-colors duration-200">{l}</a>
          ))}
        </div>

        <div className="relative flex items-center gap-2">
          <LanguageSwitcher variant="dark" />
          {loggedIn && (
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white/55 hover:text-white border border-white/20 hover:border-white/40 px-3 py-2 rounded-full transition-all"
            >
              {lang === 'ru' ? 'Выйти' : 'Chiqish'}
            </button>
          )}
          <Link
            href="/post-task"
            className="hidden sm:block text-sm font-bold px-4 py-2 rounded-full text-white hover:opacity-90 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
          >
            {t.nav.postTask}
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden relative flex items-center justify-center w-9 h-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h10"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16" onClick={() => setMobileOpen(false)}>
          <div
            className="mx-3 mt-2 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(11,11,24,0.97)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(24px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 flex flex-col gap-0.5">
              {navLinks.map((l) => (
                <a
                  key={l}
                  href={`#${l}`}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-white/65 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                >
                  {l}
                </a>
              ))}
              <div className="border-t border-white/8 mt-2 pt-2 grid grid-cols-2 gap-2">
                <Link href="/post-task" onClick={() => setMobileOpen(false)}
                  className="text-center py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
                >
                  {t.nav.postTask}
                </Link>
                <Link href="/onboarding/executor" onClick={() => setMobileOpen(false)}
                  className="text-center py-3 rounded-xl font-semibold text-[#F59E0B] text-sm border border-[#F59E0B]/30"
                >
                  {t.hero.ctaMaster}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function Hero() {
  const { t } = useLanguage();
  return (
    <section className="hero-bg relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-8 blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />

      {/* Live ticker — replaces static badge */}
      <LiveTicker />

      {/* Headline */}
      <h1
        className="relative text-[2.6rem] sm:text-6xl md:text-[80px] font-black text-white leading-[1.0] max-w-4xl animate-fade-up"
        style={{ letterSpacing: '-0.04em' }}
      >
        {t.hero.title}{' '}
        <span className="gradient-text">{t.hero.titleHighlight}</span>
        <br className="hidden sm:block" />{' '}
        {t.hero.titleEnd}
      </h1>

      <p className="relative mt-5 text-base md:text-xl text-white/45 max-w-md leading-relaxed">
        {t.hero.subtitle}
      </p>

      <p className="relative mt-2 text-xs sm:text-sm text-white/25 font-inter">
        {t.hero.prices}
      </p>

      {/* CTAs */}
      <div className="relative mt-8 flex flex-col sm:flex-row gap-3 items-center w-full max-w-sm sm:max-w-none sm:w-auto">
        <Link
          href="/post-task"
          className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] glow-violet"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}
        >
          {t.hero.ctaTask}
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        <Link
          href="/onboarding/executor"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/80 glass hover:bg-white/8 transition-all"
        >
          {t.hero.ctaMaster}
        </Link>
      </div>

      {/* Intro video link */}
      <Link
        href="/intro"
        className="relative mt-5 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors group"
      >
        <span className="w-7 h-7 rounded-full flex items-center justify-center border border-white/15 group-hover:border-white/30 transition-colors">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M3 2l5 3-5 3V2z"/>
          </svg>
        </span>
        О проекте
      </Link>

      {/* Trust signals */}
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-white/30">
        {t.hero.trust.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">{item}</span>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20">
        <span className="text-[10px] tracking-widest uppercase">{t.hero.scrollHint}</span>
        <div className="w-px h-6 bg-gradient-to-b from-white/15 to-transparent mt-1" />
      </div>
    </section>
  );
}

/* ─── Stats bar ──────────────────────────────────────────────────────────── */

function StatsBar() {
  const { t } = useLanguage();
  const s = t.stats;
  const rev = useReveal();

  const masters = useCountUp(2000);
  const tasks   = useCountUp(15000);
  const rating  = useCountUp(4.8, 1);
  const cities  = useCountUp(12);

  const items = [
    { label: s.masters.label, spanRef: masters.ref, display: `${masters.val.toLocaleString()}+` },
    { label: s.tasks.label,   spanRef: tasks.ref,   display: `${tasks.val.toLocaleString()}+`   },
    { label: s.rating.label,  spanRef: rating.ref,  display: `${rating.val.toFixed(1)}★`        },
    { label: s.cities.label,  spanRef: cities.ref,  display: `${cities.val}`                    },
  ];

  return (
    <div ref={rev} className="bg-[#0B0B18] border-y border-white/5">
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4">
        {items.map((item, i) => (
          <div key={item.label}
            className={`flex flex-col items-center py-5 ${i % 2 === 0 && i < 3 ? 'border-r border-white/5' : ''} ${i < 2 ? 'md:border-r md:border-white/5' : ''}`}>
            <span ref={item.spanRef} className="text-2xl sm:text-3xl font-extrabold text-white font-jakarta tabular-nums">
              {item.display}
            </span>
            <span className="text-xs sm:text-sm text-white/35 mt-1 text-center px-2">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── How It Works ───────────────────────────────────────────────────────── */

const STEP_ICONS = [
  <svg key="a" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>,
  <svg key="b" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>,
  <svg key="c" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>,
];

function HowItWorks() {
  const { t } = useLanguage();
  const h = t.how;
  const rev = useReveal();

  return (
    <section id={t.nav.howItWorks} className="py-20 md:py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto" ref={rev}>
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#7C3AED] mb-3">{h.sectionLabel}</span>
          <h2 className="text-3xl md:text-[52px] font-extrabold text-[#0D0D1A] leading-tight">{h.title}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {h.steps.map((s, i) => (
            <div key={s.n} className="relative group">
              {i < h.steps.length - 1 && (
                <div className="hidden md:flex absolute top-10 left-[calc(100%+2px)] w-5 items-center justify-center z-10">
                  <svg width="16" height="10" viewBox="0 0 20 12" fill="none">
                    <path d="M0 6h14M10 1l6 5-6 5" stroke="#7C3AED" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div className="bg-[#F8F7FF] rounded-3xl p-6 md:p-7 h-full group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 border border-transparent group-hover:border-[#7C3AED]/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
                    {STEP_ICONS[i]}
                  </div>
                  <span className="text-4xl font-extrabold text-[#7C3AED]/10 font-jakarta leading-none">{s.n}</span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-[#0D0D1A] mb-2">{s.title}</h3>
                <p className="text-[#71717A] leading-relaxed text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Categories ─────────────────────────────────────────────────────────── */

function Categories() {
  const { t } = useLanguage();
  const c = t.categories;
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setRevealed(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const featured = c.items[0];
  const rest     = c.items.slice(1);
  const featCfg  = CAT_CONFIG[0];

  return (
    <section id={t.nav.categories} className="py-20 md:py-24 px-4" style={{ background: '#F8F7FF' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#7C3AED] mb-3">{c.sectionLabel}</span>
          <h2 className="text-3xl md:text-[52px] font-extrabold text-[#0D0D1A] leading-tight">{c.title}</h2>
          <p className="mt-3 text-sm md:text-base text-[#71717A] max-w-xs mx-auto">{c.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" ref={containerRef}>

          {/* Featured card — spans 2 cols */}
          <Link
            href="/post-task"
            className="col-span-2 group bg-white rounded-2xl p-5 flex items-center gap-4 border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'none' : 'translateY(16px)',
              transition: 'opacity 0.45s ease 0ms, transform 0.45s ease 0ms',
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <featCfg.Icon className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-bold text-[#0D0D1A]">{featured.name}</p>
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">{c.popular}</span>
              </div>
              <p className="text-sm text-[#71717A] line-clamp-1">{featured.desc}</p>
            </div>
            <svg className="w-4 h-4 text-zinc-300 group-hover:text-amber-400 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M9 18l6-6-6-6"/></svg>
          </Link>

          {/* Rest of categories with stagger */}
          {rest.map((cat, i) => {
            const cfg = CAT_CONFIG[(i + 1) % CAT_CONFIG.length];
            const delay = (i + 1) * 55;
            return (
              <Link
                key={cat.name}
                href="/post-task"
                className={`group bg-white rounded-2xl p-4 md:p-5 flex flex-col gap-3 border border-zinc-100 ${cfg.hoverBorder} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]`}
                style={{
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? 'none' : 'translateY(16px)',
                  transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
                }}
              >
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <cfg.Icon className={`w-5 h-5 ${cfg.iconCls}`} />
                </div>
                <div>
                  <p className="font-semibold text-[#0D0D1A] text-sm leading-snug">{cat.name}</p>
                  <p className="text-xs text-[#71717A] mt-0.5 line-clamp-1">{cat.desc}</p>
                </div>
                <span className="text-xs font-semibold text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity -mt-1 hidden sm:block">
                  {c.cta}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── For Masters ────────────────────────────────────────────────────────── */

const PERK_ICONS = [
  <svg key="p" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
  </svg>,
  <svg key="m" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9 8.5h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15"/>
  </svg>,
  <svg key="f" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>,
  <svg key="s" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>,
];

function ForMasters() {
  const { t } = useLanguage();
  const m = t.forMasters;
  const rev = useReveal();

  return (
    <section id={t.nav.forMasters} className="py-20 md:py-24 px-4 hero-bg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />

      <div className="max-w-5xl mx-auto relative" ref={rev}>
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#F59E0B] mb-3">{m.sectionLabel}</span>
          <h2 className="text-3xl md:text-[52px] font-extrabold text-white leading-tight">
            {m.title}{' '}
            <span className="gradient-text">{m.titleHighlight}</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/45 max-w-sm mx-auto">{m.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 md:gap-4 mb-10 md:mb-12">
          {m.perks.map((p, i) => (
            <div key={p.title} className="glass rounded-2xl p-5 md:p-6 flex gap-4">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-[#F59E0B]"
                style={{ background: 'rgba(245,158,11,0.12)' }}>
                {PERK_ICONS[i]}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{p.title}</p>
                <p className="text-xs md:text-sm text-white/45 mt-1 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/onboarding/executor"
            className="inline-flex items-center gap-2 px-8 md:px-10 py-4 rounded-2xl text-base font-bold text-[#0B0B18] transition-all hover:scale-[1.02] active:scale-[0.98] glow-gold"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          >
            {m.cta} →
          </Link>
          <p className="mt-3 text-xs text-white/25">{m.note}</p>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────────────────── */

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#7C3AED,#5B21B6)',
  'linear-gradient(135deg,#D97706,#B45309)',
  'linear-gradient(135deg,#0EA5E9,#0369A1)',
];

function Testimonials() {
  const { t } = useLanguage();
  const tr = t.testimonials;
  const rev = useReveal();

  return (
    <section className="py-20 md:py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto" ref={rev}>
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#7C3AED] mb-3">{tr.sectionLabel}</span>
          <h2 className="text-3xl md:text-[52px] font-extrabold text-[#0D0D1A]">{tr.title}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {tr.items.map((item, i) => (
            <div key={item.name}
              className="bg-[#F8F7FF] rounded-3xl p-6 md:p-7 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-[#7C3AED]/10">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} width="13" height="13" viewBox="0 0 24 24"
                    fill={j < item.rating ? '#F59E0B' : 'none'}
                    stroke="#F59E0B" strokeWidth={1.5}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p className="text-[#0D0D1A]/70 leading-relaxed text-sm flex-1">&#8220;{item.text}&#8221;</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                >
                  {item.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm text-[#0D0D1A]">{item.name}</p>
                  <p className="text-xs text-[#71717A]">{item.city} · {item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Banner ─────────────────────────────────────────────────────────── */

function CtaBanner() {
  const { t } = useLanguage();
  const c = t.ctaBanner;
  const rev = useReveal();

  return (
    <section className="px-4 py-12 md:py-16 bg-[#F8F7FF]">
      <div
        className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 55%, #1A1A3A 100%)' }}
        ref={rev}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />
        <div className="relative text-center px-6 py-12 md:px-8 md:py-16">
          <h2 className="text-2xl md:text-5xl font-extrabold text-white leading-tight whitespace-pre-line">{c.title}</h2>
          <p className="mt-3 text-sm md:text-base text-white/50 max-w-md mx-auto">{c.subtitle}</p>
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/post-task"
              className="px-8 md:px-10 py-4 rounded-2xl font-bold text-[#0B0B18] text-base hover:scale-[1.02] transition-transform glow-gold active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              {c.ctaTask}
            </Link>
            <Link href="/onboarding/executor"
              className="px-8 md:px-10 py-4 rounded-2xl font-semibold text-white/80 glass text-base hover:bg-white/10 transition-colors">
              {c.ctaMaster}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

function Footer() {
  const { t } = useLanguage();
  const f = t.footer;

  return (
    <footer className="bg-[#0B0B18] text-white/45 py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo size="sm" variant="dark" />
            </div>
            <p className="text-sm leading-relaxed">{f.desc}</p>
          </div>
          {f.columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-bold text-white mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm hover:text-white/80 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <p>{f.copyright}</p>
          <div className="flex gap-5">
            {f.socials.map((s) => (
              <a key={s} href="#" className="hover:text-white/70 transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Categories />
      <ForMasters />
      <Testimonials />
      <CtaBanner />
      <Footer />
      <StickyMobileCTA />
    </>
  );
}

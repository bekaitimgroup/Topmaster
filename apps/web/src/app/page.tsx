'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from '@/components/Logo';
import { api } from '@/lib/api';

function Navbar() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    api.auth.me().then(() => setLoggedIn(true)).catch(() => setLoggedIn(false));
  }, []);

  async function logout() {
    try { await api.auth.logout(); } catch {}
    setLoggedIn(false);
    router.replace('/auth');
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
      <div className="absolute inset-0 bg-[#0B0B18]/70 backdrop-blur-md border-b border-white/5" />
      <Logo size="sm" variant="dark" />
      <div className="relative hidden md:flex items-center gap-8 text-sm text-white/70">
        {[t.nav.howItWorks, t.nav.categories, t.nav.forMasters].map((l) => (
          <a key={l} href={`#${l}`} className="hover:text-white transition-colors">{l}</a>
        ))}
      </div>
      <div className="relative flex items-center gap-3">
        <LanguageSwitcher variant="dark" />
        {loggedIn ? (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white border border-white/25 hover:border-white/50 px-4 py-2 rounded-full transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {lang === 'ru' ? 'Выйти' : 'Chiqish'}
          </button>
        ) : (
          <Link href="/post-task" className="hidden sm:block text-sm font-semibold text-white/80 hover:text-white transition-colors">
            {t.nav.login}
          </Link>
        )}
        <Link
          href="/post-task"
          className="text-sm font-bold px-4 py-2 rounded-full text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
        >
          {t.nav.postTask}
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  const { t } = useLanguage();
  const s = t.stats;
  return (
    <section className="hero-bg relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full opacity-15 blur-[80px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />

      <div className="relative mb-6 inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm font-medium text-white/80">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        {t.hero.badge}
      </div>

      <h1 className="relative text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight max-w-4xl">
        {t.hero.title}{' '}
        <span className="gradient-text">{t.hero.titleHighlight}</span>{' '}
        {t.hero.titleEnd}
      </h1>

      <p className="relative mt-6 text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
        {t.hero.subtitle}
      </p>

      <div className="relative mt-10 flex flex-col sm:flex-row gap-4 items-center">
        <Link
          href="/post-task"
          className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95 glow-violet"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}
        >
          {t.hero.ctaTask}
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
        <Link
          href="/onboarding/executor"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white/90 glass hover:bg-white/10 transition-all"
        >
          {t.hero.ctaMaster}
        </Link>
      </div>

      <div className="relative mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10">
        {([s.masters, s.tasks, s.rating, s.cities] as const).map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</p>
            <p className="text-sm text-white/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30">
        <span className="text-xs">{t.hero.scrollHint}</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useLanguage();
  const h = t.how;
  return (
    <section id={t.nav.howItWorks} className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-bold uppercase tracking-widest text-[#7C3AED]">{h.sectionLabel}</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-[#0D0D1A] leading-tight">{h.title}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {h.steps.map((s, i) => (
            <div key={s.n} className="relative group">
              {i < h.steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%-1rem)] w-8 border-t-2 border-dashed border-[#7C3AED]/30 z-10" />
              )}
              <div className="bg-[#F8F7FF] rounded-3xl p-8 h-full group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="text-6xl font-extrabold text-[#7C3AED]/10 mb-2 leading-none">{s.n}</div>
                <h3 className="text-xl font-bold text-[#0D0D1A] mb-3">{s.title}</h3>
                <p className="text-[#71717A] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const { t } = useLanguage();
  const c = t.categories;
  return (
    <section id={t.nav.categories} className="py-24 px-4" style={{ background: '#F8F7FF' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-bold uppercase tracking-widest text-[#7C3AED]">{c.sectionLabel}</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-[#0D0D1A] leading-tight">{c.title}</h2>
          <p className="mt-4 text-lg text-[#71717A] max-w-xl mx-auto">{c.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {c.items.map((cat) => (
            <Link
              key={cat.name}
              href="/post-task"
              className="group bg-white rounded-2xl p-5 flex flex-col gap-3 border border-transparent hover:border-[#7C3AED]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <div>
                <p className="font-bold text-[#0D0D1A] group-hover:text-[#7C3AED] transition-colors">{cat.name}</p>
                <p className="text-xs text-[#71717A] mt-0.5">{cat.desc}</p>
              </div>
              <span className="text-xs font-semibold text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity">{c.cta}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForMasters() {
  const { t } = useLanguage();
  const m = t.forMasters;
  return (
    <section id={t.nav.forMasters} className="py-24 px-4 hero-bg noise relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-14">
          <span className="text-sm font-bold uppercase tracking-widest text-[#F59E0B]">{m.sectionLabel}</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-white leading-tight">
            {m.title}{' '}
            <span className="gradient-text">{m.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-lg text-white/60 max-w-xl mx-auto">{m.subtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          {m.perks.map((p) => (
            <div key={p.title} className="glass rounded-2xl p-6 flex gap-4">
              <span className="text-3xl shrink-0">{p.icon}</span>
              <div>
                <p className="font-bold text-white">{p.title}</p>
                <p className="text-sm text-white/60 mt-1 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/onboarding/executor"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-[#0B0B18] transition-all hover:scale-105 active:scale-95 glow-gold"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          >
            {m.cta} →
          </Link>
          <p className="mt-4 text-sm text-white/40">{m.note}</p>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { t } = useLanguage();
  const tr = t.testimonials;
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-bold uppercase tracking-widest text-[#7C3AED]">{tr.sectionLabel}</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-[#0D0D1A]">{tr.title}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tr.items.map((item) => (
            <div key={item.name} className="bg-[#F8F7FF] rounded-3xl p-7 flex flex-col gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex text-[#F59E0B] text-lg">{'★'.repeat(item.rating)}</div>
              <p className="text-[#0D0D1A]/80 leading-relaxed flex-1">&#8220;{item.text}&#8221;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold text-sm">
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

function CtaBanner() {
  const { t } = useLanguage();
  const c = t.ctaBanner;
  return (
    <section className="px-4 py-16">
      <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 50%, #1A1A3A 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-[60px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 blur-[60px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }} />
        <div className="relative text-center px-8 py-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight whitespace-pre-line">{c.title}</h2>
          <p className="mt-4 text-lg text-white/60 max-w-lg mx-auto">{c.subtitle}</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/post-task"
              className="px-10 py-4 rounded-2xl font-bold text-[#0B0B18] text-base hover:scale-105 transition-transform glow-gold"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              {c.ctaTask}
            </Link>
            <Link href="/onboarding/executor"
              className="px-10 py-4 rounded-2xl font-bold text-white/90 glass text-base hover:bg-white/10 transition-colors">
              {c.ctaMaster}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLanguage();
  const f = t.footer;
  return (
    <footer className="bg-[#0B0B18] text-white/60 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo size="sm" variant="dark" />
            </div>
            <p className="text-sm leading-relaxed">{f.desc}</p>
          </div>
          {f.columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-bold text-white mb-4">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>{f.copyright}</p>
          <div className="flex gap-4">
            {f.socials.map((s) => (
              <a key={s} href="#" className="hover:text-white transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Categories />
      <ForMasters />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </>
  );
}

'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface PublicProfile {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  badge: string;
  idVerified: boolean;
  rating: number;
  reviewCount: number;
  completedTaskCount: number;
  categories: { id: string; nameUz: string; nameRu: string }[];
  portfolio: { id: string; url: string }[];
}

const BADGE_STYLES: Record<string, string> = {
  registered: 'bg-white/12 border border-white/20 text-white',
  verified:   'bg-info-tint text-info-strong',
  pro:        'bg-brand-tint text-brand-dark',
  top_master: 'bg-gradient-gold text-white',
};

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" aria-hidden
          fill={i <= Math.round(rating) ? '#FCD34D' : 'rgba(255,255,255,0.25)'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

export default function MasterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t, lang } = useLanguage();
  const mp = t.masterProfile;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/executor/${id}/public`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas" aria-label={mp.loading} aria-busy>
        <div className="bg-gradient-brand-deep px-4 pt-4 pb-8">
          <div className="max-w-2xl mx-auto">
            <div className="skeleton w-11 h-11 rounded-full mb-6" />
            <div className="flex items-center gap-4">
              <div className="skeleton w-20 h-20 rounded-full" />
              <div className="space-y-2">
                <div className="skeleton h-6 w-44" />
                <div className="skeleton h-4 w-28" />
              </div>
            </div>
          </div>
        </div>
        <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          <div className="bg-surface rounded-2xl border-2 border-zinc-100 p-5 space-y-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-2xl" />)}
          </div>
        </main>
      </div>
    );
  }

  /* ── Not found ── */
  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6 text-center">
        <svg width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden className="mb-5">
          <circle cx="60" cy="40" r="24" stroke="#DDD6FE" strokeWidth="2.5"/>
          <path d="M36 92c0-13 11-22 24-22s24 9 24 22" stroke="#DDD6FE" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M52 36l16 10M68 36L52 46" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <p className="font-bold text-ink text-lg">{mp.notFound}</p>
        <p className="text-sm text-muted mt-2 max-w-xs">{mp.notFoundDesc}</p>
        <Link href="/" className="mt-6 inline-block px-6 py-3.5 rounded-2xl bg-gradient-brand text-white font-bold text-sm btn-press">
          {mp.backHome}
        </Link>
      </div>
    );
  }

  const badgeLabel = (mp.badges as Record<string, string>)[profile.badge] ?? profile.badge;
  const badgeStyle = BADGE_STYLES[profile.badge] ?? BADGE_STYLES.registered;
  const initial = profile.fullName?.trim()[0]?.toUpperCase() ?? '?';
  const hasReviews = profile.reviewCount > 0;

  return (
    <div className="min-h-screen bg-canvas pb-28">
      {/* ── Hero ── */}
      <div className="hero-bg text-white px-4 pt-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.back()} aria-label={t.common.back}
              className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center text-white/80 hover:text-white hover:border-white/60 transition-colors">
              ←
            </button>
            <LanguageSwitcher variant="dark" />
          </div>

          <div className="flex items-start gap-4 animate-fade-up">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName ?? ''}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/30 shrink-0" />
            ) : (
              <div aria-hidden className="w-20 h-20 rounded-full bg-gradient-brand border-2 border-white/30 flex items-center justify-center text-3xl font-extrabold shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold truncate">{profile.fullName ?? mp.newMaster}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeStyle}`}>{badgeLabel}</span>
                {profile.idVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-success-tint text-success-strong">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
                    {mp.verifiedId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                {hasReviews ? (
                  <>
                    <Stars rating={profile.rating} label={`${mp.ratingLabel}: ${profile.rating.toFixed(1)} / 5`} />
                    <span className="text-sm font-bold">{profile.rating.toFixed(1)}</span>
                    <span className="text-sm text-white/70">· {profile.reviewCount} {mp.reviewsLabel}</span>
                  </>
                ) : (
                  <span className="text-sm text-white/70">{mp.newMaster}</span>
                )}
              </div>
              {profile.city && (
                <p className="text-sm text-white/70 mt-1.5 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {profile.city}
                </p>
              )}
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-2 mt-6 animate-fade-up d-1">
            {[
              { value: hasReviews ? profile.rating.toFixed(1) : '—', label: mp.ratingLabel },
              { value: String(profile.reviewCount), label: mp.reviewsLabel },
              { value: String(profile.completedTaskCount), label: mp.completedLabel },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl px-3 py-3 text-center">
                <p className="font-display font-extrabold text-lg tabular-nums">{s.value}</p>
                <p className="text-[11px] text-white/70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* About */}
        <section className="bg-surface rounded-2xl border-2 border-zinc-100 p-5 animate-fade-up d-2">
          <h2 className="text-sm font-bold text-ink mb-2">{mp.aboutTitle}</h2>
          {profile.bio
            ? <p className="text-sm text-zinc-700 whitespace-pre-line leading-relaxed">{profile.bio}</p>
            : <p className="text-sm text-muted italic">{mp.noBio}</p>}
        </section>

        {/* Categories */}
        {profile.categories.length > 0 && (
          <section className="bg-surface rounded-2xl border-2 border-zinc-100 p-5 animate-fade-up d-3">
            <h2 className="text-sm font-bold text-ink mb-3">{mp.categoriesTitle}</h2>
            <div className="flex flex-wrap gap-2">
              {profile.categories.map((c) => (
                <span key={c.id} className="text-xs font-bold text-brand-dark bg-brand-tint border border-brand-border px-3 py-1.5 rounded-full">
                  {lang === 'ru' ? c.nameRu : c.nameUz}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio */}
        <section className="animate-fade-up d-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-bold text-ink">{mp.portfolioTitle}</h2>
            {profile.portfolio.length > 0 && (
              <span className="text-xs text-muted tabular-nums">{profile.portfolio.length} {mp.portfolioCount}</span>
            )}
          </div>
          {profile.portfolio.length === 0 ? (
            <div className="bg-surface rounded-2xl border-2 border-zinc-100 p-8 text-center">
              <svg width="96" height="72" viewBox="0 0 96 72" fill="none" aria-hidden className="mx-auto mb-3">
                <rect x="14" y="14" width="68" height="48" rx="8" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="2"/>
                <circle cx="36" cy="32" r="6" fill="#DDD6FE"/>
                <path d="M20 56l16-14 10 9 14-13 16 16" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-muted">{mp.portfolioEmpty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {profile.portfolio.map((p, i) => (
                <img key={p.id} src={p.url} alt={`${mp.portfolioAlt} ${i + 1}`} loading="lazy"
                  className="aspect-square w-full object-cover rounded-2xl border-2 border-zinc-100 bg-zinc-50" />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-zinc-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <button onClick={() => router.back()}
            className="w-full min-h-[52px] py-4 rounded-2xl bg-gradient-brand text-white font-bold text-sm btn-press">
            {mp.chooseCta}
          </button>
          <p className="text-[11px] text-muted text-center mt-1.5">{mp.chooseHint}</p>
        </div>
      </div>
    </div>
  );
}

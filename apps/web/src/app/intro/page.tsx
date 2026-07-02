import { LogoMark, LogoWordmark } from '@/components/Logo';

const YOUTUBE_ID = 'GM3gjTmztdI';

const STATS = [
  { num: '$2 млрд',  label: 'Рынок Узбекистана' },
  { num: '36 млн',   label: 'Потенциальных пользователей' },
  { num: '10%',      label: 'Комиссия с безопасных сделок' },
  { num: '0',        label: 'Прямых конкурентов' },
];

export const metadata = {
  title: 'Topmaster — Питч',
  description: 'Первый маркетплейс обратного аукциона для бытовых услуг в Узбекистане.',
  openGraph: {
    title: 'Topmaster — Питч',
    description: 'Первый маркетплейс обратного аукциона для бытовых услуг в Узбекистане.',
    images: ['/icon.svg'],
  },
};

export default function PitchPage() {
  return (
    <main className="min-h-screen bg-[#0B0B18] text-white flex flex-col">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <LogoMark size={36} />
          <LogoWordmark fontSize={20} variant="dark" />
        </div>
        <span className="text-sm text-white/30 font-medium tracking-wide uppercase">
          2026
        </span>
      </nav>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-10">
        <h1
          className="font-[family-name:var(--font-jakarta)] text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] mb-5"
          style={{ maxWidth: 780 }}
        >
          Рынок бытовых услуг —<br />
          <span style={{ color: '#7C3AED' }}>переосмыслен</span>
        </h1>

        <p className="text-white/50 text-lg max-w-xl leading-relaxed mb-10">
          Topmaster — первый маркетплейс обратного аукциона для бытовых услуг
          в Узбекистане. Клиент размещает задание, мастера соревнуются за него.
        </p>

        {/* ── Video ── */}
        <div
          className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{
            maxWidth: 900,
            background: '#111',
            boxShadow: '0 0 0 1px rgba(124,58,237,0.15), 0 32px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* Glow bar */}
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, #7C3AED, #F59E0B, #7C3AED)' }}
          />
          <div className="relative" style={{ paddingTop: '56.25%' /* 16:9 */ }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1&color=white`}
              title="Topmaster Pitch"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <p className="mt-5 text-white/25 text-sm">
          Узбекистан · iOS & Android · Web App · 2026
        </p>
      </section>

      {/* ── Stats ── */}
      <section className="px-6 pb-14">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto"
          style={{ maxWidth: 900 }}
        >
          {STATS.map(({ num, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center"
            >
              <div
                className="font-[family-name:var(--font-jakarta)] text-3xl font-black mb-1"
                style={{ color: '#F59E0B' }}
              >
                {num}
              </div>
              <div className="text-white/45 text-sm leading-snug">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="flex flex-col items-center px-6 pb-20 gap-4">
        <p className="text-white/35 text-sm">Есть вопросы или хотите обсудить партнёрство?</p>
        <a
          href="mailto:info@topmaster.uz"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
        >
          ✉️ info@topmaster.uz
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark size={24} />
          <LogoWordmark fontSize={14} variant="dark" />
        </div>
        <span className="text-white/20 text-xs">topmaster.uz</span>
      </footer>
    </main>
  );
}

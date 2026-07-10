'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, Task } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from '@/components/Logo';
import { useRequireAuth } from '@/hooks/useRequireAuth';

/* Status pill + dot. Color never carries the meaning alone — the label does. */
const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  published:         { pill: 'bg-brand-tint text-brand-dark',       dot: 'bg-brand' },
  bids_received:     { pill: 'bg-warning-tint text-warning-strong', dot: 'bg-warning' },
  executor_selected: { pill: 'bg-success-tint text-success-strong', dot: 'bg-success' },
  in_progress:       { pill: 'bg-info-tint text-info-strong',       dot: 'bg-info' },
  completed:         { pill: 'bg-success-tint text-success-strong', dot: 'bg-success' },
  cancelled:         { pill: 'bg-error-tint text-error-strong',     dot: 'bg-error' },
};

function timeAgo(iso: string, ago: { justNow: string; minutes: string; hours: string; days: string }) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return ago.justNow;
  if (mins < 60) return `${mins} ${ago.minutes}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${ago.hours}`;
  return `${Math.floor(hours / 24)} ${ago.days}`;
}

export default function MyTasksPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { checked } = useRequireAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checked) return;
    api.tasks.my()
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [checked]);

  const m = t.myTasks;

  if (!checked) {
    return (
      <div className="min-h-screen bg-canvas px-4 py-5 max-w-2xl mx-auto space-y-3" aria-busy aria-label={t.common.loading}>
        <div className="skeleton h-6 w-48 mt-14" />
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-surface border-b border-zinc-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label={t.common.back}
            className="w-11 h-11 shrink-0 rounded-full border border-zinc-200 flex items-center justify-center text-muted hover:text-brand hover:border-brand transition-colors"
          >
            ←
          </button>
          <span className="flex-1">
            <Logo size="sm" />
          </span>
          <LanguageSwitcher />
          <Link
            href="/post-task"
            className="min-h-[44px] flex items-center text-xs font-bold px-3.5 rounded-xl text-brand-dark bg-brand-tint hover:bg-brand-border transition-colors whitespace-nowrap"
          >
            {m.newTask}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-8">
        <div className="mb-4">
          <h1 className="text-xl font-extrabold text-ink">{m.title}</h1>
          <p className="text-sm text-muted mt-0.5">{m.subtitle}</p>
        </div>

        {loading ? (
          <div className="space-y-3" aria-hidden>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl border-2 border-zinc-100 p-4">
                <div className="flex gap-2 mb-3">
                  <div className="skeleton h-6 w-24 rounded-full" />
                  <div className="skeleton h-6 w-28 rounded-full" />
                </div>
                <div className="skeleton h-5 w-3/4 mb-3" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          /* Empty state: an invitation, not a dead end */
          <div className="text-center py-16 animate-fade-up">
            <svg width="150" height="120" viewBox="0 0 150 120" fill="none" aria-hidden className="mx-auto mb-5">
              <rect x="38" y="14" width="74" height="94" rx="10" fill="#fff" stroke="#DDD6FE" strokeWidth="2"/>
              <rect x="60" y="8" width="30" height="14" rx="6" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="2"/>
              <rect x="50" y="36" width="50" height="6" rx="3" fill="#EDE9FE"/>
              <rect x="50" y="50" width="36" height="6" rx="3" fill="#F5F3FF"/>
              <rect x="50" y="64" width="44" height="6" rx="3" fill="#F5F3FF"/>
              <circle cx="112" cy="88" r="18" fill="#7C3AED"/>
              <path d="M112 80v16M104 88h16" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="30" cy="34" r="4" fill="#FCD34D"/>
              <circle cx="124" cy="24" r="3" fill="#A78BFA" opacity="0.6"/>
              <circle cx="24" cy="90" r="3" fill="#DDD6FE"/>
            </svg>
            <p className="font-bold text-ink text-lg">{m.empty.title}</p>
            <p className="text-sm text-muted mt-2 max-w-xs mx-auto">{m.empty.desc}</p>
            <Link
              href="/post-task"
              className="inline-block mt-6 px-8 py-4 rounded-2xl bg-gradient-brand text-white font-bold text-sm btn-press"
            >
              {m.empty.cta}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, i) => {
              const statusLabel =
                (t.taskDetail.statusLabels as Record<string, string>)[task.status] ?? task.status;
              const style = STATUS_STYLES[task.status] ?? { pill: 'bg-zinc-100 text-zinc-600', dot: 'bg-zinc-400' };
              const hasBids = (task.bidCount ?? 0) > 0;
              const awaitingBids = ['published', 'bids_received'].includes(task.status);
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className={`block bg-surface rounded-2xl border-2 border-zinc-100 p-4 shadow-card card-lift hover:border-brand-border hover:shadow-card-hover animate-fade-up ${i < 6 ? `d-${i + 1}` : ''}`}
                >
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${style.pill}`}>
                      <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {statusLabel}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {lang === 'ru' ? task.category.nameRu : task.category.nameUz}
                    </span>
                    <span className="ml-auto text-xs text-muted whitespace-nowrap">
                      {timeAgo(task.createdAt, m.ago)}
                    </span>
                  </div>

                  <p className="font-bold text-ink mb-2.5 leading-snug">{task.title}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {awaitingBids && (
                      hasBids ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark bg-brand-tint px-2.5 py-1 rounded-full">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          {m.bidsLabel}: {task.bidCount}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-muted">{m.noBidsYet}</span>
                      )
                    )}
                    <span className="ml-auto text-sm font-bold text-ink whitespace-nowrap">
                      {task.budgetUzs
                        ? `${task.budgetUzs.toLocaleString()} ${t.currency}`
                        : t.common.negotiable}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

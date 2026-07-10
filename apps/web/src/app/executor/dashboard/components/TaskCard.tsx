'use client';
import Link from 'next/link';
import { FeedTask } from '@/hooks/useTaskFeed';
import { useLanguage } from '@/contexts/LanguageContext';

function timeAgo(dateStr: string, lang: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === 'ru' ? 'Только что' : 'Hozirgina';
  if (mins < 60) return lang === 'ru' ? `${mins} мин назад` : `${mins} daqiqa oldin`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return lang === 'ru' ? `${hrs} ч назад` : `${hrs} soat oldin`;
  return lang === 'ru' ? `${Math.floor(hrs / 24)} дн назад` : `${Math.floor(hrs / 24)} kun oldin`;
}

function formatStart(dateStr: string, lang: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return (lang === 'ru' ? 'Сегодня ' : 'Bugun ') + time;
  if (isTomorrow) return (lang === 'ru' ? 'Завтра ' : 'Ertaga ') + time;
  return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) + ` ${time}`;
}

/* Inline meta icons — SVG, not emoji: emoji render inconsistently across
   budget Android keyboards/webviews and carry no stroke-weight relationship
   to the type around them. */
function IconPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-zinc-400">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-zinc-400">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  );
}

interface Props { task: FeedTask; isNew?: boolean; }

export default function TaskCard({ task, isNew }: Props) {
  const { t, lang } = useLanguage();
  const d = t.dashboard;

  return (
    <Link href={`/tasks/${task.id}`}
      className={`block bg-white rounded-2xl border-2 card-lift group ${
        isNew
          ? 'border-[#7C3AED] shadow-[0_0_16px_rgba(124,58,237,0.15)] animate-fade-up'
          : 'border-zinc-100 hover:border-[#DDD6FE] hover:shadow-card-hover'
      }`}>
      {isNew && (
        <div className="px-4 pt-3 pb-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B21B6] bg-[#EDE9FE] px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-pulse" />
            {d.newTask}
          </span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-[#5B21B6] bg-[#F5F3FF] px-2.5 py-1 rounded-full">
            {task.category.nameUz}
          </span>
          <span className="text-xs text-zinc-400 shrink-0">{timeAgo(task.createdAt, lang)}</span>
        </div>
        <h3 className="font-bold text-[#0D0D1A] mb-3 leading-snug group-hover:text-[#5B21B6] transition-colors">
          {task.title}
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <IconPin />
            {task.isRemote ? t.common.remote : (task.district ?? 'Toshkent')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconClock />
            {formatStart(task.startAt, lang)}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            {task.budgetUzs ? (
              <span className="text-base font-extrabold text-[#0D0D1A] font-display tabular-nums">
                {task.budgetUzs.toLocaleString()}
                <span className="text-xs font-semibold text-zinc-500 ml-1">
                  {t.currency} {lang === 'ru' ? 'до' : 'gacha'}
                </span>
              </span>
            ) : (
              <span className="text-sm text-zinc-500">{d.budgetNone}</span>
            )}
            {task.bidCount > 0 && (
              <span className="ml-2 text-xs font-medium text-[#5B21B6] bg-[#F5F3FF] px-2 py-0.5 rounded-full whitespace-nowrap">
                {task.bidCount} {d.bidsCount}
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-[#7C3AED] flex items-center gap-1 shrink-0">
            {d.bidCta}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

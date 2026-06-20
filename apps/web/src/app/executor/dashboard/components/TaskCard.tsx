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

interface Props { task: FeedTask; isNew?: boolean; }

export default function TaskCard({ task, isNew }: Props) {
  const { t, lang } = useLanguage();
  const d = t.dashboard;

  return (
    <Link href={`/tasks/${task.id}`}
      className={`block bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group ${
        isNew ? 'border-[#7C3AED] shadow-[0_0_16px_rgba(124,58,237,0.15)]' : 'border-zinc-100 hover:border-[#DDD6FE]'
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
          <span>📍 {task.isRemote ? t.common.remote : (task.district ?? 'Toshkent')}</span>
          <span>🕐 {formatStart(task.startAt, lang)}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-between">
          <div>
            {task.budgetUzs ? (
              <span className="text-sm font-bold text-[#0D0D1A]">
                {task.budgetUzs.toLocaleString()} {t.currency} {lang === 'ru' ? 'до' : 'gacha'}
              </span>
            ) : (
              <span className="text-sm text-zinc-400">{d.budgetNone}</span>
            )}
            {task.bidCount > 0 && (
              <span className="ml-2 text-xs text-zinc-400">· {task.bidCount} {d.bidsCount}</span>
            )}
          </div>
          <span className="text-xs font-bold text-[#7C3AED] flex items-center gap-1">
            {d.bidCta}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

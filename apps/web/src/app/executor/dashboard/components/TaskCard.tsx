'use client';
import Link from 'next/link';
import { FeedTask } from '@/hooks/useTaskFeed';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hozirgina';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} soat oldin`;
  return `${Math.floor(hrs / 24)} kun oldin`;
}

function formatStart(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Bugun ${time}`;
  if (isTomorrow) return `Ertaga ${time}`;
  return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) + ` ${time}`;
}

interface Props {
  task: FeedTask;
  isNew?: boolean;
}

export default function TaskCard({ task, isNew }: Props) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className={`block bg-white rounded-2xl border transition-all duration-500 hover:shadow-md ${
        isNew ? 'border-blue-400 shadow-blue-100 shadow-md' : 'border-zinc-200'
      }`}
    >
      {isNew && (
        <div className="px-4 pt-3 pb-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Yangi vazifa!
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            {task.category.nameUz}
          </span>
          <span className="text-xs text-zinc-400 shrink-0">{timeAgo(task.createdAt)}</span>
        </div>

        <h3 className="font-semibold text-zinc-900 mb-3 leading-snug">{task.title}</h3>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-zinc-600">
          <span className="flex items-center gap-1">
            <span>📍</span>
            {task.isRemote ? 'Masofadan' : (task.district ?? 'Toshkent')}
          </span>
          <span className="flex items-center gap-1">
            <span>🕐</span>
            {formatStart(task.startAt)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            {task.budgetUzs ? (
              <span className="text-sm font-semibold text-zinc-900">
                {task.budgetUzs.toLocaleString()} so'm gacha
              </span>
            ) : (
              <span className="text-sm text-zinc-400">Narx kelishiladi</span>
            )}
            {task.bidCount > 0 && (
              <span className="ml-2 text-xs text-zinc-400">
                · {task.bidCount} taklif
              </span>
            )}
          </div>

          <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Taklif berish →
          </span>
        </div>
      </div>
    </Link>
  );
}

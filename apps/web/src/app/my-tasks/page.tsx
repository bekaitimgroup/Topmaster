'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, Task } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from '@/components/Logo';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const STATUS_COLORS: Record<string, string> = {
  published:         'bg-[#EDE9FE] text-[#5B21B6]',
  bids_received:     'bg-amber-100 text-amber-700',
  executor_selected: 'bg-green-100 text-green-700',
  in_progress:       'bg-[#F5F3FF] text-[#7C3AED]',
  completed:         'bg-green-100 text-green-700',
  cancelled:         'bg-red-100 text-red-700',
};

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

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
      </div>
    );
  }

  const m = t.myTasks;
  const dateLocale = lang === 'ru' ? 'ru-RU' : 'uz-UZ';

  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors text-sm"
          >
            ←
          </button>
          <span className="flex-1">
            <Logo size="sm" />
          </span>
          <LanguageSwitcher />
          <Link
            href="/post-task"
            className="text-xs font-bold px-3 py-1.5 rounded-xl text-[#5B21B6] bg-[#EDE9FE] hover:bg-[#DDD6FE] transition-colors whitespace-nowrap"
          >
            {m.newTask}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-8">
        <div className="mb-4">
          <h1 className="text-xl font-extrabold text-[#0D0D1A]">{m.title}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{m.subtitle}</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-zinc-100 p-4 animate-pulse">
                <div className="flex gap-2 mb-3"><div className="h-5 bg-[#F5F3FF] rounded-full w-24" /></div>
                <div className="h-5 bg-zinc-100 rounded w-3/4 mb-3" />
                <div className="h-4 bg-zinc-50 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-bold text-[#0D0D1A] text-lg">{m.empty.title}</p>
            <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto">{m.empty.desc}</p>
            <Link
              href="/post-task"
              className="inline-block mt-6 px-8 py-4 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}
            >
              {m.empty.cta}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const statusLabel =
                (t.taskDetail.statusLabels as Record<string, string>)[task.status] ?? task.status;
              const statusColor = STATUS_COLORS[task.status] ?? 'bg-zinc-100 text-zinc-600';
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="block bg-white rounded-2xl border-2 border-zinc-100 p-4 hover:border-[#DDD6FE] hover:shadow-md transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold text-[#5B21B6] bg-[#F5F3FF] px-2.5 py-1 rounded-full">
                      {lang === 'ru' ? task.category.nameRu : task.category.nameUz}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <p className="font-bold text-[#0D0D1A] mb-1.5">{task.title}</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>
                      {new Date(task.startAt).toLocaleString(dateLocale, {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span>·</span>
                    <span className="font-medium text-zinc-500">
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

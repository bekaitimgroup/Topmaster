'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTaskFeed, FeedFilters } from '@/hooks/useTaskFeed';
import TaskCard from './components/TaskCard';
import FilterBar from './components/FilterBar';

export default function ExecutorDashboard() {
  const [filters, setFilters] = useState<FeedFilters>({});
  const { tasks, loading, newTaskIds } = useTaskFeed(filters);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">topmaster.uz</p>
            <h1 className="font-bold text-zinc-900">Vazifalar tasması</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/executor/subscriptions"
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Obuna
            </Link>
            <Link
              href="/executor/profile"
              className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
            >
              👤
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-100 p-4 animate-pulse">
                <div className="h-3 bg-zinc-100 rounded w-1/4 mb-3" />
                <div className="h-5 bg-zinc-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-zinc-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-zinc-700">Hozircha vazifalar yo'q</p>
            <p className="text-sm text-zinc-400 mt-1">
              Yangi vazifa tushishi bilan siz birinchi bo'lib ko'rasiz
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-400 mb-3">
              {tasks.length} ta vazifa · Yangilanishlar avtomatik
            </p>
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isNew={newTaskIds.has(task.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 safe-area-pb">
        <div className="max-w-2xl mx-auto flex">
          {[
            { href: '/executor/dashboard', icon: '🏠', label: 'Tasma' },
            { href: '/executor/bids', icon: '📋', label: 'Takliflarim' },
            { href: '/executor/earnings', icon: '💰', label: 'Daromad' },
            { href: '/executor/profile', icon: '👤', label: 'Profil' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 text-zinc-400 hover:text-blue-600 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom nav spacer */}
      <div className="h-20" />
    </div>
  );
}

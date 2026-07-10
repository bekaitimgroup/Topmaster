'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTaskFeed, FeedFilters } from '@/hooks/useTaskFeed';
import TaskCard from './components/TaskCard';
import FilterBar from './components/FilterBar';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from '@/components/Logo';

export default function ExecutorDashboard() {
  const [filters, setFilters] = useState<FeedFilters>({});
  const { tasks, loading, newTaskIds } = useTaskFeed(filters);
  const { t } = useLanguage();
  const d = t.dashboard;

  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/executor/subscriptions"
              className="text-xs font-bold px-3 py-1.5 rounded-xl text-[#5B21B6] bg-[#EDE9FE] hover:bg-[#DDD6FE] transition-colors">
              {d.subscriptionBtn}
            </Link>
            <Link href="/executor/profile"
              className="w-9 h-9 rounded-full bg-[#F5F3FF] border-2 border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] hover:border-[#7C3AED] transition-colors font-bold text-sm">
              P
            </Link>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        <p className="text-xs font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
          {d.title} · {d.autoUpdate}
        </p>

        {loading ? (
          <div className="space-y-3" aria-hidden>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-zinc-100 p-4">
                <div className="flex justify-between mb-3">
                  <div className="skeleton h-5 w-24 rounded-full" />
                  <div className="skeleton h-4 w-16" />
                </div>
                <div className="skeleton h-5 w-3/4 mb-3" />
                <div className="skeleton h-4 w-1/2 mb-3" />
                <div className="pt-3 border-t border-zinc-50 flex justify-between">
                  <div className="skeleton h-4 w-28" />
                  <div className="skeleton h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 animate-fade-up">
            {/* Empty-feed illustration: radar sweeping for incoming tasks */}
            <svg width="140" height="120" viewBox="0 0 140 120" fill="none" className="mx-auto mb-5" aria-hidden>
              <circle cx="70" cy="58" r="44" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="4 6"/>
              <circle cx="70" cy="58" r="30" stroke="#DDD6FE" strokeWidth="2"/>
              <circle cx="70" cy="58" r="15" fill="#F5F3FF"/>
              <path d="M70 58 L98 34" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="70" cy="58" r="4" fill="#7C3AED"/>
              <circle cx="98" cy="34" r="5" fill="#7C3AED" opacity="0.85"/>
              <circle cx="44" cy="78" r="3.5" fill="#A78BFA" opacity="0.5"/>
              <circle cx="94" cy="80" r="3" fill="#F59E0B" opacity="0.6"/>
              <rect x="18" y="12" width="26" height="8" rx="4" fill="#EDE9FE"/>
              <rect x="100" y="98" width="22" height="8" rx="4" fill="#EDE9FE"/>
            </svg>
            <p className="font-bold text-[#0D0D1A] text-lg">{d.empty.title}</p>
            <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto">{d.empty.desc}</p>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => setFilters({})}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-bold text-[#5B21B6] bg-[#EDE9FE] hover:bg-[#DDD6FE] btn-press"
              >
                {t.lang === 'ru' ? 'Сбросить фильтры' : 'Filtrlarni tozalash'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} isNew={newTaskIds.has(task.id)} />
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-2xl mx-auto flex">
          {[
            { href: '/executor/dashboard', label: d.nav.feed, active: true,
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
            { href: '/executor/bids',      label: d.nav.bids, active: false,
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
            { href: '/executor/earnings',  label: d.nav.earnings, active: false,
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
            { href: '/executor/profile',   label: d.nav.profile, active: false,
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                item.active ? 'text-[#7C3AED]' : 'text-zinc-400 hover:text-[#7C3AED]'
              }`}>
              {item.icon}
              <span className={`text-[10px] ${item.active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              {item.active && <span className="w-1 h-1 rounded-full bg-[#7C3AED]" />}
            </Link>
          ))}
        </div>
      </nav>
      <div className="h-20" />
    </div>
  );
}

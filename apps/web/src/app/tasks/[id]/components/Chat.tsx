'use client';
import { useEffect, useRef, useState } from 'react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  taskId: string;
  partnerId: string;
  currentUserId: string;
  /** Show the escrow-protection banner (safe_deal tasks) */
  safeDeal?: boolean;
}

/* Group messages by calendar day, and mark bubbles that continue
   a run from the same sender within 5 minutes (tighter spacing,
   timestamp only on the last of the run). */
function buildGroups(messages: ChatMessage[]) {
  const days: { key: string; date: Date; items: (ChatMessage & { compact: boolean; showTime: boolean })[] }[] = [];
  messages.forEach((msg, i) => {
    const d = new Date(msg.createdAt);
    const key = d.toDateString();
    let day = days[days.length - 1];
    if (!day || day.key !== key) {
      day = { key, date: d, items: [] };
      days.push(day);
    }
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const sameRun = (a?: ChatMessage, b?: ChatMessage) =>
      !!a && !!b && a.senderId === b.senderId &&
      Math.abs(new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) < 5 * 60 * 1000 &&
      new Date(a.createdAt).toDateString() === new Date(b.createdAt).toDateString();
    day.items.push({
      ...msg,
      compact: sameRun(prev, msg),
      showTime: !sameRun(msg, next),
    });
  });
  return days;
}

export default function Chat({ taskId, partnerId, currentUserId, safeDeal }: Props) {
  const { messages, loading, partnerTyping, send, emitTyping } = useChat(taskId, partnerId);
  const { t, lang } = useLanguage();
  const c = t.chat;
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef(false);

  const locale = lang === 'ru' ? 'ru-RU' : 'uz-UZ';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      emitTyping(true);
    }
    clearTimeout((handleInput as any)._t);
    (handleInput as any)._t = setTimeout(() => {
      typingRef.current = false;
      emitTyping(false);
    }, 1500);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    send(text);
    setInput('');
    typingRef.current = false;
    emitTyping(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function dayLabel(date: Date) {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    if (date.toDateString() === today.toDateString()) return c.today;
    if (date.toDateString() === yesterday.toDateString()) return c.yesterday;
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border-2 border-zinc-100 p-4 space-y-3" aria-busy aria-label={t.common.loading}>
        <div className="skeleton h-10 w-2/3 rounded-2xl" />
        <div className="skeleton h-10 w-1/2 rounded-2xl ml-auto" />
        <div className="skeleton h-10 w-3/5 rounded-2xl" />
      </div>
    );
  }

  const groups = buildGroups(messages);

  return (
    <div className="bg-surface rounded-2xl border-2 border-zinc-100 flex flex-col h-[480px] overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-canvas">
        {/* Safe-deal banner — persistent, inline, never a popup */}
        {safeDeal && (
          <div className="flex items-start gap-2.5 bg-brand-tint border border-brand-border rounded-2xl px-3.5 py-3 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 mt-0.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <div>
              <p className="text-xs font-bold text-brand-deeper">{c.safeDeal.title}</p>
              <p className="text-xs text-brand-dark mt-0.5 leading-relaxed">{c.safeDeal.desc}</p>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center py-10">
            <svg width="88" height="64" viewBox="0 0 88 64" fill="none" aria-hidden className="mx-auto mb-3">
              <rect x="8" y="6" width="52" height="34" rx="10" fill="#fff" stroke="#DDD6FE" strokeWidth="2"/>
              <path d="M20 40l-2 10 12-10" fill="#fff" stroke="#DDD6FE" strokeWidth="2" strokeLinejoin="round"/>
              <rect x="36" y="24" width="44" height="28" rx="10" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="2"/>
              <circle cx="50" cy="38" r="2.5" fill="#7C3AED"/>
              <circle cx="58" cy="38" r="2.5" fill="#7C3AED"/>
              <circle cx="66" cy="38" r="2.5" fill="#7C3AED"/>
            </svg>
            <p className="text-sm font-bold text-ink">{c.emptyTitle}</p>
            <p className="text-xs text-muted mt-1 max-w-[220px] mx-auto">{c.emptyDesc}</p>
          </div>
        )}

        {groups.map((day) => (
          <div key={day.key}>
            {/* Date divider */}
            <div className="flex items-center justify-center my-3">
              <span className="text-[11px] font-semibold text-muted bg-surface border border-zinc-100 px-3 py-1 rounded-full">
                {dayLabel(day.date)}
              </span>
            </div>

            {day.items.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${msg.compact ? 'mt-0.5' : 'mt-2'}`}>
                  <div
                    className={`max-w-[75%] px-3.5 py-2 text-sm leading-relaxed break-words ${
                      isMine
                        ? `bg-brand text-white rounded-2xl ${msg.showTime ? 'rounded-br-md' : ''}`
                        : `bg-surface text-ink border border-zinc-100 rounded-2xl ${msg.showTime ? 'rounded-bl-md' : ''}`
                    }`}
                  >
                    {msg.content}
                    {msg.showTime && (
                      <span className={`block text-[10px] mt-1 text-right ${isMine ? 'text-white/90' : 'text-muted'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        {isMine && (
                          <span className="ml-1" aria-label={msg.isRead ? c.readLabel : c.sentLabel}>
                            {msg.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {partnerTyping && (
          <div className="flex justify-start mt-2">
            <div className="bg-surface border border-zinc-100 rounded-2xl rounded-bl-md px-3.5 py-2.5">
              <span className="flex gap-1 items-center h-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-brand-light rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-zinc-100 bg-surface flex gap-2 items-end">
        <textarea
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={c.placeholder}
          aria-label={c.placeholder}
          className="flex-1 min-h-[44px] resize-none rounded-xl border-2 border-zinc-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 max-h-24 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label={c.sendLabel}
          className="w-11 h-11 rounded-xl bg-gradient-brand text-white flex items-center justify-center disabled:opacity-40 btn-press shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

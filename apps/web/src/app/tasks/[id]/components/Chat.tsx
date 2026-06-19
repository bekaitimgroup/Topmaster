'use client';
import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';

interface Props {
  taskId: string;
  partnerId: string;
  currentUserId: string;
}

export default function Chat({ taskId, partnerId, currentUserId }: Props) {
  const { messages, loading, partnerTyping, send, emitTyping } = useChat(taskId, partnerId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef(false);

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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-10 bg-zinc-100 rounded-xl w-2/3 ${i % 2 ? 'ml-auto' : ''}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 flex flex-col" style={{ height: '400px' }}>
      <div className="px-4 py-3 border-b border-zinc-100">
        <p className="font-semibold text-sm">💬 Chat</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-sm text-zinc-400 py-8">
            Hali xabar yo'q. Birinchi bo'lib yozing!
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-zinc-100 text-zinc-900 rounded-bl-sm'
                }`}
              >
                {msg.content}
                <p className={`text-[10px] mt-0.5 ${isMine ? 'text-blue-200' : 'text-zinc-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('uz-UZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {isMine && <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>}
                </p>
              </div>
            </div>
          );
        })}
        {partnerTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 rounded-2xl rounded-bl-sm px-3 py-2">
              <span className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
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
      <div className="px-3 py-3 border-t border-zinc-100 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Xabar yozing..."
          className="flex-1 resize-none rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-24"
          style={{ minHeight: '40px' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  taskId: string;
  senderId: string;
  recipientId: string;
  content: string | null;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; fullName: string | null; avatarUrl: string | null };
}

export function useChat(taskId: string, partnerId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history
  useEffect(() => {
    if (!taskId || !partnerId) return;
    const token = localStorage.getItem('token');
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/messages/task/${taskId}/partner/${partnerId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((r) => r.json())
      .then((msgs) => setMessages(Array.isArray(msgs) ? msgs : []))
      .finally(() => setLoading(false));
  }, [taskId, partnerId]);

  // Socket connection
  useEffect(() => {
    if (!taskId || !partnerId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/chat`,
      { auth: { token }, transports: ['websocket'] },
    );
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_chat', { taskId, partnerId });
    });

    socket.on('new_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('partner_typing', ({ isTyping }: { isTyping: boolean }) => {
      setPartnerTyping(isTyping);
      if (isTyping) {
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setPartnerTyping(false), 3000);
      }
    });

    return () => { socket.disconnect(); };
  }, [taskId, partnerId]);

  const send = useCallback((content: string) => {
    socketRef.current?.emit('send_message', { content });
  }, []);

  const emitTyping = useCallback((isTyping: boolean) => {
    socketRef.current?.emit('typing', { isTyping });
  }, []);

  return { messages, loading, partnerTyping, send, emitTyping };
}

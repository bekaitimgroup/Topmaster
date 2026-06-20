'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';

export interface FeedTask {
  id: string;
  title: string;
  category: { id: string; nameUz: string };
  district: string | null;
  isRemote: boolean;
  startAt: string;
  budgetUzs: number | null;
  paymentMethod: string;
  status: string;
  bidCount: number;
  customer: { id: string; fullName: string | null; avatarUrl: string | null } | null;
  createdAt: string;
}

export interface FeedFilters {
  categoryId?: string;
  district?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export function useTaskFeed(filters: FeedFilters = {}) {
  const [tasks, setTasks] = useState<FeedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.district) params.set('district', filters.district);
      if (filters.budgetMin) params.set('budgetMin', String(filters.budgetMin));
      if (filters.budgetMax) params.set('budgetMax', String(filters.budgetMax));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/feed?${params}`,
        { credentials: 'include' },
      );
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }, [filters.categoryId, filters.district, filters.budgetMin, filters.budgetMax]);

  // Initial load + reload on filter change
  useEffect(() => { load(); }, [load]);

  // Socket.io connection
  useEffect(() => {
    const socket = io(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/tasks`,
      { withCredentials: true, transports: ['websocket'] },
    );
    socketRef.current = socket;

    socket.on('new_task', (task: FeedTask) => {
      setTasks((prev) => [task, ...prev]);
      setNewTaskIds((prev) => new Set(prev).add(task.id));
      // Clear highlight after 8 seconds
      setTimeout(() => {
        setNewTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(task.id);
          return next;
        });
      }, 8000);
    });

    return () => { socket.disconnect(); };
  }, []);

  return { tasks, loading, newTaskIds, reload: load };
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    sendOtp: (phone: string) =>
      request('/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      }),
    verifyOtp: (phone: string, code: string, role: string) =>
      request<{ accessToken: string; isNewUser: boolean }>('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, role }),
      }),
    me: () => request('/auth/me'),
  },
  categories: {
    list: () => request<Category[]>('/categories'),
  },
  tasks: {
    create: (formData: FormData) =>
      request<Task>('/tasks', { method: 'POST', body: formData }),
    my: () => request<Task[]>('/tasks/my'),
    get: (id: string) => request<Task>(`/tasks/${id}`),
  },
  executor: {
    register: (formData: FormData) =>
      request('/executor/register', { method: 'POST', body: formData }),
    me: () => request('/executor/me'),
    plans: (categoryId: string) =>
      request<Plan[]>(`/executor/plans?categoryId=${categoryId}`),
  },
};

export interface Category {
  id: string;
  nameUz: string;
  nameRu: string;
  executorCount: number;
  subscriptionPriceUzs: number;
}

export interface Plan {
  id: string;
  label: string;
  bids: number | null;
  days: number;
  priceUzs: number;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  budgetUzs: number | null;
  paymentMethod: string;
  startAt: string;
  category: Category;
  createdAt: string;
}

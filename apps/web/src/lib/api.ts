const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    // Send httpOnly cookie automatically — no manual token handling
    credentials: 'include',
    headers: {
      ...(init.headers ?? {}),
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
      request<{ isNewUser: boolean }>('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, role }),
      }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    telegram: (data: Record<string, unknown>) =>
      request<{ isNewUser: boolean }>('/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    google: (accessToken: string) =>
      request<{ isNewUser: boolean }>('/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      }),
  },
  categories: {
    list: () => request<Category[]>('/categories'),
  },
  stats: {
    get: () => request<Stats>('/stats'),
  },
  cars: {
    makes: () => request<CarMake[]>('/cars/makes'),
    models: (makeId: string) => request<CarModel[]>(`/cars/makes/${makeId}/models`),
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

export interface Stats {
  executorCount: number;
  taskCount: number;
  avgRating: number;
  cityCount: number;
}

export interface SubCategory {
  id: string;
  nameUz: string;
  nameRu: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  nameUz: string;
  nameRu: string;
  executorCount: number;
  subscriptionPriceUzs: number;
  children: SubCategory[];
}

export interface CarMake {
  id: string;
  name: string;
  isLocal: boolean;
  sortOrder: number;
}

export interface CarModel {
  id: string;
  name: string;
  yearFrom: number | null;
  yearTo: number | null;
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

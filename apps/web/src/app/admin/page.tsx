'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API}/api${path}`, {
    ...init,
    headers: { ...authHeader(), 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, color = 'blue' }: { label: string; value: number | string; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

function StatsTab() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { apiFetch('/admin/stats').then(setStats); }, []);
  if (!stats) return <div className="animate-pulse text-zinc-400 py-8 text-center">Yuklanmoqda...</div>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <StatCard label="Jami foydalanuvchilar" value={stats.totalUsers} color="blue" />
      <StatCard label="Ustalar" value={stats.totalExecutors} color="blue" />
      <StatCard label="Jami vazifalar" value={stats.totalTasks} color="green" />
      <StatCard label="Faol vazifalar" value={stats.activeTasks} color="amber" />
      <StatCard label="Bajarildi" value={stats.completedTasks} color="green" />
      <StatCard label="Ochiq nizolar" value={stats.openDisputes} color="red" />
      <StatCard label="Daromad (komissiya)" value={`${stats.totalCommissionUzs.toLocaleString()} so'm`} color="green" />
    </div>
  );
}

function CategoriesTab() {
  const [cats, setCats] = useState<any[]>([]);
  const [form, setForm] = useState({ nameUz: '', nameRu: '', subscriptionPriceUzs: '', sortOrder: '0' });
  const [editing, setEditing] = useState<string | null>(null);

  const load = () => apiFetch('/admin/categories').then(setCats);
  useEffect(() => { load(); }, []);

  async function save() {
    const data = { ...form, subscriptionPriceUzs: Number(form.subscriptionPriceUzs), sortOrder: Number(form.sortOrder) };
    if (editing) {
      await apiFetch(`/admin/categories/${editing}`, { method: 'PATCH', body: JSON.stringify(data) });
    } else {
      await apiFetch('/admin/categories', { method: 'POST', body: JSON.stringify(data) });
    }
    setForm({ nameUz: '', nameRu: '', subscriptionPriceUzs: '', sortOrder: '0' });
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
    load();
  }

  async function toggle(id: string, isActive: boolean) {
    await apiFetch(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }) });
    load();
  }

  function startEdit(cat: any) {
    setEditing(cat.id);
    setForm({ nameUz: cat.nameUz, nameRu: cat.nameRu, subscriptionPriceUzs: String(cat.subscriptionPriceUzs), sortOrder: String(cat.sortOrder) });
  }

  return (
    <div className="space-y-4">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
        <p className="font-semibold text-sm">{editing ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</p>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.nameUz} onChange={e => setForm(f => ({ ...f, nameUz: e.target.value }))} placeholder="Nomi (UZ)" className="input" />
          <input value={form.nameRu} onChange={e => setForm(f => ({ ...f, nameRu: e.target.value }))} placeholder="Nomi (RU)" className="input" />
          <input type="number" value={form.subscriptionPriceUzs} onChange={e => setForm(f => ({ ...f, subscriptionPriceUzs: e.target.value }))} placeholder="Obuna narxi (so'm)" className="input" />
          <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} placeholder="Tartib raqami" className="input" />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="btn-primary">{editing ? 'Saqlash' : 'Qo\'shish'}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ nameUz: '', nameRu: '', subscriptionPriceUzs: '', sortOrder: '0' }); }} className="btn-ghost">Bekor</button>}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Kategoriya</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">Obuna narxi</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">Vazifalar</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">Obunalar</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {cats.map((c) => (
              <tr key={c.id} className={c.isActive ? '' : 'opacity-50'}>
                <td className="px-4 py-3">
                  <p className="font-medium">{c.nameUz}</p>
                  <p className="text-xs text-zinc-400">{c.nameRu}</p>
                </td>
                <td className="px-4 py-3 text-right">{c.subscriptionPriceUzs.toLocaleString()} so'm</td>
                <td className="px-4 py-3 text-right">{c.taskCount}</td>
                <td className="px-4 py-3 text-right">{c.subscriptionCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => startEdit(c)} className="text-blue-600 hover:underline text-xs">Tahrir</button>
                    <button onClick={() => toggle(c.id, c.isActive)} className="text-amber-600 hover:underline text-xs">{c.isActive ? "O'chir" : 'Yoq'}</button>
                    <button onClick={() => remove(c.id)} className="text-red-500 hover:underline text-xs">O'chir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  const [data, setData] = useState<any>({ users: [], total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = () => apiFetch(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`).then(setData);
  useEffect(() => { load(); }, [page, search]);

  async function ban(id: string, isActive: boolean) {
    await apiFetch(`/admin/users/${id}/active`, { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }) });
    load();
  }

  async function setBadge(id: string, badge: string) {
    await apiFetch(`/admin/users/${id}/badge`, { method: 'PATCH', body: JSON.stringify({ badge }) });
    load();
  }

  const BADGES = ['registered', 'verified', 'pro', 'top_master'];

  return (
    <div className="space-y-4">
      <input
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        placeholder="Telefon yoki ism bo'yicha qidirish..."
        className="input w-full"
      />

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Foydalanuvchi</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Rol</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">Reyting</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.users.map((u: any) => (
              <tr key={u.id} className={u.isActive ? '' : 'opacity-50 bg-red-50'}>
                <td className="px-4 py-3">
                  <p className="font-medium">{u.fullName ?? '—'}</p>
                  <p className="text-xs text-zinc-400">{u.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'executor' ? 'bg-blue-100 text-blue-700' :
                    'bg-zinc-100 text-zinc-600'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {u.executorProfile
                    ? `★ ${Number(u.executorProfile.rating).toFixed(1)} · ${u.executorProfile.completedTaskCount} ta`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end items-center">
                    {u.role === 'executor' && (
                      <select
                        value={u.executorProfile?.badge ?? 'registered'}
                        onChange={e => setBadge(u.id, e.target.value)}
                        className="text-xs border border-zinc-200 rounded-lg px-2 py-1"
                      >
                        {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    )}
                    <button onClick={() => ban(u.id, u.isActive)} className={`text-xs hover:underline ${u.isActive ? 'text-red-500' : 'text-green-600'}`}>
                      {u.isActive ? 'Bloklash' : 'Tiklash'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>Jami: {data.total} ta</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg border border-zinc-200 disabled:opacity-40">←</button>
          <span className="px-3 py-1">{page}</span>
          <button disabled={page * 30 >= data.total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg border border-zinc-200 disabled:opacity-40">→</button>
        </div>
      </div>
    </div>
  );
}

function DisputesTab() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [filter, setFilter] = useState('open');
  const [resolving, setResolving] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const load = () => apiFetch(`/admin/disputes?status=${filter}`).then(setDisputes);
  useEffect(() => { load(); }, [filter]);

  async function resolve(id: string, resolution: string) {
    await apiFetch(`/admin/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ adminNotes: notes, resolution }),
    });
    setResolving(null);
    setNotes('');
    load();
  }

  const STATUS_COLORS: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    under_review: 'bg-amber-100 text-amber-700',
    resolved_customer: 'bg-green-100 text-green-700',
    resolved_executor: 'bg-blue-100 text-blue-700',
    resolved_split: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['open', 'under_review', 'resolved_customer', 'resolved_executor'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${filter === s ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-zinc-200'}`}
          >
            {s === 'open' ? 'Ochiq' : s === 'under_review' ? 'Ko\'rib chiqilmoqda' : s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {disputes.length === 0 && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-zinc-400">
            Nizolar yo'q
          </div>
        )}
        {disputes.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-sm">{d.task?.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {d.openedBy?.fullName ?? d.openedBy?.phone} tomonidan ·{' '}
                  {new Date(d.createdAt).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[d.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                {d.status}
              </span>
            </div>

            <p className="text-sm text-zinc-700 bg-zinc-50 rounded-xl px-3 py-2">{d.reason}</p>

            {d.adminNotes && (
              <p className="text-xs text-zinc-500 italic">Admin izohi: {d.adminNotes}</p>
            )}

            {d.status === 'open' && (
              resolving === d.id ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Admin izohi..."
                    rows={2}
                    className="w-full text-sm border border-zinc-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => resolve(d.id, 'resolved_customer')} className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">Mijoz foydasiga</button>
                    <button onClick={() => resolve(d.id, 'resolved_executor')} className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-medium">Usta foydasiga</button>
                    <button onClick={() => resolve(d.id, 'resolved_split')} className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium">Teng bo'lish</button>
                    <button onClick={() => setResolving(null)} className="px-3 py-2 rounded-xl border border-zinc-200 text-sm">Bekor</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setResolving(d.id)} className="w-full py-2 rounded-xl border border-zinc-200 text-sm font-medium hover:bg-zinc-50">
                  Hal qilish
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main admin page ───────────────────────────────────────────────────────────

type Tab = 'stats' | 'categories' | 'users' | 'disputes';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('stats');
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/'); return; }
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(u => {
        if (u.role !== 'admin') { router.replace('/'); return; }
        setAuthorized(true);
      })
      .catch(() => router.replace('/'));
  }, []);

  if (authorized === null) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-400">Tekshirilmoqda...</div>;
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'stats', label: '📊 Statistika' },
    { key: 'categories', label: '🗂 Kategoriyalar' },
    { key: 'users', label: '👥 Foydalanuvchilar' },
    { key: 'disputes', label: '⚖️ Nizolar' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <h1 className="font-bold text-zinc-900">Topmaster Admin</h1>
          <div className="flex gap-1 ml-4">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${tab === t.key ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'stats'      && <StatsTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'users'      && <UsersTab />}
        {tab === 'disputes'   && <DisputesTab />}
      </main>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e4e4e7;
          border-radius: 0.75rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { box-shadow: 0 0 0 2px #2563eb40; border-color: #2563eb; }
        .btn-primary {
          background: #2563eb;
          color: white;
          border-radius: 0.75rem;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-ghost {
          border: 1px solid #e4e4e7;
          border-radius: 0.75rem;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
        }
        .btn-ghost:hover { background: #f4f4f5; }
      `}</style>
    </div>
  );
}

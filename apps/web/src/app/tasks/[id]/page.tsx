'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import BidCard from './components/BidCard';
import BidForm from './components/BidForm';
import Chat from './components/Chat';
import ReviewForm from './components/ReviewForm';

interface Task {
  id: string;
  title: string;
  description: string | null;
  addressA: string | null;
  isRemote: boolean;
  startAt: string;
  budgetUzs: number | null;
  paymentMethod: string;
  status: string;
  bidCount: number;
  category: { id: string; nameUz: string };
  customer: { id: string; fullName: string | null };
}

interface Bid {
  id: string;
  priceUzs: number;
  message: string | null;
  estimatedDurationMins: number | null;
  status: string;
  createdAt: string;
  executor: {
    id: string;
    userId: string;
    badge: string;
    rating: number;
    reviewCount: number;
    completedTaskCount: number;
    user: { fullName: string | null; avatarUrl: string | null };
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  published:         { label: 'Taklif kutilmoqda', color: 'bg-blue-100 text-blue-700' },
  bids_received:     { label: 'Takliflar bor', color: 'bg-amber-100 text-amber-700' },
  executor_selected: { label: 'Usta tanlandi', color: 'bg-green-100 text-green-700' },
  in_progress:       { label: 'Bajarilmoqda', color: 'bg-purple-100 text-purple-700' },
  completed:         { label: 'Bajarildi', color: 'bg-green-100 text-green-700' },
  cancelled:         { label: 'Bekor qilindi', color: 'bg-red-100 text-red-700' },
};

const PAYMENT_LABELS: Record<string, string> = {
  safe_deal: "Xavfsiz to'lov",
  direct: "To'g'ridan-to'g'ri",
  b2b: 'B2B (Aktlar)',
};

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChatPartnerId, setActiveChatPartnerId] = useState<string | null>(null);
  const [myBid, setMyBid] = useState<Bid | null>(null);
  const [payment, setPayment] = useState<{ id: string; status: string; amountUzs: number; commissionUzs: number } | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  async function loadTask() {
    const [taskRes, meRes] = await Promise.all([
      fetch(`${API}/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const taskData = await taskRes.json();
    const meData = await meRes.json();
    setTask(taskData);
    setCurrentUserId(meData.id);
    setUserRole(meData.role);
    setLoading(false);

    // Load payment if task is at payment stage
    if (['executor_selected', 'in_progress', 'completed'].includes(taskData.status)) {
      const payRes = await fetch(`${API}/api/payments/task/${taskData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (payRes.ok) {
        const payData = await payRes.json();
        if (payData) setPayment(payData);
      }
    }
  }

  async function loadBids() {
    if (!currentUserId) return;
    const res = await fetch(`${API}/api/bids/task/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBids(Array.isArray(data) ? data : []);
    if (userRole === 'executor') {
      setMyBid(data.find((b: Bid) => b.executor?.userId === currentUserId) ?? null);
    }
  }

  useEffect(() => { loadTask(); }, [id]);
  useEffect(() => { if (currentUserId) loadBids(); }, [currentUserId]);

  async function handleAccept(bidId: string) {
    await fetch(`${API}/api/bids/${bidId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadTask();
    loadBids();
  }

  async function handleDecline(bidId: string) {
    await fetch(`${API}/api/bids/${bidId}/decline`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadBids();
  }

  async function handleComplete() {
    setCompleteLoading(true);
    try {
      await fetch(`${API}/api/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadTask();
    } finally {
      setCompleteLoading(false);
    }
  }

  async function handlePay() {
    setPayLoading(true);
    setPayError('');
    try {
      const res = await fetch(`${API}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ taskId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Xatolik');
      window.location.href = data.checkoutUrl;
    } catch (e: any) {
      setPayError(e.message);
    } finally {
      setPayLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500">Vazifa topilmadi</p>
      </div>
    );
  }

  const isCustomer = task.customer.id === currentUserId;
  const statusInfo = STATUS_LABELS[task.status] ?? { label: task.status, color: 'bg-zinc-100 text-zinc-600' };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-700">←</button>
          <h1 className="font-semibold text-zinc-900 truncate flex-1">{task.title}</h1>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-8">
        {/* Task info */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
          <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
            {task.category.nameUz}
          </span>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-zinc-400 text-xs mb-0.5">Manzil</p>
              <p className="font-medium">
                {task.isRemote ? 'Masofadan' : task.addressA ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs mb-0.5">Boshlanish</p>
              <p className="font-medium">
                {new Date(task.startAt).toLocaleString('uz-UZ', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs mb-0.5">Byudjet</p>
              <p className="font-medium">
                {task.budgetUzs ? `${task.budgetUzs.toLocaleString()} so'm gacha` : 'Kelishiladi'}
              </p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs mb-0.5">To'lov</p>
              <p className="font-medium">{PAYMENT_LABELS[task.paymentMethod] ?? task.paymentMethod}</p>
            </div>
          </div>

          {task.description && (
            <div>
              <p className="text-zinc-400 text-xs mb-1">Tavsif</p>
              <p className="text-sm text-zinc-700">{task.description}</p>
            </div>
          )}
        </div>

        {/* Escrow payment panel — customer pays after accepting a bid */}
        {isCustomer && task.paymentMethod === 'safe_deal' && task.status === 'executor_selected' && (
          <div className="bg-white rounded-2xl border border-blue-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <div>
                <p className="font-semibold text-sm">Xavfsiz to'lov</p>
                <p className="text-xs text-zinc-500">Pul usta ishni tugataguncha bloklanadi</p>
              </div>
            </div>

            {payment ? (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                payment.status === 'held'     ? 'bg-amber-50 text-amber-700' :
                payment.status === 'released' ? 'bg-green-50 text-green-700' :
                payment.status === 'refunded' ? 'bg-red-50 text-red-700' :
                'bg-zinc-50 text-zinc-600'
              }`}>
                {payment.status === 'held'     && `✓ ${payment.amountUzs.toLocaleString()} so'm to'landi va blokda`}
                {payment.status === 'released' && `✓ ${payment.amountUzs.toLocaleString()} so'm ustaga o'tkazildi`}
                {payment.status === 'refunded' && `↩ ${payment.amountUzs.toLocaleString()} so'm qaytarildi`}
                {payment.status === 'pending'  && `⏳ To'lov kutilmoqda`}
              </div>
            ) : (
              <>
                <div className="text-sm text-zinc-600 bg-zinc-50 rounded-xl px-4 py-3 space-y-1">
                  <div className="flex justify-between">
                    <span>Usta narxi</span>
                    <span className="font-medium">{bids.find(b => b.status === 'accepted')?.priceUzs.toLocaleString() ?? '—'} so'm</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Platforma komissiyasi (10%)</span>
                    <span>{bids.find(b => b.status === 'accepted') ? Math.round(bids.find(b => b.status === 'accepted')!.priceUzs * 0.1).toLocaleString() : '—'} so'm</span>
                  </div>
                </div>
                {payError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{payError}</p>
                )}
                <button
                  onClick={handlePay}
                  disabled={payLoading}
                  className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {payLoading ? "Yo'naltirilmoqda..." : "Payme orqali to'lash →"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Active chat (if opened) */}
        {activeChatPartnerId && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-zinc-700">Muloqot</p>
              <button
                onClick={() => setActiveChatPartnerId(null)}
                className="text-xs text-zinc-400 hover:text-zinc-600"
              >
                Yopish ✕
              </button>
            </div>
            <Chat
              taskId={task.id}
              partnerId={activeChatPartnerId}
              currentUserId={currentUserId!}
            />
          </div>
        )}

        {/* Bid form for executors who haven't bid yet */}
        {!isCustomer && userRole === 'executor' && !myBid && ['published', 'bids_received'].includes(task.status) && (
          <BidForm
            taskId={task.id}
            budgetUzs={task.budgetUzs}
            onSubmitted={() => { loadBids(); }}
          />
        )}

        {/* Executor's own bid status */}
        {!isCustomer && myBid && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-4">
            <p className="text-sm font-medium mb-3">Sizning taklifingiz</p>
            <BidCard
              bid={myBid}
              isCustomer={false}
              taskStatus={task.status}
              onChat={() => setActiveChatPartnerId(task.customer.id)}
            />
          </div>
        )}

        {/* Customer: mark task as complete when in_progress */}
        {isCustomer && task.status === 'in_progress' && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
            <div>
              <p className="font-semibold text-sm">Ish bajarildi?</p>
              <p className="text-xs text-zinc-500 mt-0.5">Usta ishni tugatgandan so'ng tasdiqlang</p>
            </div>
            <button
              onClick={handleComplete}
              disabled={completeLoading}
              className="w-full py-3.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {completeLoading ? 'Saqlanmoqda...' : '✓ Ishni yakunlash'}
            </button>
          </div>
        )}

        {/* Review form — shown after task completed */}
        {task.status === 'completed' && !hasReviewed && (
          <ReviewForm
            taskId={task.id}
            onSubmitted={() => setHasReviewed(true)}
          />
        )}
        {task.status === 'completed' && hasReviewed && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-green-700 font-medium">✓ Rahmat! Bahongiz qabul qilindi</p>
          </div>
        )}

        {/* Bids list for customer */}
        {isCustomer && ['published', 'bids_received'].includes(task.status) && (
          <div>
            <p className="text-sm font-medium text-zinc-700 mb-2">
              Takliflar ({bids.length})
            </p>
            {bids.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
                <p className="text-2xl mb-2">⏳</p>
                <p className="text-sm text-zinc-500">Ustalar takliflarini kutmoqda...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bids.map((bid) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    isCustomer={isCustomer}
                    taskStatus={task.status}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onChat={(executorUserId) => setActiveChatPartnerId(
                      activeChatPartnerId === executorUserId ? null : executorUserId
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

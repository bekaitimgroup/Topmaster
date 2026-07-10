'use client';
import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import BidCard from './components/BidCard';
import BidForm from './components/BidForm';
import Chat from './components/Chat';
import ReviewForm from './components/ReviewForm';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SuccessBurst from '@/components/SuccessBurst';

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

const STATUS_COLORS: Record<string, string> = {
  published:         'bg-[#EDE9FE] text-[#5B21B6]',
  bids_received:     'bg-amber-100 text-amber-700',
  executor_selected: 'bg-green-100 text-green-700',
  in_progress:       'bg-[#F5F3FF] text-[#7C3AED]',
  completed:         'bg-green-100 text-green-700',
  cancelled:         'bg-red-100 text-red-700',
};

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t, lang } = useLanguage();
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
  const [justPosted, setJustPosted] = useState(false);

  // Celebrate freshly posted tasks (?new=1 from the post-task wizard),
  // then clean the URL so refresh doesn't re-celebrate.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') {
      setJustPosted(true);
      params.delete('new');
      const qs = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
    }
  }, []);

  const API = process.env.NEXT_PUBLIC_API_URL;
  const withCreds: RequestInit = { credentials: 'include' };

  async function loadTask() {
    const [taskRes, meRes] = await Promise.all([
      fetch(`${API}/api/tasks/${id}`, withCreds),
      fetch(`${API}/api/auth/me`, withCreds),
    ]);
    // A non-ok response returns an error object, not a Task — it is truthy,
    // so it would pass the `!task` guard and crash at task.customer.id.
    if (!taskRes.ok) {
      setTask(null);
      setLoading(false);
      return;
    }
    const taskData = await taskRes.json();
    const meData = await meRes.json();
    setTask(taskData);
    setCurrentUserId(meData.id);
    setUserRole(meData.role);
    setLoading(false);

    // Load payment if task is at payment stage
    if (['executor_selected', 'in_progress', 'completed'].includes(taskData.status)) {
      const payRes = await fetch(`${API}/api/payments/task/${taskData.id}`, withCreds);
      if (payRes.ok) {
        const payData = await payRes.json();
        if (payData) setPayment(payData);
      }
    }
  }

  async function loadBids() {
    if (!currentUserId) return;
    const res = await fetch(`${API}/api/bids/task/${id}`, withCreds);
    const data = await res.json();
    // Guard once, use the guarded value everywhere — raw `data` may be an
    // error object on non-ok responses, and .find() on it throws.
    const list: Bid[] = Array.isArray(data) ? data : [];
    setBids(list);
    if (userRole === 'executor') {
      setMyBid(list.find((b) => b.executor?.userId === currentUserId) ?? null);
    }
  }

  useEffect(() => { loadTask(); }, [id]);
  useEffect(() => { if (currentUserId) loadBids(); }, [currentUserId]);

  // Poll for new bids while the task is still waiting on offers
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const shouldPoll = task && currentUserId
      && ['published', 'bids_received', 'executor_selected'].includes(task.status);
    if (!shouldPoll) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/tasks/${id}`, withCreds);
        if (res.ok) setTask(await res.json());
        loadBids();
      } catch {}
    }, 8000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [task?.status, currentUserId, id]);

  async function handleAccept(bidId: string) {
    await fetch(`${API}/api/bids/${bidId}/accept`, { method: 'PATCH', credentials: 'include' });
    loadTask();
    loadBids();
  }

  async function handleDecline(bidId: string) {
    await fetch(`${API}/api/bids/${bidId}/decline`, { method: 'PATCH', credentials: 'include' });
    loadBids();
  }

  async function handleComplete() {
    setCompleteLoading(true);
    try {
      await fetch(`${API}/api/tasks/${id}/complete`, { method: 'PATCH', credentials: 'include' });
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      <div className="min-h-screen bg-[#F8F7FF]">
        <header className="bg-white border-b border-zinc-100 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="skeleton h-5 w-48" />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-5 space-y-4" aria-label={t.taskDetail.loading} aria-busy>
          <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 space-y-4">
            <div className="skeleton h-6 w-28 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><div className="skeleton h-3 w-16" /><div className="skeleton h-4 w-24" /></div>
              <div className="space-y-1.5"><div className="skeleton h-3 w-16" /><div className="skeleton h-4 w-28" /></div>
              <div className="space-y-1.5"><div className="skeleton h-3 w-16" /><div className="skeleton h-4 w-32" /></div>
              <div className="space-y-1.5"><div className="skeleton h-3 w-16" /><div className="skeleton h-4 w-20" /></div>
            </div>
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
          <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 space-y-3">
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-16 w-full rounded-xl" />
            <div className="skeleton h-16 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <p className="text-zinc-500">{t.taskDetail.notFound}</p>
      </div>
    );
  }

  const isCustomer = task.customer.id === currentUserId;
  const dateLocale = lang === 'ru' ? 'ru-RU' : 'uz-UZ';
  const td = t.taskDetail;
  const statusLabel = (td.statusLabels as Record<string, string>)[task.status] ?? task.status;
  const statusColor = STATUS_COLORS[task.status] ?? 'bg-zinc-100 text-zinc-600';
  const paymentLabel = (td.paymentLabels as Record<string, string>)[task.paymentMethod] ?? task.paymentMethod;

  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label={lang === 'ru' ? 'Назад' : 'Orqaga'}
            className="w-11 h-11 -my-1.5 shrink-0 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors text-sm"
          >
            ←
          </button>
          <h1 className="font-bold text-[#0D0D1A] truncate flex-1">{task.title}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4 pb-8">
        {/* Celebration — task just posted from the wizard */}
        {justPosted && (
          <div className="bg-white rounded-2xl border-2 border-emerald-100 p-6 flex flex-col items-center text-center animate-scale-in">
            <SuccessBurst
              size={64}
              label={lang === 'ru' ? 'Заявка опубликована!' : 'Buyurtma joylandi!'}
            />
            <p className="text-sm text-zinc-500 mt-1 max-w-xs">
              {lang === 'ru'
                ? 'Мастера уже видят её. Первые предложения обычно приходят в течение 2 часов — мы покажем их здесь.'
                : "Ustalar buyurtmangizni ko'rmoqda. Odatda birinchi takliflar 2 soat ichida keladi — ularni shu yerda ko'rasiz."}
            </p>
          </div>
        )}

        {/* Task info */}
        <div className="bg-white rounded-2xl border-2 border-zinc-100 p-5 space-y-4">
          <span className="inline-block text-xs font-bold text-[#5B21B6] bg-[#F5F3FF] px-2.5 py-1 rounded-full">
            {task.category.nameUz}
          </span>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-zinc-400 text-xs mb-0.5">{td.info.address}</p>
              <p className="font-medium">{task.isRemote ? t.common.remote : task.addressA ?? '—'}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs mb-0.5">{td.info.start}</p>
              <p className="font-medium">
                {new Date(task.startAt).toLocaleString(dateLocale, {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs mb-0.5">{td.info.budget}</p>
              <p className="font-medium">
                {task.budgetUzs
                  ? `${task.budgetUzs.toLocaleString()} ${t.currency} ${td.info.budgetMax}`
                  : t.common.negotiable}
              </p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs mb-0.5">{td.info.payment}</p>
              <p className="font-medium">{paymentLabel}</p>
            </div>
          </div>

          {task.description && (
            <div>
              <p className="text-zinc-400 text-xs mb-1">{td.info.desc}</p>
              <p className="text-sm text-zinc-700">{task.description}</p>
            </div>
          )}
        </div>

        {/* Escrow payment panel */}
        {isCustomer && task.paymentMethod === 'safe_deal' && task.status === 'executor_selected' && (
          <div className="bg-white rounded-2xl border-2 border-[#DDD6FE] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center text-xl">🔒</div>
              <div>
                <p className="font-bold text-[#0D0D1A]">{td.escrow.title}</p>
                <p className="text-xs text-zinc-500">{td.escrow.desc}</p>
              </div>
            </div>

            {payment ? (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                payment.status === 'held'     ? 'bg-amber-50 text-amber-700' :
                payment.status === 'released' ? 'bg-green-50 text-green-700' :
                payment.status === 'refunded' ? 'bg-red-50 text-red-700' :
                'bg-zinc-50 text-zinc-600'
              }`}>
                {payment.status === 'held'     && td.escrow.statusHeld(`${payment.amountUzs.toLocaleString()} ${t.currency}`)}
                {payment.status === 'released' && td.escrow.statusReleased(`${payment.amountUzs.toLocaleString()} ${t.currency}`)}
                {payment.status === 'refunded' && td.escrow.statusRefunded(`${payment.amountUzs.toLocaleString()} ${t.currency}`)}
                {payment.status === 'pending'  && td.escrow.statusPending}
              </div>
            ) : (
              <>
                <div className="text-sm text-zinc-600 bg-zinc-50 rounded-xl px-4 py-3">
                  <div className="flex justify-between">
                    <span>{td.escrow.masterPrice}</span>
                    <span className="font-medium">{bids.find(b => b.status === 'accepted')?.priceUzs.toLocaleString() ?? '—'} {t.currency}</span>
                  </div>
                </div>
                {payError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{payError}</p>
                )}
                <button onClick={handlePay} disabled={payLoading}
                  className="w-full py-4 rounded-2xl text-white font-bold disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
                  {payLoading ? td.escrow.paying : td.escrow.payBtn}
                </button>
              </>
            )}
          </div>
        )}

        {/* Active chat (if opened) */}
        {activeChatPartnerId && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-zinc-700">{td.chat}</p>
              <button onClick={() => setActiveChatPartnerId(null)}
                className="min-h-[44px] px-3 -mr-3 text-xs font-medium text-muted hover:text-ink transition-colors">
                {td.chatClose}
              </button>
            </div>
            <Chat
              taskId={task.id}
              partnerId={activeChatPartnerId}
              currentUserId={currentUserId!}
              safeDeal={task.paymentMethod === 'safe_deal'}
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
            <p className="text-sm font-medium mb-3">{td.myBid}</p>
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
          <div className="bg-white rounded-2xl border-2 border-green-100 p-5 space-y-4">
            <div>
              <p className="font-bold text-[#0D0D1A]">{td.complete.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{td.complete.desc}</p>
            </div>
            <button onClick={handleComplete} disabled={completeLoading}
              className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98]">
              {completeLoading ? t.common.saving : td.complete.btn}
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
            <p className="text-green-700 font-medium">{td.reviewDone}</p>
          </div>
        )}

        {/* Bids list for customer */}
        {isCustomer && ['published', 'bids_received'].includes(task.status) && (
          <div>
            <p className="text-sm font-medium text-zinc-700 mb-2">
              {td.bids.title} ({bids.length})
            </p>
            {bids.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
                <p className="text-2xl mb-2">⏳</p>
                <p className="text-sm text-zinc-500">{td.bids.empty}</p>
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

'use client';

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

const BADGE_LABELS: Record<string, string> = {
  registered: '●',
  verified: '✓',
  top_master: '🏆',
  pro: '⭐',
};

const DURATION_LABELS: Record<number, string> = {
  60: '1 soat',
  120: '2 soat',
  180: '3 soat',
  240: '4 soat',
  480: 'Yarim kun',
  720: '¾ kun',
  960: 'Butun kun',
};

interface Props {
  bid: Bid;
  isCustomer: boolean;
  taskStatus: string;
  onAccept?: (bidId: string) => void;
  onDecline?: (bidId: string) => void;
  onChat?: (executorUserId: string) => void;
}

export default function BidCard({ bid, isCustomer, taskStatus, onAccept, onDecline, onChat }: Props) {
  const canAct = isCustomer && bid.status === 'pending' && taskStatus === 'bids_received';
  const durationLabel = bid.estimatedDurationMins
    ? DURATION_LABELS[bid.estimatedDurationMins] ?? `${bid.estimatedDurationMins} daqiqa`
    : null;

  const statusColors: Record<string, string> = {
    pending: 'text-zinc-500 bg-zinc-100',
    accepted: 'text-green-700 bg-green-100',
    declined: 'text-red-600 bg-red-100',
    withdrawn: 'text-zinc-400 bg-zinc-100',
  };

  return (
    <div className={`rounded-2xl border p-4 ${bid.status === 'accepted' ? 'border-green-300 bg-green-50' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-semibold text-zinc-600 shrink-0">
            {bid.executor.user.fullName?.[0] ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-sm">
              {bid.executor.user.fullName ?? 'Usta'}
              {' '}
              <span className="text-base">{BADGE_LABELS[bid.executor.badge]}</span>
            </p>
            <p className="text-xs text-zinc-500">
              {bid.executor.reviewCount > 0
                ? `★ ${bid.executor.rating.toFixed(1)} · ${bid.executor.reviewCount} izoh`
                : 'Yangi usta'}
              {bid.executor.completedTaskCount > 0 && ` · ${bid.executor.completedTaskCount} ta bajarilgan`}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="font-bold text-zinc-900">{bid.priceUzs.toLocaleString()} so'm</p>
          {durationLabel && <p className="text-xs text-zinc-400">{durationLabel}</p>}
        </div>
      </div>

      {bid.message && (
        <p className="mt-3 text-sm text-zinc-700 bg-zinc-50 rounded-xl px-3 py-2">
          {bid.message}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        {bid.status !== 'pending' && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[bid.status]}`}>
            {bid.status === 'accepted' ? 'Qabul qilindi' : bid.status === 'declined' ? 'Rad etildi' : 'Bekor qilindi'}
          </span>
        )}

        {canAct && (
          <>
            <button
              onClick={() => onAccept?.(bid.id)}
              className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Qabul qilish
            </button>
            <button
              onClick={() => onDecline?.(bid.id)}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              Rad etish
            </button>
          </>
        )}

        {(bid.status === 'accepted' || bid.status === 'pending') && (
          <button
            onClick={() => onChat?.(bid.executor.userId)}
            className="ml-auto px-3 py-2 rounded-xl border border-zinc-200 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
          >
            💬 Yozish
          </button>
        )}
      </div>
    </div>
  );
}

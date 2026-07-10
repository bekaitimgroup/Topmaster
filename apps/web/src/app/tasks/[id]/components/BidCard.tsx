'use client';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface Props {
  bid: Bid;
  isCustomer: boolean;
  taskStatus: string;
  onAccept?: (bidId: string) => void;
  onDecline?: (bidId: string) => void;
  onChat?: (executorUserId: string) => void;
}

export default function BidCard({ bid, isCustomer, taskStatus, onAccept, onDecline, onChat }: Props) {
  const { t } = useLanguage();
  const bc = t.bidCard;

  const canAct = isCustomer && bid.status === 'pending' && taskStatus === 'bids_received';

  const durationLabel = bid.estimatedDurationMins
    ? (bc.durations as Record<number, string>)[bid.estimatedDurationMins]
      ?? `${bid.estimatedDurationMins} ${bc.mins}`
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
        {/* Name + avatar link to the public master profile */}
        <Link href={`/masters/${bid.executor.userId}`}
          className="flex items-center gap-3 min-w-0 group rounded-xl -m-1 p-1">
          {bid.executor.user.avatarUrl ? (
            <img src={bid.executor.user.avatarUrl} alt=""
              className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-tint flex items-center justify-center font-semibold text-brand-dark shrink-0" aria-hidden>
              {bid.executor.user.fullName?.[0] ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate group-hover:text-brand transition-colors">
              {bid.executor.user.fullName ?? bc.masterDefault}
              {' '}
              <span className="text-base">{BADGE_LABELS[bid.executor.badge]}</span>
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {bid.executor.reviewCount > 0
                ? `★ ${bid.executor.rating.toFixed(1)} · ${bid.executor.reviewCount} ${bc.reviews}`
                : bc.newMaster}
              {bid.executor.completedTaskCount > 0 && ` · ${bid.executor.completedTaskCount} ${bc.completed}`}
            </p>
          </div>
        </Link>

        <div className="text-right shrink-0">
          <p className="font-bold text-zinc-900">{bid.priceUzs.toLocaleString()} {t.currency}</p>
          {durationLabel && <p className="text-xs text-zinc-400">{durationLabel}</p>}
        </div>
      </div>

      {bid.message && (
        <p className="mt-3 text-sm text-zinc-700 bg-zinc-50 rounded-xl px-3 py-2">{bid.message}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        {bid.status !== 'pending' && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[bid.status]}`}>
            {bid.status === 'accepted' ? bc.accepted
              : bid.status === 'declined' ? bc.declined
              : bc.withdrawn}
          </span>
        )}

        {canAct && (
          <>
            <button onClick={() => onAccept?.(bid.id)}
              className="flex-1 min-h-[44px] py-2 rounded-xl bg-gradient-brand text-white text-sm font-bold btn-press">
              {bc.accept}
            </button>
            <button onClick={() => onDecline?.(bid.id)}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium hover:bg-zinc-50 transition-colors">
              {bc.decline}
            </button>
          </>
        )}

        {(bid.status === 'accepted' || bid.status === 'pending') && (
          <button onClick={() => onChat?.(bid.executor.userId)}
            className="ml-auto min-h-[44px] px-3 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-brand hover:bg-brand-tint transition-colors">
            💬 {bc.chat}
          </button>
        )}
      </div>
    </div>
  );
}

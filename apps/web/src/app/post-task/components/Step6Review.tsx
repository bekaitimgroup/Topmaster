'use client';
import { useLanguage } from '@/contexts/LanguageContext';

interface FormData {
  categoryId: string; categoryName: string; title: string;
  addressA: string; addressB: string; isRemote: boolean;
  date: string; time: string; description: string;
  budgetUzs: string; paymentMethod: string; photos: File[];
}
interface Props {
  data: FormData; onSubmit: () => void; onBack: () => void;
  loading: boolean; error: string;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 border-b border-zinc-100 last:border-0 gap-4">
      <span className="text-sm text-zinc-400 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-[#0D0D1A] text-right">{value}</span>
    </div>
  );
}

export default function Step6Review({ data, onSubmit, onBack, loading, error }: Props) {
  const { t, lang } = useLanguage();
  const s = t.postTask.step6;
  const r = s.rows;

  const locale = lang === 'ru' ? 'ru-RU' : 'uz-UZ';
  const dateStr = data.date && data.time
    ? new Date(`${data.date}T${data.time}`).toLocaleString(locale, {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      })
    : '—';

  const methodLabel = (t.postTask.methodLabels as Record<string, string>)[data.paymentMethod] ?? data.paymentMethod;

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0D0D1A] mb-1">{s.title}</h2>
        <p className="text-sm text-zinc-500">{s.subtitle}</p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-zinc-100 px-5 py-2">
        <Row label={r.category} value={data.categoryName || '—'} />
        <Row label={r.title}    value={data.title || '—'} />
        <Row label={r.address}  value={data.isRemote ? `🌐 ${t.common.remote}` : data.addressA || '—'} />
        {data.addressB && <Row label={r.addressB} value={data.addressB} />}
        <Row label={r.time}    value={dateStr} />
        {data.description && <Row label={r.desc} value={data.description} />}
        <Row label={r.budget}
          value={data.budgetUzs
            ? `${Number(data.budgetUzs).toLocaleString()} ${t.currency} ${r.budgetMax}`
            : r.budgetNone} />
        <Row label={r.payment} value={methodLabel} />
        {data.photos.length > 0 && <Row label={r.photos} value={`${data.photos.length} ${r.photosCount}`} />}
      </div>

      <div className="bg-[#F5F3FF] rounded-2xl p-4 border border-[#DDD6FE]">
        <p className="text-sm font-bold text-[#5B21B6]">{s.notice}</p>
        <p className="text-xs text-[#7C3AED] mt-0.5">{s.noticeDesc}</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3 border border-red-100">{error}</p>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading}
          className="flex-1 py-4 rounded-2xl border-2 border-zinc-200 font-bold text-sm text-zinc-600 hover:bg-zinc-50 transition-all disabled:opacity-40">
          {t.common.back}
        </button>
        <button onClick={onSubmit} disabled={loading}
          className="flex-1 py-4 rounded-2xl text-white font-bold text-sm disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {s.submitting}
            </span>
          ) : s.submitBtn}
        </button>
      </div>
    </div>
  );
}

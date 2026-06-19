'use client';

interface FormData {
  categoryId: string;
  categoryName: string;
  title: string;
  addressA: string;
  addressB: string;
  isRemote: boolean;
  date: string;
  time: string;
  description: string;
  budgetUzs: string;
  paymentMethod: string;
  photos: File[];
}

interface Props {
  data: FormData;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error: string;
}

const METHOD_LABELS: Record<string, string> = {
  safe_deal: "Xavfsiz to'lov",
  direct: "To'g'ridan-to'g'ri",
  b2b: 'B2B (Aktlar)',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-zinc-100 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function Step6Review({ data, onSubmit, onBack, loading, error }: Props) {
  const dateStr = data.date && data.time
    ? new Date(`${data.date}T${data.time}`).toLocaleString('uz-UZ', {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Tekshiring va joylang</h2>
        <p className="text-sm text-zinc-500">Barcha ma'lumotlar to'g'rimi?</p>
      </div>

      <div className="bg-zinc-50 rounded-xl p-4">
        <Row label="Kategoriya" value={data.categoryName || '—'} />
        <Row label="Sarlavha" value={data.title || '—'} />
        <Row label="Manzil" value={data.isRemote ? 'Masofadan' : data.addressA || '—'} />
        {data.addressB && <Row label="Manzil B" value={data.addressB} />}
        <Row label="Vaqt" value={dateStr} />
        {data.description && <Row label="Tavsif" value={data.description} />}
        <Row
          label="Byudjet"
          value={
            data.budgetUzs
              ? `${Number(data.budgetUzs).toLocaleString()} so'm gacha`
              : "Belgilanmagan"
          }
        />
        <Row label="To'lov" value={METHOD_LABELS[data.paymentMethod] ?? data.paymentMethod} />
        {data.photos.length > 0 && (
          <Row label="Rasmlar" value={`${data.photos.length} ta`} />
        )}
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-blue-800 font-medium">Taxminiy javob vaqti</p>
        <p className="text-xs text-blue-600 mt-0.5">
          Sizning vazifangiz 10 soniyada ustalar tasmasiga tushadi
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3.5 rounded-xl border border-zinc-200 font-medium text-sm hover:bg-zinc-50 transition-colors disabled:opacity-40"
        >
          Orqaga
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-60 hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Joylanyapti...' : 'Vazifani joylash'}
        </button>
      </div>
    </div>
  );
}

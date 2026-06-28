import type { CheckoutItem } from "@/lib/checkout/storage";
import { formatPrice } from "@/lib/utils";

interface OrderSummaryCardProps {
  items: CheckoutItem[];
  currency: string;
  urgencyNote?: string | null;
  showContinue?: boolean;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}

export function OrderSummaryCard({
  items,
  currency,
  urgencyNote,
  showContinue,
  onContinue,
  continueLabel = "Continue",
  continueDisabled,
}: OrderSummaryCardProps) {
  const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {urgencyNote && (
        <p className="mb-4 border-l-4 border-pink-400 pl-3 text-sm font-medium text-pink-700">
          {urgencyNote}
        </p>
      )}

      <h2 className="text-lg font-bold text-slate-900">Order summary</h2>

      {items.map((item) => (
        <div
          key={`${item.listingId ?? item.categoryId}-${item.categoryName}`}
          className="mt-4 border-b border-slate-100 pb-4 last:border-0"
        >
          <p className="font-semibold text-slate-900">{item.categoryName}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {item.quantity} ticket{item.quantity !== 1 ? "s" : ""} · Seated together
          </p>
        </div>
      ))}

      <dl className="mt-2 space-y-2 text-sm">
        {items.map((item) => (
          <div
            key={`line-${item.listingId ?? item.categoryId}-${item.categoryName}`}
            className="flex justify-between gap-4"
          >
            <dt className="min-w-0 text-slate-600">
              Tickets · {item.quantity} × {formatPrice(item.unitPrice, currency)}
            </dt>
            <dd className="shrink-0 font-medium text-slate-900">
              {formatPrice(item.quantity * item.unitPrice, currency)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-bold text-slate-900">
        <span>Total price</span>
        <span className="text-lg">{formatPrice(subtotal, currency)}</span>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {totalTickets} ticket{totalTickets !== 1 ? "s" : ""} · fees included in ticket price
      </p>

      {showContinue && onContinue && (
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className="mt-5 w-full rounded-lg bg-emerald-600 py-3.5 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {continueLabel}
        </button>
      )}
    </div>
  );
}

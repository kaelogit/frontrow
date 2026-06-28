"use client";

import { Loader2 } from "lucide-react";
import type { CheckoutItem } from "@/lib/checkout/storage";
import { formatPrice } from "@/lib/utils";

interface MobileCheckoutBarProps {
  items: CheckoutItem[];
  currency: string;
  primaryLabel: string;
  onPrimary?: () => void;
  formId?: string;
  primaryDisabled?: boolean;
  loading?: boolean;
}

export function MobileCheckoutBar({
  items,
  currency,
  primaryLabel,
  onPrimary,
  formId,
  primaryDisabled,
  loading,
}: MobileCheckoutBarProps) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 pb-safe">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">
            {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
          </p>
          <p className="text-lg font-bold text-slate-900">{formatPrice(subtotal, currency)}</p>
        </div>
        <button
          type={formId ? "submit" : "button"}
          form={formId}
          onClick={formId ? undefined : onPrimary}
          disabled={primaryDisabled || loading}
          className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

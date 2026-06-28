"use client";

import { useState } from "react";
import { Minus, Plus, Shield } from "lucide-react";
import type { EventWithRelations, TicketCategory } from "@/types/database";
import { formatPrice, cn } from "@/lib/utils";

interface TicketSelectorProps {
  event: EventWithRelations;
  partySize?: number;
  onCheckout: (selections: Record<string, number>) => void;
}

export function TicketSelector({ event, partySize, onCheckout }: TicketSelectorProps) {
  const categories = (event.ticket_categories ?? []).filter(
    (cat) => !partySize || cat.quantity_available >= partySize
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const setQty = (id: string, qty: number, max: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(max, qty)),
    }));
  };

  const total = categories.reduce((sum, cat) => {
    const qty = quantities[cat.id] ?? 0;
    return sum + qty * cat.price;
  }, 0);

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const hasSelection = partySize
    ? totalTickets === partySize
    : totalTickets > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {categories.map((cat) => (
          <CategoryRow
            key={cat.id}
            category={cat}
            currency={event.currency}
            quantity={quantities[cat.id] ?? 0}
            partySize={partySize}
            onChange={(qty) =>
              setQty(
                cat.id,
                qty,
                partySize ? Math.min(cat.quantity_available, partySize) : cat.quantity_available
              )
            }
          />
        ))}
      </div>

      {hasSelection && (
        <div className="sticky bottom-4 rounded-2xl border border-sky-200 bg-sky-50 p-5 pb-safe shadow-lg shadow-sky-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-600">
                {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {formatPrice(total, event.currency)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCheckout(quantities)}
              className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-md hover:brightness-105"
            >
              Continue
            </button>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Shield className="h-3.5 w-3.5 text-sky-500" />
            Secure booking · E-ticket delivery
          </p>
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  currency,
  quantity,
  partySize,
  onChange,
}: {
  category: TicketCategory;
  currency: string;
  quantity: number;
  partySize?: number;
  onChange: (qty: number) => void;
}) {
  const soldOut = category.quantity_available <= 0;
  const lowStock = category.quantity_available > 0 && category.quantity_available <= 10;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-slate-50 p-4 transition",
        quantity > 0 && "border-sky-300 bg-sky-50/50"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900">{category.name}</h4>
            {category.section && (
              <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                {category.section}
              </span>
            )}
          </div>
          {category.description && (
            <p className="mt-1 text-sm text-slate-500">{category.description}</p>
          )}
          <p className="mt-2 text-lg font-bold text-sky-600">
            {formatPrice(category.price, currency)}
          </p>
          {soldOut ? (
            <p className="mt-1 text-xs font-medium text-red-600">Sold out</p>
          ) : lowStock ? (
            <p className="mt-1 text-xs font-medium text-amber-600">
              Only {category.quantity_available} left
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              {category.quantity_available} available
            </p>
          )}
        </div>

        {!soldOut && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange(quantity - 1)}
              disabled={quantity <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center font-semibold text-slate-900">{quantity}</span>
            <button
              type="button"
              onClick={() => onChange(quantity + 1)}
              disabled={
                quantity >= category.quantity_available ||
                (partySize != null && quantity >= partySize)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

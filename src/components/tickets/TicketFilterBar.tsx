"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { SortOption } from "@/lib/tickets/filters";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price", label: "Price" },
  { value: "best_deal", label: "Best deal" },
  { value: "best_view", label: "Best view" },
];

interface TicketFilterBarProps {
  ticketCount: number;
  onTicketCountChange: (n: number) => void;
  minPrice: number;
  maxPrice: number;
  priceMin: number;
  priceMax: number;
  onPriceRangeChange: (min: number, max: number) => void;
  currency: string;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  resultCount: number;
}

function TicketQuantitySelect({
  ticketCount,
  onTicketCountChange,
  className = "",
}: {
  ticketCount: number;
  onTicketCountChange: (n: number) => void;
  className?: string;
}) {
  return (
    <select
      value={ticketCount}
      onChange={(e) => onTicketCountChange(Number(e.target.value))}
      className={`h-9 min-w-0 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 ${className}`}
      aria-label="Number of tickets"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <option key={n} value={n}>
          {n} ticket{n > 1 ? "s" : ""}
        </option>
      ))}
    </select>
  );
}

function PriceRangeButton({
  minPrice,
  maxPrice,
  priceMin,
  priceMax,
  onPriceRangeChange,
  currency,
  className = "",
}: {
  minPrice: number;
  maxPrice: number;
  priceMin: number;
  priceMax: number;
  onPriceRangeChange: (min: number, max: number) => void;
  currency: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const atFullRange = priceMin <= minPrice && priceMax >= maxPrice;
  const label = atFullRange
    ? `${formatPrice(minPrice, currency)} – ${formatPrice(maxPrice, currency)}+`
    : `${formatPrice(priceMin, currency)} – ${formatPrice(priceMax, currency)}${priceMax >= maxPrice ? "+" : ""}`;

  return (
    <div ref={ref} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full min-w-0 items-center justify-between gap-1 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800"
      >
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:left-0 sm:right-auto">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Price range</p>
          <div className="space-y-2">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceMin}
              onChange={(e) =>
                onPriceRangeChange(Math.min(Number(e.target.value), priceMax - 1), priceMax)
              }
              className="w-full accent-sky-600"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceMax}
              onChange={(e) =>
                onPriceRangeChange(priceMin, Math.max(Number(e.target.value), priceMin + 1))
              }
              className="w-full accent-sky-600"
            />
          </div>
          <p className="mt-2 text-center text-xs text-slate-500">
            {formatPrice(priceMin, currency)} – {formatPrice(priceMax, currency)}
          </p>
        </div>
      )}
    </div>
  );
}

function SortButton({
  sort,
  onSortChange,
  className = "",
}: {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Recommended";

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full min-w-0 items-center justify-between gap-1 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800"
      >
        <span className="truncate">Sort: {current}</span>
        <span className="shrink-0 text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[200px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSortChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                sort === opt.value ? "font-semibold text-brand-700" : "text-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FiltersButton({
  onOpenFilters,
  activeFilterCount,
  className = "",
}: {
  onOpenFilters: () => void;
  activeFilterCount: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpenFilters}
      className={`relative flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand-700 ${className}`}
    >
      <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
      <span>Filters</span>
      {activeFilterCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

export function TicketFilterBar({
  ticketCount,
  onTicketCountChange,
  minPrice,
  maxPrice,
  priceMin,
  priceMax,
  onPriceRangeChange,
  currency,
  sort,
  onSortChange,
  onOpenFilters,
  activeFilterCount,
  resultCount,
}: TicketFilterBarProps) {
  return (
    <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
      {/* Mobile: 2 rows — ticket + price, then sort + filters */}
      <div className="flex flex-col gap-1.5 lg:hidden">
        <div className="grid grid-cols-2 gap-1.5">
          <TicketQuantitySelect
            ticketCount={ticketCount}
            onTicketCountChange={onTicketCountChange}
          />
          <PriceRangeButton
            minPrice={minPrice}
            maxPrice={maxPrice}
            priceMin={priceMin}
            priceMax={priceMax}
            onPriceRangeChange={onPriceRangeChange}
            currency={currency}
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <SortButton sort={sort} onSortChange={onSortChange} />
          <FiltersButton onOpenFilters={onOpenFilters} activeFilterCount={activeFilterCount} />
        </div>
      </div>

      {/* Desktop: single row with ticket count */}
      <div className="hidden items-center gap-2 lg:flex">
        <TicketQuantitySelect
          ticketCount={ticketCount}
          onTicketCountChange={onTicketCountChange}
          className="shrink-0"
        />
        <PriceRangeButton
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceRangeChange={onPriceRangeChange}
          currency={currency}
          className="shrink-0"
        />
        <SortButton sort={sort} onSortChange={onSortChange} className="shrink-0" />
        <FiltersButton
          onOpenFilters={onOpenFilters}
          activeFilterCount={activeFilterCount}
          className="shrink-0"
        />
        <p className="ml-auto shrink-0 text-sm font-semibold text-brand-800">
          {resultCount} ticket{resultCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

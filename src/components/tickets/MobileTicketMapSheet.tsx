"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type SheetSnap = "peek" | "expanded";

const PEEK_HEIGHT = 0.44;
const EXPANDED_HEIGHT = 0.9;

interface MobileTicketMapSheetProps {
  map: ReactNode;
  resultCount: number;
  ticketCount: number;
  onTicketCountChange: (n: number) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  onSnapChange?: (snap: SheetSnap) => void;
  children: ReactNode;
  listRef?: RefObject<HTMLDivElement | null>;
  onListScroll?: () => void;
}

export function MobileTicketMapSheet({
  map,
  resultCount,
  ticketCount,
  onTicketCountChange,
  activeFilterCount,
  onOpenFilters,
  onSnapChange,
  children,
  listRef,
  onListScroll,
}: MobileTicketMapSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState<SheetSnap>("peek");
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const baseHeight = snap === "expanded" ? EXPANDED_HEIGHT : PEEK_HEIGHT;
  const sheetHeight = dragHeight ?? baseHeight;

  const setSnapState = useCallback(
    (next: SheetSnap) => {
      setSnap(next);
      onSnapChange?.(next);
    },
    [onSnapChange]
  );

  const heightToSnap = useCallback((ratio: number): SheetSnap => {
    const mid = (PEEK_HEIGHT + EXPANDED_HEIGHT) / 2;
    return ratio >= mid ? "expanded" : "peek";
  }, []);

  const onDragStart = useCallback(
    (clientY: number) => {
      const containerH = containerRef.current?.clientHeight ?? 1;
      dragRef.current = {
        startY: clientY,
        startHeight: dragHeight ?? baseHeight,
      };
      setDragHeight(dragRef.current.startHeight);
    },
    [baseHeight, dragHeight]
  );

  const onDragMove = useCallback((clientY: number) => {
    const drag = dragRef.current;
    const containerH = containerRef.current?.clientHeight ?? 1;
    if (!drag) return;
    const delta = drag.startY - clientY;
    const next = Math.min(
      EXPANDED_HEIGHT + 0.02,
      Math.max(0.28, drag.startHeight + delta / containerH)
    );
    setDragHeight(next);
  }, []);

  const onDragEnd = useCallback(() => {
    if (dragHeight == null) {
      dragRef.current = null;
      return;
    }
    setSnapState(heightToSnap(dragHeight));
    setDragHeight(null);
    dragRef.current = null;
  }, [dragHeight, heightToSnap, setSnapState]);

  const onHandlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    onDragStart(e.clientY);
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    onDragMove(e.clientY);
  };

  const onHandlePointerUp = () => {
    onDragEnd();
  };

  const toggleSnap = () => {
    setSnapState(snap === "expanded" ? "peek" : "expanded");
  };

  useEffect(() => {
    setDragHeight(null);
  }, [snap]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-0 flex-1 lg:hidden"
    >
      <div className="absolute inset-0 bg-slate-100">{map}</div>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-2xl bg-white",
          "shadow-[0_-10px_40px_rgba(15,23,42,0.14)]",
          dragRef.current ? "" : "transition-[height] duration-300 ease-out"
        )}
        style={{ height: `${sheetHeight * 100}%` }}
      >
        <div
          className="flex shrink-0 touch-none flex-col items-center"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        >
          <button
            type="button"
            onClick={toggleSnap}
            className="flex w-full flex-col items-center pt-2.5 pb-1"
            aria-label={snap === "expanded" ? "Show map" : "Expand ticket list"}
          >
            <span className="h-1 w-11 rounded-full bg-slate-300" />
          </button>

          <div className="flex w-full items-center justify-between gap-2 px-4 pb-3">
            <p className="text-sm font-semibold text-slate-900">
              {resultCount} ticket{resultCount !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenFilters}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
                aria-label="Filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <select
                value={ticketCount}
                onChange={(e) => onTicketCountChange(Number(e.target.value))}
                className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800"
                aria-label="Number of tickets"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} ticket{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div
          ref={listRef}
          onScroll={onListScroll}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 pb-6 pt-1"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

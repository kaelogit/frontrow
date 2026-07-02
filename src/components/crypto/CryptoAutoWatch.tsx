"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { CryptoPaymentId } from "@/lib/crypto/payment-options";

interface CryptoAutoWatchProps {
  reference: string;
  offerToken?: string;
  paymentId: CryptoPaymentId;
  totalUsd: number;
  expiresAt?: string;
  onPaid: () => void;
}

export function CryptoAutoWatch({
  reference,
  offerToken,
  paymentId,
  totalUsd,
  expiresAt,
  onPaid,
}: CryptoAutoWatchProps) {
  const paidRef = useRef(false);

  useEffect(() => {
    paidRef.current = false;
    let cancelled = false;

    async function register() {
      await fetch("/api/checkout/crypto/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          offerToken,
          paymentId,
          totalUsd,
          expiresAt,
        }),
      });
    }

    async function poll() {
      const params = new URLSearchParams({ reference });
      if (offerToken) params.set("offerToken", offerToken);
      const res = await fetch(`/api/checkout/crypto/watch?${params}`);
      const data = (await res.json()) as { status?: string };
      if (cancelled || paidRef.current) return;
      if (data.status === "paid") {
        paidRef.current = true;
        onPaid();
      }
    }

    void register();
    const id = setInterval(() => void poll(), 12_000);
    void poll();

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [reference, offerToken, paymentId, totalUsd, expiresAt, onPaid]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
      <span>
        Watching for your payment on-chain (1 confirmation). You&apos;ll be redirected automatically.
      </span>
    </div>
  );
}

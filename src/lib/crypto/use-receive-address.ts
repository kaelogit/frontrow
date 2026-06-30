"use client";

import { useEffect, useState } from "react";

export function useCryptoReceiveAddress(paymentId: string | null) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(paymentId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setAddress(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(
      `/api/checkout/crypto/receive-address?paymentId=${encodeURIComponent(paymentId)}`
    )
      .then(async (res) => {
        const data = (await res.json()) as { address?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Address not available");
        return data.address!;
      })
      .then((addr) => {
        if (!cancelled) setAddress(addr);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Address not available");
          setAddress(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  return { address, loading, error };
}

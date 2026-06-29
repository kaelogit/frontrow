"use client";

import { useCallback, useState } from "react";
import QRCode from "react-qr-code";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CryptoReceiveAddressCardProps {
  address: string;
  /** QR payload — payment URI when supported, otherwise the raw address */
  qrValue?: string;
  title?: string;
  amountLabel?: string;
  hint?: string;
  className?: string;
}

export function CryptoReceiveAddressCard({
  address,
  qrValue,
  title = "Our receive address",
  amountLabel,
  hint = "Scan with your wallet, or tap the address to copy",
  className,
}: CryptoReceiveAddressCardProps) {
  const [copied, setCopied] = useState(false);
  const scanValue = qrValue ?? address;

  const copyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("textarea");
      input.value = address;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 text-sm",
        className
      )}
    >
      {amountLabel && (
        <div className="mb-3 border-b border-slate-100 pb-3">
          <p className="text-slate-500">Send exactly</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">{amountLabel}</p>
        </div>
      )}

      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>

      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
          aria-hidden
        >
          <QRCode
            value={scanValue}
            size={148}
            level="M"
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <button
            type="button"
            onClick={() => void copyAddress()}
            className="group w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-sky-200 hover:bg-sky-50/50 active:scale-[0.99]"
          >
            <div className="flex items-start gap-2">
              <code className="flex-1 break-all text-xs leading-relaxed text-slate-800">
                {address}
              </code>
              <span className="shrink-0 rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 group-hover:border-sky-200 group-hover:text-sky-600">
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {copied ? (
                <span className="font-medium text-emerald-600">Copied to clipboard</span>
              ) : (
                "Tap to copy address"
              )}
            </p>
          </button>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
      </div>
    </div>
  );
}

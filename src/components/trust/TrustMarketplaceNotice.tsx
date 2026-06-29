import { Info } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TrustMarketplaceNoticeProps {
  className?: string;
}

/** viagogo / Hellotickets-style independent marketplace disclaimer */
export function TrustMarketplaceNotice({ className }: TrustMarketplaceNoticeProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3.5 text-sm leading-relaxed text-amber-950",
        className
      )}
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
      <p>
        <strong className="font-semibold">{SITE_NAME}</strong> is an independent ticket
        marketplace — not the official box office or FIFA. Prices may be above or below face
        value. Every confirmed order is covered by our{" "}
        <a href="/guarantee" className="font-medium text-amber-900 underline underline-offset-2">
          100% order guarantee
        </a>
        .
      </p>
    </div>
  );
}

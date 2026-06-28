import Link from "next/link";
import { Shield } from "lucide-react";

interface TicketFlowFooterProps {
  showGuarantee?: boolean;
}

export function TicketFlowFooter({ showGuarantee = true }: TicketFlowFooterProps) {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {showGuarantee && (
          <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
            <div>
              <p className="font-semibold text-slate-900">100% Order Guarantee</p>
              <p className="mt-1 text-sm text-slate-600">
                We back every order so you can buy tickets with complete confidence.
              </p>
            </div>
          </div>
        )}

        <nav
          className={`flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500 ${showGuarantee ? "mt-6" : ""}`}
        >
          <Link href="/guarantee" className="hover:text-sky-600">
            Order guarantee
          </Link>
          <Link href="/refunds" className="hover:text-sky-600">
            Refunds
          </Link>
          <Link href="/contact" className="hover:text-sky-600">
            Contact
          </Link>
          <Link href="/faq" className="hover:text-sky-600">
            FAQ
          </Link>
        </nav>

        {showGuarantee && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Every order is 100% guaranteed
          </p>
        )}
      </div>
    </footer>
  );
}

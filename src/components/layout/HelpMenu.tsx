import Link from "next/link";
import { HelpCircle } from "lucide-react";

export function HelpMenu() {
  return (
    <div className="group relative hidden lg:block">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <HelpCircle className="h-4 w-4" />
        Help
      </button>
      <div className="invisible absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-xl border border-slate-200 bg-white py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <Link
          href="/faq"
          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          FAQ
        </Link>
        <Link
          href="/contact"
          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Contact us
        </Link>
        <Link
          href="/guarantee"
          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Guarantee
        </Link>
      </div>
    </div>
  );
}

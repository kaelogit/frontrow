"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  onSubmit?: () => void;
}

export function SearchBar({ className = "", autoFocus, onSubmit }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(searchParams.get("search") ?? searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/events?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/events");
    }
    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="City or activity"
          autoFocus={autoFocus}
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
        />
      </div>
    </form>
  );
}

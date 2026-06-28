"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { HelpCircle, Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SearchBar } from "@/components/layout/SearchBar";
import {
  LocaleMenuRow,
  LocalePickerModal,
  LocaleSelector,
} from "@/components/layout/LocaleSelector";
import { HelpMenu } from "@/components/layout/HelpMenu";
import { Portal } from "@/components/ui/Portal";

const nav = [
  { href: "/world-cup-2026", label: "World Cup 2026" },
  { href: "/events", label: "All Events" },
  { href: "/concerts", label: "Concerts" },
];

const helpLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/guarantee", label: "Our guarantee" },
  { href: "/contact", label: "Contact us" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);

  useEffect(() => {
    const locked = menuOpen || searchOpen || localeOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen, localeOpen]);

  const openLocale = () => setLocaleOpen(true);

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-[4.25rem] sm:px-6">
          <Logo />

          <Suspense fallback={<div className="hidden min-w-0 flex-1 max-w-md lg:block" />}>
            <SearchBar className="hidden min-w-0 flex-1 max-w-md lg:block" />
          </Suspense>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <LocaleSelector onOpenPicker={openLocale} />
            <HelpMenu />
            <Link
              href="/events"
              className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition hover:shadow-lg hover:brightness-105"
            >
              Find tickets
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
              aria-label="Search events"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <Portal>
          <div className="fixed inset-0 z-[200] flex flex-col bg-white lg:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 pt-safe">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-12 items-center rounded-xl px-4 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-800"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Help
                </p>
                <ul className="space-y-1">
                  {helpLinks.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-12 items-center gap-2 rounded-xl px-4 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <LocaleMenuRow onOpenPicker={openLocale} />
              </div>
            </nav>

            <div className="border-t border-slate-100 bg-white p-4 pb-safe">
              <Link
                href="/events"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-sm font-semibold text-white shadow-md"
              >
                Find tickets
              </Link>
            </div>
          </div>
        </Portal>
      )}

      {searchOpen && (
        <Portal>
          <div className="fixed inset-0 z-[200] flex flex-col bg-white lg:hidden">
            <div className="mx-auto flex w-full max-w-2xl items-center justify-between border-b border-slate-100 px-4 py-4 pt-safe">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-900">Search</p>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-6">
              <Suspense fallback={null}>
                <SearchBar
                  autoFocus
                  onSubmit={() => setSearchOpen(false)}
                  className="[&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:py-3.5 [&_input]:text-base"
                />
              </Suspense>
            </div>
          </div>
        </Portal>
      )}

      <LocalePickerModal open={localeOpen} onClose={() => setLocaleOpen(false)} />
    </>
  );
}

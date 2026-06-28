"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Settings,
  ShoppingBag,
  X,
} from "lucide-react";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/venues", label: "Venues", icon: MapPin },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminShellProps {
  children: React.ReactNode;
  sessionLabel: string | null;
}

function NavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("space-y-1", className)}>
      {nav.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm transition",
              active
                ? "bg-sky-50 font-semibold text-sky-800"
                : "text-zinc-600 hover:bg-slate-100 hover:text-zinc-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({
  pathname,
  sessionLabel,
  onNavigate,
}: {
  pathname: string;
  sessionLabel: string | null;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link href="/admin" onClick={onNavigate} className="block text-lg font-bold text-zinc-900">
        FRONT<span className="text-amber-500">ROWLY</span>
        <span className="mt-1 block text-xs font-normal text-zinc-500">Admin</span>
      </Link>

      <NavLinks pathname={pathname} onNavigate={onNavigate} className="mt-8" />

      <div className="mt-8 border-t border-card-border pt-4">
        {sessionLabel && (
          <p className="truncate px-3 text-xs text-zinc-500">{sessionLabel}</p>
        )}
        <AdminSignOutButton className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm text-zinc-600 transition hover:bg-slate-100 hover:text-zinc-900">
          <LogOut className="h-4 w-4" />
          Sign out
        </AdminSignOutButton>
      </div>

      <Link
        href="/"
        onClick={onNavigate}
        className="mt-4 block px-3 text-xs text-zinc-500 hover:text-zinc-700"
      >
        ← Back to site
      </Link>
    </>
  );
}

export function AdminShell({ children, sessionLabel }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentPage = nav.find(({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href)
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-zinc-900">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-card-border bg-white p-4 lg:block">
        <SidebarContent pathname={pathname} sessionLabel={sessionLabel} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col bg-white p-4 shadow-xl">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              sessionLabel={sessionLabel}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-card-border bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-zinc-700 hover:bg-slate-50"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {currentPage?.label ?? "Admin"}
            </p>
            {sessionLabel && (
              <p className="truncate text-xs text-zinc-500">{sessionLabel}</p>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

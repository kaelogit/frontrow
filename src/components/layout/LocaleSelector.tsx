"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { CURRENCIES } from "@/lib/constants";
import { Portal } from "@/components/ui/Portal";

const COOKIE_KEY = "frontrowly_locale";
const LOCALE_OPTIONS = [
  { country: "United States", currency: "USD", flag: "🇺🇸" },
  { country: "Canada", currency: "CAD", flag: "🇨🇦" },
  { country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { country: "European Union", currency: "EUR", flag: "🇪🇪" },
  { country: "Mexico", currency: "USD", flag: "🇲🇽" },
  { country: "Brazil", currency: "BRL", flag: "🇧🇷" },
  { country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
] as const;

export type LocaleOption = (typeof LOCALE_OPTIONS)[number];

const DEFAULT_LOCALE: LocaleOption = LOCALE_OPTIONS[0];

function readLocale(): LocaleOption {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_KEY}=`));
  if (!match) return DEFAULT_LOCALE;
  try {
    const parsed = JSON.parse(decodeURIComponent(match.split("=")[1])) as LocaleOption;
    const valid = LOCALE_OPTIONS.find(
      (o) => o.country === parsed.country && o.currency === parsed.currency
    );
    return valid ?? DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function saveLocale(locale: LocaleOption) {
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(locale))};path=/;max-age=31536000`;
  window.dispatchEvent(new CustomEvent("frontrowly:locale", { detail: locale }));
}

interface LocalePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: () => void;
}

export function LocalePickerModal({ open, onClose, onSelect }: LocalePickerModalProps) {
  const [selected, setSelected] = useState<LocaleOption>(DEFAULT_LOCALE);

  useEffect(() => {
    if (open) setSelected(readLocale());
  }, [open]);

  if (!open) return null;

  const pick = (locale: LocaleOption) => {
    setSelected(locale);
    saveLocale(locale);
    onClose();
    onSelect?.();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[210] flex items-end justify-center bg-white sm:items-center sm:bg-slate-900/40 sm:p-4 sm:backdrop-blur-sm">
        <button
          type="button"
          className="absolute inset-0 hidden sm:block"
          onClick={onClose}
          aria-label="Close region picker"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="locale-picker-title"
          className="relative flex max-h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl"
        >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="locale-picker-title" className="text-lg font-semibold text-slate-900">
            Region & currency
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {LOCALE_OPTIONS.map((locale) => {
            const isActive =
              selected.country === locale.country && selected.currency === locale.currency;
            return (
              <li key={`${locale.country}-${locale.currency}`}>
                <button
                  type="button"
                  onClick={() => pick(locale)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition hover:bg-sky-50 ${
                    isActive ? "bg-sky-50 font-semibold text-sky-800" : "text-slate-700"
                  }`}
                >
                  <span className="text-xl">{locale.flag}</span>
                  <span className="flex-1">{locale.country}</span>
                  <span className="text-slate-500">{locale.currency}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-slate-100 px-5 py-3 pb-safe text-xs text-slate-500">
          Supported: {CURRENCIES.join(", ")}. Checkout prices shown in USD.
        </p>
        </div>
      </div>
    </Portal>
  );
}

interface LocaleSelectorProps {
  onOpenPicker: () => void;
}

/** Desktop header trigger — lg+ only */
export function LocaleSelector({ onOpenPicker }: LocaleSelectorProps) {
  const [selected, setSelected] = useState<LocaleOption>(DEFAULT_LOCALE);

  useEffect(() => {
    setSelected(readLocale());
    const sync = () => setSelected(readLocale());
    window.addEventListener("frontrowly:locale", sync);
    return () => window.removeEventListener("frontrowly:locale", sync);
  }, []);

  return (
    <button
      type="button"
      onClick={onOpenPicker}
      className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 lg:flex"
    >
      <span>{selected.flag}</span>
      <span className="max-w-[8rem] truncate">{selected.country}</span>
      <span className="text-slate-400">({selected.currency})</span>
      <ChevronDown className="h-4 w-4 text-slate-400" />
    </button>
  );
}

/** Row inside mobile drawer */
export function LocaleMenuRow({ onOpenPicker }: { onOpenPicker: () => void }) {
  const [selected, setSelected] = useState<LocaleOption>(DEFAULT_LOCALE);

  useEffect(() => {
    setSelected(readLocale());
    const sync = () => setSelected(readLocale());
    window.addEventListener("frontrowly:locale", sync);
    return () => window.removeEventListener("frontrowly:locale", sync);
  }, []);

  return (
    <button
      type="button"
      onClick={onOpenPicker}
      className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm text-slate-700 hover:bg-slate-50"
    >
      <span className="text-lg">{selected.flag}</span>
      <span className="flex-1 font-medium text-slate-900">Region & currency</span>
      <span className="text-slate-500">{selected.currency}</span>
    </button>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { Competition } from "@/types/database";
import {
  browseFiltersToQuery,
  countActiveBrowseFilters,
  parseBrowseFilters,
  type BrowseFilterOptions,
  type EventBrowseFilters,
} from "@/lib/events/browse-filters";
import { cn } from "@/lib/utils";

interface EventFiltersProps {
  competitions: Competition[];
  options: BrowseFilterOptions;
  resultCount: number;
}

type FilterKey = "location" | "group" | "team" | "round" | "date" | "price" | "parking";

const FILTER_LABELS: Record<FilterKey, string> = {
  location: "Location",
  group: "Group",
  team: "Teams",
  round: "Round",
  date: "Dates",
  price: "Price",
  parking: "Parking",
};

function FilterDropdown({
  label,
  active,
  onClear,
  children,
}: {
  label: string;
  active: boolean;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition",
          active
            ? "border-sky-600 bg-sky-50 text-sky-700"
            : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
        )}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      {active && onClear && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
            setOpen(false);
          }}
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-white"
          aria-label={`Clear ${label}`}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-label="Close filter"
          />
          <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full rounded-lg px-3 py-2 text-left text-sm transition",
        selected
          ? "bg-sky-600 font-semibold text-white"
          : "text-slate-700 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

export function EventFilters({ competitions, options, resultCount }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMobile, setShowMobile] = useState(false);

  const filters = useMemo(
    () => parseBrowseFilters(Object.fromEntries(searchParams.entries())),
    [searchParams]
  );

  const activeCount = countActiveBrowseFilters(filters);

  const pushFilters = useCallback(
    (next: Partial<EventBrowseFilters>) => {
      const merged: EventBrowseFilters = { ...filters, ...next };
      const query = browseFiltersToQuery(merged);
      const qs = new URLSearchParams(query).toString();
      router.push(qs ? `/events?${qs}` : "/events");
    },
    [filters, router]
  );

  const clearFilter = (keys: (keyof EventBrowseFilters)[]) => {
    const next = { ...filters };
    for (const key of keys) {
      delete next[key];
    }
    const query = browseFiltersToQuery(next);
    const qs = new URLSearchParams(query).toString();
    router.push(qs ? `/events?${qs}` : "/events");
  };

  const clearAll = () => {
    const query = filters.competition
      ? new URLSearchParams({ competition: filters.competition }).toString()
      : "";
    router.push(query ? `/events?${query}` : "/events");
  };

  const filterBar = (
    <div className="flex flex-wrap items-center gap-2">
      {options.cities.length > 0 && (
        <FilterDropdown
          label={
            filters.city
              ? options.cities.find((c) => c.value === filters.city)?.label ?? FILTER_LABELS.location
              : FILTER_LABELS.location
          }
          active={Boolean(filters.city)}
          onClear={() => clearFilter(["city"])}
        >
          <OptionButton selected={!filters.city} onClick={() => pushFilters({ city: undefined })}>
            All locations
          </OptionButton>
          {options.cities.map((city) => (
            <OptionButton
              key={city.value}
              selected={filters.city === city.value}
              onClick={() => pushFilters({ city: city.value })}
            >
              {city.label}
            </OptionButton>
          ))}
        </FilterDropdown>
      )}

      {options.groups.length > 0 && (
        <FilterDropdown
          label={
            filters.group ? `Group ${filters.group}` : FILTER_LABELS.group
          }
          active={Boolean(filters.group)}
          onClear={() => clearFilter(["group"])}
        >
          <OptionButton selected={!filters.group} onClick={() => pushFilters({ group: undefined })}>
            All groups
          </OptionButton>
          {options.groups.map((group) => (
            <OptionButton
              key={group.value}
              selected={filters.group === group.value}
              onClick={() => pushFilters({ group: group.value })}
            >
              {group.label}
            </OptionButton>
          ))}
        </FilterDropdown>
      )}

      {options.teams.length > 0 && (
        <FilterDropdown
          label={
            filters.team
              ? options.teams.find((t) => t.value === filters.team)?.label ?? FILTER_LABELS.team
              : FILTER_LABELS.team
          }
          active={Boolean(filters.team)}
          onClear={() => clearFilter(["team"])}
        >
          <OptionButton selected={!filters.team} onClick={() => pushFilters({ team: undefined })}>
            All teams
          </OptionButton>
          {options.teams.map((team) => (
            <OptionButton
              key={team.value}
              selected={filters.team === team.value}
              onClick={() => pushFilters({ team: team.value })}
            >
              {team.label}
            </OptionButton>
          ))}
        </FilterDropdown>
      )}

      {options.rounds.length > 0 && (
        <FilterDropdown
          label={
            filters.round
              ? options.rounds.find((r) => r.value === filters.round)?.label ?? FILTER_LABELS.round
              : FILTER_LABELS.round
          }
          active={Boolean(filters.round)}
          onClear={() => clearFilter(["round"])}
        >
          <OptionButton selected={!filters.round} onClick={() => pushFilters({ round: undefined })}>
            All rounds
          </OptionButton>
          {options.rounds.map((round) => (
            <OptionButton
              key={round.value}
              selected={filters.round === round.value}
              onClick={() =>
                pushFilters({ round: round.value as EventBrowseFilters["round"] })
              }
            >
              {round.label}
            </OptionButton>
          ))}
        </FilterDropdown>
      )}

      {options.months.length > 0 && (
        <FilterDropdown
          label={
            filters.month
              ? options.months.find((m) => m.value === filters.month)?.label ?? FILTER_LABELS.date
              : FILTER_LABELS.date
          }
          active={Boolean(filters.month || filters.date)}
          onClear={() => clearFilter(["month", "date"])}
        >
          <OptionButton
            selected={!filters.month && !filters.date}
            onClick={() => pushFilters({ month: undefined, date: undefined })}
          >
            All dates
          </OptionButton>
          {options.months.map((month) => (
            <OptionButton
              key={month.value}
              selected={filters.month === month.value}
              onClick={() =>
                pushFilters({
                  month: month.value as EventBrowseFilters["month"],
                  date: undefined,
                })
              }
            >
              {month.label}
            </OptionButton>
          ))}
        </FilterDropdown>
      )}

      <FilterDropdown
        label={FILTER_LABELS.price}
        active={filters.priceMin != null || filters.priceMax != null}
        onClear={() => clearFilter(["priceMin", "priceMax"])}
      >
        <div className="space-y-3 p-1">
          <p className="px-2 text-xs text-slate-500">
            From {options.priceRange.min} – {options.priceRange.max}
          </p>
          <div className="flex items-center gap-2 px-2">
            <input
              type="number"
              min={options.priceRange.min}
              max={options.priceRange.max}
              placeholder="Min"
              defaultValue={filters.priceMin ?? ""}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              onBlur={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                pushFilters({ priceMin: val });
              }}
            />
            <span className="text-slate-400">–</span>
            <input
              type="number"
              min={options.priceRange.min}
              max={options.priceRange.max}
              placeholder="Max"
              defaultValue={filters.priceMax ?? ""}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              onBlur={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                pushFilters({ priceMax: val });
              }}
            />
          </div>
        </div>
      </FilterDropdown>

      <button
        type="button"
        onClick={() => pushFilters({ parking: filters.parking ? undefined : true })}
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition",
          filters.parking
            ? "border-sky-600 bg-sky-50 text-sky-700"
            : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
        )}
      >
        {FILTER_LABELS.parking}
      </button>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-sm font-medium text-sky-600 hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <a
          href="/events"
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            !filters.competition
              ? "bg-sky-600 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:border-sky-300"
          )}
        >
          All
        </a>
        {competitions.map((comp) => {
          const href = `/events?competition=${comp.slug}`;
          return (
            <a
              key={comp.id}
              href={href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                filters.competition === comp.slug
                  ? "bg-sky-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-sky-300"
              )}
            >
              {comp.name}
            </a>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          {resultCount} event{resultCount !== 1 ? "s" : ""}
          {activeCount > 0 && ` · ${activeCount} filter${activeCount !== 1 ? "s" : ""} active`}
        </p>
        <button
          type="button"
          onClick={() => setShowMobile(true)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-sky-600 px-1.5 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className="hidden lg:block">{filterBar}</div>

      {showMobile && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobile(false)}
            aria-label="Close filters"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              <button
                type="button"
                onClick={() => setShowMobile(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterBar}
            <button
              type="button"
              onClick={() => setShowMobile(false)}
              className="mt-6 w-full rounded-full bg-sky-600 py-3 text-sm font-semibold text-white"
            >
              Show {resultCount} event{resultCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

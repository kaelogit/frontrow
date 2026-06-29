"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { EventWithRelations } from "@/types/database";
import type { StagePricingTier, WorldCupStage } from "@/lib/marketing/world-cup-stages";
import { estimateAvgPrice } from "@/lib/marketing/world-cup-stages";

type StageSectionSample = NonNullable<WorldCupStage["sectionSamples"]>[number];
import { MatchTeamsRow } from "@/components/events/MatchTeamsRow";
import { getEventMatchDisplay } from "@/lib/events/match-display";
import { getEventTicketHref } from "@/lib/events/event-scarcity";
import { formatEventDate, formatPrice } from "@/lib/utils";
import { useDisplayCurrency, useFxSettings } from "@/components/site-settings/SiteSettingsProvider";
import { formatDisplayPrice } from "@/lib/fx/format";

interface StageMatchTableProps {
  shortTitle: string;
  events: EventWithRelations[];
}

function StageMatchCards({ events }: { events: EventWithRelations[] }) {
  const fx = useFxSettings();
  const displayCurrency = useDisplayCurrency();

  return (
    <div className="space-y-3 md:hidden">
      {events.map((event) => {
        const avg = estimateAvgPrice(event);
        const match = getEventMatchDisplay(event);
        const venue = event.venue
          ? `${event.venue.name}, ${event.venue.city}`
          : "TBA";

        return (
          <article
            key={event.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <MatchTeamsRow event={event} variant="compact" />
            <p className="mt-2 text-xs font-medium text-slate-600">{match.headline}</p>
            {event.subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">{event.subtitle}</p>
            )}
            <p className="mt-3 text-sm text-slate-600">{venue}</p>
            <p className="mt-1 text-sm text-slate-500">
              {formatEventDate(event.event_date, event.event_time)}
            </p>
            <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-500">From</p>
                <p className="text-lg font-bold text-slate-900">
                  {event.min_price != null
                    ? event.currency === "USD"
                      ? formatDisplayPrice({
                          usdAmount: event.min_price,
                          displayCurrency,
                          fx,
                        })
                      : formatPrice(event.min_price, event.currency)
                    : "—"}
                </p>
                {avg != null && (
                  <p className="text-xs text-slate-500">
                    Avg{" "}
                    {event.currency === "USD"
                      ? formatDisplayPrice({ usdAmount: avg, displayCurrency, fx })
                      : formatPrice(avg, event.currency)}
                  </p>
                )}
              </div>
              <Link
                href={getEventTicketHref(event)}
                className="inline-flex min-h-11 items-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Tickets
                <ChevronRight className="ml-0.5 h-4 w-4" />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function StageMatchTable({ shortTitle, events }: StageMatchTableProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-600">
          {shortTitle} matches will be listed as inventory is confirmed.
        </p>
        <Link
          href="/world-cup-2026"
          className="mt-4 inline-block text-sm font-semibold text-emerald-600 hover:underline"
        >
          Browse all World Cup events
        </Link>
      </div>
    );
  }

  return (
    <>
      <StageMatchCards events={events} />

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Match</th>
              <th className="px-4 py-3 font-semibold">Venue</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold text-right">From</th>
              <th className="px-4 py-3 font-semibold text-right">Avg price</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => {
              const avg = estimateAvgPrice(event);
              const match = getEventMatchDisplay(event);
              const venue = event.venue
                ? `${event.venue.name}, ${event.venue.city}`
                : "TBA";

              return (
                <tr key={event.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-4">
                    <MatchTeamsRow event={event} variant="compact" />
                    <p className="mt-1 text-xs font-medium text-slate-600">{match.headline}</p>
                    {event.subtitle && (
                      <p className="mt-0.5 text-xs text-slate-500">{event.subtitle}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{venue}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                    {formatEventDate(event.event_date, event.event_time)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-900">
                    {event.min_price != null
                      ? formatPrice(event.min_price, event.currency)
                      : "—"}
                  </td>
                  <td className="px-4 py-4 text-right text-slate-600">
                    {avg != null ? formatPrice(avg, event.currency) : "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={getEventTicketHref(event)}
                      className="inline-flex items-center font-semibold text-emerald-600 hover:underline"
                    >
                      Tickets
                      <ChevronRight className="ml-0.5 h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface StagePricingTableProps {
  pricingTiers?: StagePricingTier[];
  sectionSamples?: StageSectionSample[];
}

function PricingTierCards({
  tiers,
}: {
  tiers: NonNullable<WorldCupStage["pricingTiers"]>;
}) {
  return (
    <div className="mt-4 space-y-3 md:hidden">
      {tiers.map((tier) => (
        <div
          key={tier.zone}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="font-semibold text-slate-900">{tier.zone}</p>
          <p className="mt-1 text-sm text-slate-600">{tier.sections}</p>
          <div className="mt-3 flex justify-between text-sm">
            <div>
              <p className="text-xs text-slate-500">From</p>
              <p className="font-semibold">{formatPrice(tier.fromPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Avg</p>
              <p className="text-slate-600">{formatPrice(tier.avgPrice)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionSampleCards({
  rows,
}: {
  rows: NonNullable<WorldCupStage["sectionSamples"]>;
}) {
  return (
    <div className="mt-4 space-y-3 md:hidden">
      {rows.map((row) => (
        <div
          key={`${row.section}-${row.fromPrice}`}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="font-medium text-slate-900">{row.section}</p>
          {row.note && <p className="mt-1 text-xs text-slate-500">{row.note}</p>}
          <div className="mt-3 flex justify-between text-sm">
            <div>
              <p className="text-xs text-slate-500">From</p>
              <p className="font-semibold">{formatPrice(row.fromPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Avg</p>
              <p className="text-slate-600">{formatPrice(row.avgPrice)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StagePricingTable({
  pricingTiers,
  sectionSamples,
}: StagePricingTableProps) {
  if (!pricingTiers?.length) return null;

  return (
    <div className="mt-10">
      <h3 className="text-lg font-bold text-slate-900">Price by category zone</h3>
      <p className="mt-1 text-sm text-slate-600">
        Typical market range per ticket · updated from live inventory
      </p>

      <PricingTierCards tiers={pricingTiers} />

      <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Zone</th>
              <th className="px-4 py-3 font-semibold">Sections</th>
              <th className="px-4 py-3 font-semibold text-right">From</th>
              <th className="px-4 py-3 font-semibold text-right">Avg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pricingTiers.map((tier) => (
              <tr key={tier.zone}>
                <td className="px-4 py-3 font-medium text-slate-900">{tier.zone}</td>
                <td className="px-4 py-3 text-slate-600">{tier.sections}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatPrice(tier.fromPrice)}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {formatPrice(tier.avgPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sectionSamples && sectionSamples.length > 0 && (
        <>
          <h3 className="mt-10 text-lg font-bold text-slate-900">Section price breakdown</h3>
          <p className="mt-1 text-sm text-slate-600">
            Sample listings — prices vary by row and quantity
          </p>

          <SectionSampleCards rows={sectionSamples} />

          <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Section / product</th>
                  <th className="px-4 py-3 font-semibold text-right">From</th>
                  <th className="px-4 py-3 font-semibold text-right">Avg</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sectionSamples.map((row) => (
                  <tr key={`${row.section}-${row.fromPrice}`}>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.section}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatPrice(row.fromPrice)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatPrice(row.avgPrice)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{row.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

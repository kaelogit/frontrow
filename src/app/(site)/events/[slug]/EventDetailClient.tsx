"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Shield, Ticket } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TicketSelector } from "@/components/events/TicketSelector";
import { MatchTeamsRow } from "@/components/events/MatchTeamsRow";
import {
  TicketBrowserModal,
  useTicketBrowserOpen,
} from "@/components/tickets/TicketBrowserModal";
import { getEventMatchDisplay } from "@/lib/events/match-display";
import { buildEventBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { trackEventView } from "@/lib/analytics/funnel";
import { saveCheckoutSession } from "@/lib/checkout/storage";
import type { EventWithRelations, TicketListing } from "@/types/database";
import { resolveEventHeroImage } from "@/lib/images";
import { formatEventDate, formatPrice } from "@/lib/utils";

interface EventDetailClientProps {
  event: EventWithRelations;
  listings?: TicketListing[];
}

export function EventDetailClient({ event, listings = [] }: EventDetailClientProps) {
  const router = useRouter();
  const usesSeatMap = event.seat_map_enabled === true;
  const match = getEventMatchDisplay(event);
  const breadcrumbs = buildEventBreadcrumbs(event);
  const { open: ticketsOpen, openBrowser, closeBrowser } = useTicketBrowserOpen(event.slug);

  useEffect(() => {
    trackEventView({
      slug: event.slug,
      matchNumber: event.match_number,
      competitionSlug: event.competition?.slug ?? null,
    });
  }, [event.slug, event.match_number, event.competition?.slug]);

  const handleCheckout = (quantities: Record<string, number>) => {
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([categoryId, quantity]) => {
        const cat = event.ticket_categories?.find((c) => c.id === categoryId);
        return {
          categoryId,
          categoryName: cat?.name ?? "",
          quantity,
          unitPrice: cat?.price ?? 0,
        };
      });

    saveCheckoutSession({
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: match.headline,
      currency: event.currency,
      items,
    });
    router.push(`/events/${event.slug}/checkout`);
  };

  const location = event.venue
    ? `${event.venue.name}, ${event.venue.city}`
    : "Venue TBA";

  const { src: imageSrc } = resolveEventHeroImage(
    event.slug,
    event.competition?.slug ?? null,
    event.match_number,
    event.image_url
  );

  return (
    <>
      <div className="bg-slate-50 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={breadcrumbs} className="mb-6" />

          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative aspect-video overflow-hidden rounded-2xl card-shadow">
                <Image
                  src={imageSrc}
                  alt={match.headline}
                  fill
                  className="object-cover"
                  sizes="40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {event.competition && (
                    <span className="inline-block rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800">
                      {event.competition.name}
                    </span>
                  )}
                  <div className="mt-4">
                    <MatchTeamsRow
                      event={event}
                      variant="hero"
                      showHeadline={match.hasTbd}
                    />
                  </div>
                  {event.subtitle && (
                    <p className="mt-2 text-sm text-white/85">{event.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 card-shadow">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-500" />
                  {formatEventDate(event.event_date, event.event_time)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-sky-500" />
                  {location}
                </p>
                <p className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sky-500" />
                  Secure booking · E-ticket delivery
                </p>
              </div>

              {event.description && (
                <p className="mt-6 text-sm leading-relaxed text-slate-600">
                  {event.description}
                </p>
              )}
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 card-shadow sm:p-8">
                {usesSeatMap ? (
                  <>
                    <h2 className="text-xl font-bold text-slate-900">Get tickets</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Interactive stadium map · pick your section and row
                    </p>
                    {event.min_price != null && (
                      <p className="mt-4 text-2xl font-bold text-sky-600">
                        From {formatPrice(event.min_price, event.currency)}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={openBrowser}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-8 py-4 font-semibold text-white shadow-md hover:brightness-105"
                    >
                      <Ticket className="h-5 w-5" />
                      See tickets
                    </button>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <Shield className="h-3.5 w-3.5 text-sky-500" />
                      Seats guaranteed together when quantity selected
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-slate-900">Select tickets</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Choose your category and quantity
                    </p>
                    <div className="mt-6">
                      <TicketSelector event={event} onCheckout={handleCheckout} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {usesSeatMap && (
        <TicketBrowserModal
          event={event}
          listings={listings}
          open={ticketsOpen}
          onClose={closeBrowser}
        />
      )}
    </>
  );
}

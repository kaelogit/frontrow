import { Suspense } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { getEventBySlug } from "@/lib/data/events";
import { getListingsForEvent } from "@/lib/data/listings";
import { resolveEventHeroImage } from "@/lib/images";
import { enforceQueueOrRedirect } from "@/lib/queue/guard";
import { buildEventPageMetadata } from "@/lib/seo/event-metadata";
import {
  buildEventBreadcrumbJsonLd,
  buildSportsEventJsonLd,
} from "@/lib/seo/jsonld";
import { EventDetailClient } from "./EventDetailClient";

interface EventPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tickets?: string }>;
}

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };

  return buildEventPageMetadata(event, slug);
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { slug } = await params;
  const { tickets } = await searchParams;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  if (tickets === "1" && event.seat_map_enabled) {
    await enforceQueueOrRedirect(event);
  }

  const listings =
    event.seat_map_enabled ? await getListingsForEvent(event.id) : [];

  const { src: imagePath } = resolveEventHeroImage(
    event.slug,
    event.competition?.slug ?? null,
    event.match_number,
    event.image_url
  );

  return (
    <>
      <JsonLd
        data={[
          buildSportsEventJsonLd(event, imagePath),
          buildEventBreadcrumbJsonLd(event),
        ]}
      />
      <Suspense fallback={<div className="min-h-[50vh] bg-slate-50" />}>
        <EventDetailClient event={event} listings={listings} />
      </Suspense>
    </>
  );
}

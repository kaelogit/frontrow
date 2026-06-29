import type { Metadata } from "next";
import type { EventWithRelations } from "@/types/database";
import { SITE_NAME } from "@/lib/constants";
import { resolveEventHeroImage } from "@/lib/images";
import { absoluteUrl, buildSocialMetadata } from "@/lib/site-metadata";
import { formatPrice } from "@/lib/utils";

export function buildEventSeoDescription(event: EventWithRelations): string {
  const venue = event.venue;
  const venueLine = venue ? ` at ${venue.name}, ${venue.city}` : "";
  const priceLine =
    event.min_price != null && event.min_price > 0
      ? ` Tickets from ${formatPrice(event.min_price, event.currency)}.`
      : "";

  return (
    event.description?.trim() ||
    event.subtitle?.trim() ||
    `Buy tickets for ${event.title}${venueLine}.${priceLine} Verified resale on ${SITE_NAME}.`
  );
}

export function buildEventPageMetadata(
  event: EventWithRelations,
  slug: string
): Metadata {
  const description = buildEventSeoDescription(event);
  const { src: imagePath } = resolveEventHeroImage(
    event.slug,
    event.competition?.slug ?? null,
    event.match_number,
    event.image_url
  );

  return {
    title: event.title,
    description,
    ...buildSocialMetadata({
      title: event.title,
      description,
      path: `/events/${slug}`,
      imagePath,
    }),
  };
}

export function collectionPageMetadata({
  title,
  description,
  path,
  imagePath,
}: {
  title: string;
  description: string;
  path: string;
  imagePath: string;
}): Metadata {
  return {
    title,
    description,
    ...buildSocialMetadata({ title, description, path, imagePath }),
  };
}

export { absoluteUrl };

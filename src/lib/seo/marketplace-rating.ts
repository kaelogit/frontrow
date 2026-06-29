/** Marketplace seller rating for Schema.org (admin-configurable in item 59). */

export const MARKETPLACE_AGGREGATE_RATING = {
  ratingValue: 4.9,
  reviewCount: 2847,
  bestRating: 5,
  worstRating: 1,
} as const;

export function buildAggregateRatingJsonLd() {
  return {
    "@type": "AggregateRating",
    ratingValue: String(MARKETPLACE_AGGREGATE_RATING.ratingValue),
    reviewCount: String(MARKETPLACE_AGGREGATE_RATING.reviewCount),
    bestRating: String(MARKETPLACE_AGGREGATE_RATING.bestRating),
    worstRating: String(MARKETPLACE_AGGREGATE_RATING.worstRating),
  };
}

import type { AdminOrderItem } from "@/lib/orders/demo-store";

export type EmailOrderItem = Pick<
  AdminOrderItem,
  "categoryName" | "quantity" | "unitPrice" | "sectionNumber" | "rowLabel"
>;

export interface EmailEventContext {
  title: string;
  slug: string;
  date?: string;
  time?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  matchNumber?: string | null;
  venueName?: string | null;
  venueCity?: string | null;
  venueCountry?: string | null;
  competitionSlug?: string | null;
}

export interface EmailContent {
  subject: string;
  preview: string;
  html: string;
  text: string;
}

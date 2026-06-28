import { z } from "zod";
import { viewLabelFromScore } from "@/lib/listings/constants";

export const listingFormSchema = z.object({
  section_number: z.string().optional(),
  row_label: z.string().optional(),
  product_name: z.string().optional(),
  listing_type: z.enum(["seat", "zone", "hospitality"]),
  quantity: z.coerce.number().int().min(1).max(20),
  quantity_available: z.coerce.number().int().min(0).max(20).optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  currency: z.string().default("USD"),
  perks: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  view_score: z.string().optional(),
  view_label: z.string().optional(),
  status: z.enum(["available", "reserved", "sold"]).default("available"),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;

export function parseListingForm(formData: FormData) {
  const perks = formData.getAll("perks").map(String);
  const badges = formData.getAll("badges").map(String);
  const viewScoreRaw = formData.get("view_score");
  const viewScore =
    viewScoreRaw && String(viewScoreRaw).trim() !== ""
      ? String(viewScoreRaw)
      : "";

  const raw = {
    section_number: formData.get("section_number") || "",
    row_label: formData.get("row_label") || "",
    product_name: formData.get("product_name") || "",
    listing_type: formData.get("listing_type") || "seat",
    quantity: formData.get("quantity"),
    quantity_available: formData.get("quantity_available") || formData.get("quantity"),
    price: formData.get("price"),
    currency: formData.get("currency") || "USD",
    perks,
    badges,
    view_score: viewScore,
    view_label: formData.get("view_label") || "",
    status: formData.get("status") || "available",
  };

  return listingFormSchema.safeParse(raw);
}

export function listingFormToRecord(values: ListingFormValues, eventId: string) {
  const viewScore =
    values.view_score && values.view_score.trim() !== ""
      ? Number(values.view_score)
      : null;
  const viewLabel =
    values.view_label?.trim() ||
    viewLabelFromScore(viewScore) ||
    null;

  const qty = values.quantity;
  const qtyAvailable =
    values.quantity_available != null ? values.quantity_available : qty;

  return {
    event_id: eventId,
    section_number: values.section_number?.trim() || null,
    row_label: values.row_label?.trim() || null,
    product_name: values.product_name?.trim() || null,
    listing_type: values.listing_type,
    quantity: qty,
    quantity_available: Math.min(qtyAvailable, qty),
    price: values.price,
    currency: values.currency,
    perks: values.perks ?? [],
    badges: values.badges ?? [],
    view_score: viewScore,
    view_label: viewLabel,
    status: values.status,
  };
}

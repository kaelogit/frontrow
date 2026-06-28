import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import { shouldUseMockData } from "@/lib/data/mock-mode";
import {
  getDemoOrder,
  listDemoOrders,
  type AdminOrder,
  type AdminOrderItem,
} from "@/lib/orders/demo-store";

function mapOrderRow(row: Record<string, unknown>): AdminOrder {
  const event = row.event as {
    title?: string;
    slug?: string;
    subtitle?: string | null;
    event_date?: string;
    event_time?: string | null;
    image_url?: string | null;
    match_number?: string | null;
    venue?: { name?: string; city?: string; country?: string | null } | null;
  } | null;
  const orderItems = (row.order_items as Record<string, unknown>[] | null) ?? [];

  const items: AdminOrderItem[] = orderItems.map((item) => {
    const listing = item.listing as {
      section_number?: string | null;
      row_label?: string | null;
      product_name?: string | null;
    } | null;
    const category = item.category as { name?: string } | null;

    return {
      categoryName:
        listing?.product_name ??
        (item.category_name as string | undefined) ??
        category?.name ??
        undefined,
      quantity: item.quantity as number,
      unitPrice: Number(item.unit_price),
      sectionNumber: listing?.section_number ?? (item.section_number as string | undefined),
      rowLabel: listing?.row_label ?? (item.row_label as string | undefined),
    };
  });

  return {
    id: row.id as string,
    reference: row.reference as string,
    event_id: row.event_id as string,
    event_title: event?.title ?? "Unknown event",
    event_slug: event?.slug ?? "",
    event_date: event?.event_date,
    event_time: event?.event_time ?? null,
    event_subtitle: event?.subtitle ?? null,
    event_image_url: event?.image_url ?? null,
    match_number: event?.match_number ?? null,
    venue_name: event?.venue?.name ?? null,
    venue_city: event?.venue?.city ?? null,
    venue_country: event?.venue?.country ?? null,
    customer_name: row.customer_name as string,
    customer_email: row.customer_email as string,
    customer_phone: (row.customer_phone as string | null) ?? null,
    total_amount: Number(row.total_amount),
    currency: row.currency as string,
    payment_method: row.payment_method as AdminOrder["payment_method"],
    status: row.status as AdminOrder["status"],
    payment_external_id: (row.payment_external_id as string | null) ?? null,
    reserved_until: (row.reserved_until as string | null) ?? null,
    paid_at: (row.paid_at as string | null) ?? null,
    ticket_sent_at: (row.ticket_sent_at as string | null) ?? null,
    admin_notes: (row.admin_notes as string | null) ?? null,
    created_at: row.created_at as string,
    items,
  };
}

export async function getAdminOrders(filters?: {
  status?: string;
}): Promise<AdminOrder[]> {
  if (shouldUseMockData()) {
    let orders = listDemoOrders();
    if (filters?.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }
    return orders;
  }

  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      event:events(title, slug),
      order_items(quantity, unit_price, category_id, listing_id)
    `
    )
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("[admin] getAdminOrders:", error?.message);
    return [];
  }

  return data.map((row) => mapOrderRow(row as Record<string, unknown>));
}

export async function getAdminOrderByReference(
  reference: string
): Promise<AdminOrder | null> {
  if (shouldUseMockData()) {
    return getDemoOrder(reference);
  }

  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      event:events(
        title,
        slug,
        subtitle,
        event_date,
        event_time,
        image_url,
        match_number,
        venue:venues(name, city, country)
      ),
      order_items(
        quantity,
        unit_price,
        category_id,
        listing_id,
        listing:ticket_listings(section_number, row_label, product_name),
        category:ticket_categories(name)
      )
    `
    )
    .eq("reference", reference)
    .single();

  if (error || !data) {
    if (error && error.code !== "PGRST116") {
      console.error("[admin] getAdminOrderByReference:", error.message);
    }
    return null;
  }

  return mapOrderRow(data as Record<string, unknown>);
}

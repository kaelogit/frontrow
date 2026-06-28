import type { OrderStatus, PaymentMethod } from "@/types/database";

export interface AdminOrderItem {
  categoryName?: string;
  quantity: number;
  unitPrice: number;
  sectionNumber?: string;
  rowLabel?: string;
}

export interface AdminOrder {
  id: string;
  reference: string;
  event_id: string;
  event_title: string;
  event_slug: string;
  event_date?: string;
  event_time?: string | null;
  event_subtitle?: string | null;
  event_image_url?: string | null;
  match_number?: string | null;
  venue_name?: string | null;
  venue_city?: string | null;
  venue_country?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  payment_external_id: string | null;
  reserved_until: string | null;
  paid_at: string | null;
  ticket_sent_at: string | null;
  admin_notes: string | null;
  created_at: string;
  items: AdminOrderItem[];
}

const demoOrders = new Map<string, AdminOrder>();

export function saveDemoOrder(order: AdminOrder) {
  demoOrders.set(order.reference, order);
}

export function getDemoOrder(reference: string): AdminOrder | null {
  return demoOrders.get(reference) ?? null;
}

export function listDemoOrders(): AdminOrder[] {
  return Array.from(demoOrders.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function updateDemoOrder(
  reference: string,
  patch: Partial<AdminOrder>
): AdminOrder | null {
  const existing = demoOrders.get(reference);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  demoOrders.set(reference, updated);
  return updated;
}

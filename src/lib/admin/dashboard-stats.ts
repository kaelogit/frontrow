import { getAdminEvents } from "@/lib/events/admin-events";
import { getAdminOrders } from "@/lib/orders/admin-queries";
import type { AdminOrder } from "@/lib/orders/demo-store";
import { getEventScarcityPercent } from "@/lib/events/event-scarcity";
import type { EventWithRelations } from "@/types/database";

const PAID_STATUSES = new Set(["paid", "ticket_issued", "completed"]);
const LOW_STOCK_PERCENT = 15;
const LOW_STOCK_ABSOLUTE = 25;

export interface LowStockEvent {
  id: string;
  slug: string;
  title: string;
  available: number;
  scarcityPercent: number | null;
}

export interface AdminDashboardStats {
  activeEvents: number;
  openReservations: number;
  pendingPayments: number;
  paidRevenue: number;
  ordersToday: number;
  recentOrders: AdminOrder[];
  lowStockEvents: LowStockEvent[];
}

function eventAvailableTickets(event: EventWithRelations): number {
  const listings = event.ticket_listings ?? [];
  if (listings.length > 0) {
    return listings.reduce((sum, listing) => sum + (listing.quantity_available ?? 0), 0);
  }

  const categories = event.ticket_categories ?? [];
  return categories.reduce((sum, category) => sum + category.quantity_available, 0);
}

function isLowStock(event: EventWithRelations): boolean {
  const available = eventAvailableTickets(event);
  if (available === 0) return false;
  if (available <= LOW_STOCK_ABSOLUTE) return true;

  const scarcityPercent = getEventScarcityPercent(event);
  return scarcityPercent != null && scarcityPercent <= LOW_STOCK_PERCENT;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [events, orders] = await Promise.all([getAdminEvents(), getAdminOrders()]);

  const today = new Date().toISOString().slice(0, 10);
  const activeEvents = events.filter(
    (event) => event.status !== "cancelled" && event.status !== "completed"
  );

  const lowStockEvents = activeEvents
    .filter(isLowStock)
    .map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      available: eventAvailableTickets(event),
      scarcityPercent: getEventScarcityPercent(event),
    }))
    .sort((a, b) => {
      const aScore = a.scarcityPercent ?? 100;
      const bScore = b.scarcityPercent ?? 100;
      return aScore - bScore || a.available - b.available;
    })
    .slice(0, 6);

  return {
    activeEvents: activeEvents.length,
    openReservations: orders.filter((order) => order.status === "reservation_requested")
      .length,
    pendingPayments: orders.filter((order) => order.status === "pending_payment").length,
    paidRevenue: orders
      .filter((order) => PAID_STATUSES.has(order.status))
      .reduce((sum, order) => sum + order.total_amount, 0),
    ordersToday: orders.filter((order) => order.created_at.startsWith(today)).length,
    recentOrders: orders.slice(0, 8),
    lowStockEvents,
  };
}

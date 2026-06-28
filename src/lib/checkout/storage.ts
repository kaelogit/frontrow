export interface CheckoutItem {
  categoryId?: string;
  listingId?: string;
  categoryName: string;
  sectionNumber?: string;
  rowLabel?: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutSession {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  currency: string;
  items: CheckoutItem[];
}

const CHECKOUT_KEY = "frontrowly_checkout";

export function saveCheckoutSession(session: CheckoutSession): void {
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(session));
}

export function readCheckoutSession(): CheckoutSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CHECKOUT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutSession;
  } catch {
    return null;
  }
}

export function clearCheckoutSession(): void {
  sessionStorage.removeItem(CHECKOUT_KEY);
}

export function checkoutTotal(session: CheckoutSession): number {
  return session.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function checkoutTicketCount(session: CheckoutSession): number {
  return session.items.reduce((sum, item) => sum + item.quantity, 0);
}

export type EventStatus = "scheduled" | "sold_out" | "cancelled" | "completed";
export type TicketStatus = "available" | "reserved" | "sold";
export type OrderStatus =
  | "reservation_requested"
  | "pending_payment"
  | "paid"
  | "ticket_issued"
  | "completed"
  | "cancelled"
  | "expired";
export type PaymentMethod = "card" | "crypto" | "reservation";

export interface Competition {
  id: string;
  slug: string;
  name: string;
  sport: string;
  country: string | null;
  logo_url: string | null;
  description: string | null;
  featured: boolean;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  logo_url: string | null;
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  capacity: number | null;
  image_url: string | null;
  stadium_map_slug?: string | null;
}

export interface StadiumMap {
  id: string;
  venue_id: string;
  slug: string;
  name: string;
  svg_path: string | null;
  svg_content: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface StadiumSection {
  id: string;
  venue_id: string;
  section_number: string;
  level: string;
  zone: string | null;
  label_x: number | null;
  label_y: number | null;
  created_at: string;
}

export interface StadiumRow {
  id: string;
  section_id: string;
  row_label: string;
  sort_order: number;
  created_at: string;
}

export interface Event {
  id: string;
  slug: string;
  competition_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_team_label: string | null;
  away_team_label: string | null;
  venue_id: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  event_date: string;
  event_time: string | null;
  status: EventStatus;
  image_url: string | null;
  min_price: number | null;
  currency: string;
  featured: boolean;
  seat_map_enabled?: boolean;
  match_number?: string | null;
  queue_enabled?: boolean;
  queue_admission_rate?: number | null;
  scarcity_override?: number | null;
}

export interface TicketCategory {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  section: string | null;
  price: number;
  quantity_total: number;
  quantity_available: number;
  sort_order: number;
}

export interface TicketListing {
  id: string;
  event_id: string;
  section_id: string | null;
  section_number: string | null;
  row_label: string | null;
  product_name: string | null;
  listing_type: "seat" | "zone" | "hospitality";
  quantity: number;
  quantity_available: number;
  price: number;
  compare_at_price?: number | null;
  currency: string;
  perks: string[];
  badges: string[];
  view_score: number | null;
  view_label: string | null;
  status: TicketStatus;
  sort_order: number;
}

export interface CompetitorPrice {
  id: string;
  event_id: string;
  source: string;
  price: number;
  currency: string;
  url: string | null;
}

export interface Order {
  id: string;
  reference: string;
  event_id: string;
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
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  category_id: string | null;
  listing_id: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface EventWithRelations extends Event {
  competition?: Competition | null;
  home_team?: Team | null;
  away_team?: Team | null;
  venue?: Venue | null;
  ticket_categories?: TicketCategory[];
  ticket_listings?: TicketListing[];
  competitor_prices?: CompetitorPrice[];
}

export interface CheckoutItem {
  categoryId?: string;
  listingId?: string;
  categoryName: string;
  sectionNumber?: string;
  rowLabel?: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutPayload {
  eventId: string;
  eventSlug: string;
  items: CheckoutItem[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
}

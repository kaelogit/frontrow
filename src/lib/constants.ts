export const SITE_NAME = "Frontrowly";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://frontrowly.com";
export const SITE_DESCRIPTION =
  "Premium seats to World Cup, NBA, Premier League, concerts and more. Your front row to the world's biggest live events.";

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AED", "BRL"] as const;

export const RESERVATION_HOLD_HOURS = 48;

export const PAYMENT_METHODS = {
  reservation: {
    id: "reservation" as const,
    label: "Request reservation",
    description: "We'll email you payment options — no account needed",
    enabled: true,
  },
  card: {
    id: "card" as const,
    label: "Pay with card",
    description: "Visa · Mastercard · Apple Pay",
    enabled: false,
    disabledLabel: "Under maintenance",
  },
  crypto: {
    id: "crypto" as const,
    label: "Pay with crypto",
    description: "WalletConnect Pay",
    enabled: false,
    disabledLabel: "Coming soon",
  },
} as const;

export type ActivePaymentMethod = "reservation" | "crypto";

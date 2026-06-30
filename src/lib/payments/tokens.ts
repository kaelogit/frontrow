import { randomBytes } from "crypto";

export function generatePaymentOfferToken(): string {
  return randomBytes(24).toString("base64url");
}

export function paymentOfferUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/pay/${token}`;
}

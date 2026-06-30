/**
 * Operator inbox — reservation alerts, payment proofs, crypto notifications.
 * Reply-To on these emails is the customer so you can hit Reply from this inbox.
 * NOT the same as ADMIN_EMAILS (admin login allowlist).
 */
export function getAdminInboxEmail(): string {
  return process.env.ADMIN_EMAIL ?? "support@frontrowly.com";
}

/** From address on outbound mail (e.g. tickets@frontrowly.com). */
export function getFromEmail(): string {
  return process.env.FROM_EMAIL ?? "tickets@frontrowly.com";
}

/** Reply-To on customer-facing mail — where customer replies land. */
export function getSupportReplyToEmail(): string {
  return process.env.SUPPORT_REPLY_TO_EMAIL ?? getAdminInboxEmail();
}

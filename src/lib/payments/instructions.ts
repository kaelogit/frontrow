import type { PaymentCredential, PaymentCredentialType } from "@/lib/payments/types";

const FIELD_LABELS: Record<string, string> = {
  bankName: "Bank name",
  accountName: "Account name",
  accountNumber: "Account number",
  routingNumber: "Routing number",
  swiftCode: "SWIFT / BIC",
  iban: "IBAN",
  beneficiary: "Beneficiary",
  bankAddress: "Bank address",
  cashtag: "Cashtag",
  displayName: "Display name",
  phone: "Phone",
  email: "Email",
  username: "Username",
  referenceNote: "Payment reference",
  note: "Note",
  instructions: "Instructions",
};

export function formatInstructionRows(
  type: PaymentCredentialType,
  details: Record<string, string>
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];

  for (const [key, value] of Object.entries(details)) {
    if (!value?.trim()) continue;
    rows.push({
      label: FIELD_LABELS[key] ?? key,
      value: value.trim(),
    });
  }

  if (type === "cashapp" && details.cashtag) {
    return rows;
  }

  return rows;
}

export function snapshotFromCredential(credential: PaymentCredential): {
  method_label: string;
  method_type: PaymentCredentialType;
  instructions: Record<string, string>;
} {
  return {
    method_label: credential.label,
    method_type: credential.type,
    instructions: { ...credential.details },
  };
}

export function expiredMessage(methodType: PaymentCredentialType): string {
  switch (methodType) {
    case "cashapp":
      return "This Cash App link expired. Email us to request new Cash App payment details.";
    case "wire_us":
      return "This wire transfer link expired. Email us to request new wire instructions.";
    case "swift":
      return "This SWIFT link expired. Email us to request new transfer instructions.";
    case "crypto":
      return "This crypto payment link expired. Email us to request a new payment link.";
    case "apple_pay":
      return "This Apple Pay link expired. Email us to request new payment details.";
    case "paypal":
      return "This PayPal link expired. Email us to request new payment details.";
    default:
      return "This payment link expired. Email us to request new payment details.";
  }
}

export const SUPPORT_EMAIL =
  process.env.ADMIN_EMAIL ?? process.env.FROM_EMAIL ?? "support@frontrowly.com";

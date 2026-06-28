/**
 * WalletConnect Pay Merchant API
 * Docs: https://docs.walletconnect.com/payments/merchant/quickstart
 */

const WCP_API_URL =
  process.env.WALLETCONNECT_PAY_API_URL ?? "https://api.pay.walletconnect.com";

const WCP_VERSION = process.env.WALLETCONNECT_PAY_API_VERSION ?? "2026-02-18";

export interface WalletConnectPaymentParams {
  reference: string;
  amount: number;
  currency: string;
  customerEmail: string;
}

export interface WalletConnectPaymentResult {
  paymentId: string;
  checkoutUrl: string;
}

export function isWalletConnectConfigured(): boolean {
  return Boolean(
    process.env.WALLETCONNECT_PAY_API_KEY &&
      process.env.WALLETCONNECT_PAY_MERCHANT_ID
  );
}

export async function createWalletConnectPayment(
  params: WalletConnectPaymentParams
): Promise<WalletConnectPaymentResult> {
  const apiKey = process.env.WALLETCONNECT_PAY_API_KEY;
  const merchantId = process.env.WALLETCONNECT_PAY_MERCHANT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!apiKey || !merchantId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[WalletConnect Pay] No API key — using demo crypto redirect");
      return {
        paymentId: `demo_${params.reference}`,
        checkoutUrl: `${appUrl}/order/${params.reference}/confirmation?crypto_pending=1`,
      };
    }
    throw new Error(
      "Crypto payments are not configured. Set WALLETCONNECT_PAY_API_KEY and WALLETCONNECT_PAY_MERCHANT_ID."
    );
  }

  const response = await fetch(`${WCP_API_URL}/v1/payments`, {
    method: "POST",
    headers: {
      "Api-Key": apiKey,
      "Merchant-Id": merchantId,
      "WCP-Version": WCP_VERSION,
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      referenceId: params.reference,
      amount: {
        value: params.amount.toFixed(2),
        currency: params.currency,
      },
      buyer: {
        email: params.customerEmail,
      },
      successUrl: `${appUrl}/order/${params.reference}/confirmation`,
      cancelUrl: `${appUrl}/checkout`,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WalletConnect Pay error: ${text}`);
  }

  const result = (await response.json()) as {
    id?: string;
    link?: string;
    url?: string;
    checkoutUrl?: string;
  };

  const paymentId = result.id;
  const checkoutUrl = result.link ?? result.url ?? result.checkoutUrl;

  if (!paymentId || !checkoutUrl) {
    throw new Error("WalletConnect Pay returned an incomplete payment response");
  }

  return { paymentId, checkoutUrl };
}

export async function getWalletConnectPaymentStatus(paymentId: string): Promise<{
  status: string;
  isFinal: boolean;
}> {
  const apiKey = process.env.WALLETCONNECT_PAY_API_KEY;
  const merchantId = process.env.WALLETCONNECT_PAY_MERCHANT_ID;

  if (!apiKey || !merchantId) {
    throw new Error("WalletConnect Pay is not configured");
  }

  const response = await fetch(
    `${WCP_API_URL}/v1/payments/${paymentId}/status`,
    {
      headers: {
        "Api-Key": apiKey,
        "Merchant-Id": merchantId,
        "WCP-Version": WCP_VERSION,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WalletConnect Pay status error: ${text}`);
  }

  const result = (await response.json()) as {
    status?: string;
    isFinal?: boolean;
  };

  return {
    status: result.status ?? "unknown",
    isFinal: result.isFinal ?? false,
  };
}

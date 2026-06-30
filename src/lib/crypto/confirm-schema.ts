import { z } from "zod";
import { CRYPTO_PAYMENT_IDS } from "@/lib/crypto/payment-options";

export const EVM_PAYMENTS = [
  "usdc-base",
  "usdc-ethereum",
  "usdt-ethereum",
  "eth-ethereum",
  "bnb-bsc",
  "usdt-bsc",
] as const;

export const TXID_PAYMENTS = [
  "btc-bitcoin",
  "ltc-litecoin",
  "doge-dogecoin",
  "trx-tron",
  "usdt-tron",
  "ton-toncoin",
] as const;

export const cryptoConfirmSchema = z
  .object({
    paymentId: z.enum(CRYPTO_PAYMENT_IDS),
    txHash: z
      .string()
      .regex(/^0x[a-fA-F0-9]{64}$/)
      .optional(),
    chainId: z.number().int().positive().optional(),
    signature: z.string().min(32).max(128).optional(),
    txid: z.string().min(32).max(128).optional(),
  })
  .superRefine((data, ctx) => {
    if ((EVM_PAYMENTS as readonly string[]).includes(data.paymentId)) {
      if (!data.txHash) {
        ctx.addIssue({ code: "custom", message: "txHash required", path: ["txHash"] });
      }
      if (!data.chainId) {
        ctx.addIssue({ code: "custom", message: "chainId required", path: ["chainId"] });
      }
    }
    if (data.paymentId === "sol-solana" && !data.signature) {
      ctx.addIssue({ code: "custom", message: "signature required", path: ["signature"] });
    }
    if ((TXID_PAYMENTS as readonly string[]).includes(data.paymentId) && !data.txid) {
      ctx.addIssue({ code: "custom", message: "txid required", path: ["txid"] });
    }
  });

export type CryptoConfirmInput = z.infer<typeof cryptoConfirmSchema>;

export function externalIdFromConfirm(data: CryptoConfirmInput): string {
  return data.txHash ?? data.signature ?? data.txid!;
}

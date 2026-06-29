import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { getSolanaReceiveAddress } from "@/lib/crypto/config";
import { getCryptoPaymentOption } from "@/lib/crypto/payment-options";
import { quoteCryptoPayment } from "@/lib/crypto/prices";

const SOLANA_RPC =
  process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

export async function verifySolanaPayment(input: {
  signature: string;
  expectedUsd: number;
}) {
  const receiveAddress = getSolanaReceiveAddress();
  if (!receiveAddress) {
    return { ok: false as const, error: "Solana receive address is not configured" };
  }

  const option = getCryptoPaymentOption("sol-solana");
  if (!option) {
    return { ok: false as const, error: "SOL payments are not configured" };
  }

  const quote = await quoteCryptoPayment(option, input.expectedUsd);
  const expectedLamports = BigInt(quote.amountRaw);

  const connection = new Connection(SOLANA_RPC, "confirmed");
  const tx = await connection.getTransaction(input.signature, {
    maxSupportedTransactionVersion: 0,
  });

  if (!tx || tx.meta?.err) {
    return { ok: false as const, error: "Solana transaction not found or failed" };
  }

  const destination = new PublicKey(receiveAddress);
  let received = BigInt(0);

  const message = tx.transaction.message;
  const accountKeys = message.getAccountKeys().staticAccountKeys;

  for (const ix of message.compiledInstructions) {
    const programId = accountKeys[ix.programIdIndex];
    if (!programId.equals(SystemProgram.programId)) continue;

    const fromIndex = ix.accountKeyIndexes[0];
    const toIndex = ix.accountKeyIndexes[1];
    const to = accountKeys[toIndex];
    if (!to.equals(destination)) continue;

    const data = ix.data;
    if (data.length < 12) continue;
    let lamports = BigInt(0);
    for (let i = 0; i < 8; i++) {
      lamports += BigInt(data[4 + i]!) << BigInt(i * 8);
    }
    received += lamports;
  }

  if (received < expectedLamports) {
    return { ok: false as const, error: "SOL amount is below order total" };
  }

  return { ok: true as const };
}

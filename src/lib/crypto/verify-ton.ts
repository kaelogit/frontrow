import { getTonReceiveAddress } from "@/lib/crypto/config";

import { getCryptoPaymentOption } from "@/lib/crypto/payment-options";

import { quoteCryptoPayment } from "@/lib/crypto/prices";



interface TonApiTx {

  success?: boolean;

  in_msg?: { value?: number; destination?: { address?: string } };

  out_msgs?: { value?: number; destination?: { address?: string } }[];

}



export async function verifyTonPayment(input: { txid: string; expectedUsd: number }) {

  const receiveAddress = getTonReceiveAddress();

  if (!receiveAddress) {

    return { ok: false as const, error: "TON receive address is not configured" };

  }



  const option = getCryptoPaymentOption("ton-toncoin");

  if (!option) {

    return { ok: false as const, error: "TON payments are not configured" };

  }



  const quote = await quoteCryptoPayment(option, input.expectedUsd);

  const expectedNano = BigInt(quote.amountRaw);



  const res = await fetch(`https://tonapi.io/v2/blockchain/transactions/${input.txid}`);

  if (!res.ok) {

    return { ok: false as const, error: "TON transaction not found" };

  }



  const tx = (await res.json()) as TonApiTx;

  let received = BigInt(0);



  for (const msg of tx.out_msgs ?? []) {

    const dest = msg.destination?.address ?? "";

    if (dest.includes(receiveAddress.replace(/^UQ/, "EQ").slice(2, 10)) || dest === receiveAddress) {

      received += BigInt(msg.value ?? 0);

    }

  }



  if (received === BigInt(0)) {

    return {

      ok: false as const,

      error: "TON payment to our address was not found in this transaction",

    };

  }



  if (received < expectedNano) {

    return { ok: false as const, error: "TON amount is below order total" };

  }



  return { ok: true as const };

}



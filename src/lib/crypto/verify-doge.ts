import { getDogeReceiveAddress } from "@/lib/crypto/config";

import { getCryptoPaymentOption } from "@/lib/crypto/payment-options";

import { quoteCryptoPayment } from "@/lib/crypto/prices";



interface DogeTxResponse {

  success?: number;

  transaction?: {

    outputs?: { addr?: string; value?: string }[];

    confirmations?: number;

  };

}



export async function verifyDogePayment(input: { txid: string; expectedUsd: number }) {

  const receiveAddress = getDogeReceiveAddress();

  if (!receiveAddress) {

    return { ok: false as const, error: "Dogecoin receive address is not configured" };

  }



  const option = getCryptoPaymentOption("doge-dogecoin");

  if (!option) {

    return { ok: false as const, error: "DOGE payments are not configured" };

  }



  const quote = await quoteCryptoPayment(option, input.expectedUsd);

  const expectedKoinu = BigInt(quote.amountRaw);



  const res = await fetch(`https://dogechain.info/api/v1/transaction/${input.txid}`);

  if (!res.ok) {

    return { ok: false as const, error: "Dogecoin transaction not found" };

  }



  const data = (await res.json()) as DogeTxResponse;

  if (!data.success || !data.transaction) {

    return { ok: false as const, error: "Dogecoin transaction not found" };

  }

  if ((data.transaction.confirmations ?? 0) < 1) {

    return { ok: false as const, error: "Dogecoin transaction not confirmed yet" };

  }



  let received = BigInt(0);

  for (const out of data.transaction.outputs ?? []) {

    if (out.addr === receiveAddress && out.value) {

      received += BigInt(Math.round(parseFloat(out.value) * 1e8));

    }

  }



  if (received < expectedKoinu) {

    return { ok: false as const, error: "DOGE amount is below order total" };

  }



  return { ok: true as const };

}



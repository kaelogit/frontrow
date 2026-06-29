import { getBtcReceiveAddress, getLtcReceiveAddress } from "@/lib/crypto/config";

import { getCryptoPaymentOption } from "@/lib/crypto/payment-options";

import { quoteCryptoPayment } from "@/lib/crypto/prices";



interface UtxoTx {

  txid: string;

  status?: { confirmed?: boolean };

  vout: { scriptpubkey_address?: string; value: number }[];

}



const UTXO_EXPLORERS = {

  bitcoin: "https://blockstream.info/api/tx/",

  litecoin: "https://litecoinspace.org/api/tx/",

} as const;



export async function verifyUtxoPayment(input: {

  paymentId: "btc-bitcoin" | "ltc-litecoin";

  txid: string;

  expectedUsd: number;

}) {

  const option = getCryptoPaymentOption(input.paymentId);

  if (!option?.utxoNetwork || option.utxoNetwork === "dogecoin") {

    return { ok: false as const, error: "UTXO payment is not configured" };

  }



  const receiveAddress =

    input.paymentId === "btc-bitcoin" ? getBtcReceiveAddress() : getLtcReceiveAddress();

  if (!receiveAddress) {

    return { ok: false as const, error: "Receive address is not configured" };

  }



  const quote = await quoteCryptoPayment(option, input.expectedUsd);

  const expectedSats = BigInt(quote.amountRaw);



  const explorer = UTXO_EXPLORERS[option.utxoNetwork];

  const res = await fetch(`${explorer}${input.txid}`);

  if (!res.ok) {

    return { ok: false as const, error: "Transaction not found" };

  }



  const tx = (await res.json()) as UtxoTx;

  if (!tx.status?.confirmed) {

    return { ok: false as const, error: "Transaction not confirmed yet" };

  }



  let received = BigInt(0);

  for (const out of tx.vout) {

    if (out.scriptpubkey_address === receiveAddress) {

      received += BigInt(out.value);

    }

  }



  if (received < expectedSats) {

    return { ok: false as const, error: `${option.symbol} amount is below order total` };

  }



  return { ok: true as const };

}



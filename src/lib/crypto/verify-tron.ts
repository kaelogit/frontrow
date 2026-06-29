import { getTronReceiveAddress } from "@/lib/crypto/config";

import { getCryptoPaymentOption } from "@/lib/crypto/payment-options";

import { quoteCryptoPayment } from "@/lib/crypto/prices";



const USDT_TRC20 = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";



interface TronScanTx {

  contractRet?: string;

  confirmed?: boolean;

  toAddress?: string;

  amount?: number;

  trc20TransferInfo?: {

    to_address?: string;

    contract_address?: string;

    amount_str?: string;

    decimals?: number;

  }[];

}



export async function verifyTronPayment(input: {

  paymentId: "trx-tron" | "usdt-tron";

  txid: string;

  expectedUsd: number;

}) {

  const receiveAddress = getTronReceiveAddress();

  if (!receiveAddress) {

    return { ok: false as const, error: "Tron receive address is not configured" };

  }



  const option = getCryptoPaymentOption(input.paymentId);

  if (!option) {

    return { ok: false as const, error: "Tron payments are not configured" };

  }



  const quote = await quoteCryptoPayment(option, input.expectedUsd);

  const expectedAmount = BigInt(quote.amountRaw);



  const res = await fetch(

    `https://apilist.tronscanapi.com/api/transaction-info?hash=${input.txid}`

  );

  if (!res.ok) {

    return { ok: false as const, error: "Tron transaction not found" };

  }



  const tx = (await res.json()) as TronScanTx;

  if (tx.contractRet !== "SUCCESS" || !tx.confirmed) {

    return { ok: false as const, error: "Tron transaction not confirmed yet" };

  }



  if (input.paymentId === "trx-tron") {

    if (tx.toAddress !== receiveAddress) {

      return { ok: false as const, error: "Payment was not sent to our Tron address" };

    }

    const received = BigInt(tx.amount ?? 0);

    if (received < expectedAmount) {

      return { ok: false as const, error: "TRX amount is below order total" };

    }

    return { ok: true as const };

  }



  const transfer = tx.trc20TransferInfo?.find(

    (t) =>

      t.contract_address === USDT_TRC20 &&

      t.to_address === receiveAddress

  );

  if (!transfer?.amount_str) {

    return { ok: false as const, error: "USDT TRC-20 transfer not found" };

  }



  const received = BigInt(transfer.amount_str);

  if (received < expectedAmount) {

    return { ok: false as const, error: "USDT amount is below order total" };

  }



  return { ok: true as const };

}



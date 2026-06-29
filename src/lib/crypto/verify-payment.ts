import type { Hash } from "viem";

import type { CryptoPaymentId } from "@/lib/crypto/payment-options";

import { verifyDogePayment } from "@/lib/crypto/verify-doge";

import { verifyEvmPayment } from "@/lib/crypto/verify-evm";

import { verifySolanaPayment } from "@/lib/crypto/verify-solana";

import { verifyTonPayment } from "@/lib/crypto/verify-ton";

import { verifyTronPayment } from "@/lib/crypto/verify-tron";

import { verifyUtxoPayment } from "@/lib/crypto/verify-utxo";



const EVM_PAYMENTS = [

  "usdc-base",

  "usdc-ethereum",

  "usdt-ethereum",

  "eth-ethereum",

  "bnb-bsc",

  "usdt-bsc",

] as const;



const UTXO_PAYMENTS = ["btc-bitcoin", "ltc-litecoin"] as const;



const TRON_PAYMENTS = ["trx-tron", "usdt-tron"] as const;



export async function verifyCryptoPayment(input: {

  paymentId: CryptoPaymentId;

  expectedUsd: number;

  txHash?: Hash;

  chainId?: number;

  signature?: string;

  txid?: string;

}) {

  const option = input.paymentId;



  if ((EVM_PAYMENTS as readonly string[]).includes(option)) {

    if (!input.txHash || !input.chainId) {

      return { ok: false as const, error: "Missing EVM transaction" };

    }

    return verifyEvmPayment({

      txHash: input.txHash,

      chainId: input.chainId,

      paymentId: option as (typeof EVM_PAYMENTS)[number],

      expectedUsd: input.expectedUsd,

    });

  }



  if (option === "sol-solana") {

    if (!input.signature) {

      return { ok: false as const, error: "Missing Solana transaction signature" };

    }

    return verifySolanaPayment({

      signature: input.signature,

      expectedUsd: input.expectedUsd,

    });

  }



  if ((UTXO_PAYMENTS as readonly string[]).includes(option)) {

    if (!input.txid) {

      return { ok: false as const, error: "Missing transaction ID" };

    }

    return verifyUtxoPayment({

      paymentId: option as (typeof UTXO_PAYMENTS)[number],

      txid: input.txid,

      expectedUsd: input.expectedUsd,

    });

  }



  if (option === "doge-dogecoin") {

    if (!input.txid) {

      return { ok: false as const, error: "Missing Dogecoin transaction ID" };

    }

    return verifyDogePayment({ txid: input.txid, expectedUsd: input.expectedUsd });

  }



  if ((TRON_PAYMENTS as readonly string[]).includes(option)) {

    if (!input.txid) {

      return { ok: false as const, error: "Missing Tron transaction ID" };

    }

    return verifyTronPayment({

      paymentId: option as (typeof TRON_PAYMENTS)[number],

      txid: input.txid,

      expectedUsd: input.expectedUsd,

    });

  }



  if (option === "ton-toncoin") {

    if (!input.txid) {

      return { ok: false as const, error: "Missing TON transaction ID" };

    }

    return verifyTonPayment({ txid: input.txid, expectedUsd: input.expectedUsd });

  }



  return { ok: false as const, error: "Unsupported payment method" };

}



import {
  createPublicClient,
  decodeEventLog,
  erc20Abi,
  http,
  type Hash,
} from "viem";
import { base, bsc, mainnet } from "viem/chains";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { getCryptoPaymentOption } from "@/lib/crypto/payment-options";
import type { CryptoPaymentWatch } from "@/lib/crypto/watch/types";

const MIN_CONFIRMATIONS = 1;

function watchStartedMs(watch: CryptoPaymentWatch): number {
  return new Date(watch.started_at).getTime() - 60_000;
}

function amountOk(received: bigint, expected: bigint): boolean {
  return received >= expected;
}

interface UtxoTx {
  txid: string;
  status?: { confirmed?: boolean; block_time?: number };
  vout: { scriptpubkey_address?: string; value: number }[];
}

async function scanUtxoAddress(
  watch: CryptoPaymentWatch,
  apiBase: string
): Promise<string | null> {
  const expected = BigInt(watch.expected_amount_raw);
  const res = await fetch(`${apiBase}${watch.receive_address}/txs`);
  if (!res.ok) return null;

  const txs = (await res.json()) as UtxoTx[];
  for (const tx of txs) {
    if (!tx.status?.confirmed) continue;
    if (tx.status.block_time && tx.status.block_time * 1000 < watchStartedMs(watch)) {
      continue;
    }

    let received = BigInt(0);
    for (const out of tx.vout) {
      if (out.scriptpubkey_address === watch.receive_address) {
        received += BigInt(out.value);
      }
    }
    if (amountOk(received, expected)) return tx.txid;
  }
  return null;
}

async function scanDoge(watch: CryptoPaymentWatch): Promise<string | null> {
  const expected = BigInt(watch.expected_amount_raw);
  const res = await fetch(
    `https://api.blockcypher.com/v1/doge/main/addrs/${watch.receive_address}/full?limit=15`
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    txs?: {
      hash: string;
      confirmations?: number;
      confirmed?: string;
      outputs?: { addresses?: string[]; value?: number }[];
    }[];
  };

  for (const tx of data.txs ?? []) {
    if ((tx.confirmations ?? 0) < MIN_CONFIRMATIONS) continue;
    if (tx.confirmed && new Date(tx.confirmed).getTime() < watchStartedMs(watch)) continue;

    let received = BigInt(0);
    for (const out of tx.outputs ?? []) {
      if (out.addresses?.includes(watch.receive_address) && out.value != null) {
        received += BigInt(out.value);
      }
    }
    if (amountOk(received, expected)) return tx.hash;
  }
  return null;
}

function getEvmClient(chainId: number) {
  if (chainId === base.id) return createPublicClient({ chain: base, transport: http() });
  if (chainId === mainnet.id) return createPublicClient({ chain: mainnet, transport: http() });
  if (chainId === bsc.id) return createPublicClient({ chain: bsc, transport: http() });
  return null;
}

async function scanEvm(watch: CryptoPaymentWatch): Promise<string | null> {
  const option = getCryptoPaymentOption(watch.payment_id);
  if (!option?.chainId) return null;

  const client = getEvmClient(option.chainId);
  if (!client) return null;

  const expected = BigInt(watch.expected_amount_raw);
  const receive = watch.receive_address.toLowerCase() as `0x${string}`;
  const currentBlock = await client.getBlockNumber();
  const window = BigInt(2000);
  const fromBlock = currentBlock > window ? currentBlock - window : BigInt(0);

  if (option.evmKind === "native") {
    for (let blockNum = currentBlock; blockNum >= fromBlock; blockNum--) {
      const block = await client.getBlock({ blockNumber: blockNum, includeTransactions: true });
      if (!block?.transactions) continue;
      const blockTime = Number(block.timestamp) * 1000;
      if (blockTime < watchStartedMs(watch)) break;

      for (const tx of block.transactions) {
        if (typeof tx === "string") continue;
        if (tx.to?.toLowerCase() === receive && tx.value >= expected) {
          return tx.hash;
        }
      }
    }
    return null;
  }

  if (!option.contractAddress) return null;

  const logs = await client.getLogs({
    address: option.contractAddress,
    fromBlock,
    toBlock: "latest",
  });

  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: erc20Abi,
        eventName: "Transfer",
        data: log.data,
        topics: log.topics,
      });
      if (decoded.args.to?.toLowerCase() !== receive) continue;
      const value = decoded.args.value ?? BigInt(0);
      if (!amountOk(value, expected)) continue;

      const receipt = await client.getTransactionReceipt({ hash: log.transactionHash });
      if (!receipt || receipt.status !== "success") continue;
      const block = await client.getBlock({ blockNumber: receipt.blockNumber });
      if (Number(block.timestamp) * 1000 < watchStartedMs(watch)) continue;
      return log.transactionHash;
    } catch {
      // skip non-transfer logs
    }
  }
  return null;
}

async function scanSolana(watch: CryptoPaymentWatch): Promise<string | null> {
  const expected = BigInt(watch.expected_amount_raw);
  const rpc = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpc, "confirmed");
  const destination = new PublicKey(watch.receive_address);

  const signatures = await connection.getSignaturesForAddress(destination, { limit: 25 });
  for (const sig of signatures) {
    if ((sig.confirmationStatus !== "confirmed" && sig.confirmationStatus !== "finalized") || sig.err) {
      continue;
    }
    if (sig.blockTime && sig.blockTime * 1000 < watchStartedMs(watch)) continue;

    const tx = await connection.getTransaction(sig.signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx || tx.meta?.err) continue;

    let received = BigInt(0);
    const message = tx.transaction.message;
    const accountKeys = message.getAccountKeys().staticAccountKeys;

    for (const ix of message.compiledInstructions) {
      const programId = accountKeys[ix.programIdIndex];
      if (!programId.equals(SystemProgram.programId)) continue;
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

    if (amountOk(received, expected)) return sig.signature;
  }
  return null;
}

async function scanTron(watch: CryptoPaymentWatch): Promise<string | null> {
  const expected = BigInt(watch.expected_amount_raw);
  const option = getCryptoPaymentOption(watch.payment_id);
  if (!option) return null;

  const minTimestamp = watchStartedMs(watch);
  const url =
    watch.payment_id === "trx-tron"
      ? `https://apilist.tronscanapi.com/api/transfer/trx?sort=-timestamp&count=true&limit=20&address=${watch.receive_address}`
      : `https://apilist.tronscanapi.com/api/token_trc20/transfers?sort=-timestamp&count=true&limit=20&toAddress=${watch.receive_address}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as {
    data?: {
      transactionHash?: string;
      hash?: string;
      confirmed?: boolean;
      block_timestamp?: number;
      quant?: string;
      amount?: string;
      toAddress?: string;
      contract_address?: string;
    }[];
  };

  const USDT_TRC20 = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

  for (const row of data.data ?? []) {
    if (row.confirmed === false) continue;
    if (row.block_timestamp && row.block_timestamp < minTimestamp) continue;

    const txId = row.transactionHash ?? row.hash;
    if (!txId) continue;

    if (watch.payment_id === "trx-tron") {
      const received = BigInt(row.quant ?? row.amount ?? "0");
      if (amountOk(received, expected)) return txId;
      continue;
    }

    if (row.contract_address === USDT_TRC20 || row.toAddress === watch.receive_address) {
      const received = BigInt(row.quant ?? row.amount ?? "0");
      if (amountOk(received, expected)) return txId;
    }
  }
  return null;
}

async function scanTon(watch: CryptoPaymentWatch): Promise<string | null> {
  const expected = BigInt(watch.expected_amount_raw);
  const res = await fetch(
    `https://tonapi.io/v2/accounts/${encodeURIComponent(watch.receive_address)}/events?limit=20`
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    events?: {
      event_id?: string;
      timestamp?: number;
      actions?: {
        type?: string;
        status?: string;
        TonTransfer?: { recipient?: { address?: string }; amount?: number };
      }[];
    }[];
  };

  for (const event of data.events ?? []) {
    if (event.timestamp && event.timestamp * 1000 < watchStartedMs(watch)) continue;
    for (const action of event.actions ?? []) {
      if (action.type !== "TonTransfer" || action.status === "failed") continue;
      const transfer = action.TonTransfer;
      if (!transfer?.recipient?.address) continue;
      if (!transfer.recipient.address.includes(watch.receive_address.slice(0, 10))) continue;
      const received = BigInt(transfer.amount ?? 0);
      if (amountOk(received, expected) && event.event_id) {
        return event.event_id;
      }
    }
  }
  return null;
}

export async function scanIncomingPayment(
  watch: CryptoPaymentWatch
): Promise<string | null> {
  const option = getCryptoPaymentOption(watch.payment_id);
  if (!option) return null;

  switch (option.rail) {
    case "utxo":
      if (option.utxoNetwork === "bitcoin") {
        return scanUtxoAddress(watch, "https://blockstream.info/api/address/");
      }
      if (option.utxoNetwork === "litecoin") {
        return scanUtxoAddress(watch, "https://litecoinspace.org/api/address/");
      }
      if (option.utxoNetwork === "dogecoin") {
        return scanDoge(watch);
      }
      return null;
    case "evm":
      return scanEvm(watch);
    case "solana":
      return scanSolana(watch);
    case "tron":
      return scanTron(watch);
    case "ton":
      return scanTon(watch);
    default:
      return null;
  }
}

export async function verifyScannedPayment(
  watch: CryptoPaymentWatch,
  txId: string
): Promise<boolean> {
  const { verifyCryptoPayment } = await import("@/lib/crypto/verify-payment");
  const option = getCryptoPaymentOption(watch.payment_id);
  if (!option) return false;

  const input: Parameters<typeof verifyCryptoPayment>[0] = {
    paymentId: watch.payment_id,
    expectedUsd: watch.expected_usd,
  };

  if (option.rail === "evm" && watch.chain_id) {
    input.txHash = txId as Hash;
    input.chainId = watch.chain_id;
  } else if (option.rail === "solana") {
    input.signature = txId;
  } else {
    input.txid = txId;
  }

  const result = await verifyCryptoPayment(input);
  return result.ok;
}

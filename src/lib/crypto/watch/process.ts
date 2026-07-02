import {
  expireStaleWatches,
  isTransactionAlreadyMatched,
  listWatchingCryptoWatches,
  markWatchPaid,
  touchWatchScan,
} from "@/lib/crypto/watch/store";
import { scanIncomingPayment, verifyScannedPayment } from "@/lib/crypto/watch/scan-incoming";
import { finalizeCryptoWatch } from "@/lib/crypto/watch/finalize";

export interface ProcessCryptoWatchesResult {
  scanned: number;
  matched: number;
  expired: number;
  errors: string[];
}

export async function processCryptoWatches(): Promise<ProcessCryptoWatchesResult> {
  const expired = await expireStaleWatches();
  const watches = await listWatchingCryptoWatches();
  const result: ProcessCryptoWatchesResult = {
    scanned: 0,
    matched: 0,
    expired,
    errors: [],
  };

  for (const watch of watches) {
    result.scanned++;
    try {
      const txId = await scanIncomingPayment(watch);
      await touchWatchScan(watch.id);

      if (!txId) continue;
      if (await isTransactionAlreadyMatched(txId)) continue;

      const valid = await verifyScannedPayment(watch, txId);
      if (!valid) continue;

      const paidWatch = await markWatchPaid(watch.id, txId);
      if (!paidWatch) continue;

      await finalizeCryptoWatch(paidWatch, txId);
      result.matched++;
    } catch (err) {
      result.errors.push(
        `${watch.order_reference}: ${err instanceof Error ? err.message : "scan failed"}`
      );
    }
  }

  return result;
}

import { NextResponse } from "next/server";
import {
  getCryptoAddressConfig,
  getWalletConnectProjectId,
  isCryptoPaymentsEnabled,
} from "@/lib/crypto/config";
import { getOptionsForConfiguredAddresses } from "@/lib/crypto/payment-options";

export async function GET() {
  const addresses = getCryptoAddressConfig();
  const options = getOptionsForConfiguredAddresses(addresses);
  return NextResponse.json({
    enabled: isCryptoPaymentsEnabled(),
    walletConnect: Boolean(getWalletConnectProjectId()),
    addresses,
    options: options.map((o) => ({ id: o.id, label: o.label, symbol: o.symbol })),
  });
}

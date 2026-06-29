"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, mainnet } from "viem/chains";
import { CRYPTO_SUPPORTED_CHAIN_IDS } from "@/lib/crypto/config";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = getDefaultConfig({
  appName: "Frontrowly",
  projectId,
  chains: [base, mainnet],
  ssr: true,
});

export const cryptoChainIds = CRYPTO_SUPPORTED_CHAIN_IDS;

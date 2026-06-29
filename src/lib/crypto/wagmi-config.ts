"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, bsc, mainnet } from "viem/chains";
import type { Config } from "wagmi";

let wagmiConfig: Config | null = null;

export function getWagmiConfig(): Config {
  if (wagmiConfig) return wagmiConfig;

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

  wagmiConfig = getDefaultConfig({
    appName: "Frontrowly",
    projectId,
    chains: [base, mainnet, bsc],
    ssr: true,
  });

  return wagmiConfig;
}

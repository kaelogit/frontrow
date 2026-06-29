"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, bsc, mainnet } from "viem/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = getDefaultConfig({
  appName: "Frontrowly",
  projectId,
  chains: [base, mainnet, bsc],
  ssr: true,
});

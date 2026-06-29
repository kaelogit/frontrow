"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { getWagmiConfig } from "@/lib/crypto/wagmi-config";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

function Web3ProviderInner({ children }: { children: React.ReactNode }) {
  const wagmiConfig = getWagmiConfig();
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#0ea5e9",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

/** Wallet stack only when WalletConnect is configured (checkout crypto). */
export function Web3Provider({ children }: { children: React.ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();
  if (!projectId) {
    return <>{children}</>;
  }
  return <Web3ProviderInner>{children}</Web3ProviderInner>;
}

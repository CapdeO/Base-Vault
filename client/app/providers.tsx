"use client"

import type React from "react"

import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { metaMaskWallet, coinbaseWallet, rainbowWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets"
import '@rainbow-me/rainbowkit/styles.css';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { base } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

const wallets = projectId
  ? [metaMaskWallet, coinbaseWallet, rainbowWallet, walletConnectWallet]
  : [metaMaskWallet, coinbaseWallet, rainbowWallet]

const config = getDefaultConfig({
  appName: "Base Vault",
  projectId: projectId || "demo-project-id", // Provide fallback for demo
  chains: [base],
  wallets: [
    {
      groupName: "Recommended",
      wallets,
    },
  ],
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniKitProvider apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY} chain={base}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MiniKitProvider>
  )
}

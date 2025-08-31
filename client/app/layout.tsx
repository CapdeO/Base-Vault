import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Base Vault",
  description: "Goal-based savings dApp on Base",
  generator: "v0.app",
  icons: {
    icon: "/base.webp",
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://base-vault-aleph.vercel.app/splash.png",
    "fc:frame:image:aspect_ratio": "1.91:1",
    "fc:frame:button:1": "Start Saving",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://base-vault-aleph.vercel.app",
    "og:title": "BaseVault",
    "og:description": "Set goals and safely earn USDC with Aave and Symbiotic",
    "og:image": "https://base-vault-aleph.vercel.app/splash.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}

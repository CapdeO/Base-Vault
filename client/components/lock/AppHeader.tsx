"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, AlertTriangle, Lock } from "lucide-react"

interface AppHeaderProps {
  isConnected: boolean
  isOnBaseChain: boolean
  address: string | undefined
  onSwitchToBase: () => void
}

export default function AppHeader({ isConnected, isOnBaseChain, address, onSwitchToBase }: AppHeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-900/70 backdrop-blur flex-shrink-0">
      <div className="mx-auto w-full max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                BaseVault
              </h1>
              <p className="text-[11px] text-gray-400">Lock goals. Earn yield. Stay disciplined.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isConnected ? (
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  const ready = mounted
                  const connected = ready && account && chain

                  return (
                    <div
                      {...(!ready && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none",
                          userSelect: "none",
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button 
                              onClick={openConnectModal} 
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90 cursor-pointer" 
                              size="sm"
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              Connect Wallet
                            </Button>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )
                }}
              </ConnectButton.Custom>
            ) : (
              <>
                {!isOnBaseChain && (
                  <Button
                    onClick={onSwitchToBase}
                    variant="destructive"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Switch to Base</span>
                  </Button>
                )}
                <Badge variant={isOnBaseChain ? "default" : "destructive"} className="flex items-center space-x-1 bg-gray-800 border border-gray-700">
                  <div className={`w-2 h-2 ${isOnBaseChain ? "bg-green-500" : "bg-red-500"} rounded-full`} />
                  <span className="text-xs">{isOnBaseChain ? "Base" : "Wrong Network"}</span>
                </Badge>
                <Badge variant="outline" className="text-xs border-gray-700 text-gray-300 bg-gray-800">
                  {address ? `${address.slice(0, 4)}…${address.slice(-4)}` : "Not Connected"}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
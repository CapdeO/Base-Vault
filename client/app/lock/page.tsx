"use client"

import { useState, useEffect } from "react"
import { useAccount, useDisconnect, useSwitchChain, useSendTransaction } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { sepolia } from "wagmi/chains"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Wallet, Target, Clock, DollarSign, Shield, Zap, AlertTriangle, Lock } from "lucide-react"

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  createdDate: Date
  isActive: boolean
  protocol: string
}

export default function BaseVaultApp() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { sendTransaction, isPending: isTransactionPending } = useSendTransaction()

  const isOnSepoliaChain = chain?.id === sepolia.id

  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    duration: "30",
    initialDeposit: "",
    protocol: "aave",
  })
  const [depositAmount, setDepositAmount] = useState("")
  const [extendDays, setExtendDays] = useState("")
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)

  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [modalGoal, setModalGoal] = useState<Goal | null>(null)

  const [minStakingCountdown, setMinStakingCountdown] = useState<{ [goalId: string]: number }>({})

  const currentGoal = goals.find((goal) => goal.isActive)

  useEffect(() => {
    const interval = setInterval(() => {
      setMinStakingCountdown((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((goalId) => {
          if (updated[goalId] > 0) {
            updated[goalId] -= 1
          }
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSwitchToSepolia = async () => {
    if (switchChain) {
      switchChain({ chainId: sepolia.id })
    }
  }

  const sendEmptyTransaction = async () => {
    if (!address || !isOnSepoliaChain) return

    try {
      sendTransaction({
        to: address,
        value: BigInt(0),
        gas: BigInt(21000),
      })

      // Wait a bit to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("Transaction failed:", error)
      alert("Transaction failed. Please try again.")
    }
  }

  const openCreateGoalModal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.initialDeposit) return
    setShowCreateGoalModal(true)
  }

  const confirmCreateGoal = async () => {
    if (!isOnSepoliaChain) {
      await handleSwitchToSepolia()
      return
    }

    await sendEmptyTransaction()

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: Number.parseFloat(newGoal.targetAmount),
      currentAmount: Number.parseFloat(newGoal.initialDeposit),
      targetDate: new Date(Date.now() + Number.parseInt(newGoal.duration) * 24 * 60 * 60 * 1000),
      createdDate: new Date(),
      isActive: true,
      protocol: newGoal.protocol,
    }

    setGoals([...goals, goal])
    setMinStakingCountdown((prev) => ({ ...prev, [goal.id]: 60 }))
    setNewGoal({ name: "", targetAmount: "", duration: "30", initialDeposit: "", protocol: "aave" })
    setShowCreateGoalModal(false)
  }

  const openDepositModal = (goal: Goal) => {
    if (!depositAmount) return
    setModalGoal(goal)
    setShowDepositModal(true)
  }

  const confirmDeposit = async () => {
    if (!modalGoal || !depositAmount) return
    if (!isOnSepoliaChain) {
      await handleSwitchToSepolia()
      return
    }

    await sendEmptyTransaction()

    const updatedGoal = { ...modalGoal, currentAmount: modalGoal.currentAmount + Number.parseFloat(depositAmount) }

    if (extendDays && Number.parseInt(extendDays) > 0) {
      updatedGoal.targetDate = new Date(
        modalGoal.targetDate.getTime() + Number.parseInt(extendDays) * 24 * 60 * 60 * 1000,
      )
    }

    setGoals(goals.map((goal) => (goal.id === modalGoal.id ? updatedGoal : goal)))
    setDepositAmount("")
    setExtendDays("")
    setSelectedGoal(null)
    setModalGoal(null)
    setShowDepositModal(false)
  }

  const openWithdrawModal = (goal: Goal) => {
    setModalGoal(goal)
    setShowWithdrawModal(true)
  }

  const confirmWithdraw = async () => {
    if (!modalGoal) return
    if (!isOnSepoliaChain) {
      await handleSwitchToSepolia()
      return
    }

    await sendEmptyTransaction()

    alert(`Withdrawing ${modalGoal.currentAmount} USDC + yield from ${modalGoal.name}`)
    setModalGoal(null)
    setShowWithdrawModal(false)
  }

  const canWithdraw = (goal: Goal) => {
    return new Date() >= goal.targetDate
  }

  const canWithdrawMinStaking = (goal: Goal) => {
    return (minStakingCountdown[goal.id] || 0) <= 0
  }

  const isEarlyWithdrawal = (goal: Goal) => {
    return !canWithdraw(goal) && canWithdrawMinStaking(goal)
  }

  const getProgress = (goal: Goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  }

  const getDaysRemaining = (goal: Goal) => {
    const diff = goal.targetDate.getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
        </div>
      {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/70 backdrop-blur flex-shrink-0">
          <div className="mx-auto w-full max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">BaseVault</h1>
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
                              <Button onClick={openConnectModal} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90" size="sm">
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
                  {!isOnSepoliaChain && (
                    <Button
                      onClick={handleSwitchToSepolia}
                      variant="destructive"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Switch to Sepolia</span>
                    </Button>
                  )}
                  <Badge variant={isOnSepoliaChain ? "default" : "destructive"} className="flex items-center space-x-1 bg-gray-800 border border-gray-700">
                    <div className={`w-2 h-2 ${isOnSepoliaChain ? "bg-green-500" : "bg-red-500"} rounded-full`} />
                    <span className="text-xs">{isOnSepoliaChain ? "Sepolia" : "Wrong Network"}</span>
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
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-4">

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!currentGoal ? (
          <Card className="bg-gray-800/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg text-white">
                <Target className="w-5 h-5 text-blue-400" />
                <span>Create a Lock Goal</span>
              </CardTitle>
              <CardDescription className="text-sm text-gray-300">Define your target, deposit, and duration. Funds earn yield while locked.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="goal-name" className="text-sm text-gray-300">
                  Goal Name
                </Label>
                <Input
                  id="goal-name"
                  placeholder="e.g., Bike Vault, Vacation Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="target-amount" className="text-sm text-gray-300">
                    Target (USDC)
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-400">$</div>
                    <Input
                    id="target-amount"
                    type="number"
                    placeholder="150"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600 pl-6"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="duration" className="text-sm text-gray-300">
                    Days
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={newGoal.duration}
                    onChange={(e) => setNewGoal({ ...newGoal, duration: e.target.value })}
                      className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600"
                    />
                    <div className="hidden sm:flex gap-1">
                      {[30, 60, 90].map((d) => (
                        <Button
                          key={d}
                          size="icon"
                          variant="outline"
                          className={`h-8 w-8 border-gray-600 text-gray-300 ${String(d) === newGoal.duration ? "bg-gray-700" : ""}`}
                          onClick={() => setNewGoal({ ...newGoal, duration: String(d) })}
                        >
                          {d}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="initial-deposit" className="text-sm text-gray-300">
                  Initial Deposit (USDC)
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-400">$</div>
                  <Input
                  id="initial-deposit"
                  type="number"
                  placeholder="50"
                  value={newGoal.initialDeposit}
                  onChange={(e) => setNewGoal({ ...newGoal, initialDeposit: e.target.value })}
                    className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600 pl-6"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="protocol" className="text-sm text-gray-300">
                  Protocol
                </Label>
                <Select value={newGoal.protocol} onValueChange={(value) => setNewGoal({ ...newGoal, protocol: value })}>
                  <SelectTrigger className="text-sm bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose protocol" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="aave" className="text-white hover:bg-gray-700">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                          <span>Aave</span>
                        </div>
                        <span className="text-[11px] text-gray-400"> - Stable yield</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="symbiotic" className="text-white hover:bg-gray-700">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                          <span>Symbiotic</span>
                        </div>
                        <span className="text-[11px] text-gray-400"> - Cohort bonus</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="h-3.5 w-3.5 text-blue-400" />
                  <span>Funds locked until goal date</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="bg-gray-700 border border-gray-600 text-gray-200">~5.8% APY</Badge>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border-gray-700 text-gray-200">
                    Simulated rate for demo purposes.
                  </TooltipContent>
                </Tooltip>
              </div>

              <Button
                onClick={openCreateGoalModal}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90"
                disabled={!newGoal.name || !newGoal.targetAmount || !newGoal.initialDeposit}
              >
                Create Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-800/80 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg text-white">
                <Target className="w-5 h-5 text-blue-400" />
                <span>Your Goal</span>
              </CardTitle>
              <CardDescription className="text-sm text-gray-300">You can only have one active goal at a time</CardDescription>
            </CardHeader>
          </Card>
        )}

        {currentGoal && (
          <Card className="overflow-hidden bg-gray-800/80 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white">{currentGoal.name}</CardTitle>
                <Badge variant={canWithdraw(currentGoal) ? "default" : "secondary"} className="text-xs bg-gray-700 text-gray-200">
                  {canWithdraw(currentGoal) ? "Ready" : `${getDaysRemaining(currentGoal)}d left`}
                </Badge>
              </div>
              <CardDescription className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>
                    ${fmt(currentGoal.currentAmount)} / ${fmt(currentGoal.targetAmount)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Due {currentGoal.targetDate.toLocaleDateString()}</span>
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Progress</span>
                  <span>{getProgress(currentGoal).toFixed(1)}%</span>
                </div>
                <Progress value={getProgress(currentGoal)} className="h-2" />
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`deposit-${currentGoal.id}`} className="text-xs text-gray-300">
                      Deposit Amount
                    </Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-400">$</div>
                      <Input
                      id={`deposit-${currentGoal.id}`}
                      type="number"
                      placeholder="50"
                      value={selectedGoal === currentGoal.id ? depositAmount : ""}
                      onChange={(e) => {
                        setSelectedGoal(currentGoal.id)
                        setDepositAmount(e.target.value)
                      }}
                      className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600 pl-6"
                    />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`extend-days-${currentGoal.id}`} className="text-xs text-gray-300">
                      Extend Days (Optional)
                    </Label>
                    <Input
                      id={`extend-days-${currentGoal.id}`}
                      type="number"
                      placeholder="30"
                      value={selectedGoal === currentGoal.id ? extendDays : ""}
                      onChange={(e) => {
                        setSelectedGoal(currentGoal.id)
                        setExtendDays(e.target.value)
                      }}
                      className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => openDepositModal(currentGoal)}
                  disabled={selectedGoal !== currentGoal.id || !depositAmount}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90"
                  size="sm"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Deposit
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                size="sm"
                disabled={!canWithdrawMinStaking(currentGoal)}
                onClick={() => openWithdrawModal(currentGoal)}
              >
                {canWithdraw(currentGoal)
                  ? "Withdraw Full Amount + Yield"
                  : canWithdrawMinStaking(currentGoal)
                    ? "Withdraw Early (No APY)"
                    : `Min staking: ${minStakingCountdown[currentGoal.id] || 0}s`}
              </Button>

              <div className="text-xs text-gray-300 bg-gray-800/60 p-3 rounded-lg border border-gray-700">
                <p className="font-medium mb-1 text-white">Yield Mechanics</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Early withdrawal forfeits yield (redistributed to cohort).</li>
                  <li>On-time withdrawal: principal + yield + cohort bonus.</li>
                  <li>0.5% fee on withdrawal.</li>
                  <li>Minimum staking time: 60 seconds.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {goals.length === 0 && (
          <Card className="text-center py-8 bg-gray-800/80 border-gray-800">
            <CardContent>
              <Target className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <CardTitle className="text-base mb-2 text-white">No Goals Yet</CardTitle>
              <CardDescription className="text-sm text-gray-300">
                Create your first savings goal to start earning yield with Aave and Symbiotic.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
          </div>
        </main>

      <Dialog open={showCreateGoalModal} onOpenChange={setShowCreateGoalModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-white">
              <Target className="w-5 h-5 text-blue-400" />
              <span>Confirm Goal Creation</span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">Review your goal details before creating</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Goal Name:</span>
                <span className="text-sm font-medium text-white">{newGoal.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Target Amount:</span>
                <span className="text-sm font-medium text-white">${newGoal.targetAmount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Initial Deposit:</span>
                <span className="text-sm font-medium text-white">${newGoal.initialDeposit} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Duration:</span>
                <span className="text-sm font-medium text-white">{newGoal.duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Protocol:</span>
                <span className="text-sm font-medium text-white">
                  {newGoal.protocol === "aave" ? "Aave" : "Symbiotic"}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
              <p className="font-medium mb-1 text-white">Remember:</p>
              <p>• Early withdrawal forfeits yield</p>
              <p>• Completing on time earns bonus yield</p>
              <p>• 0.5% fee applies on withdrawal</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateGoalModal(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
            <Button onClick={confirmCreateGoal} disabled={isTransactionPending} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90">
              {!isOnSepoliaChain ? "Switch to Sepolia" : isTransactionPending ? "Processing..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-white">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>Confirm Deposit</span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">Review your deposit details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Goal:</span>
                <span className="text-sm font-medium text-white">{modalGoal?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Deposit Amount:</span>
                <span className="text-sm font-medium text-white">${depositAmount} USDC</span>
              </div>
              {extendDays && Number.parseInt(extendDays) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Extend Goal By:</span>
                  <span className="text-sm font-medium text-white">{extendDays} days</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">New Total:</span>
                <span className="text-sm font-medium text-white">${modalGoal ? fmt(modalGoal.currentAmount + Number.parseFloat(depositAmount || "0")) : "0"} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Progress:</span>
                <span className="text-sm font-medium text-white">
                  {modalGoal
                    ? Math.min(
                        ((modalGoal.currentAmount + Number.parseFloat(depositAmount || "0")) / modalGoal.targetAmount) *
                          100,
                        100,
                      ).toFixed(1)
                    : "0"}
                  %
                </span>
              </div>
              {extendDays && Number.parseInt(extendDays) > 0 && modalGoal && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">New Target Date:</span>
                  <span className="text-sm font-medium text-white">
                    {new Date(
                      modalGoal.targetDate.getTime() + Number.parseInt(extendDays) * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDepositModal(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
            <Button onClick={confirmDeposit} disabled={isTransactionPending} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90">
              {!isOnSepoliaChain ? "Switch to Sepolia" : isTransactionPending ? "Processing..." : "Confirm Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-white">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span>Confirm Withdrawal</span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">Review your withdrawal details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Goal:</span>
                <span className="text-sm font-medium text-white">{modalGoal?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Principal:</span>
                <span className="text-sm font-medium text-white">${modalGoal ? fmt(modalGoal.currentAmount) : "0.00"} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Estimated Yield:</span>
                <span
                  className={`text-sm font-medium ${modalGoal && isEarlyWithdrawal(modalGoal) ? "text-red-400" : "text-green-400"}`}
                >
                  {modalGoal && isEarlyWithdrawal(modalGoal) ? "$0.00 USDC" : "+$12.50 USDC"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Withdrawal Fee (0.5%):</span>
                <span className="text-sm font-medium text-red-400">-$0.85 USDC</span>
              </div>
               <Separator className="bg-gray-700" />
              <div className="flex justify-between font-medium">
                <span className="text-sm text-gray-300">Total Withdrawal:</span>
                <span className={`text-sm ${modalGoal && canWithdraw(modalGoal) ? "text-white" : "text-green-400"}`}>
                  $
                  {modalGoal
                    ? (modalGoal.currentAmount + (isEarlyWithdrawal(modalGoal) ? 0 : 12.5) - 0.85).toFixed(2)
                    : "0"}{" "}
                  USDC
                </span>
              </div>
            </div>

            {modalGoal && canWithdraw(modalGoal) ? (
              <div className="text-xs text-gray-300 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                <p className="font-medium mb-1 text-green-400">🎉 Goal Completed!</p>
                <p>You've earned bonus yield from early withdrawals by others in your cohort.</p>
              </div>
            ) : (
              <div className="text-xs text-gray-300 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                <p className="font-medium mb-1 text-yellow-400">⚠️ Early Withdrawal</p>
                <p>
                  You're withdrawing before your goal completion date. You will not receive any APY rewards, but your
                  principal minus fees will be returned.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
            <Button
              onClick={confirmWithdraw}
              disabled={isTransactionPending}
              className={modalGoal && canWithdraw(modalGoal) ? "bg-green-600 hover:bg-green-700" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90"}
            >
              {!isOnSepoliaChain ? "Switch to Sepolia" : isTransactionPending ? "Processing..." : "Confirm Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
        <a
          href="https://v0.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          made with v0
        </a>
      </div>
      </div>
    </TooltipProvider>
  )
}

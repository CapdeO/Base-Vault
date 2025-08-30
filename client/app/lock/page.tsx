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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col relative">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">BaseVault</h1>
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
                              <Button onClick={openConnectModal} className="bg-blue-600 hover:bg-blue-700" size="sm">
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
                  <Badge variant={isOnSepoliaChain ? "default" : "destructive"} className="flex items-center space-x-1">
                    <div className={`w-2 h-2 ${isOnSepoliaChain ? "bg-green-500" : "bg-red-500"} rounded-full`} />
                    <span>{isOnSepoliaChain ? "Sepolia Network" : "Wrong Network"}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!currentGoal ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg text-white">
                <Target className="w-5 h-5 text-blue-400" />
                <span>Create Goal</span>
              </CardTitle>
              <CardDescription className="text-sm text-gray-300">Set target amount and timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
                  <Input
                    id="target-amount"
                    type="number"
                    placeholder="150"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="duration" className="text-sm text-gray-300">
                    Days
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={newGoal.duration}
                    onChange={(e) => setNewGoal({ ...newGoal, duration: e.target.value })}
                    className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="initial-deposit" className="text-sm text-gray-300">
                  Initial Deposit (USDC)
                </Label>
                <Input
                  id="initial-deposit"
                  type="number"
                  placeholder="50"
                  value={newGoal.initialDeposit}
                  onChange={(e) => setNewGoal({ ...newGoal, initialDeposit: e.target.value })}
                  className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="protocol" className="text-sm text-gray-300">
                  Protocol
                </Label>
                <Select value={newGoal.protocol} onValueChange={(value) => setNewGoal({ ...newGoal, protocol: value })}>
                  <SelectTrigger className="text-sm bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="aave" className="text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">A</span>
                        </div>
                        <span>Aave</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="symbiotic" className="text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">S</span>
                        </div>
                        <span>Symbiotic</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={openCreateGoalModal}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!newGoal.name || !newGoal.targetAmount || !newGoal.initialDeposit}
              >
                Create Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
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
          <Card className="overflow-hidden bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white">{currentGoal.name}</CardTitle>
                <Badge variant={canWithdraw(currentGoal) ? "default" : "secondary"} className="text-xs bg-gray-700 text-gray-200">
                  {canWithdraw(currentGoal) ? "Ready" : `${getDaysRemaining(currentGoal)}d left`}
                </Badge>
              </div>
              <CardDescription className="flex items-center space-x-3 text-xs text-gray-300">
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>
                    ${currentGoal.currentAmount.toFixed(2)} / ${currentGoal.targetAmount.toFixed(2)}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{currentGoal.targetDate.toLocaleDateString()}</span>
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

              <Separator className="bg-gray-600" />

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`deposit-${currentGoal.id}`} className="text-xs text-gray-300">
                      Deposit Amount
                    </Label>
                    <Input
                      id={`deposit-${currentGoal.id}`}
                      type="number"
                      placeholder="50"
                      value={selectedGoal === currentGoal.id ? depositAmount : ""}
                      onChange={(e) => {
                        setSelectedGoal(currentGoal.id)
                        setDepositAmount(e.target.value)
                      }}
                      className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600"
                    />
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Deposit
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
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

              <div className="text-xs text-gray-300 bg-gray-700/50 p-2 rounded-lg">
                <p className="font-medium mb-1 text-white">Yield Mechanics:</p>
                <p>• Early withdrawal = lose yield (redistributed to others)</p>
                <p>• On-time withdrawal = your deposit + yield + bonus from early exits</p>
                <p>• 0.5% fee on withdrawal only</p>
                <p>• Minimum staking time: 60 seconds</p>
              </div>
            </CardContent>
          </Card>
        )}

        {goals.length === 0 && (
          <Card className="text-center py-8 bg-gray-800 border-gray-700">
            <CardContent>
              <Target className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <CardTitle className="text-base mb-2 text-white">No Goals Yet</CardTitle>
              <CardDescription className="text-sm text-gray-300">
                Create your first savings goal to start earning yield with Aave and Symbiotic
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showCreateGoalModal} onOpenChange={setShowCreateGoalModal}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-white">
              <Target className="w-5 h-5 text-blue-400" />
              <span>Confirm Goal Creation</span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">Review your goal details before creating</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
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

            <div className="text-xs text-gray-300 bg-gray-700/30 p-3 rounded-lg">
              <p className="font-medium mb-1 text-white">Remember:</p>
              <p>• Early withdrawal forfeits yield</p>
              <p>• Completing on time earns bonus yield</p>
              <p>• 0.5% fee applies on withdrawal</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateGoalModal(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Cancel
            </Button>
            <Button onClick={confirmCreateGoal} disabled={isTransactionPending} className="bg-blue-600 hover:bg-blue-700">
              {!isOnSepoliaChain ? "Switch to Sepolia" : isTransactionPending ? "Processing..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-white">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>Confirm Deposit</span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">Review your deposit details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
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
                <span className="text-sm font-medium text-white">
                  ${modalGoal ? (modalGoal.currentAmount + Number.parseFloat(depositAmount || "0")).toFixed(2) : "0"}{" "}
                  USDC
                </span>
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
            <Button variant="outline" onClick={() => setShowDepositModal(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Cancel
            </Button>
            <Button onClick={confirmDeposit} disabled={isTransactionPending} className="bg-blue-600 hover:bg-blue-700">
              {!isOnSepoliaChain ? "Switch to Sepolia" : isTransactionPending ? "Processing..." : "Confirm Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-white">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span>Confirm Withdrawal</span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">Review your withdrawal details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Goal:</span>
                <span className="text-sm font-medium text-white">{modalGoal?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Principal:</span>
                <span className="text-sm font-medium text-white">${modalGoal?.currentAmount.toFixed(2)} USDC</span>
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
              <Separator className="bg-gray-600" />
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
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Cancel
            </Button>
            <Button
              onClick={confirmWithdraw}
              disabled={isTransactionPending}
              className={modalGoal && canWithdraw(modalGoal) ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
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
  )
}

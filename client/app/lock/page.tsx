"use client"

import { useState, useEffect } from "react"
import { useAccount, useDisconnect, useSwitchChain, useSendTransaction } from "wagmi"
import { base } from "wagmi/chains"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Target } from "lucide-react"
import { formatUnits, parseUnits } from "viem"

// Import components
import AppHeader from "@/components/lock/AppHeader"
import CreateGoalCard from "@/components/lock/CreateGoalCard"
import GoalCard from "@/components/lock/GoalCard"
import CreateGoalModal from "@/components/lock/CreateGoalModal"
import DepositModal from "@/components/lock/DepositModal"
import WithdrawModal from "@/components/lock/WithdrawModal"

// Import web3 hook
import { useBaseVault, type GoalData } from "@/hooks/useBaseVault"

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

interface NewGoal {
  name: string
  targetAmount: string
  duration: string
  initialDeposit: string
  protocol: string
}

export default function BaseVaultApp() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { sendTransaction, isPending: isTransactionPending } = useSendTransaction()

  // Web3 hook - now includes localStorage functions
  const { 
    useUserData, 
    useUsdcBalance, 
    useUsdcAllowance, 
    useMinStakingTime,
    approveUsdc, 
    createGoal, 
    withdrawGoal, 
    getGoalFromLocalStorage,
    removeGoalFromLocalStorage,
    isLoading: contractLoading, 
    error: contractError,
    isConfirmed,
    isWithdrawConfirmed,
    hash: currentTxHash
  } = useBaseVault()

  const isOnBaseChain = chain?.id === base.id

  // Read user data from contract
  const { data: userData, isLoading: userDataLoading, refetch: refetchUserData } = useUserData(address)
  
  // Read USDC balance
  const { data: usdcBalance, isLoading: usdcBalanceLoading, refetch: refetchUsdcBalance } = useUsdcBalance(address)
  
  // Read USDC allowance
  const { data: usdcAllowance, isLoading: usdcAllowanceLoading, refetch: refetchUsdcAllowance } = useUsdcAllowance(address)
  
  // Read minimum staking time from contract
  const { data: minStakingTime, isLoading: minStakingTimeLoading } = useMinStakingTime()

  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState<NewGoal>({
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
  const [isApprovalPending, setIsApprovalPending] = useState(false)
  const [pendingGoalData, setPendingGoalData] = useState<{
    assets: bigint
    goalData: Omit<GoalData, 'createdAt'>
    durationInDays: number
  } | null>(null)
  const [lastProcessedTxHash, setLastProcessedTxHash] = useState<string | null>(null)

  // Monitor address changes and fetch all data
  useEffect(() => {
    if (address && isOnBaseChain) {
      console.log("🔍 Address changed, fetching all data for:", address)
      refetchUserData()
      refetchUsdcBalance()
      refetchUsdcAllowance()
    }
  }, [address, isOnBaseChain, refetchUserData, refetchUsdcBalance, refetchUsdcAllowance])

  // Monitor USDC balance changes
  useEffect(() => {
    if (usdcBalance !== undefined) {
      console.log("💵 USDC Balance:", formatUnits(usdcBalance, 6), "USDC")
    }
  }, [usdcBalance])

  // Monitor allowance changes
  useEffect(() => {
    if (usdcAllowance !== undefined) {
      console.log("🔓 USDC Allowance:", formatUnits(usdcAllowance, 6), "USDC")
    }
  }, [usdcAllowance])

  // Refetch data when transactions are confirmed (approve/deposit only)
  useEffect(() => {
    if (isConfirmed && currentTxHash && currentTxHash !== lastProcessedTxHash) {
      console.log("✅ Transaction confirmed:", currentTxHash)
      setLastProcessedTxHash(currentTxHash)
      
      // If we were waiting for approval, now proceed with deposit
      if (isApprovalPending && pendingGoalData && address) {
        console.log("🔄 Approval confirmed, proceeding with deposit...")
        setIsApprovalPending(false)
        
        // Execute the deposit after approval
        setTimeout(async () => {
          try {
            await createGoal(
              pendingGoalData.assets,
              address,
              pendingGoalData.durationInDays,
              pendingGoalData.goalData
            )
            setPendingGoalData(null)
          } catch (error) {
            console.error("Deposit after approval failed:", error)
            alert("Deposit failed after approval. Please try again.")
            setPendingGoalData(null)
          }
        }, 1000)
      } else {
        // For other transactions (like deposits), just refetch data
        setTimeout(() => {
          refetchUserData()
          refetchUsdcBalance()
          refetchUsdcAllowance()
        }, 2000)
      }
    }
  }, [isConfirmed, currentTxHash, lastProcessedTxHash, isApprovalPending, pendingGoalData, address, createGoal, refetchUserData, refetchUsdcBalance, refetchUsdcAllowance])

  // Handle withdraw transaction confirmations specifically
  useEffect(() => {
    if (isWithdrawConfirmed && address) {
      console.log("💸 Withdraw transaction confirmed, cleaning localStorage...")
      removeGoalFromLocalStorage(address)
      console.log("🗑️ Goal removed from localStorage after withdraw confirmation")
      
      // Refetch data after withdraw
      setTimeout(() => {
        refetchUserData()
        refetchUsdcBalance()
        refetchUsdcAllowance()
      }, 2000)
    }
  }, [isWithdrawConfirmed, address])

  // Monitor user data changes and create active goal from contract + localStorage
  useEffect(() => {
    if (userData && address) {
      console.log("📊 User data from contract:", {
        vesting: userData[0].toString(),
        amount: userData[1].toString(),
        invested: userData[2].toString(),
        extracted: userData[3].toString()
      })

      const userAmount = userData[1] // amount is the second element in the struct
      
      if (userAmount > BigInt(0)) {
        console.log("💰 User has active deposit:", formatUnits(userAmount, 6), "USDC")
        
        // Try to get goal data from localStorage
        const storedGoal = getGoalFromLocalStorage(address)
        
        if (storedGoal) {
          console.log("📁 Found stored goal data:", storedGoal)
          
          // Create active goal with stored data + contract amount
          const activeGoal: Goal = {
            id: "contract-goal",
            name: storedGoal.name,
            targetAmount: storedGoal.targetAmount,
            currentAmount: Number(formatUnits(userAmount, 6)),
            targetDate: new Date(storedGoal.createdAt + (storedGoal.duration * 24 * 60 * 60 * 1000)),
            createdDate: new Date(storedGoal.createdAt),
            isActive: true,
            protocol: storedGoal.protocol,
          }

          setGoals([activeGoal])
          setMinStakingCountdown((prev) => ({ ...prev, [activeGoal.id]: 60 }))
          
          console.log("✅ Active goal created from localStorage + contract data")
        } else {
          // Fallback: create basic goal if no localStorage data
          const activeGoal: Goal = {
            id: "contract-goal",
            name: "Active Vault Goal",
            targetAmount: Number(formatUnits(userAmount, 6)) * 2,
            currentAmount: Number(formatUnits(userAmount, 6)),
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            createdDate: new Date(),
            isActive: true,
            protocol: "aave",
          }

          setGoals([activeGoal])
          setMinStakingCountdown((prev) => ({ ...prev, [activeGoal.id]: 60 }))
          
          console.log("✅ Active goal created with fallback data")
        }
      } else {
        console.log("📭 No active deposit found")
        setGoals([])
        // Only clean localStorage if there are currently goals (to avoid infinite calls)
        if (goals.length > 0) {
          console.log("🗑️ Cleaning localStorage due to no active deposit")
          removeGoalFromLocalStorage(address)
        }
      }
    } else if (!userData && address) {
      // If userData is explicitly null/undefined (not loading), clear goals
      setGoals([])
    }
  }, [userData, address]) // Removed the localStorage functions from dependencies

  const currentGoal = goals.find((goal) => goal.isActive)

  // Calculate min staking countdown based on contract minStakingTime and goal createdAt
  useEffect(() => {
    if (!minStakingTime || !currentGoal || !address) {
      // Clear countdown if no data
      setMinStakingCountdown((prev) => ({
        ...prev,
        [currentGoal?.id || '']: 0
      }))
      return
    }

    // Read localStorage ONCE
    const storedGoal = getGoalFromLocalStorage(address)
    if (!storedGoal) {
      setMinStakingCountdown((prev) => ({
        ...prev,
        [currentGoal.id]: 0
      }))
      return
    }

    // Calculate initial values ONCE
    const depositTimeSeconds = Math.floor(storedGoal.createdAt / 1000)
    const minStakingTimeSeconds = Number(minStakingTime)
    const withdrawalAllowedTime = depositTimeSeconds + minStakingTimeSeconds
    const currentTimeSeconds = Math.floor(Date.now() / 1000)
    const initialRemainingSeconds = withdrawalAllowedTime - currentTimeSeconds

    console.log("⏰ Initial staking countdown calculation:", {
      depositTime: new Date(storedGoal.createdAt).toISOString(),
      minStakingTimeSeconds,
      withdrawalAllowedTime: new Date(withdrawalAllowedTime * 1000).toISOString(),
      currentTime: new Date().toISOString(),
      initialRemainingSeconds
    })

    // If already expired, no need for interval
    if (initialRemainingSeconds <= 0) {
      console.log("✅ Staking period already expired, withdrawal allowed")
      setMinStakingCountdown((prev) => ({
        ...prev,
        [currentGoal.id]: 0
      }))
      return
    }

    // Set initial countdown
    setMinStakingCountdown((prev) => ({
      ...prev,
      [currentGoal.id]: initialRemainingSeconds
    }))

    // Only create interval if we need countdown
    console.log("⏳ Starting countdown interval for", initialRemainingSeconds, "seconds")
    const interval = setInterval(() => {
      const currentTimeSeconds = Math.floor(Date.now() / 1000)
      const remainingSeconds = withdrawalAllowedTime - currentTimeSeconds
      
      if (remainingSeconds <= 0) {
        console.log("✅ Countdown finished, withdrawal now allowed")
        setMinStakingCountdown((prev) => ({
          ...prev,
          [currentGoal.id]: 0
        }))
        clearInterval(interval)
      } else {
        setMinStakingCountdown((prev) => ({
          ...prev,
          [currentGoal.id]: remainingSeconds
        }))
      }
    }, 1000)

    return () => {
      console.log("🧹 Cleaning up countdown interval")
      clearInterval(interval)
    }
  }, [minStakingTime, currentGoal, address]) // Dependencies don't include getGoalFromLocalStorage

  const handleSwitchToBase = async () => {
    if (switchChain) {
      switchChain({ chainId: base.id })
    }
  }

  // Check if user has sufficient USDC balance
  const hasInsufficientBalance = (amount: string) => {
    if (!usdcBalance || !amount) return false
    const requiredAmount = parseUnits(amount, 6)
    return usdcBalance < requiredAmount
  }

  // Check if user needs to approve USDC
  const needsApproval = (amount: string) => {
    if (!usdcAllowance || !amount) return false
    const requiredAmount = parseUnits(amount, 6)
    return usdcAllowance < requiredAmount
  }

  const openCreateGoalModal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.initialDeposit) return
    setShowCreateGoalModal(true)
  }

  const confirmCreateGoal = async () => {
    if (!isOnBaseChain) {
      await handleSwitchToBase()
      return
    }

    if (!address) return

    try {
      const assets = parseUnits(newGoal.initialDeposit, 6) // Only assets goes to contract
      const durationInDays = parseInt(newGoal.duration)

      // Check balance first
      if (hasInsufficientBalance(newGoal.initialDeposit)) {
        alert(`Insufficient USDC balance. You need ${newGoal.initialDeposit} USDC but have ${formatUnits(usdcBalance || BigInt(0), 6)} USDC`)
        return
      }

      // Prepare goal data for localStorage
      const goalData: Omit<GoalData, 'createdAt'> = {
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.targetAmount),
        duration: durationInDays,
        protocol: newGoal.protocol
      }

      // ALWAYS do approve first, then deposit
      console.log("🔓 Starting approve → deposit flow...")
      
      // Store pending goal data for after approval
      setPendingGoalData({
        assets,
        goalData,
        durationInDays
      })
      setIsApprovalPending(true)
      
      // Always request approval first
      await approveUsdc(assets)
      
      console.log("🔄 Approval transaction sent, waiting for confirmation...")
      setShowCreateGoalModal(false) // Close modal, deposit will happen after approval

    } catch (error) {
      console.error("Approval failed:", error)
      alert("Approval failed. Please try again.")
      setPendingGoalData(null)
      setIsApprovalPending(false)
      return
    }

    setNewGoal({ name: "", targetAmount: "", duration: "30", initialDeposit: "", protocol: "aave" })
  }

  const openDepositModal = (goal: Goal) => {
    if (!depositAmount) return
    setModalGoal(goal)
    setShowDepositModal(true)
  }

  const confirmDeposit = async () => {
    if (!modalGoal || !depositAmount || !address) return
    if (!isOnBaseChain) {
      await handleSwitchToBase()
      return
    }

    try {
      const assets = parseUnits(depositAmount, 6)
      const durationInDays = parseInt(newGoal.duration)

      // Check balance first
      if (hasInsufficientBalance(depositAmount)) {
        alert(`Insufficient USDC balance. You need ${depositAmount} USDC but have ${formatUnits(usdcBalance || BigInt(0), 6)} USDC`)
        return
      }

      // For additional deposits, we'll extend the existing goal data
      const existingGoalData = getGoalFromLocalStorage(address)
      const goalData: Omit<GoalData, 'createdAt'> = existingGoalData ? {
        name: existingGoalData.name,
        targetAmount: existingGoalData.targetAmount, // Keep same target
        duration: durationInDays,
        protocol: existingGoalData.protocol
      } : {
        name: modalGoal.name,
        targetAmount: modalGoal.targetAmount,
        duration: durationInDays,
        protocol: modalGoal.protocol
      }

      // ALWAYS do approve first for additional deposits too
      console.log("🔓 Starting approve → deposit flow for additional deposit...")
      
      setPendingGoalData({
        assets,
        goalData,
        durationInDays
      })
      setIsApprovalPending(true)
      
      // Always request approval first
      await approveUsdc(assets)
      console.log("🔄 Approval for additional deposit sent...")
      setShowDepositModal(false) // Close modal, deposit will happen after approval

    } catch (error) {
      console.error("Approval for additional deposit failed:", error)
      alert("Approval failed. Please try again.")
      setPendingGoalData(null)
      setIsApprovalPending(false)
      return
    }

    setDepositAmount("")
    setExtendDays("")
    setSelectedGoal(null)
    setModalGoal(null)
  }

  const openWithdrawModal = (goal: Goal) => {
    setModalGoal(goal)
    setShowWithdrawModal(true)
  }

  const confirmWithdraw = async () => {
    if (!modalGoal || !address) return
    if (!isOnBaseChain) {
      await handleSwitchToBase()
      return
    }

    try {
      await withdrawGoal(address, address)
      
      console.log("💸 Withdrawal transaction sent, waiting for confirmation...")

    } catch (error) {
      console.error("Withdrawal failed:", error)
      alert("Withdrawal failed. Please try again.")
      return
    }

    setModalGoal(null)
    setShowWithdrawModal(false)
  }

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Show loading state while fetching user data
  if (userDataLoading && address && isOnBaseChain) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col relative">
          <AppHeader 
            isConnected={isConnected}
            isOnBaseChain={isOnBaseChain}
            address={address}
            onSwitchToBase={handleSwitchToBase}
          />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading your vault data...</p>
            </div>
          </main>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
        </div>

        <AppHeader 
          isConnected={isConnected}
          isOnBaseChain={isOnBaseChain}
          address={address}
          onSwitchToBase={handleSwitchToBase}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-4">
            {/* USDC Balance Display */}
            {address && isOnBaseChain && (
              <Card className="bg-gray-800/80 border-gray-800">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                      <span className="text-white font-medium">USDC Balance</span>
                    </div>
                    <div className="text-right">
                      {usdcBalanceLoading ? (
                        <div className="animate-pulse bg-gray-700 h-5 w-20 rounded"></div>
                      ) : (
                        <span className="text-lg font-semibold text-white">
                          {usdcBalance ? formatUnits(usdcBalance, 6) : '0.00'} USDC
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {!currentGoal ? (
                <CreateGoalCard 
                  newGoal={newGoal}
                  setNewGoal={setNewGoal}
                  onCreateGoal={openCreateGoalModal}
                  usdcBalance={usdcBalance}
                  usdcAllowance={usdcAllowance}
                  isBalanceLoading={usdcBalanceLoading}
                />
              ) : (
                <Card className="bg-gray-800/80 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg text-white">
                      <Target className="w-5 h-5 text-blue-400" />
                      <span>Your Goal</span>
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-300">
                      Active goal from your vault deposit
                      {userData && (
                        <span className="ml-2 text-blue-400">
                          (Contract: {formatUnits(userData[1], 6)} USDC)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {currentGoal && (
                <GoalCard 
                  goal={currentGoal}
                  depositAmount={depositAmount}
                  extendDays={extendDays}
                  selectedGoal={selectedGoal}
                  minStakingCountdown={minStakingCountdown}
                  onDepositAmountChange={setDepositAmount}
                  onExtendDaysChange={setExtendDays}
                  onSetSelectedGoal={setSelectedGoal}
                  onDeposit={() => openDepositModal(currentGoal)}
                  onWithdraw={() => openWithdrawModal(currentGoal)}
                  fmt={fmt}
                />
              )}

              {goals.length === 0 && !userDataLoading && (
                <Card className="text-center py-8 bg-gray-800/80 border-gray-800">
                  <CardContent>
                    <Target className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <CardTitle className="text-base mb-2 text-white">No Goals Yet</CardTitle>
                    <CardDescription className="text-sm text-gray-300">
                      Create your first savings goal to start earning yield with Aave and Symbiotic.
                      {usdcBalance && usdcBalance === BigInt(0) && (
                        <div className="mt-2 text-yellow-400 text-xs">
                          ⚠️ You need USDC to create a goal. Please get some USDC first.
                        </div>
                      )}
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        <CreateGoalModal 
          isOpen={showCreateGoalModal}
          onClose={() => setShowCreateGoalModal(false)}
          newGoal={newGoal}
          isOnBaseChain={isOnBaseChain}
          isTransactionPending={contractLoading || isTransactionPending}
          onConfirm={confirmCreateGoal}
        />

        <DepositModal 
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          goal={modalGoal}
          depositAmount={depositAmount}
          extendDays={extendDays}
          isOnBaseChain={isOnBaseChain}
          isTransactionPending={contractLoading || isTransactionPending}
          onConfirm={confirmDeposit}
          fmt={fmt}
        />

        <WithdrawModal 
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          goal={modalGoal}
          isOnBaseChain={isOnBaseChain}
          isTransactionPending={contractLoading || isTransactionPending}
          onConfirm={confirmWithdraw}
          fmt={fmt}
        />

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

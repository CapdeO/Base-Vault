import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseVaultAbi } from '@/lib/abi'
import { baseVaultContract, usdcBaseContract } from '@/lib/constants'
import { useEffect, useState } from 'react'
import { formatUnits, erc20Abi } from 'viem'

export interface UserData {
  vesting: bigint
  amount: bigint
  invested: bigint
  extracted: bigint
}

export interface GoalData {
  name: string
  targetAmount: number
  duration: number
  protocol: string
  createdAt: number
}

export function useBaseVault() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [withdrawTxHash, setWithdrawTxHash] = useState<string | null>(null)

  const { writeContract, data: hash, isPending: isWritePending, writeContractAsync } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Separate hook for withdraw transaction confirmation
  const { 
    isLoading: isWithdrawConfirming, 
    isSuccess: isWithdrawConfirmed 
  } = useWaitForTransactionReceipt({
    hash: withdrawTxHash as `0x${string}`,
    query: {
      enabled: !!withdrawTxHash,
    },
  })

  // Hook para leer datos del usuario
  const useUserData = (address: string | undefined) => {
    return useReadContract({
      address: baseVaultContract as `0x${string}`,
      abi: baseVaultAbi,
      functionName: 'user',
      args: address ? [address as `0x${string}`] : undefined,
      query: {
        enabled: !!address,
      },
    })
  }

  // Hook para leer balance de USDC
  const useUsdcBalance = (address: string | undefined) => {
    return useReadContract({
      address: usdcBaseContract as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: address ? [address as `0x${string}`] : undefined,
      query: {
        enabled: !!address,
      },
    })
  }

  // Hook para leer allowance de USDC
  const useUsdcAllowance = (address: string | undefined) => {
    return useReadContract({
      address: usdcBaseContract as `0x${string}`,
      abi: erc20Abi,
      functionName: 'allowance',
      args: address ? [address as `0x${string}`, baseVaultContract as `0x${string}`] : undefined,
      query: {
        enabled: !!address,
      },
    })
  }

  // Hook para leer minStakingTime del contrato
  const useMinStakingTime = () => {
    return useReadContract({
      address: baseVaultContract as `0x${string}`,
      abi: baseVaultAbi,
      functionName: 'minStakingTime',
      query: {
        enabled: true,
      },
    })
  }

  // Funciones para manejar localStorage de goals
  const saveGoalToLocalStorage = (address: string, goalData: GoalData) => {
    const key = `goal_${address.toLowerCase()}`
    localStorage.setItem(key, JSON.stringify(goalData))
    console.log("💾 Goal saved to localStorage:", goalData)
  }

  const getGoalFromLocalStorage = (address: string): GoalData | null => {
    const key = `goal_${address.toLowerCase()}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        const goal = JSON.parse(stored)
        console.log("📁 Goal loaded from localStorage:", goal)
        return goal
      } catch (error) {
        console.error("Error parsing goal from localStorage:", error)
      }
    }
    return null
  }

  const removeGoalFromLocalStorage = (address: string) => {
    const key = `goal_${address.toLowerCase()}`
    localStorage.removeItem(key)
    console.log("🗑️ Goal removed from localStorage")
  }

  // Función para aprobar USDC
  const approveUsdc = async (amount: bigint) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log("🔓 Approving USDC spend:", formatUnits(amount, 6), "USDC")
      
      await writeContract({
        address: usdcBaseContract as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [baseVaultContract as `0x${string}`, amount],
      })
      
      console.log("✅ Approval transaction sent")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Función para crear un goal (solo assets/initialDeposit al contrato)
  const createGoal = async (
    assets: bigint,
    receiver: string,
    durationInDays: number,
    goalData: Omit<GoalData, 'createdAt'>
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Convertir días a timestamp unix (días * 24 * 60 * 60)
      const targetTimestamp = BigInt(Math.floor(Date.now() / 1000) + (durationInDays * 24 * 60 * 60))
      
      console.log("🎯 Creating goal:", {
        assets: formatUnits(assets, 6) + " USDC",
        receiver,
        targetTimestamp: targetTimestamp.toString(),
        durationInDays,
        goalData
      })
      
      // Guardar goal data en localStorage antes del depósito
      saveGoalToLocalStorage(receiver, {
        ...goalData,
        createdAt: Date.now()
      })
      
      await writeContract({
        address: baseVaultContract as `0x${string}`,
        abi: baseVaultAbi,
        functionName: 'deposit',
        args: [assets, receiver as `0x${string}`, targetTimestamp],
      })
      
      console.log("✅ Deposit transaction sent")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Función para hacer withdraw/redeem
  const withdrawGoal = async (receiver: string, owner: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log("💸 Withdrawing goal...")
      
      const txHash = await writeContractAsync({
        address: baseVaultContract as `0x${string}`,
        abi: baseVaultAbi,
        functionName: 'redeem',
        args: [receiver as `0x${string}`, owner as `0x${string}`],
      })
      
      // Store the withdraw transaction hash for tracking
      setWithdrawTxHash(txHash)
      
      // DON'T remove from localStorage here - wait for confirmation
      console.log("✅ Withdrawal transaction sent, hash:", txHash)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Función para invertir en Symbiosis
  const investInSymbiosis = async (
    amount: bigint,
    targetContract: string,
    message: string
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await writeContract({
        address: baseVaultContract as `0x${string}`,
        abi: baseVaultAbi,
        functionName: 'investInSymbiosis',
        args: [amount, targetContract as `0x${string}`, message as `0x${string}`],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // Data
    userData,
    
    // Loading states
    isLoading: isLoading || isWritePending || isConfirming,
    isConfirmed,
    isWithdrawConfirming,
    isWithdrawConfirmed,
    error,
    hash,
    
    // Functions
    useUserData,
    useUsdcBalance,
    useUsdcAllowance,
    useMinStakingTime,
    approveUsdc,
    createGoal,
    withdrawGoal,
    investInSymbiosis,
    
    // LocalStorage functions
    saveGoalToLocalStorage,
    getGoalFromLocalStorage,
    removeGoalFromLocalStorage,
    
    // Reset error
    clearError: () => setError(null),
  }
}
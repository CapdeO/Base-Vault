"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DollarSign } from "lucide-react"

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

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal | null
  isOnBaseChain: boolean
  isTransactionPending: boolean
  onConfirm: () => void
  fmt: (n: number) => string
}

export default function WithdrawModal({
  isOpen,
  onClose,
  goal,
  isOnBaseChain,
  isTransactionPending,
  onConfirm,
  fmt
}: WithdrawModalProps) {
  const canWithdraw = (goal: Goal) => {
    return new Date() >= goal.targetDate
  }

  const isEarlyWithdrawal = (goal: Goal) => {
    return !canWithdraw(goal)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <span className="text-sm font-medium text-white">{goal?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Principal:</span>
              <span className="text-sm font-medium text-white">${goal ? fmt(goal.currentAmount) : "0.00"} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Estimated Yield:</span>
              <span
                className={`text-sm font-medium ${goal && isEarlyWithdrawal(goal) ? "text-red-400" : "text-green-400"}`}
              >
                {goal && isEarlyWithdrawal(goal) ? "$0.00 USDC" : "+$12.50 USDC"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Withdrawal Fee (0.5%):</span>
              <span className="text-sm font-medium text-red-400">-$0.85 USDC</span>
            </div>
            <Separator className="bg-gray-700" />
            <div className="flex justify-between font-medium">
              <span className="text-sm text-gray-300">Total Withdrawal:</span>
              <span className={`text-sm ${goal && canWithdraw(goal) ? "text-white" : "text-green-400"}`}>
                $
                {goal
                  ? (goal.currentAmount + (isEarlyWithdrawal(goal) ? 0 : 12.5) - 0.85).toFixed(2)
                  : "0"}{" "}
                USDC
              </span>
            </div>
          </div>

          {goal && canWithdraw(goal) ? (
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
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isTransactionPending}
            className={goal && canWithdraw(goal) ? "bg-green-600 hover:bg-green-700" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90"}
          >
            {!isOnBaseChain ? "Switch to Base" : isTransactionPending ? "Processing..." : "Confirm Withdrawal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
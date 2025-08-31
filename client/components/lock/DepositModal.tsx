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
import { Zap } from "lucide-react"

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

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal | null
  depositAmount: string
  extendDays: string
  isOnBaseChain: boolean
  isTransactionPending: boolean
  onConfirm: () => void
  fmt: (n: number) => string
}

export default function DepositModal({
  isOpen,
  onClose,
  goal,
  depositAmount,
  extendDays,
  isOnBaseChain,
  isTransactionPending,
  onConfirm,
  fmt
}: DepositModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <span className="text-sm font-medium text-white">{goal?.name}</span>
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
                ${goal ? fmt(goal.currentAmount + Number.parseFloat(depositAmount || "0")) : "0"} USDC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Progress:</span>
              <span className="text-sm font-medium text-white">
                {goal
                  ? Math.min(
                      ((goal.currentAmount + Number.parseFloat(depositAmount || "0")) / goal.targetAmount) * 100,
                      100,
                    ).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
            {extendDays && Number.parseInt(extendDays) > 0 && goal && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">New Target Date:</span>
                <span className="text-sm font-medium text-white">
                  {new Date(
                    goal.targetDate.getTime() + Number.parseInt(extendDays) * 24 * 60 * 60 * 1000,
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isTransactionPending} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90">
            {!isOnBaseChain ? "Switch to Base" : isTransactionPending ? "Processing..." : "Confirm Deposit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
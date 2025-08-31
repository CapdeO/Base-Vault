"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Target } from "lucide-react"

interface NewGoal {
  name: string
  targetAmount: string
  duration: string
  initialDeposit: string
  protocol: string
}

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  newGoal: NewGoal
  isOnBaseChain: boolean
  isTransactionPending: boolean
  onConfirm: () => void
}

export default function CreateGoalModal({
  isOpen,
  onClose,
  newGoal,
  isOnBaseChain,
  isTransactionPending,
  onConfirm
}: CreateGoalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isTransactionPending} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90">
            {!isOnBaseChain ? "Switch to Base" : isTransactionPending ? "Processing..." : "Create Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
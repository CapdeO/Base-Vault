"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Target, Shield, AlertTriangle } from "lucide-react"
import { formatUnits, parseUnits } from "viem"

interface NewGoal {
  name: string
  targetAmount: string
  duration: string
  initialDeposit: string
  protocol: string
}

interface CreateGoalCardProps {
  newGoal: NewGoal
  setNewGoal: (goal: NewGoal) => void
  onCreateGoal: () => void
  usdcBalance?: bigint
  usdcAllowance?: bigint
  isBalanceLoading?: boolean
}

export default function CreateGoalCard({ 
  newGoal, 
  setNewGoal, 
  onCreateGoal, 
  usdcBalance, 
  usdcAllowance,
  isBalanceLoading 
}: CreateGoalCardProps) {
  
  // Check if user has sufficient balance
  const hasInsufficientBalance = () => {
    if (!usdcBalance || !newGoal.initialDeposit) return false
    try {
      const requiredAmount = parseUnits(newGoal.initialDeposit, 6)
      return usdcBalance < requiredAmount
    } catch {
      return false
    }
  }

  // Check if approval is needed
  const needsApproval = () => {
    if (!usdcAllowance || !newGoal.initialDeposit) return false
    try {
      const requiredAmount = parseUnits(newGoal.initialDeposit, 6)
      return usdcAllowance < requiredAmount
    } catch {
      return false
    }
  }

  const isFormValid = newGoal.name && newGoal.targetAmount && newGoal.initialDeposit && !hasInsufficientBalance()
  const showInsufficientBalance = hasInsufficientBalance()
  const showNeedsApproval = needsApproval() && !showInsufficientBalance

  return (
    <Card className="bg-gray-800/80 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg text-white">
          <Target className="w-5 h-5 text-blue-400" />
          <span>Create a Lock Goal</span>
        </CardTitle>
        <CardDescription className="text-sm text-gray-300">
          Define your target, deposit, and duration. Funds earn yield while locked.
        </CardDescription>
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
              className={`text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600 pl-6 ${
                showInsufficientBalance ? "border-red-500 focus:border-red-500" : ""
              }`}
            />
          </div>
          
          {/* Balance validation messages */}
          {showInsufficientBalance && (
            <div className="flex items-center gap-1 text-xs text-red-400">
              <AlertTriangle className="w-3 h-3" />
              <span>
                Insufficient balance. You have {usdcBalance ? formatUnits(usdcBalance, 6) : '0'} USDC
              </span>
            </div>
          )}
          
          {showNeedsApproval && (
            <div className="flex items-center gap-1 text-xs text-yellow-400">
              <Shield className="w-3 h-3" />
              <span>
                Approval needed. Current allowance: {usdcAllowance ? formatUnits(usdcAllowance, 6) : '0'} USDC
              </span>
            </div>
          )}
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
          onClick={onCreateGoal}
          className={`w-full ${
            showNeedsApproval 
              ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-600/90 hover:to-orange-600/90" 
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90"
          }`}
          disabled={!isFormValid || isBalanceLoading}
        >
          {isBalanceLoading ? (
            "Loading..."
          ) : showInsufficientBalance ? (
            "Insufficient USDC Balance"
          ) : showNeedsApproval ? (
            "Approve USDC First"
          ) : (
            "Create Goal"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
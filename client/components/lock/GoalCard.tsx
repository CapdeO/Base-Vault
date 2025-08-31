"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Target, Clock, DollarSign, Zap } from "lucide-react"

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

interface GoalCardProps {
  goal: Goal
  depositAmount: string
  extendDays: string
  selectedGoal: string | null
  minStakingCountdown: { [goalId: string]: number }
  onDepositAmountChange: (amount: string) => void
  onExtendDaysChange: (days: string) => void
  onSetSelectedGoal: (goalId: string) => void
  onDeposit: () => void
  onWithdraw: () => void
  fmt: (n: number) => string
}

export default function GoalCard({
  goal,
  depositAmount,
  extendDays,
  selectedGoal,
  minStakingCountdown,
  onDepositAmountChange,
  onExtendDaysChange,
  onSetSelectedGoal,
  onDeposit,
  onWithdraw,
  fmt
}: GoalCardProps) {
  const canWithdraw = () => {
    return new Date() >= goal.targetDate
  }

  const canWithdrawMinStaking = () => {
    return (minStakingCountdown[goal.id] || 0) <= 0
  }

  const getProgress = () => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  }

  const getDaysRemaining = () => {
    const diff = goal.targetDate.getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  return (
    <Card className="overflow-hidden bg-gray-800/80 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-white">{goal.name}</CardTitle>
          <Badge variant={canWithdraw() ? "default" : "secondary"} className="text-xs bg-gray-700 text-gray-200">
            {canWithdraw() ? "Ready" : `${getDaysRemaining()}d left`}
          </Badge>
        </div>
        <CardDescription className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>
              ${fmt(goal.currentAmount)} / ${fmt(goal.targetAmount)}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Due {goal.targetDate.toLocaleDateString()}</span>
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-300">
            <span>Progress</span>
            <span>{getProgress().toFixed(1)}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        <Separator className="bg-gray-700" />

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor={`deposit-${goal.id}`} className="text-xs text-gray-300">
                Deposit Amount
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-400">$</div>
                <Input
                  id={`deposit-${goal.id}`}
                  type="number"
                  placeholder="50"
                  value={selectedGoal === goal.id ? depositAmount : ""}
                  onChange={(e) => {
                    onSetSelectedGoal(goal.id)
                    onDepositAmountChange(e.target.value)
                  }}
                  className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600 pl-6"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`extend-days-${goal.id}`} className="text-xs text-gray-300">
                Extend Days (Optional)
              </Label>
              <Input
                id={`extend-days-${goal.id}`}
                type="number"
                placeholder="30"
                value={selectedGoal === goal.id ? extendDays : ""}
                onChange={(e) => {
                  onSetSelectedGoal(goal.id)
                  onExtendDaysChange(e.target.value)
                }}
                className="text-sm text-white placeholder:text-gray-500 bg-gray-700 border-gray-600"
              />
            </div>
          </div>
          <Button
            onClick={onDeposit}
            disabled={selectedGoal !== goal.id || !depositAmount}
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
          disabled={!canWithdrawMinStaking()}
          onClick={onWithdraw}
        >
          {canWithdraw()
            ? "Withdraw Full Amount + Yield"
            : canWithdrawMinStaking()
              ? "Withdraw Early (No APY)"
              : `Min staking: ${minStakingCountdown[goal.id] || 0}s`}
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
  )
}
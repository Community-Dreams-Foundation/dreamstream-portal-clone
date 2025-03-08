
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, TrendingUp } from "lucide-react"

interface PerformanceRewardsProps {
  costEfficiencyScore: number
  totalSavings: number
  rewardPoints: number
}

export function PerformanceRewards({
  costEfficiencyScore,
  totalSavings,
  rewardPoints
}: PerformanceRewardsProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="text-yellow-500" />
            Performance Rewards
          </h3>
          <span className="text-sm text-muted-foreground">
            {rewardPoints} points earned
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Cost Efficiency Score</span>
              <span className="text-sm text-muted-foreground">{costEfficiencyScore}%</span>
            </div>
            <Progress value={costEfficiencyScore} className="h-2" />
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <TrendingUp className="text-green-500" />
            <div>
              <p className="font-semibold">${totalSavings.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Cost Savings</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

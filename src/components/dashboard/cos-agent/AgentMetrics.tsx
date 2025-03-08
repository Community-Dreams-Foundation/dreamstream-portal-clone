
import { Card } from "@/components/ui/card"
import { PerformanceMetrics } from "@/types/performance"
import { ExperienceProgress } from "@/components/dashboard/metrics/ExperienceProgress"
import { AchievementsList } from "@/components/dashboard/metrics/AchievementsList"
import { Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AgentMetricsProps {
  metrics: PerformanceMetrics;
}

export function AgentMetrics({ metrics }: AgentMetricsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-3">
          <p className="text-sm text-muted-foreground">Task Completion</p>
          <p className="text-lg font-semibold">{(metrics.taskCompletionRate * 100).toFixed(0)}%</p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-muted-foreground">Avg Task Time</p>
          <p className="text-lg font-semibold">{metrics.avgTaskTime} min</p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-muted-foreground">Delegation Score</p>
          <p className="text-lg font-semibold">{(metrics.delegationEfficiency * 100).toFixed(0)}%</p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-muted-foreground">Feedback Score</p>
          <p className="text-lg font-semibold">{metrics.feedbackScore}</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h4 className="font-medium">Level Progress</h4>
          </div>
          <Badge variant="secondary">
            Rank #{metrics.leaderboardRank} / {metrics.totalParticipants}
          </Badge>
        </div>
        <ExperienceProgress
          level={metrics.level}
          experience={metrics.experience}
          experienceToNextLevel={metrics.experienceToNextLevel}
        />
      </Card>

      <AchievementsList achievements={metrics.achievements} />
    </div>
  )
}

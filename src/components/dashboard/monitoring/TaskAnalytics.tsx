
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, Star, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/types/task"
import { WeeklyActivityChart } from "../metrics/WeeklyActivityChart"
import { StatsGrid } from "../metrics/StatsGrid"
import { MetricAlert } from "./MetricAlert"
import { AchievementsAlert } from "./AchievementsAlert"
import {
  calculateWeightedEfficiencyScore,
  calculateLeadershipImpactScore,
  calculateInnovationScore,
  calculateDomainPerformance,
  determineTierEligibility
} from "@/utils/taskAnalytics"

interface TaskAnalyticsProps {
  tasks: Task[]
}

export function TaskAnalytics({ tasks }: TaskAnalyticsProps) {
  const analytics = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === "completed")
    const inProgressTasks = tasks.filter(t => t.status === "in-progress")
    const highPriorityTasks = tasks.filter(t => t.priority === "high")
    
    const weightedEfficiencyScore = calculateWeightedEfficiencyScore(completedTasks)
    const leadershipImpactScore = calculateLeadershipImpactScore(completedTasks)
    const innovationScore = calculateInnovationScore(tasks)
    const domainPerformance = calculateDomainPerformance(tasks)

    const metrics = {
      taskCompletion: completedTasks.length / (tasks.length || 1),
      efficiency: weightedEfficiencyScore,
      impact: leadershipImpactScore,
      innovation: innovationScore / 100
    }

    const currentTier = determineTierEligibility(metrics)

    const achievements = [
      {
        id: "efficiency-master",
        name: "Efficiency Master",
        earned: weightedEfficiencyScore > 0.9,
        description: "Consistently complete tasks ahead of schedule"
      },
      {
        id: "innovation-leader",
        name: "Innovation Leader",
        earned: innovationScore > 80,
        description: "Drive innovation and learning across the team"
      },
      {
        id: "team-catalyst",
        name: "Team Catalyst",
        earned: leadershipImpactScore > 8,
        description: "Exceptional impact on team performance"
      }
    ]

    return {
      efficiency: weightedEfficiencyScore * 100,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      highPriorityCompletion: highPriorityTasks.filter(t => t.status === "completed").length / 
                             (highPriorityTasks.length || 1) * 100,
      leadershipImpactScore,
      innovationScore,
      currentTier,
      achievements,
      domainExpertise: Object.values(domainPerformance).reduce((acc, stats) => 
        acc + (stats.completed / stats.total), 0) / Object.keys(domainPerformance).length * 100
    }
  }, [tasks])

  if (tasks.length === 0) return null

  return (
    <Card className="p-4 space-y-6">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Leadership Analytics</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current Tier:</span>
            <Badge className="bg-primary">{analytics.currentTier}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        <StatsGrid
          efficiency={analytics.efficiency}
          completedTasks={analytics.completedTasks}
          totalTasks={analytics.totalTasks}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricAlert
            icon={TrendingUp}
            title="Leadership Impact"
            value={analytics.leadershipImpactScore * 10}
            suffix="/100"
            description="in business value and team efficiency"
          />

          <MetricAlert
            icon={Star}
            title="Innovation Score"
            value={analytics.innovationScore}
            suffix="/100"
            description="in driving innovation and learning"
          />

          <MetricAlert
            icon={Target}
            title="Domain Expertise"
            value={analytics.domainExpertise}
            suffix="%"
            description="mastery across domains"
          />

          <AchievementsAlert achievements={analytics.achievements} />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Weekly Activity & Progress</h4>
          <WeeklyActivityChart weeklyTasks={[
            { name: 'Mon', tasks: 0 },
            { name: 'Tue', tasks: 0 },
            { name: 'Wed', tasks: 0 },
            { name: 'Thu', tasks: 0 },
            { name: 'Fri', tasks: 0 }
          ]} />
        </div>
      </CardContent>
    </Card>
  )
}



import { Card } from "@/components/ui/card"
import { Brain, TrendingUp, Clock } from "lucide-react"
import type { PerformanceMetrics } from "@/types/performance"

interface AiEvaluationProps {
  metrics: PerformanceMetrics
}

export function AiEvaluation({ metrics }: AiEvaluationProps) {
  const getAiInsight = () => {
    const insights = []
    
    if (metrics.taskCompletionRate >= 0.8) {
      insights.push("High task completion rate indicates excellent team performance")
    } else if (metrics.taskCompletionRate < 0.6) {
      insights.push("Task completion rate needs improvement - consider reviewing workload distribution")
    }

    if (metrics.delegationEfficiency >= 0.8) {
      insights.push("Team is effectively managing task delegation")
    } else if (metrics.delegationEfficiency < 0.6) {
      insights.push("Consider improving task delegation strategies")
    }

    if (metrics.avgTaskTime < 30) {
      insights.push("Task completion time is optimal")
    } else if (metrics.avgTaskTime > 60) {
      insights.push("Task completion time could be improved - review bottlenecks")
    }

    return insights
  }

  const insights = getAiInsight()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Performance Analysis</h3>
      </div>
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <Card key={index} className="p-3">
            <p className="text-sm">{insight}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

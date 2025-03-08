
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { fetchPerformanceData } from "@/utils/performanceUtils"
import { useAuth } from "@/contexts/AuthContext"
import { Brain, TrendingUp, Users, Clock } from "lucide-react"
import { StatsGrid } from "./StatsGrid"
import { WeeklyActivityChart } from "./WeeklyActivityChart"
import { TeamPerformanceTable } from "./TeamPerformanceTable"
import { ProductivityTrends } from "./ProductivityTrends"
import { AiEvaluation } from "./AiEvaluation"

export function PerformanceMetrics() {
  const { currentUser } = useAuth()
  const { data: performance } = useQuery({
    queryKey: ['performanceData', currentUser?.uid],
    queryFn: () => fetchPerformanceData(currentUser?.uid || ''),
    enabled: !!currentUser,
  })

  if (!performance) {
    return <div>Loading performance data...</div>
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Efficiency Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.efficiency}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Team Velocity
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.tasksThisWeek} tasks
            </div>
            <p className="text-xs text-muted-foreground">
              {performance.totalTasks} total tasks completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              AI Impact Score
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.feedbackScore}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on AI evaluation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Time Optimization
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.avgTaskTime}min
            </div>
            <p className="text-xs text-muted-foreground">
              Average task completion time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Productivity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductivityTrends data={performance.weeklyTasks} />
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>AI Evaluation Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <AiEvaluation metrics={performance} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamPerformanceTable data={performance} />
        </CardContent>
      </Card>
    </div>
  )
}

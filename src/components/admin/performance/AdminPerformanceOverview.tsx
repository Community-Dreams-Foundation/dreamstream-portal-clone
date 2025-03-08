
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function AdminPerformanceOverview() {
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["admin-performance"],
    queryFn: async () => {
      // Simulated data - replace with actual API call
      return {
        overallEfficiency: 85,
        averageTaskTime: 45,
        totalTasksCompleted: 1250,
        weeklyActivity: [
          { day: "Mon", tasks: 45 },
          { day: "Tue", tasks: 52 },
          { day: "Wed", tasks: 49 },
          { day: "Thu", tasks: 63 },
          { day: "Fri", tasks: 58 },
        ],
      }
    },
  })

  if (isLoading) return <div>Loading performance data...</div>

  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>
          Monitor task completion and efficiency metrics
        </CardDescription>
      </CardHeader>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Overall Efficiency</span>
            <span className="text-sm text-muted-foreground">
              {performanceData?.overallEfficiency}%
            </span>
          </div>
          <Progress value={performanceData?.overallEfficiency} className="h-2" />
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData?.weeklyActivity}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium">Avg Task Time</div>
              <div className="text-2xl font-bold">
                {performanceData?.averageTaskTime}min
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium">Tasks Completed</div>
              <div className="text-2xl font-bold">
                {performanceData?.totalTasksCompleted}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

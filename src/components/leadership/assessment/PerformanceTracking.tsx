
import React from "react"
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { useQuery } from "@tanstack/react-query"
import { getDatabase, ref, onValue, off } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"

interface PerformanceMetric {
  timestamp: string;
  taskCompletionRate: number;
  teamEfficiency: number;
  delegationAccuracy: number;
  averageTaskTime: number;
  tasksCompleted: number;
}

interface PerformanceTrackingProps {
  assessmentId: string;
}

export function PerformanceTracking({ assessmentId }: PerformanceTrackingProps) {
  const { currentUser } = useAuth()

  const { data: metrics = [] } = useQuery<PerformanceMetric[]>({
    queryKey: ['performanceMetrics', assessmentId],
    queryFn: () => {
      return new Promise((resolve) => {
        if (!currentUser?.uid) {
          resolve([])
          return
        }
        
        const db = getDatabase()
        const metricsRef = ref(db, `users/${currentUser.uid}/assessments/${assessmentId}/metrics`)
        
        onValue(metricsRef, (snapshot) => {
          if (!snapshot.exists()) {
            resolve([])
            return
          }
          
          // Transform the data for the chart
          const data = snapshot.val()
          const chartData = Object.entries(data).map(([timestamp, values]: [string, any]) => ({
            timestamp: new Date(Number(timestamp)).toLocaleTimeString(),
            ...values
          }))
          
          resolve(chartData)
        })

        // Cleanup subscription on unmount
        return () => off(metricsRef)
      })
    },
    enabled: !!currentUser && !!assessmentId
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Task Completion Rate</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="taskCompletionRate"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Team Efficiency</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="teamEfficiency"
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Delegation Accuracy</p>
            <p className="text-2xl font-semibold">
              {metrics[metrics.length - 1]?.delegationAccuracy?.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Task Time</p>
            <p className="text-2xl font-semibold">
              {metrics[metrics.length - 1]?.averageTaskTime?.toFixed(1)} min
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tasks Completed</p>
            <p className="text-2xl font-semibold">
              {metrics[metrics.length - 1]?.tasksCompleted || 0}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}


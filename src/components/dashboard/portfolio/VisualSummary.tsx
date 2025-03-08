
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { PortfolioItem } from "@/types/portfolio"

interface VisualSummaryProps {
  data: PortfolioItem[];
}

export function VisualSummary({ data }: VisualSummaryProps) {
  const chartData = useMemo(() => data.map(item => ({
    name: item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title,
    efficiency: item.impact.efficiency,
    timeEfficiency: item.impact.timeEfficiency,
    tasksCompleted: item.impact.tasksCompleted,
  })), [data])

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
            No performance data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar 
                dataKey="efficiency" 
                fill="#9b87f5" 
                name="Overall Efficiency"
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="timeEfficiency" 
                fill="#7E69AB" 
                name="Time Efficiency"
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="tasksCompleted" 
                fill="#5D4B8C" 
                name="Tasks Completed"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}


import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ProductivityTrendsProps {
  data: Array<{
    name: string
    tasks: number
  }>
}

export function ProductivityTrends({ data }: ProductivityTrendsProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            className="text-sm"
          />
          <YAxis
            className="text-sm"
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="tasks"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

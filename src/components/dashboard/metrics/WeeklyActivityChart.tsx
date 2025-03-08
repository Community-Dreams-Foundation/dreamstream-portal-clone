
import { BarChart as ChartIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface WeeklyActivityChartProps {
  weeklyTasks: Array<{
    name: string;
    tasks: number;
  }>;
}

export function WeeklyActivityChart({ weeklyTasks }: WeeklyActivityChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ChartIcon className="h-4 w-4" />
          <CardTitle className="text-lg">Weekly Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTasks}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="tasks" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


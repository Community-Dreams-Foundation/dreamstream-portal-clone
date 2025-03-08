
import { TrendingUp, CheckCircle, LayoutList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsGridProps {
  efficiency: number
  completedTasks: number
  totalTasks: number
}

export function StatsGrid({ efficiency, completedTasks, totalTasks }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Efficiency</span>
          </div>
          <p className="text-2xl font-bold">{Math.round(efficiency)}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Completed Tasks</span>
          </div>
          <p className="text-2xl font-bold">{completedTasks}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Total Tasks</span>
          </div>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </CardContent>
      </Card>
    </div>
  )
}

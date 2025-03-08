
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { Task } from "@/types/task"
import { useToast } from "@/hooks/use-toast"

interface TaskMonitorProps {
  tasks: Task[]
}

export function TaskMonitor({ tasks }: TaskMonitorProps) {
  const { toast } = useToast()
  const [activeTasks, setActiveTasks] = useState<Task[]>([])

  useEffect(() => {
    setActiveTasks(tasks.filter(task => task.isTimerRunning))
  }, [tasks])

  useEffect(() => {
    // Check for tasks exceeding estimated duration
    activeTasks.forEach(task => {
      if (task.totalElapsedTime && task.estimatedDuration) {
        const elapsedMinutes = task.totalElapsedTime / (1000 * 60)
        const estimatedMinutes = task.estimatedDuration

        if (elapsedMinutes > estimatedMinutes * 0.8 && elapsedMinutes <= estimatedMinutes) {
          toast({
            title: "Task Time Alert",
            description: `Task "${task.title}" is approaching its estimated duration`,
            variant: "default",
          })
        } else if (elapsedMinutes > estimatedMinutes) {
          toast({
            title: "Task Time Warning",
            description: `Task "${task.title}" has exceeded its estimated duration`,
            variant: "destructive",
          })
        }
      }
    })
  }, [activeTasks, toast])

  const getTaskProgress = (task: Task) => {
    const elapsed = task.totalElapsedTime || 0
    const estimated = task.estimatedDuration * 60 * 1000
    return Math.min((elapsed / estimated) * 100, 100)
  }

  const getStatusColor = (progress: number) => {
    if (progress < 50) return "text-green-500"
    if (progress < 80) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="font-medium">Active Tasks Monitor</h3>
        </div>
        <Badge variant="secondary" className="animate-pulse">
          {activeTasks.length} Active
        </Badge>
      </div>

      <div className="space-y-4">
        {activeTasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No active tasks at the moment</p>
          </div>
        ) : (
          activeTasks.map(task => {
            const progress = getTaskProgress(task)
            const statusColor = getStatusColor(progress)
            return (
              <div key={task.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task.title}</span>
                    {progress > 80 && (
                      <AlertTriangle className={`h-4 w-4 ${statusColor}`} />
                    )}
                  </div>
                  <Badge variant="outline" className={statusColor}>
                    {Math.floor(progress)}%
                  </Badge>
                </div>
                <Progress value={progress} className="mb-2" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Elapsed: {Math.floor((task.totalElapsedTime || 0) / (1000 * 60))}min</span>
                  <span>Estimated: {task.estimatedDuration}min</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

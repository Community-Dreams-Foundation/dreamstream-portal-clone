
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Task = {
  id: string
  title: string
  status: "completed" | "in-progress" | "urgent"
  dueDate: string
}

export function TaskList() {
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // Simulate loading tasks
    const loadTasks = () => {
      const demoTasks: Task[] = [
        {
          id: "1",
          title: "Review quarterly objectives",
          status: "urgent",
          dueDate: "2024-03-20"
        },
        {
          id: "2",
          title: "Prepare morning briefing",
          status: "in-progress",
          dueDate: "2024-03-21"
        },
        {
          id: "3",
          title: "Update team calendar",
          status: "completed",
          dueDate: "2024-03-19"
        }
      ]
      setTasks(demoTasks)
      setIsLoading(false)
    }

    setTimeout(loadTasks, 1000) // Simulate network delay
  }, [])

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "urgent":
        return "bg-red-100 text-red-800"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-3/4" />
            <div className="mt-2 flex items-center gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(task.status)}
              <span className="font-medium">{task.title}</span>
            </div>
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace("-", " ")}
            </Badge>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        </Card>
      ))}
    </div>
  )
}

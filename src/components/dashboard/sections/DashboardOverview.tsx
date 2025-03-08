
import { Card, CardContent } from "@/components/ui/card"
import { Bot, Clock, CheckCircle, AlertTriangle, BarChart3, Calendar, TrendingUp, Flag } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Task } from "@/types/task"

interface DashboardOverviewProps {
  tasks: Task[]
}

export function DashboardOverview({ tasks }: DashboardOverviewProps) {
  // Calculate task metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === "completed").length
  const inProgressTasks = tasks.filter(task => task.status === "in-progress").length
  const blockedTasks = tasks.filter(task => task.status === "blocked").length
  const todoTasks = tasks.filter(task => 
    task.status === "todo" || task.status === "not-started"
  ).length
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Calculate efficiency metrics
  const onTimeCompletions = tasks.filter(task => 
    task.status === "completed" && 
    task.actualDuration && 
    task.estimatedDuration && 
    task.actualDuration <= task.estimatedDuration
  ).length
  
  const efficiencyRate = completedTasks > 0 
    ? Math.round((onTimeCompletions / completedTasks) * 100) 
    : 0
  
  // Calculate estimated remaining work time
  const estimatedRemainingHours = tasks
    .filter(task => task.status !== "completed")
    .reduce((total, task) => total + (task.estimatedDuration / 60), 0)
    .toFixed(1)

  // Calculate average time per task
  const avgTaskTime = completedTasks > 0
    ? (tasks
        .filter(task => task.status === "completed" && task.actualDuration)
        .reduce((total, task) => total + (task.actualDuration || 0), 0) / completedTasks / 60).toFixed(1)
    : "0.0"

  // Calculate priority distribution
  const highPriorityTasks = tasks.filter(task => task.priority === "high").length
  const highPriorityCompleted = tasks.filter(task => 
    task.priority === "high" && task.status === "completed"
  ).length
  const highPriorityRate = highPriorityTasks > 0 
    ? Math.round((highPriorityCompleted / highPriorityTasks) * 100) 
    : 0

  const cards = [
    {
      title: "Task Completion",
      value: `${completionRate}%`,
      icon: CheckCircle,
      description: `${completedTasks} of ${totalTasks} tasks completed`,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/40"
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      description: `${estimatedRemainingHours} hours remaining`,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      title: "Blocked Tasks",
      value: blockedTasks,
      icon: AlertTriangle,
      description: blockedTasks > 0 ? "Needs attention" : "No blocked tasks",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/40"
    },
    {
      title: "Efficiency Rate",
      value: `${efficiencyRate}%`,
      icon: TrendingUp,
      description: `Avg. task time: ${avgTaskTime}h`,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/40"
    },
    {
      title: "Today's Tasks",
      value: todoTasks,
      icon: Calendar,
      description: "Tasks pending today",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/40" 
    },
    {
      title: "Priority Tasks",
      value: `${highPriorityRate}%`,
      icon: Flag,
      description: `${highPriorityCompleted}/${highPriorityTasks} high priority completed`,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40"
    },
    {
      title: "Performance Score",
      value: "86",
      icon: BarChart3,
      description: "Based on task completion efficiency",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40"
    },
    {
      title: "CoS Insights",
      value: "3",
      icon: Bot,
      description: "Optimization recommendations",
      color: "text-primary",
      bgColor: "bg-primary-50 dark:bg-primary/10"
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Task Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {cards.map((card, index) => (
          <Card key={index} className="overflow-hidden border-none shadow-sm">
            <CardContent className={`p-4 ${card.bgColor} h-full`}>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">{card.title}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">{card.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">{card.description}</p>
                </div>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              {card.title === "Task Completion" && (
                <Progress value={completionRate} className="mt-3 h-1.5" />
              )}
              {card.title === "Priority Tasks" && (
                <Progress value={highPriorityRate} className="mt-3 h-1.5" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

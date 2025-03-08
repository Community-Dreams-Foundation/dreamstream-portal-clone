
import { Activity, Task } from "@/types/task"
import { 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  RefreshCw, 
  Tag,
  AlertTriangle,
  CheckCircle,
  GitMerge
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface TaskActivityProps {
  activities?: Activity[]
  task?: Task // Add task as an optional prop
}

export function TaskActivity({ activities, task }: TaskActivityProps) {
  // Use the activities from props if provided, otherwise use task.activities
  const activityList = activities || task?.activities || []
  
  if (!activityList || activityList.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No activity recorded yet</p>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "status_change":
        return <RefreshCw className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "timer_update":
        return <Clock className="h-4 w-4" />
      case "dependency_update":
        return <ExternalLink className="h-4 w-4" />
      case "tag_update":
        return <Tag className="h-4 w-4" />
      case "priority_change":
        return <AlertTriangle className="h-4 w-4" />
      case "completion":
        return <CheckCircle className="h-4 w-4" />
      case "split":
        return <GitMerge className="h-4 w-4" />
      default:
        return <RefreshCw className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Activity History</h3>
      <div className="space-y-2">
        {activityList.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 text-sm">
            <div className="mt-0.5 text-muted-foreground">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p>{activity.details}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

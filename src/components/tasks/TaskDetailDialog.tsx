import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Task, TaskInput } from "@/types/task"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { 
  Calendar, Clock, Tag, AlertCircle, CheckCircle, 
  MessageSquare, RotateCw, Calendar as CalendarIcon,
  GitBranch, GitMerge, Link, Plus, Bell
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCommentSection } from "./TaskCommentSection"
import { TaskActivity } from "./TaskActivity"
import { format } from "date-fns"
import { DependencyVisualization } from "./DependencyVisualization"
import { useAuth } from "@/contexts/AuthContext"
import { fetchTasks, createTask } from "@/utils/tasks/basicOperations"
import { useToast } from "@/hooks/use-toast"

interface TaskDetailDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated?: () => void
}

export function TaskDetailDialog({ 
  task, 
  open, 
  onOpenChange,
  onTaskUpdated
}: TaskDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const { currentUser } = useAuth()
  const { toast } = useToast()
  
  const handleTabChange = async (value: string) => {
    setActiveTab(value)
    
    if ((value === "dependencies" || value === "subtasks") && currentUser?.uid && allTasks.length === 0) {
      try {
        const tasks = await fetchTasks(currentUser.uid)
        setAllTasks(tasks)
      } catch (error) {
        console.error("Error fetching tasks for dependencies:", error)
        toast({
          variant: "destructive",
          title: "Error loading tasks",
          description: "Could not load tasks for dependency visualization."
        })
      }
    }
  }
  
  const handleCreateSubtask = async () => {
    if (!currentUser?.uid) return
    
    try {
      const subtask: TaskInput = {
        title: `Subtask of: ${task.title}`,
        description: `This is a subtask of "${task.title}"`,
        status: "todo",
        estimatedDuration: 30,
        actualDuration: 0,
        priority: task.priority || "medium",
        tags: task.tags || [],
        metadata: {
          ...task.metadata,
          parentTaskId: task.id,
          hasSubtasks: false,
          subtaskIds: [],
          complexity: task.metadata?.complexity || "medium",
          impact: task.metadata?.impact || "medium",
          businessValue: task.metadata?.businessValue || 5,
          learningOpportunity: task.metadata?.learningOpportunity || 5
        }
      }
      
      const newSubtaskId = await createTask(currentUser.uid, subtask)
      
      toast({
        title: "Subtask created",
        description: "Subtask has been created successfully."
      })
      
      if (onTaskUpdated) {
        onTaskUpdated()
      }
    } catch (error) {
      console.error("Error creating subtask:", error)
      toast({
        variant: "destructive",
        title: "Error creating subtask",
        description: "Could not create subtask. Please try again."
      })
    }
  }
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  const formatElapsedTime = (milliseconds: number = 0) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "todo":
        return <Badge className="bg-blue-500">To Do</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "blocked":
        return <Badge className="bg-red-500">Blocked</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="outline" className="text-red-500 border-red-500">High</Badge>
      case "medium":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Medium</Badge>
      case "low":
        return <Badge variant="outline" className="text-green-500 border-green-500">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }
  
  const getNextOccurrenceText = () => {
    if (!task.recurringConfig?.nextOccurrence) return "Not set";
    return format(new Date(task.recurringConfig.nextOccurrence), "PPP");
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {task.title}
            {task.recurringConfig?.isRecurring && (
              <RotateCw className="h-5 w-5 text-blue-500" />
            )}
            {task.metadata?.hasSubtasks && (
              <GitBranch className="h-5 w-5 text-purple-500" />
            )}
            {task.metadata?.parentTaskId && (
              <GitMerge className="h-5 w-5 text-indigo-500" />
            )}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {getStatusBadge(task.status)}
            {task.priority && getPriorityBadge(task.priority)}
            
            {task.recurringConfig?.isRecurring && (
              <Badge className="bg-blue-500/10 text-blue-500">
                <RotateCw className="h-3.5 w-3.5 mr-1" />
                Recurring
              </Badge>
            )}
            
            {task.metadata?.hasSubtasks && (
              <Badge className="bg-purple-500/10 text-purple-500">
                <GitBranch className="h-3.5 w-3.5 mr-1" />
                Has Subtasks
              </Badge>
            )}
            
            {task.metadata?.parentTaskId && (
              <Badge className="bg-indigo-500/10 text-indigo-500">
                <GitMerge className="h-3.5 w-3.5 mr-1" />
                Subtask
              </Badge>
            )}
            
            {task.dependencies && task.dependencies.length > 0 && (
              <Badge className="bg-gray-500/10 text-gray-500">
                <Link className="h-3.5 w-3.5 mr-1" />
                Has Dependencies
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <Tabs 
          defaultValue="details" 
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
            <TabsTrigger value="reminders">
              <Bell className="h-4 w-4 mr-1" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="comments">
              Comments
              {task.comments && task.comments.length > 0 && (
                <Badge className="ml-2 bg-primary" variant="secondary">
                  {task.comments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1 overflow-auto space-y-6 p-1">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{task.description || "No description provided."}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Time & Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Estimated: {formatDuration(task.estimatedDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Spent: {formatElapsedTime(task.totalElapsedTime)}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {task.completionPercentage !== undefined && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Progress: {task.completionPercentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Created: {new Date(task.createdAt || 0).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Updated: {new Date(task.updatedAt || 0).toLocaleDateString()}</span>
                    </div>
                    {task.assignedTo && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Assigned to: {task.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {task.recurringConfig?.isRecurring && (
                <>
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Recurring Task Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <RotateCw className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          Pattern: Every {task.recurringConfig.interval} {" "}
                          {task.recurringConfig.pattern === "daily" ? "day(s)" : 
                           task.recurringConfig.pattern === "weekly" ? "week(s)" :
                           task.recurringConfig.pattern === "biweekly" ? "2 week(s)" : "month(s)"}
                        </span>
                      </div>
                      
                      {task.recurringConfig.daysOfWeek && task.recurringConfig.daysOfWeek.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            On days: {" "}
                            {task.recurringConfig.daysOfWeek
                              .map(day => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day])
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Next occurrence: {getNextOccurrenceText()}</span>
                      </div>
                      
                      {task.recurringConfig.endAfterOccurrences && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            Ends after {task.recurringConfig.endAfterOccurrences} occurrences 
                            (Completed: {task.recurringConfig.occurrencesCompleted || 0})
                          </span>
                        </div>
                      )}
                      
                      {task.recurringConfig.endDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            Ends on: {format(new Date(task.recurringConfig.endDate), "PPP")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {task.tags && task.tags.length > 0 ? (
                    task.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dependencies" className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-gray-50/50">
                  {allTasks.length > 0 ? (
                    <DependencyVisualization 
                      tasks={allTasks} 
                      taskId={task.id} 
                      type="dependencies" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">Loading dependencies...</p>
                    </div>
                  )}
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50/50">
                  {allTasks.length > 0 ? (
                    <DependencyVisualization 
                      tasks={allTasks} 
                      taskId={task.id} 
                      type="dependents" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">Loading dependent tasks...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Dependencies are tasks that must be completed before this task can be started.</p>
                <p>Dependent tasks are tasks that depend on this task to be completed.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="subtasks" className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Subtask Management</h3>
                <Button size="sm" onClick={handleCreateSubtask}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Subtask
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {task.metadata?.parentTaskId && (
                  <div className="border rounded-lg p-4 bg-gray-50/50">
                    {allTasks.length > 0 ? (
                      <DependencyVisualization 
                        tasks={allTasks} 
                        taskId={task.id} 
                        type="parent" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">Loading parent task...</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="border rounded-lg p-4 bg-gray-50/50">
                  {allTasks.length > 0 ? (
                    <DependencyVisualization 
                      tasks={allTasks} 
                      taskId={task.id} 
                      type="subtasks" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">Loading subtasks...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Subtasks are smaller, more manageable pieces of this task.</p>
                <p>Managing tasks in hierarchies helps with organization and tracking progress.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reminders" className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Task Reminders</h3>
                <div>
                  {task.dueDate ? (
                    <Badge variant="outline" className={`${
                      new Date(task.dueDate) < new Date() 
                        ? "border-red-500 text-red-500" 
                        : "border-green-500 text-green-500"
                    }`}>
                      Due: {format(new Date(task.dueDate), "PPP")}
                    </Badge>
                  ) : (
                    <Badge variant="outline">No due date set</Badge>
                  )}
                </div>
              </div>
              
              {!task.dueDate ? (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <h4 className="font-medium mb-1">No Due Date Set</h4>
                  <p className="text-sm text-muted-foreground">
                    Set a due date for this task to enable reminders
                  </p>
                </div>
              ) : (
                <div className="border rounded-md p-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Upcoming Reminders</h4>
                    <div className="space-y-2">
                      {task.metadata?.remindedAt ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Reminder already sent</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-blue-500" />
                            <span>
                              You will be reminded according to your notification preferences
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Adjust your reminder settings in your profile to customize when you receive notifications
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Task Status</h4>
                    {new Date(task.dueDate) < new Date() ? (
                      <div className="p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span>This task is overdue!</span>
                      </div>
                    ) : (
                      <div className="p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2 text-green-700">
                        <Clock className="h-4 w-4" />
                        <span>
                          {Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="flex-1 overflow-auto p-1">
            <TaskCommentSection task={task} />
          </TabsContent>
          
          <TabsContent value="activity" className="flex-1 overflow-auto p-1">
            <TaskActivity activities={task.activities} task={task} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


import { useCallback, useMemo } from "react"
import { Task, TaskStatus } from "@/types/task"
import { useToast } from "@/components/ui/use-toast"
import { updateTaskStatus, checkDependencies } from "@/utils/tasks/progressOperations"
import { recordStatusChange } from "@/utils/tasks/activityOperations"

export function useTaskDragDrop(tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, userId?: string) {
  const { toast } = useToast()

  // Memoize task state to prevent performance issues with large task lists
  const taskMap = useMemo(() => {
    return tasks.reduce((map, task) => {
      map[task.id] = task;
      return map;
    }, {} as Record<string, Task>);
  }, [tasks]);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("taskId")
    if (!userId || !taskId) return

    try {
      const task = taskMap[taskId];
      if (!task) return
      
      const currentStatus = task.status

      // If status hasn't changed, do nothing
      if (currentStatus === newStatus) return

      const canStart = await checkDependencies(userId, taskId)
      if (newStatus === 'in-progress' && !canStart) {
        toast({
          variant: "destructive",
          title: "Cannot start task",
          description: "Not all dependencies are completed."
        })
        return
      }

      // Use optimistic updates for better UX
      // Update local state immediately before API call completes
      setTasks(currentTasks => 
        currentTasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      )

      // Update the task status in the database
      await Promise.all([
        updateTaskStatus(userId, taskId, newStatus),
        // Log the status change activity
        recordStatusChange(userId, taskId, currentStatus, newStatus)
      ]);
      
    } catch (error) {
      // Revert optimistic update on error
      setTasks(currentTasks => 
        currentTasks.map(t => 
          t.id === taskId ? { ...t, status: taskMap[taskId]?.status || t.status } : t
        )
      )
      
      console.error("Error updating task status:", error)
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: "Please try again later."
      })
    }
  }, [userId, taskMap, setTasks, toast])

  return {
    handleDragStart,
    handleDragOver,
    handleDrop
  }
}

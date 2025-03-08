
import { useState, useCallback, useEffect } from "react"
import { Task } from "@/types/task"
import { useToast } from "@/hooks/use-toast"
import { updateTaskTimer } from "@/utils/tasks/timerOperations"
import { recordTimerUpdate } from "@/utils/tasks/activityOperations"

export function useTaskTimer(tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, userId?: string) {
  const { toast } = useToast()

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(currentTasks => 
        currentTasks.map(task => {
          if (task.isTimerRunning && task.startTime) {
            const elapsedSinceStart = Date.now() - task.startTime
            const totalElapsed = (task.totalElapsedTime || 0) + elapsedSinceStart
            
            if (totalElapsed > task.estimatedDuration * 60 * 1000) {
              toast({
                title: "Task Duration Alert",
                description: `Task "${task.title}" has exceeded its estimated duration`,
                variant: "destructive"
              })
            }

            return {
              ...task,
              totalElapsedTime: totalElapsed
            }
          }
          return task
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [toast, setTasks])

  const toggleTimer = useCallback(async (taskId: string) => {
    if (!userId) return

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      const now = Date.now()
      const isTimerRunning = !task.isTimerRunning
      const startTime = isTimerRunning ? now : undefined
      const totalElapsedTime = !isTimerRunning 
        ? (task.totalElapsedTime || 0) + (task.startTime ? now - task.startTime : 0)
        : task.totalElapsedTime

      // Update the timer in the database
      await updateTaskTimer(
        userId,
        taskId,
        isTimerRunning,
        startTime,
        totalElapsedTime
      )
      
      // Log the timer activity
      await recordTimerUpdate(
        userId, 
        taskId, 
        isTimerRunning, 
        !isTimerRunning ? (task.startTime ? now - task.startTime : 0) : undefined
      )

      // Update local state
      setTasks(tasks.map(t => 
        t.id === taskId ? {
          ...t,
          isTimerRunning,
          startTime,
          totalElapsedTime
        } : t
      ))

    } catch (error) {
      console.error("Error updating timer:", error)
      toast({
        variant: "destructive",
        title: "Error updating timer",
        description: "Please try again later."
      })
    }
  }, [tasks, userId, setTasks, toast])

  return { toggleTimer }
}

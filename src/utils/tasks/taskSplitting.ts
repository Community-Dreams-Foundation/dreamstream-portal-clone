
import { getDatabase, ref, get, update } from "firebase/database"
import type { Task, TaskInput } from "@/types/task"
import { createTask } from "./basicOperations"

export const autoSplitTask = async (userId: string, taskId: string) => {
  const db = getDatabase()
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
  const taskSnapshot = await get(taskRef)
  const task = taskSnapshot.val() as Task
  
  if (!task) return false

  const timeThreshold = task.estimatedDuration * 60 * 1000 * 0.9 // 90% of estimated time
  const currentTime = task.totalElapsedTime || 0
  
  if (currentTime >= timeThreshold && task.status !== "completed") {
    const remainingWork = 100 - (task.completionPercentage || 0)
    const splitPoint = Math.floor(remainingWork / 2)
    
    const subtasks: TaskInput[] = [
      {
        title: `${task.title} (Part 1)`,
        description: `First half of original task: ${task.description}`,
        estimatedDuration: Math.ceil(task.estimatedDuration / 2),
        actualDuration: 0,
        status: "todo",
        priority: task.priority,
        dependencies: task.dependencies,
        tags: [...(task.tags || []), "auto-split"],
        assignedTo: task.assignedTo,
        metadata: task.metadata
      },
      {
        title: `${task.title} (Part 2)`,
        description: `Second half of original task: ${task.description}`,
        estimatedDuration: Math.floor(task.estimatedDuration / 2),
        actualDuration: 0,
        status: "todo",
        priority: task.priority,
        dependencies: task.dependencies,
        tags: [...(task.tags || []), "auto-split"],
        assignedTo: task.assignedTo,
        metadata: task.metadata
      }
    ]
    
    const [subtask1Id, subtask2Id] = await Promise.all([
      createTask(userId, subtasks[0]),
      createTask(userId, subtasks[1])
    ])
    
    await update(taskRef, {
      status: "completed",
      completionPercentage: 100,
      updatedAt: Date.now(),
      lastActivity: {
        type: "status_change",
        timestamp: Date.now(),
        details: "Task automatically split into subtasks"
      },
      metadata: {
        ...task.metadata,
        splitIntoTasks: [subtask1Id, subtask2Id]
      }
    })
    
    return true
  }
  
  return false
}

export const checkTaskSplitNeeded = async (userId: string, taskId: string) => {
  const db = getDatabase()
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
  const taskSnapshot = await get(taskRef)
  const task = taskSnapshot.val() as Task
  
  if (!task) return false
  
  const timeThreshold = task.estimatedDuration * 60 * 1000 * 0.9 // 90% of estimated time
  const currentTime = task.totalElapsedTime || 0
  
  return currentTime >= timeThreshold && task.status !== "completed"
}


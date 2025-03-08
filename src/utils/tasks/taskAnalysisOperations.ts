
import { getDatabase, ref, get, set, push, update } from "firebase/database"
import type { Task, CoSRecommendation } from "@/types/task"
import { autoSplitTask } from "./taskSplitting"

// Analyze a task and provide recommendations
export const analyzeTask = async (userId: string, taskId: string): Promise<CoSRecommendation[]> => {
  const db = getDatabase()
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
  const taskSnapshot = await get(taskRef)
  const task = taskSnapshot.val() as Task
  
  if (!task) return []

  const recommendations: CoSRecommendation[] = []
  
  // Check for complex tasks that might need breaking down
  if (task.metadata?.complexity === 'high' && task.estimatedDuration > 120) {
    const recId = `rec-task-split-${Date.now()}`
    recommendations.push({
      id: recId,
      type: "task",
      content: `Task "${task.title}" is complex and lengthy. Consider breaking it down into subtasks for better management.`,
      timestamp: Date.now(),
      priority: "high",
      impact: 85
    })
  }
  
  // Check for dependencies that might cause bottlenecks
  if (task.dependencies && task.dependencies.length > 2) {
    const recId = `rec-task-dep-${Date.now()}`
    recommendations.push({
      id: recId,
      type: "task",
      content: `Task "${task.title}" has multiple dependencies. Consider reviewing the dependency chain to avoid potential bottlenecks.`,
      timestamp: Date.now(),
      priority: "medium",
      impact: 70
    })
  }
  
  // Check for time management
  if (task.status === 'in-progress' && task.totalElapsedTime && task.estimatedDuration) {
    const elapsedMinutes = task.totalElapsedTime / (1000 * 60)
    const estimatedMinutes = task.estimatedDuration
    
    if (elapsedMinutes > estimatedMinutes * 0.8 && elapsedMinutes <= estimatedMinutes) {
      const recId = `rec-task-time-${Date.now()}`
      recommendations.push({
        id: recId,
        type: "time",
        content: `Task "${task.title}" is approaching its estimated duration. Consider evaluating progress and adjusting the estimate if needed.`,
        timestamp: Date.now(),
        priority: "medium",
        impact: 60
      })
    }
  }
  
  // Store recommendations if any
  if (recommendations.length > 0) {
    const recommendationsRef = ref(db, `users/${userId}/recommendations`)
    
    recommendations.forEach(async (rec) => {
      const newRecRef = push(recommendationsRef)
      await set(newRecRef, rec)
    })
  }
  
  return recommendations
}

// Create subtasks from a complex task
export const breakdownTask = async (
  userId: string, 
  taskId: string, 
  subtasks: Array<{title: string, description: string, estimatedDuration: number}>
): Promise<string[]> => {
  const db = getDatabase()
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
  const taskSnapshot = await get(taskRef)
  const parentTask = taskSnapshot.val() as Task
  
  if (!parentTask) throw new Error("Parent task not found")
  
  // Creating subtasks
  const subtaskIds: string[] = []
  const subtasksPromises = subtasks.map(async (subtask) => {
    const newSubtaskRef = push(ref(db, `users/${userId}/tasks`))
    const subtaskId = newSubtaskRef.key as string
    subtaskIds.push(subtaskId)
    
    await set(newSubtaskRef, {
      id: subtaskId,
      title: subtask.title,
      description: subtask.description,
      status: "todo",
      estimatedDuration: subtask.estimatedDuration,
      actualDuration: 0,
      priority: parentTask.priority,
      dependencies: parentTask.dependencies,
      tags: [...(parentTask.tags || []), "subtask"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      assignedTo: parentTask.assignedTo,
      metadata: {
        ...parentTask.metadata,
        parentTaskId: taskId
      },
      lastActivity: {
        type: "status_change",
        timestamp: Date.now(),
        details: "Created as subtask"
      }
    })
  })
  
  await Promise.all(subtasksPromises)
  
  // Update parent task to link to subtasks
  // Fix: Instead of using updateTask from basicOperations, we'll use the Firebase update directly
  const parentTaskUpdateRef = ref(db, `users/${userId}/tasks/${taskId}`)
  
  await update(parentTaskUpdateRef, {
    metadata: {
      ...parentTask.metadata,
      // Fix: Add hasSubtasks property to the metadata type
      hasSubtasks: true,
      subtaskIds: subtaskIds
    }
  })
  
  return subtaskIds
}

// Provide contextual guidance based on task status
export const provideTaskGuidance = async (userId: string, taskId: string): Promise<string> => {
  const db = getDatabase()
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
  const taskSnapshot = await get(taskRef)
  const task = taskSnapshot.val() as Task
  
  if (!task) return "Task not found"
  
  // Check dependencies status
  if (task.dependencies && task.dependencies.length > 0) {
    const dependenciesRef = ref(db, `users/${userId}/tasks`)
    const dependenciesSnapshot = await get(dependenciesRef)
    const allTasks = dependenciesSnapshot.val() || {}
    
    const incompleteDependencies = task.dependencies.filter(depId => {
      const depTask = allTasks[depId]
      return depTask && depTask.status !== 'completed'
    })
    
    if (incompleteDependencies.length > 0) {
      return `This task has ${incompleteDependencies.length} incomplete dependencies. Consider focusing on those tasks first.`
    }
  }
  
  // Time-based guidance
  if (task.status === 'in-progress' && task.totalElapsedTime && task.estimatedDuration) {
    const elapsedMinutes = task.totalElapsedTime / (1000 * 60)
    const estimatedMinutes = task.estimatedDuration
    
    if (elapsedMinutes > estimatedMinutes * 1.2) {
      return "You've spent significantly more time than estimated on this task. Consider breaking it down or requesting assistance."
    }
  }
  
  // Complexity guidance
  if (task.metadata?.complexity === 'high' && !(task.metadata as any)?.hasSubtasks) {
    return "This is a complex task that might benefit from being broken down into smaller subtasks."
  }
  
  // Default guidance
  return "This task is on track. Keep up the good work!"
}

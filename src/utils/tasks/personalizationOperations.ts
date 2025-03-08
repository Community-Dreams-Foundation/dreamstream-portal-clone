
import { getDatabase, ref, get, update, onValue } from "firebase/database"
import type { Task } from "@/types/task"
import { autoSplitTask, checkTaskSplitNeeded } from "./taskSplitting"

export const calculatePersonalizationScore = async (
  userId: string,
  taskId: string
): Promise<number> => {
  const db = getDatabase()
  const [userSnapshot, taskSnapshot] = await Promise.all([
    get(ref(db, `users/${userId}`)),
    get(ref(db, `users/${userId}/tasks/${taskId}`))
  ])
  
  const user = userSnapshot.val()
  const task = taskSnapshot.val()
  
  if (!user || !task) return 0
  
  let score = 0
  
  if (task.metadata?.skillRequirements?.every(skill => 
    user.skills?.includes(skill)
  )) {
    score += 30
  }
  
  const activeTasksSnapshot = await get(ref(db, `users/${userId}/tasks`))
  const activeTasks = Object.values(activeTasksSnapshot.val() || {}).filter(
    (t: any) => t.status === 'in-progress'
  )
  
  if (activeTasks.length < user.preferences?.workloadThreshold) {
    score += 20
  }
  
  if (task.metadata?.performanceHistory) {
    if (task.metadata.performanceHistory.accuracyRate > 0.9) {
      score += 25
    } else if (task.metadata.performanceHistory.accuracyRate > 0.8) {
      score += 15
    }
    
    const avgCompletion = task.metadata.performanceHistory.averageCompletionTime
    if (avgCompletion && avgCompletion < task.estimatedDuration) {
      score += 25
    }
  }
  
  return Math.min(score, 100)
}

export const monitorTaskProgress = async (userId: string, taskId: string) => {
  const db = getDatabase()
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
  
  onValue(taskRef, async (snapshot) => {
    const task = snapshot.val() as Task
    if (!task) return
    
    if (task.totalElapsedTime && task.estimatedDuration) {
      const timeThreshold = task.estimatedDuration * 60 * 1000 * 0.9
      if (task.totalElapsedTime >= timeThreshold) {
        const shouldSplit = await checkTaskSplitNeeded(userId, taskId)
        if (shouldSplit) {
          await autoSplitTask(userId, taskId)
        }
      }
    }
    
    const score = await calculatePersonalizationScore(userId, taskId)
    await update(taskRef, {
      'metadata.personalizationScore': score,
      updatedAt: Date.now()
    })
  })
}

export const getRecommendedTasks = async (userId: string): Promise<Task[]> => {
  const db = getDatabase()
  const tasksRef = ref(db, `users/${userId}/tasks`)
  const snapshot = await get(tasksRef)
  const tasks = snapshot.val()
  
  if (!tasks) return []
  
  const taskArray = Object.entries(tasks).map(([id, task]: [string, any]) => ({
    id,
    ...task
  }))
  
  return taskArray.sort((a, b) => {
    const scoreA = a.metadata?.personalizationScore || 0
    const scoreB = b.metadata?.personalizationScore || 0
    
    if (scoreB !== scoreA) return scoreB - scoreA
    
    const priorityValues = { high: 3, medium: 2, low: 1 }
    return (priorityValues[b.priority || 'low'] || 0) - 
           (priorityValues[a.priority || 'low'] || 0)
  })
}


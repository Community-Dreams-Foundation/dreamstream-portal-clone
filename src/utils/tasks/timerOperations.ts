
import { getDatabase, ref, update } from "firebase/database"

export const updateTaskTimer = async (
  userId: string,
  taskId: string,
  isTimerRunning: boolean,
  startTime?: number,
  totalElapsedTime?: number
) => {
  const db = getDatabase()
  const now = Date.now()
  const updates: Record<string, any> = {
    isTimerRunning,
    updatedAt: now,
    lastActivity: {
      type: "timer_update",
      timestamp: now,
      details: isTimerRunning ? "Timer started" : "Timer stopped"
    }
  }
  
  if (startTime !== undefined) updates.startTime = startTime
  if (totalElapsedTime !== undefined) updates.totalElapsedTime = totalElapsedTime
  
  return update(ref(db, `users/${userId}/tasks/${taskId}`), updates)
}



import { getDatabase, ref, get, update, push } from "firebase/database"
import type { Task, TaskStatus } from "@/types/task"

export const checkDependencies = async (userId: string, taskId: string): Promise<boolean> => {
  const db = getDatabase()
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
  const taskSnapshot = await get(taskRef)
  const task = taskSnapshot.val()

  if (!task.dependencies || task.dependencies.length === 0) {
    return true
  }

  const dependenciesRef = ref(db, `users/${userId}/tasks`)
  const dependenciesSnapshot = await get(dependenciesRef)
  const dependencies = dependenciesSnapshot.val()

  return task.dependencies.every((depId: string) => 
    dependencies[depId] && dependencies[depId].status === 'completed'
  )
}

export const updateTaskProgress = async (
  userId: string,
  taskId: string,
  completionPercentage: number
) => {
  const db = getDatabase()
  const now = Date.now()
  return update(ref(db, `users/${userId}/tasks/${taskId}`), {
    completionPercentage,
    updatedAt: now,
    lastActivity: {
      type: "status_change",
      timestamp: now,
      details: `Progress updated to ${completionPercentage}%`
    }
  })
}

export const updateTaskStatus = async (
  userId: string,
  taskId: string,
  status: TaskStatus
) => {
  const db = getDatabase()
  const now = Date.now()
  return update(ref(db, `users/${userId}/tasks/${taskId}`), {
    status,
    updatedAt: now,
    lastActivity: {
      type: "status_change",
      timestamp: now,
      details: `Status updated to ${status}`
    }
  })
}

export const requestCostApproval = async (
  userId: string,
  taskId: string,
  amount: number,
  justification: string
): Promise<string> => {
  const db = getDatabase()
  const approvalRef = push(ref(db, `users/${userId}/costApprovals`))
  const now = Date.now()
  
  await update(approvalRef, {
    taskId,
    amount,
    justification,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    requestedBy: userId
  })

  await update(ref(db, `users/${userId}/tasks/${taskId}`), {
    costApprovalId: approvalRef.key,
    lastActivity: {
      type: "cost_approval",
      timestamp: now,
      details: `Cost approval requested for $${amount}`
    }
  })

  return approvalRef.key as string
}

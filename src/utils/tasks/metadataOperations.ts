
import { getDatabase, ref, update, push } from "firebase/database"
import type { Task } from "@/types/task"

export const updateTaskMetadata = async (
  userId: string,
  taskId: string,
  metadata: Task["metadata"]
) => {
  const db = getDatabase()
  const now = Date.now()
  return update(ref(db, `users/${userId}/tasks/${taskId}`), {
    metadata,
    updatedAt: now
  })
}

export const addTaskComment = async (
  userId: string,
  taskId: string,
  comment: Omit<NonNullable<Task["comments"]>[0], "id" | "timestamp">
) => {
  const db = getDatabase()
  const commentsRef = ref(db, `users/${userId}/tasks/${taskId}/comments`)
  const newCommentRef = push(commentsRef)
  const now = Date.now()
  
  return update(ref(db, `users/${userId}/tasks/${taskId}`), {
    [`comments/${newCommentRef.key}`]: {
      ...comment,
      id: newCommentRef.key,
      timestamp: now
    },
    updatedAt: now,
    lastActivity: {
      type: "comment",
      timestamp: now,
      details: "New comment added"
    }
  })
}



import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc, serverTimestamp, getDoc, deleteDoc, arrayUnion } from "firebase/firestore"
import { nanoid } from 'nanoid'
import { logActivity } from "./activityOperations"
import { CommentAttachment } from "@/components/tasks/TaskCommentSection"
import { addAttachmentRecord } from "./attachmentOperations"

export interface TaskComment {
  id: string
  text: string
  userId: string
  timestamp: number
  userName?: string
  parentId?: string
  lastEdited?: number
  mentions?: string[] // Array of user IDs that are mentioned
  reactions?: Record<string, string[]> // Emoji -> array of user IDs
  attachments?: CommentAttachment[] // File attachments
}

export async function addComment(
  userId: string, 
  taskId: string, 
  text: string, 
  attachments: CommentAttachment[] = []
) {
  try {
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId))
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User"
    
    const commentId = nanoid()
    const timestamp = Date.now()
    
    // Extract mentions from the text
    const mentions = extractMentions(text)
    
    // Create the comment
    const commentData = {
      id: commentId,
      text,
      userId,
      timestamp,
      userName,
      taskId,
      parentId: null,
      mentions: mentions.length > 0 ? mentions : null,
      attachments: attachments.length > 0 ? attachments : null
    }
    
    const commentRef = await addDoc(collection(db, "task_comments"), commentData)
    
    // Process attachments if any
    if (attachments.length > 0) {
      for (const attachment of attachments) {
        await addAttachmentRecord(userId, taskId, commentId, attachment)
      }
    }
    
    // Log this activity
    await logActivity(userId, taskId, {
      type: "comment",
      timestamp,
      details: `${userName} added a comment`
    })
    
    // Send notifications to mentioned users
    if (mentions.length > 0) {
      await sendMentionNotifications(userId, userName, taskId, mentions, commentId)
    }
    
    return commentId
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

export async function addCommentReply(
  userId: string, 
  taskId: string, 
  text: string, 
  parentId: string,
  attachments: CommentAttachment[] = []
) {
  try {
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId))
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User"
    
    const commentId = nanoid()
    const timestamp = Date.now()
    
    // Extract mentions from the text
    const mentions = extractMentions(text)
    
    // Create the reply
    const replyData = {
      id: commentId,
      text,
      userId,
      timestamp,
      userName,
      taskId,
      parentId,
      mentions: mentions.length > 0 ? mentions : null,
      attachments: attachments.length > 0 ? attachments : null
    }
    
    const replyRef = await addDoc(collection(db, "task_comments"), replyData)
    
    // Process attachments if any
    if (attachments.length > 0) {
      for (const attachment of attachments) {
        await addAttachmentRecord(userId, taskId, commentId, attachment)
      }
    }
    
    // Find parent comment author to notify them
    const parentCommentQuery = query(
      collection(db, "task_comments"),
      where("id", "==", parentId)
    )
    
    const parentSnapshot = await getDocs(parentCommentQuery)
    if (!parentSnapshot.empty) {
      const parentComment = parentSnapshot.docs[0].data()
      
      // Don't notify yourself
      if (parentComment.userId !== userId) {
        // Add parent author to notifications
        await sendReplyNotification(userId, userName, taskId, parentComment.userId, commentId)
      }
    }
    
    // Send notifications to mentioned users
    if (mentions.length > 0) {
      await sendMentionNotifications(userId, userName, taskId, mentions, commentId)
    }
    
    // Log this activity
    await logActivity(userId, taskId, {
      type: "comment",
      timestamp,
      details: `${userName} replied to a comment`
    })
    
    return commentId
  } catch (error) {
    console.error("Error adding reply:", error)
    throw error
  }
}

export async function editComment(userId: string, taskId: string, commentId: string, newText: string) {
  try {
    // Find the comment doc to edit
    const commentsQuery = query(
      collection(db, "task_comments"),
      where("id", "==", commentId),
      where("taskId", "==", taskId)
    )
    
    const snapshot = await getDocs(commentsQuery)
    
    if (snapshot.empty) {
      throw new Error("Comment not found")
    }
    
    // Check if user owns the comment
    const commentDoc = snapshot.docs[0]
    const commentData = commentDoc.data()
    
    if (commentData.userId !== userId) {
      throw new Error("Unauthorized to edit this comment")
    }
    
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId))
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User"
    
    // Extract mentions from the text
    const mentions = extractMentions(newText)
    
    // Edit the comment
    await updateDoc(commentDoc.ref, {
      text: newText,
      lastEdited: Date.now(),
      mentions: mentions.length > 0 ? mentions : null
    })
    
    // Find new mentions that weren't in the original comment
    const originalMentions = commentData.mentions || []
    const newMentions = mentions.filter(mention => !originalMentions.includes(mention))
    
    // Send notifications to newly mentioned users
    if (newMentions.length > 0) {
      await sendMentionNotifications(userId, userName, taskId, newMentions, commentId)
    }
    
    // Log this activity
    await logActivity(userId, taskId, {
      type: "comment",
      timestamp: Date.now(),
      details: `${userName} edited a comment`
    })
    
    return true
  } catch (error) {
    console.error("Error editing comment:", error)
    throw error
  }
}

export async function fetchComments(userId: string, taskId: string): Promise<TaskComment[]> {
  try {
    const commentsQuery = query(
      collection(db, "task_comments"),
      where("taskId", "==", taskId),
      orderBy("timestamp", "desc")
    )
    
    const snapshot = await getDocs(commentsQuery)
    const comments: TaskComment[] = []
    
    snapshot.forEach(doc => {
      comments.push(doc.data() as TaskComment)
    })
    
    return comments
  } catch (error) {
    console.error("Error fetching comments:", error)
    throw error
  }
}

export async function deleteComment(userId: string, taskId: string, commentId: string) {
  try {
    // Find the comment doc to delete
    const commentsQuery = query(
      collection(db, "task_comments"),
      where("id", "==", commentId),
      where("taskId", "==", taskId)
    )
    
    const snapshot = await getDocs(commentsQuery)
    
    if (snapshot.empty) {
      throw new Error("Comment not found")
    }
    
    // Check if user owns the comment
    const commentDoc = snapshot.docs[0]
    const commentData = commentDoc.data()
    
    if (commentData.userId !== userId) {
      throw new Error("Unauthorized to delete this comment")
    }
    
    // Delete the comment
    await deleteDoc(commentDoc.ref)
    
    // Also delete all replies to this comment
    const repliesQuery = query(
      collection(db, "task_comments"),
      where("parentId", "==", commentId)
    )
    
    const repliesSnapshot = await getDocs(repliesQuery)
    
    for (const replyDoc of repliesSnapshot.docs) {
      await deleteDoc(replyDoc.ref)
    }
    
    // Log this activity
    await logActivity(userId, taskId, {
      type: "comment",
      timestamp: Date.now(),
      details: "Comment was deleted"
    })
    
    return true
  } catch (error) {
    console.error("Error deleting comment:", error)
    throw error
  }
}

export async function addReactionToComment(
  userId: string, 
  taskId: string, 
  commentId: string, 
  reaction: string
) {
  try {
    // Find the comment
    const commentsQuery = query(
      collection(db, "task_comments"),
      where("id", "==", commentId),
      where("taskId", "==", taskId)
    )
    
    const snapshot = await getDocs(commentsQuery)
    
    if (snapshot.empty) {
      throw new Error("Comment not found")
    }
    
    const commentDoc = snapshot.docs[0]
    const commentData = commentDoc.data()
    
    // Get user's name
    const userDoc = await getDoc(doc(db, "users", userId))
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User"
    
    // Initialize reactions object if it doesn't exist
    const reactions = commentData.reactions || {}
    
    // Initialize array for this reaction if it doesn't exist
    if (!reactions[reaction]) {
      reactions[reaction] = []
    }
    
    // Check if user already reacted with this emoji
    if (!reactions[reaction].includes(userId)) {
      reactions[reaction].push(userId)
      
      // Update the comment
      await updateDoc(commentDoc.ref, { reactions })
      
      // Notify comment author if it's not the same user
      if (commentData.userId !== userId) {
        await sendReactionNotification(
          userId, 
          userName, 
          commentData.userId, 
          taskId, 
          commentId, 
          reaction
        )
      }
    }
    
    return reactions
  } catch (error) {
    console.error("Error adding reaction:", error)
    throw error
  }
}

export async function removeReactionFromComment(
  userId: string, 
  taskId: string, 
  commentId: string, 
  reaction: string
) {
  try {
    // Find the comment
    const commentsQuery = query(
      collection(db, "task_comments"),
      where("id", "==", commentId),
      where("taskId", "==", taskId)
    )
    
    const snapshot = await getDocs(commentsQuery)
    
    if (snapshot.empty) {
      throw new Error("Comment not found")
    }
    
    const commentDoc = snapshot.docs[0]
    const commentData = commentDoc.data()
    
    // If no reactions or this reaction doesn't exist, nothing to do
    const reactions = commentData.reactions || {}
    if (!reactions[reaction] || !reactions[reaction].includes(userId)) {
      return reactions
    }
    
    // Remove user from this reaction
    reactions[reaction] = reactions[reaction].filter(id => id !== userId)
    
    // Remove the reaction entirely if no users left
    if (reactions[reaction].length === 0) {
      delete reactions[reaction]
    }
    
    // Update the comment
    await updateDoc(commentDoc.ref, { reactions })
    
    return reactions
  } catch (error) {
    console.error("Error removing reaction:", error)
    throw error
  }
}

// Helper function to extract mentions from text
function extractMentions(text: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g
  const mentions: string[] = []
  let match
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[2]) // Push the user ID which is in the second capture group
  }
  
  return mentions
}

// Helper function to send notifications to mentioned users
async function sendMentionNotifications(
  fromUserId: string,
  fromUserName: string,
  taskId: string,
  mentionedUserIds: string[],
  commentId: string
) {
  try {
    const db = getDatabase()
    
    for (const mentionedUserId of mentionedUserIds) {
      // Don't notify yourself
      if (mentionedUserId === fromUserId) continue
      
      const notificationsRef = ref(db, `users/${mentionedUserId}/notifications`)
      
      const notification = {
        id: nanoid(),
        title: "New Mention",
        message: `${fromUserName} mentioned you in a comment`,
        type: "task_alert",
        status: "unread",
        timestamp: Date.now(),
        metadata: {
          taskId,
          commentId,
          actionRequired: true,
          priority: "medium" as "medium",
          action: {
            type: "view_comment",
            link: `/tasks/${taskId}`
          }
        }
      }
      
      await push(notificationsRef, notification)
    }
  } catch (error) {
    console.error("Error sending mention notifications:", error)
  }
}

// Helper function to send notifications for replies
async function sendReplyNotification(
  fromUserId: string,
  fromUserName: string,
  taskId: string,
  toUserId: string,
  commentId: string
) {
  try {
    const db = getDatabase()
    const notificationsRef = ref(db, `users/${toUserId}/notifications`)
    
    const notification = {
      id: nanoid(),
      title: "New Reply",
      message: `${fromUserName} replied to your comment`,
      type: "task_alert",
      status: "unread",
      timestamp: Date.now(),
      metadata: {
        taskId,
        commentId,
        actionRequired: false,
        priority: "medium" as "medium",
        action: {
          type: "view_comment",
          link: `/tasks/${taskId}`
        }
      }
    }
    
    await push(notificationsRef, notification)
  } catch (error) {
    console.error("Error sending reply notification:", error)
  }
}

// Helper function to send notifications for reactions
async function sendReactionNotification(
  fromUserId: string,
  fromUserName: string,
  toUserId: string,
  taskId: string,
  commentId: string,
  reaction: string
) {
  try {
    const db = getDatabase()
    const notificationsRef = ref(db, `users/${toUserId}/notifications`)
    
    const notification = {
      id: nanoid(),
      title: "New Reaction",
      message: `${fromUserName} reacted to your comment with ${reaction}`,
      type: "task_alert",
      status: "unread",
      timestamp: Date.now(),
      metadata: {
        taskId,
        commentId,
        actionRequired: false,
        priority: "low" as "low",
        action: {
          type: "view_comment",
          link: `/tasks/${taskId}`
        }
      }
    }
    
    await push(notificationsRef, notification)
  } catch (error) {
    console.error("Error sending reaction notification:", error)
  }
}

// Import the necessary functions for notifications
import { getDatabase, ref, push } from "firebase/database"

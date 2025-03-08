
import { db } from "@/lib/firebase"
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { nanoid } from 'nanoid'
import { CommentAttachment } from "@/components/tasks/TaskCommentSection"

/**
 * Uploads a file to Firebase Storage and returns the download URL
 */
export async function uploadFile(
  userId: string, 
  taskId: string, 
  file: File
): Promise<string> {
  try {
    const storage = getStorage()
    
    // Create a storage reference
    const fileId = nanoid()
    const fileExtension = file.name.split('.').pop()
    const storagePath = `taskAttachments/${taskId}/${fileId}.${fileExtension}`
    const storageRef = ref(storage, storagePath)
    
    // Upload the file
    await uploadBytes(storageRef, file)
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

/**
 * Upload a comment attachment and return the updated attachment with a permanent URL
 */
export async function uploadCommentAttachment(
  userId: string,
  taskId: string,
  attachment: CommentAttachment
): Promise<CommentAttachment> {
  try {
    // Convert data URI to File object if needed
    if (attachment.url.startsWith('blob:') || attachment.url.startsWith('data:')) {
      // This is a client-side URL, need to get the file and upload it
      const response = await fetch(attachment.url)
      const blob = await response.blob()
      const file = new File([blob], attachment.fileName, { type: attachment.fileType })
      
      // Upload the file
      const downloadURL = await uploadFile(userId, taskId, file)
      
      // Return updated attachment with permanent URL
      return {
        ...attachment,
        url: downloadURL,
      }
    }
    
    // If it already has a permanent URL, return as is
    return attachment
  } catch (error) {
    console.error("Error processing attachment:", error)
    throw error
  }
}

/**
 * Add an attachment record to the database
 */
export async function addAttachmentRecord(
  userId: string,
  taskId: string,
  commentId: string,
  attachment: CommentAttachment
) {
  try {
    const attachmentData = {
      id: attachment.id,
      taskId,
      commentId,
      userId,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      url: attachment.url,
      createdAt: serverTimestamp(),
    }
    
    await addDoc(collection(db, "task_attachments"), attachmentData)
    
    return attachment
  } catch (error) {
    console.error("Error adding attachment record:", error)
    throw error
  }
}

/**
 * Get all attachments for a comment
 */
export async function getCommentAttachments(
  commentId: string
): Promise<CommentAttachment[]> {
  try {
    // In a real app, we would query the database for attachments
    // This is just a placeholder until we implement actual storage integration
    return []
  } catch (error) {
    console.error("Error getting attachments:", error)
    throw error
  }
}

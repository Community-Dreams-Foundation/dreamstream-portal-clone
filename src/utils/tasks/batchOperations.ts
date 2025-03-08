
import { getDatabase, ref, update, get } from "firebase/database";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { updateTaskStatus } from "./progressOperations";
import { recordBulkStatusChange, recordBulkPriorityChange } from "./activityOperations";

/**
 * Updates the status of multiple tasks at once
 */
export const updateBatchTaskStatus = async (
  userId: string,
  taskIds: string[],
  newStatus: TaskStatus
): Promise<boolean> => {
  try {
    const db = getDatabase();
    const now = Date.now();
    
    // Create a batch update object
    const updates: Record<string, any> = {};
    
    // Get existing tasks to check their current status
    const tasksPromises = taskIds.map(taskId => 
      get(ref(db, `users/${userId}/tasks/${taskId}`))
    );
    
    const taskSnapshots = await Promise.all(tasksPromises);
    
    // Loop through each task to add to the updates object
    taskIds.forEach((taskId, index) => {
      const taskData = taskSnapshots[index].val();
      
      if (taskData) {
        updates[`users/${userId}/tasks/${taskId}/status`] = newStatus;
        updates[`users/${userId}/tasks/${taskId}/updatedAt`] = now;
        updates[`users/${userId}/tasks/${taskId}/lastActivity`] = {
          type: "status_change",
          timestamp: now,
          details: `Status updated to ${newStatus} via batch operation`
        };
        
        // For completed tasks, update completion info
        if (newStatus === "completed" && taskData.status !== "completed") {
          updates[`users/${userId}/tasks/${taskId}/completedAt`] = now;
          updates[`users/${userId}/tasks/${taskId}/completionPercentage`] = 100;
        }
      }
    });
    
    // Execute the batch update
    await update(ref(db), updates);
    
    // Log the activity
    await recordBulkStatusChange(userId, taskIds, newStatus);
    
    return true;
  } catch (error) {
    console.error("Error updating batch task status:", error);
    throw error;
  }
};

/**
 * Updates the priority of multiple tasks at once
 */
export const updateBatchTaskPriority = async (
  userId: string,
  taskIds: string[],
  newPriority: TaskPriority
): Promise<boolean> => {
  try {
    const db = getDatabase();
    const now = Date.now();
    
    // Create a batch update object
    const updates: Record<string, any> = {};
    
    // Loop through each task to add to the updates object
    taskIds.forEach(taskId => {
      updates[`users/${userId}/tasks/${taskId}/priority`] = newPriority;
      updates[`users/${userId}/tasks/${taskId}/updatedAt`] = now;
      updates[`users/${userId}/tasks/${taskId}/lastActivity`] = {
        type: "priority_change",
        timestamp: now,
        details: `Priority updated to ${newPriority} via batch operation`
      };
    });
    
    // Execute the batch update
    await update(ref(db), updates);
    
    // Log the activity
    await recordBulkPriorityChange(userId, taskIds, newPriority);
    
    return true;
  } catch (error) {
    console.error("Error updating batch task priority:", error);
    throw error;
  }
};

/**
 * Deletes multiple tasks at once
 */
export const deleteBatchTasks = async (
  userId: string,
  taskIds: string[]
): Promise<boolean> => {
  try {
    const db = getDatabase();
    
    // Create a batch update object with null values to delete the tasks
    const updates: Record<string, any> = {};
    
    // Loop through each task to add to the updates object
    taskIds.forEach(taskId => {
      updates[`users/${userId}/tasks/${taskId}`] = null;
    });
    
    // Execute the batch update
    await update(ref(db), updates);
    
    return true;
  } catch (error) {
    console.error("Error deleting batch tasks:", error);
    throw error;
  }
};

/**
 * Adds tags to multiple tasks at once
 */
export const addTagsToBatchTasks = async (
  userId: string,
  taskIds: string[],
  tags: string[]
): Promise<boolean> => {
  try {
    const db = getDatabase();
    const now = Date.now();
    
    // Get existing tasks to merge their tags
    const tasksPromises = taskIds.map(taskId => 
      get(ref(db, `users/${userId}/tasks/${taskId}`))
    );
    
    const taskSnapshots = await Promise.all(tasksPromises);
    
    // Create a batch update object
    const updates: Record<string, any> = {};
    
    // Loop through each task to add to the updates object
    taskIds.forEach((taskId, index) => {
      const taskData = taskSnapshots[index].val();
      
      if (taskData) {
        // Merge existing tags with new tags and remove duplicates
        const existingTags = taskData.tags || [];
        const mergedTags = [...new Set([...existingTags, ...tags])];
        
        updates[`users/${userId}/tasks/${taskId}/tags`] = mergedTags;
        updates[`users/${userId}/tasks/${taskId}/updatedAt`] = now;
        updates[`users/${userId}/tasks/${taskId}/lastActivity`] = {
          type: "tag_update",
          timestamp: now,
          details: `Tags updated via batch operation`
        };
      }
    });
    
    // Execute the batch update
    await update(ref(db), updates);
    
    return true;
  } catch (error) {
    console.error("Error adding tags to batch tasks:", error);
    throw error;
  }
};

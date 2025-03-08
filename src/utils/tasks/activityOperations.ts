import { db } from "@/lib/firebase"
import { doc, updateDoc, arrayUnion, getDoc, setDoc, query, collection, where, orderBy, getDocs } from "firebase/firestore"
import { Activity, Task } from "@/types/task"

export async function logActivity(userId: string, taskId: string, activity: Activity) {
  try {
    // First, check if the task exists
    const taskDoc = await getDoc(doc(db, "tasks", taskId))
    
    if (!taskDoc.exists()) {
      throw new Error("Task not found")
    }
    
    // Update the task with the new activity
    await updateDoc(doc(db, "tasks", taskId), {
      activities: arrayUnion(activity),
      lastActivity: activity
    })
    
    return true
  } catch (error) {
    console.error("Error logging activity:", error)
    throw error
  }
}

export async function fetchTaskActivities(userId: string, taskId: string): Promise<Activity[]> {
  try {
    const taskDoc = await getDoc(doc(db, "tasks", taskId))
    
    if (!taskDoc.exists()) {
      throw new Error("Task not found")
    }
    
    const taskData = taskDoc.data()
    return taskData.activities || []
  } catch (error) {
    console.error("Error fetching task activities:", error)
    throw error
  }
}

export async function fetchActivityHistory(userId: string, taskId: string, limit: number = 20): Promise<Activity[]> {
  try {
    const taskDoc = await getDoc(doc(db, "tasks", taskId));
    
    if (!taskDoc.exists()) {
      throw new Error("Task not found");
    }
    
    const taskData = taskDoc.data();
    const activities = taskData.activities || [];
    
    // Sort activities by timestamp (newest first) and limit the results
    return [...activities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
      
  } catch (error) {
    console.error("Error fetching activity history:", error);
    throw error;
  }
}

export async function fetchRecentActivities(userId: string, limit: number = 10): Promise<{
  taskId: string;
  taskTitle: string;
  activity: Activity;
}[]> {
  try {
    // Get all user tasks
    const tasksQuery = query(
      collection(db, "tasks"),
      where("assignedTo", "==", userId),
      orderBy("updatedAt", "desc")
    );
    
    const taskSnapshot = await getDocs(tasksQuery);
    const tasks = taskSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Task[];
    
    // Collect recent activities from all tasks
    const allActivities: {
      taskId: string;
      taskTitle: string;
      activity: Activity;
    }[] = [];
    
    tasks.forEach(task => {
      // Check if task has activities property before accessing it
      if (task && task.activities && Array.isArray(task.activities) && task.activities.length > 0) {
        task.activities.forEach((activity: Activity) => {
          allActivities.push({
            taskId: task.id,
            taskTitle: task.title || "Untitled Task", // Provide fallback if title is missing
            activity: activity
          });
        });
      }
    });
    
    // Sort by timestamp (newest first) and limit the results
    return allActivities
      .sort((a, b) => b.activity.timestamp - a.activity.timestamp)
      .slice(0, limit);
      
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw error;
  }
}

export async function recordStatusChange(userId: string, taskId: string, fromStatus: string, toStatus: string) {
  try {
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId))
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User"
    
    const activity: Activity = {
      type: "status_change",
      timestamp: Date.now(),
      details: `${userName} moved task from ${fromStatus} to ${toStatus}`
    }
    
    await logActivity(userId, taskId, activity)
    
    // If the new status is completed, add a completion activity
    if (toStatus === "completed") {
      const completionActivity: Activity = {
        type: "completion",
        timestamp: Date.now(),
        details: `${userName} marked the task as completed`
      }
      
      await logActivity(userId, taskId, completionActivity)
    }
    
    return true
  } catch (error) {
    console.error("Error recording status change:", error)
    throw error
  }
}

export async function recordBulkStatusChange(userId: string, taskIds: string[], toStatus: string) {
  try {
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId));
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User";
    
    const promises = taskIds.map(async (taskId) => {
      // Get current task status
      const taskDoc = await getDoc(doc(db, "tasks", taskId));
      if (!taskDoc.exists()) return;
      
      const taskData = taskDoc.data();
      const fromStatus = taskData.status;
      
      const activity: Activity = {
        type: "status_change",
        timestamp: Date.now(),
        details: `${userName} moved task from ${fromStatus} to ${toStatus} (batch update)`
      };
      
      await logActivity(userId, taskId, activity);
      
      // If the new status is completed, add a completion activity
      if (toStatus === "completed") {
        const completionActivity: Activity = {
          type: "completion",
          timestamp: Date.now(),
          details: `${userName} marked the task as completed (batch update)`
        };
        
        await logActivity(userId, taskId, completionActivity);
      }
    });
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error recording bulk status change:", error);
    throw error;
  }
}

export async function recordTimerUpdate(userId: string, taskId: string, isStarted: boolean, elapsedTime?: number) {
  try {
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId))
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User"
    
    let details = isStarted
      ? `${userName} started working on this task`
      : `${userName} paused work on this task`
      
    if (!isStarted && elapsedTime) {
      const minutes = Math.floor(elapsedTime / (1000 * 60))
      details += ` (worked for ${minutes} minutes)`
    }
    
    const activity: Activity = {
      type: "timer_update",
      timestamp: Date.now(),
      details
    }
    
    await logActivity(userId, taskId, activity)
    return true
  } catch (error) {
    console.error("Error recording timer update:", error)
    throw error
  }
}

export async function recordPriorityChange(userId: string, taskId: string, fromPriority: string, toPriority: string) {
  try {
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId))
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User"
    
    const activity: Activity = {
      type: "priority_change",
      timestamp: Date.now(),
      details: `${userName} changed priority from ${fromPriority} to ${toPriority}`
    }
    
    await logActivity(userId, taskId, activity)
    return true
  } catch (error) {
    console.error("Error recording priority change:", error)
    throw error
  }
}

export async function recordBulkPriorityChange(userId: string, taskIds: string[], toPriority: string) {
  try {
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId));
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User";
    
    const promises = taskIds.map(async (taskId) => {
      // Get current task priority
      const taskDoc = await getDoc(doc(db, "tasks", taskId));
      if (!taskDoc.exists()) return;
      
      const taskData = taskDoc.data();
      const fromPriority = taskData.priority || "medium";
      
      const activity: Activity = {
        type: "priority_change",
        timestamp: Date.now(),
        details: `${userName} changed priority from ${fromPriority} to ${toPriority} (batch update)`
      };
      
      await logActivity(userId, taskId, activity);
    });
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error recording bulk priority change:", error);
    throw error;
  }
}

export async function recordTaskSplit(userId: string, taskId: string, newTaskIds: string[]) {
  try {
    // Get user's name if available
    const userDoc = await getDoc(doc(db, "users", userId))
    const userName = userDoc.exists() ? userDoc.data().name || "User" : "User"
    
    const activity: Activity = {
      type: "split",
      timestamp: Date.now(),
      details: `${userName} split this task into ${newTaskIds.length} subtasks`
    }
    
    await logActivity(userId, taskId, activity)
    return true
  } catch (error) {
    console.error("Error recording task split:", error)
    throw error
  }
}

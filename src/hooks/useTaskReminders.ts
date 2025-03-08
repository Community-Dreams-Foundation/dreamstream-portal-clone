
import { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, query, orderByChild, get, update } from 'firebase/database';
import { Task } from '@/types/task';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';

type ReminderSettings = {
  enabled: boolean;
  daysBefore: number[];  // How many days before due date to send reminders (e.g., [1, 3, 7])
  notifyInApp: boolean;
  notifyEmail: boolean;
};

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  daysBefore: [1, 3],
  notifyInApp: true, 
  notifyEmail: false,
};

export function useTaskReminders() {
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  // Load user's reminder settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser?.uid) return;
      
      const db = getDatabase();
      const settingsRef = ref(db, `users/${currentUser.uid}/taskReminderSettings`);
      
      try {
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
          setReminderSettings(snapshot.val());
        } else {
          // If no settings exist, create default ones
          await update(ref(db, `users/${currentUser.uid}`), {
            taskReminderSettings: DEFAULT_REMINDER_SETTINGS
          });
        }
      } catch (error) {
        console.error("Error loading reminder settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [currentUser]);

  // Save user's reminder settings
  const saveSettings = useCallback(async (newSettings: ReminderSettings) => {
    if (!currentUser?.uid) return;
    
    setLoading(true);
    try {
      const db = getDatabase();
      await update(ref(db, `users/${currentUser.uid}`), {
        taskReminderSettings: newSettings
      });
      
      setReminderSettings(newSettings);
      toast({
        title: "Settings saved",
        description: "Your task reminder settings have been updated."
      });
    } catch (error) {
      console.error("Error saving reminder settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save reminder settings."
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  // Check for tasks that need reminders
  const checkForReminders = useCallback(async () => {
    if (!currentUser?.uid || !reminderSettings.enabled) return;
    
    try {
      const db = getDatabase();
      const tasksRef = ref(db, `users/${currentUser.uid}/tasks`);
      
      // Get tasks that have due dates
      const tasksSnapshot = await get(tasksRef);
      if (!tasksSnapshot.exists()) return;
      
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      tasksSnapshot.forEach((childSnapshot) => {
        const task = childSnapshot.val() as Task;
        
        // Skip if task has no due date, is already completed, or is already reminded
        if (!task.dueDate || task.status === "completed" || 
            (task.metadata?.remindedAt === true)) return;
        
        const dueDate = new Date(task.dueDate);
        const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if we should send a reminder based on days before setting
        if (reminderSettings.daysBefore.includes(daysUntilDue)) {
          // Send notification
          if (reminderSettings.notifyInApp) {
            addNotification({
              title: "Task Due Soon",
              message: `"${task.title}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
              type: "task_alert",
              metadata: {
                taskId: task.id,
                priority: task.priority || "medium",
                actionRequired: true,
                dueDate: new Date(task.dueDate).toISOString().split('T')[0],
                action: {
                  type: "view_task",
                  link: `/tasks/${task.id}`
                }
              }
            });
          }
          
          // Mark task as reminded
          update(ref(db, `users/${currentUser.uid}/tasks/${task.id}`), {
            metadata: {
              ...task.metadata,
              remindedAt: true
            }
          });
        }
        
        // Special case: Task due today
        if (daysUntilDue === 0) {
          if (reminderSettings.notifyInApp) {
            addNotification({
              title: "Task Due Today",
              message: `"${task.title}" is due today!`,
              type: "task_alert",
              metadata: {
                taskId: task.id,
                priority: "high",
                actionRequired: true,
                dueDate: new Date(task.dueDate).toISOString().split('T')[0],
                action: {
                  type: "view_task",
                  link: `/tasks/${task.id}`
                }
              }
            });
          }
          
          // Mark task as reminded
          update(ref(db, `users/${currentUser.uid}/tasks/${task.id}`), {
            metadata: {
              ...task.metadata,
              remindedAt: true
            }
          });
        }
        
        // Special case: Task overdue
        if (daysUntilDue < 0 && 
            (!task.metadata?.overdueReminded || 
             new Date(task.metadata.overdueReminded).getDate() !== now.getDate())) {
          if (reminderSettings.notifyInApp) {
            addNotification({
              title: "Task Overdue",
              message: `"${task.title}" is overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}!`,
              type: "task_alert",
              metadata: {
                taskId: task.id,
                priority: "high",
                actionRequired: true,
                dueDate: new Date(task.dueDate).toISOString().split('T')[0],
                action: {
                  type: "view_task",
                  link: `/tasks/${task.id}`
                }
              }
            });
          }
          
          // Mark when we reminded about overdue
          update(ref(db, `users/${currentUser.uid}/tasks/${task.id}`), {
            metadata: {
              ...task.metadata,
              overdueReminded: now.getTime()
            }
          });
        }
      });
    } catch (error) {
      console.error("Error checking for reminders:", error);
    }
  }, [currentUser, reminderSettings, addNotification]);

  // Run reminder check when component mounts and settings change
  useEffect(() => {
    if (!loading) {
      checkForReminders();
      
      // Set up interval to check every hour
      const intervalId = setInterval(checkForReminders, 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [loading, checkForReminders]);

  return {
    reminderSettings,
    saveSettings,
    loading,
    checkForReminders
  };
}

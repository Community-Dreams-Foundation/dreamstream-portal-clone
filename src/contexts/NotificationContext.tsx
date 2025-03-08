import React, { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, onValue, update, push, get } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"
import socketService from "@/utils/socketService"
import { sendEmail } from "@/utils/emailService"

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "meeting" | "support" | "system" | "task_alert" | "fee_reminder" | "performance_update" | "waiver" | "payment" | "comment" | "leadership";
  status: "unread" | "read";
  timestamp: number;
  metadata?: {
    meetingId?: string;
    supportTicketId?: string;
    taskId?: string;
    commentId?: string;
    waiverId?: string;
    paymentId?: string;
    amount?: number;
    dueDate?: string;
    priority?: "low" | "medium" | "high";
    actionRequired?: boolean;
    action?: {
      type: string;
      link?: string;
    };
  };
}

interface NotificationPreference {
  enabled: boolean;
  channel: "in-app" | "email" | "both";
  frequency: "immediate" | "hourly" | "daily";
}

type NotificationPreferences = Record<string, NotificationPreference>;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  filteredNotifications: (types: string[]) => Notification[];
  markAsRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "status" | "timestamp">) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getNotificationsByType: (type: Notification["type"]) => Notification[];
  getMeetingNotifications: () => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const unreadCount = notifications.filter(n => n.status === "unread").length

  useEffect(() => {
    if (!currentUser) return

    const db = getDatabase()
    const notificationsRef = ref(db, `users/${currentUser.uid}/notifications`)

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const notificationsList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value as Omit<Notification, "id">
        }))
        notificationsList.sort((a, b) => b.timestamp - a.timestamp)
        setNotifications(notificationsList)
      } else {
        setNotifications([])
      }
    })

    return () => unsubscribe()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    
    const db = getDatabase()
    const prefsRef = ref(db, `users/${currentUser.uid}/notificationPreferences`)
    
    const unsubscribe = onValue(prefsRef, (snapshot) => {
      if (snapshot.exists()) {
        setPreferences(snapshot.val())
      } else {
        setPreferences({})
      }
    })
    
    return () => unsubscribe()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return

    socketService.connect(currentUser.uid)

    const handleMeetingUpdated = (event: CustomEvent<any>) => {
      const data = event.detail
      addNotification({
        title: "Meeting Updated",
        message: `${data.title} has been updated by ${data.updatedBy}`,
        type: "meeting",
        metadata: {
          meetingId: data.meetingId,
          priority: "medium",
          actionRequired: true,
          action: {
            type: "view_meeting",
            link: `/meetings/${data.meetingId}`
          }
        }
      })
    }

    const handleMeetingReminder = (event: CustomEvent<any>) => {
      const data = event.detail
      addNotification({
        title: "Meeting Reminder",
        message: `${data.title} starts in ${data.timeRemaining} minutes`,
        type: "meeting",
        metadata: {
          meetingId: data.meetingId,
          priority: "high",
          actionRequired: true,
          action: {
            type: "join_meeting",
            link: data.joinUrl
          }
        }
      })
    }

    const handleMeetingStarted = (event: CustomEvent<any>) => {
      const data = event.detail
      addNotification({
        title: "Meeting Started",
        message: `${data.title} has started`,
        type: "meeting",
        metadata: {
          meetingId: data.meetingId,
          priority: "high",
          actionRequired: true,
          action: {
            type: "join_meeting",
            link: data.joinUrl
          }
        }
      })
    }

    const handleMeetingEnded = (event: CustomEvent<any>) => {
      const data = event.detail
      addNotification({
        title: "Meeting Ended",
        message: `${data.title} has ended`,
        type: "meeting",
        metadata: {
          meetingId: data.meetingId,
          priority: "low",
          actionRequired: false
        }
      })
    }

    const handleMeetingRecording = (event: CustomEvent<any>) => {
      const data = event.detail
      addNotification({
        title: "Recording Available",
        message: `Recording for "${data.title}" is now available`,
        type: "meeting",
        metadata: {
          meetingId: data.meetingId,
          priority: "medium",
          actionRequired: false,
          action: {
            type: "view_recording",
            link: data.recordingUrl
          }
        }
      })
    }

    const handleMeetingTranscript = (event: CustomEvent<any>) => {
      const data = event.detail
      addNotification({
        title: "Transcript Available",
        message: `Transcript for "${data.title}" is now available`,
        type: "meeting",
        metadata: {
          meetingId: data.meetingId,
          priority: "medium",
          actionRequired: false,
          action: {
            type: "view_transcript",
            link: data.transcriptUrl
          }
        }
      })
    }

    window.addEventListener("meeting:updated", handleMeetingUpdated as EventListener)
    window.addEventListener("meeting:reminder", handleMeetingReminder as EventListener)
    window.addEventListener("meeting:started", handleMeetingStarted as EventListener)
    window.addEventListener("meeting:ended", handleMeetingEnded as EventListener)
    window.addEventListener("meeting:recording", handleMeetingRecording as EventListener)
    window.addEventListener("meeting:transcript", handleMeetingTranscript as EventListener)

    return () => {
      window.removeEventListener("meeting:updated", handleMeetingUpdated as EventListener)
      window.removeEventListener("meeting:reminder", handleMeetingReminder as EventListener)
      window.removeEventListener("meeting:started", handleMeetingStarted as EventListener)
      window.removeEventListener("meeting:ended", handleMeetingEnded as EventListener)
      window.removeEventListener("meeting:recording", handleMeetingRecording as EventListener)
      window.removeEventListener("meeting:transcript", handleMeetingTranscript as EventListener)
      
      socketService.disconnect()
    }
  }, [currentUser])

  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return
    const db = getDatabase()
    return update(ref(db, `users/${currentUser.uid}/notifications/${notificationId}`), {
      status: "read",
    })
  }

  const markAllAsRead = async () => {
    if (!currentUser || notifications.length === 0) return
    const db = getDatabase()
    const updates: Record<string, any> = {}
    
    notifications.forEach(notification => {
      if (notification.status === "unread") {
        updates[`users/${currentUser.uid}/notifications/${notification.id}/status`] = "read"
      }
    })
    
    return update(ref(db), updates)
  }

  const deleteNotification = async (notificationId: string) => {
    if (!currentUser) return
    const db = getDatabase()
    return update(ref(db, `users/${currentUser.uid}/notifications/${notificationId}`), null)
  }

  const addNotification = async (notification: Omit<Notification, "id" | "status" | "timestamp">) => {
    if (!currentUser) return
    
    if (preferences) {
      const pref = preferences[notification.type]
      
      if (pref && !pref.enabled) {
        return
      }
      
      if (pref && (pref.channel === "email" || pref.channel === "both")) {
        if (pref.frequency === "immediate") {
          try {
            await sendEmail({
              to: currentUser.email || "",
              from: "notifications@dreamstream.org",
              subject: `DreamStream: ${notification.title}`,
              message: notification.message,
              metadata: {
                notificationType: notification.type,
                priority: notification.metadata?.priority
              }
            })
          } catch (error) {
            console.error("Failed to send email notification:", error)
          }
        }
      }
      
      if (pref && pref.channel === "email") {
        return
      }
    }
    
    const db = getDatabase()
    const notificationsRef = ref(db, `users/${currentUser.uid}/notifications`)
    
    const newNotification = {
      ...notification,
      status: "unread",
      timestamp: Date.now()
    }
    
    await push(notificationsRef, newNotification)

    toast({
      title: notification.title,
      description: notification.message,
    })
  }

  const filteredNotifications = (types: string[]) => {
    return notifications.filter(notification => types.includes(notification.type))
  }

  const getNotificationsByType = (type: Notification["type"]) => {
    return notifications.filter(notification => notification.type === type)
  }

  const getMeetingNotifications = () => {
    return notifications.filter(notification => notification.type === "meeting")
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        filteredNotifications,
        markAsRead, 
        addNotification, 
        markAllAsRead, 
        deleteNotification,
        getNotificationsByType,
        getMeetingNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}


import React, { createContext, useContext, useState, useEffect } from "react"
import { getDatabase, ref, onValue, get, set, push, update, remove } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { useCalendar } from "@/contexts/CalendarContext"
import { formatISO, addMinutes, addDays, addWeeks } from "date-fns"
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/utils/calendarIntegration"

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  hostId: string;
  hostName: string;
  participants: {
    id: string;
    name: string;
    email?: string;
    status: "pending" | "accepted" | "declined" | "tentative";
  }[];
  meetingType: "team" | "one-on-one" | "leadership" | "organization";
  recurrence?: {
    frequency: "daily" | "weekly" | "biweekly" | "monthly" | "custom";
    interval?: number; // e.g., every 2 weeks
    daysOfWeek?: number[]; // 0 = Sunday, 6 = Saturday
    endsOn?: string; // ISO string
    count?: number; // number of occurrences
  };
  location?: {
    type: "virtual" | "physical";
    link?: string;
    address?: string;
  };
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  recordingUrl?: string;
  transcriptUrl?: string;
  tags?: string[];
  agendaItems?: string[];
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  calendarEventId?: string;
}

export interface RecurringMeetingTemplate {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  meetingType: "team" | "one-on-one" | "leadership" | "organization";
  participantRoles: string[]; // roles to include
  recurrence: {
    frequency: "daily" | "weekly" | "biweekly" | "monthly" | "custom";
    interval?: number;
    daysOfWeek?: number[];
  };
  hostRole: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MeetingContextType {
  meetings: Meeting[];
  upcomingMeetings: Meeting[];
  pastMeetings: Meeting[];
  createMeeting: (meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt" | "status" | "calendarEventId">) => Promise<string>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  scheduleMeeting: (templateId: string, startTime: Date, participants: { id: string, name: string, email?: string }[]) => Promise<string>;
  getMeetingById: (id: string) => Promise<Meeting | null>;
  getUpcomingMeetingsByType: (type: Meeting["meetingType"]) => Meeting[];
  createRecurringMeetings: (
    role: string,
    participants: { id: string, name: string, email?: string }[]
  ) => Promise<string[]>;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined)

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const { currentUser } = useAuth()
  const { addNotification } = useNotifications()
  const { calendarSettings, credentials, isConnected } = useCalendar()
  
  const upcomingMeetings = meetings.filter(
    m => new Date(m.startTime) > new Date() && 
    m.status !== "cancelled"
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  
  const pastMeetings = meetings.filter(
    m => new Date(m.endTime) < new Date() || 
    m.status === "completed"
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  useEffect(() => {
    if (!currentUser) return
    
    const db = getDatabase()
    const userMeetingsRef = ref(db, `meetings`)
    
    const unsubscribe = onValue(userMeetingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const meetingList: Meeting[] = []
        
        Object.entries(data).forEach(([id, value]: [string, any]) => {
          // Check if user is host or participant
          const isHost = value.hostId === currentUser.uid
          const isParticipant = value.participants?.some(
            (p: { id: string }) => p.id === currentUser.uid
          )
          
          if (isHost || isParticipant) {
            meetingList.push({
              id,
              ...value,
            })
          }
        })
        
        setMeetings(meetingList)
      } else {
        setMeetings([])
      }
    })
    
    return () => {
      unsubscribe()
    }
  }, [currentUser])

  const createMeeting = async (
    meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt" | "status" | "calendarEventId">
  ): Promise<string> => {
    if (!currentUser) throw new Error("User not authenticated")
    
    const db = getDatabase()
    const meetingsRef = ref(db, `meetings`)
    
    const now = formatISO(new Date())
    
    const newMeeting = {
      ...meetingData,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    }
    
    const newMeetingRef = await push(meetingsRef, newMeeting)
    const meetingId = newMeetingRef.key
    
    if (!meetingId) throw new Error("Failed to create meeting")
    
    // Create calendar event if calendar integration is enabled and automatic invites are turned on
    if (isConnected && calendarSettings.autoSendInvites) {
      try {
        const meetingWithId = { id: meetingId, ...newMeeting } as Meeting
        
        const calendarEvent = await createCalendarEvent(meetingWithId, credentials)
        
        if (calendarEvent) {
          // Update meeting with calendar event ID
          await update(ref(db, `meetings/${meetingId}`), {
            calendarEventId: calendarEvent.id
          })
        }
      } catch (error) {
        console.error("Error creating calendar event:", error)
      }
    }
    
    // Notify all participants
    for (const participant of meetingData.participants) {
      if (participant.id !== currentUser.uid) {
        await addNotification({
          title: `New Meeting: ${meetingData.title}`,
          message: `You have been invited to a ${meetingData.meetingType} meeting by ${meetingData.hostName}`,
          type: "meeting",
          metadata: {
            meetingId,
            priority: "medium",
            actionRequired: true,
            action: {
              type: "view_meeting",
              link: `/meetings/${meetingId}`
            }
          }
        })
      }
    }
    
    return meetingId
  }
  
  const updateMeeting = async (id: string, updates: Partial<Meeting>): Promise<void> => {
    if (!currentUser) throw new Error("User not authenticated")
    
    const db = getDatabase()
    const meetingRef = ref(db, `meetings/${id}`)
    
    // Get current meeting data
    const snapshot = await get(meetingRef)
    if (!snapshot.exists()) throw new Error("Meeting not found")
    
    const meeting = snapshot.val() as Meeting
    
    // Check if user is the host
    if (meeting.hostId !== currentUser.uid) {
      throw new Error("Only the host can update this meeting")
    }
    
    await update(meetingRef, {
      ...updates,
      updatedAt: formatISO(new Date())
    })
    
    // Update calendar event if the meeting has one and calendar integration is enabled
    if (meeting.calendarEventId && isConnected) {
      try {
        const updatedMeeting = { ...meeting, ...updates, id } as Meeting
        
        await updateCalendarEvent(id, updatedMeeting, credentials)
      } catch (error) {
        console.error("Error updating calendar event:", error)
      }
    }
    
    // Notify participants about the update if there are significant changes
    if (updates.startTime || updates.endTime || updates.status === "cancelled") {
      for (const participant of meeting.participants) {
        if (participant.id !== currentUser.uid) {
          await addNotification({
            title: `Meeting Update: ${meeting.title}`,
            message: updates.status === "cancelled" 
              ? `A meeting has been cancelled by ${meeting.hostName}`
              : `Meeting details have been updated by ${meeting.hostName}`,
            type: "meeting",
            metadata: {
              meetingId: id,
              priority: "medium",
              actionRequired: true,
              action: {
                type: "view_meeting",
                link: `/meetings/${id}`
              }
            }
          })
        }
      }
    }
  }
  
  const deleteMeeting = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error("User not authenticated")
    
    const db = getDatabase()
    const meetingRef = ref(db, `meetings/${id}`)
    
    // Get current meeting data
    const snapshot = await get(meetingRef)
    if (!snapshot.exists()) throw new Error("Meeting not found")
    
    const meeting = snapshot.val() as Meeting
    
    // Check if user is the host
    if (meeting.hostId !== currentUser.uid) {
      throw new Error("Only the host can delete this meeting")
    }
    
    // Delete calendar event if the meeting has one and calendar integration is enabled
    if (meeting.calendarEventId && isConnected) {
      try {
        await deleteCalendarEvent(id, meeting.calendarEventId, credentials)
      } catch (error) {
        console.error("Error deleting calendar event:", error)
      }
    }
    
    // Notify participants about the cancellation
    for (const participant of meeting.participants) {
      if (participant.id !== currentUser.uid) {
        await addNotification({
          title: `Meeting Cancelled: ${meeting.title}`,
          message: `A meeting has been cancelled by ${meeting.hostName}`,
          type: "meeting",
          metadata: {
            meetingId: id,
            priority: "medium",
            actionRequired: false
          }
        })
      }
    }
    
    await remove(meetingRef)
  }
  
  const getMeetingById = async (id: string): Promise<Meeting | null> => {
    const db = getDatabase()
    const meetingRef = ref(db, `meetings/${id}`)
    
    const snapshot = await get(meetingRef)
    if (!snapshot.exists()) return null
    
    const meeting = snapshot.val() as Meeting
    return {
      id,
      ...meeting
    }
  }
  
  const getUpcomingMeetingsByType = (type: Meeting["meetingType"]): Meeting[] => {
    return upcomingMeetings.filter(m => m.meetingType === type)
  }
  
  const scheduleMeeting = async (
    templateId: string, 
    startTime: Date, 
    participants: { id: string, name: string, email?: string }[]
  ): Promise<string> => {
    if (!currentUser) throw new Error("User not authenticated")
    
    const db = getDatabase()
    const templateRef = ref(db, `meetingTemplates/${templateId}`)
    
    const snapshot = await get(templateRef)
    if (!snapshot.exists()) throw new Error("Template not found")
    
    const template = snapshot.val() as RecurringMeetingTemplate
    
    const endTime = addMinutes(startTime, template.duration)
    
    // Add status property to each participant
    const participantsWithStatus = participants.map(p => ({
      ...p,
      status: "pending" as const
    }))
    
    const meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt" | "status" | "calendarEventId"> = {
      title: template.title,
      description: template.description,
      startTime: formatISO(startTime),
      endTime: formatISO(endTime),
      hostId: currentUser.uid,
      hostName: currentUser.displayName || "Unknown Host",
      participants: participantsWithStatus,
      meetingType: template.meetingType,
      location: {
        type: "virtual",
        link: `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
      },
      agendaItems: [],
    }
    
    return createMeeting(meetingData)
  }
  
  // Create recurring meetings based on role
  const createRecurringMeetings = async (
    role: string,
    participants: { id: string, name: string, email?: string }[]
  ): Promise<string[]> => {
    if (!currentUser) throw new Error("User not authenticated")
    
    const meetingIds: string[] = []
    const now = new Date()

    // Add status property to each participant
    const participantsWithStatus = participants.map(p => ({
      ...p,
      status: "pending" as const
    }))
    
    // Different meeting patterns based on role
    if (role === "captain") {
      // Team Captains: 3 meetings per week with team members
      // Monday, Wednesday, Friday at 10 AM
      const daysToAdd = [0, 2, 4] // Adding days from Monday
      const currentDay = now.getDay()
      
      // Find the next Monday
      const daysUntilMonday = (8 - currentDay) % 7
      const nextMonday = addDays(now, daysUntilMonday)
      
      for (const dayOffset of daysToAdd) {
        const meetingDate = addDays(nextMonday, dayOffset)
        meetingDate.setHours(10, 0, 0, 0) // 10 AM
        
        const endTime = addMinutes(meetingDate, 30) // 30 minute meetings
        
        const meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt" | "status" | "calendarEventId"> = {
          title: "Team Sync",
          description: "Regular team sync to discuss progress and blockers",
          startTime: formatISO(meetingDate),
          endTime: formatISO(endTime),
          hostId: currentUser.uid,
          hostName: currentUser.displayName || "Unknown Host",
          participants: participantsWithStatus,
          meetingType: "team",
          location: {
            type: "virtual",
            link: `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
          },
          recurrence: {
            frequency: "weekly",
            interval: 1,
            daysOfWeek: [meetingDate.getDay()]
          },
          agendaItems: [
            "Team progress update",
            "Blockers and challenges",
            "Next steps and action items"
          ],
        }
        
        const meetingId = await createMeeting(meetingData)
        meetingIds.push(meetingId)
      }
    } else if (role === "team-lead") {
      // Team Leads: Weekly meetings with Captains
      // Wednesday at 2 PM
      const currentDay = now.getDay()
      const daysUntilWednesday = (10 - currentDay) % 7
      const nextWednesday = addDays(now, daysUntilWednesday)
      nextWednesday.setHours(14, 0, 0, 0) // 2 PM
      
      const endTime = addMinutes(nextWednesday, 45) // 45 minute meeting
      
      const meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt" | "status" | "calendarEventId"> = {
        title: "Captains Sync",
        description: "Weekly meeting with team captains to align on priorities and address escalations",
        startTime: formatISO(nextWednesday),
        endTime: formatISO(endTime),
        hostId: currentUser.uid,
        hostName: currentUser.displayName || "Unknown Host",
        participants: participantsWithStatus,
        meetingType: "leadership",
        location: {
          type: "virtual",
          link: `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
        },
        recurrence: {
          frequency: "weekly",
          interval: 1,
          daysOfWeek: [3] // Wednesday
        },
        agendaItems: [
          "Team performance review",
          "Process improvements",
          "Escalations and blockers",
          "Leadership development"
        ],
      }
      
      const meetingId = await createMeeting(meetingData)
      meetingIds.push(meetingId)
    } else if (role === "product-owner") {
      // Product Owners: Bi-weekly meetings with Team Leads
      // Every other Monday at 11 AM
      const currentDay = now.getDay()
      const daysUntilMonday = (8 - currentDay) % 7
      const nextMonday = addDays(now, daysUntilMonday)
      nextMonday.setHours(11, 0, 0, 0) // 11 AM
      
      const endTime = addMinutes(nextMonday, 60) // 1 hour meeting
      
      const meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt" | "status" | "calendarEventId"> = {
        title: "Sprint Planning",
        description: "Bi-weekly sprint planning and review with team leads",
        startTime: formatISO(nextMonday),
        endTime: formatISO(endTime),
        hostId: currentUser.uid,
        hostName: currentUser.displayName || "Unknown Host",
        participants: participantsWithStatus,
        meetingType: "leadership",
        location: {
          type: "virtual",
          link: `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
        },
        recurrence: {
          frequency: "biweekly",
          interval: 2,
          daysOfWeek: [1] // Monday
        },
        agendaItems: [
          "Previous sprint review",
          "Next sprint planning",
          "Resource allocation",
          "Strategic alignment"
        ],
      }
      
      const meetingId = await createMeeting(meetingData)
      meetingIds.push(meetingId)
    } else if (role === "executive") {
      // Executives: Meetings with Product Owners every 6 weeks
      // Every 6 weeks on Thursday at 2 PM
      const currentDay = now.getDay()
      const daysUntilThursday = (11 - currentDay) % 7
      const nextThursday = addDays(now, daysUntilThursday)
      nextThursday.setHours(14, 0, 0, 0) // 2 PM
      
      const endTime = addMinutes(nextThursday, 90) // 1.5 hour meeting
      
      const meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt" | "status" | "calendarEventId"> = {
        title: "Executive Review",
        description: "Strategic review and planning with product owners",
        startTime: formatISO(nextThursday),
        endTime: formatISO(endTime),
        hostId: currentUser.uid,
        hostName: currentUser.displayName || "Unknown Host",
        participants: participantsWithStatus,
        meetingType: "organization",
        location: {
          type: "virtual",
          link: `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
        },
        recurrence: {
          frequency: "custom",
          interval: 6,
          daysOfWeek: [4] // Thursday
        },
        agendaItems: [
          "Quarterly goals review",
          "Strategic initiatives",
          "Resource planning",
          "Market analysis"
        ],
      }
      
      const meetingId = await createMeeting(meetingData)
      meetingIds.push(meetingId)
      
      // Also schedule quarterly organization-wide meetings
      const nextQuarterlyMeeting = addWeeks(now, Math.ceil(12 - (now.getMonth() % 3) * 4))
      nextQuarterlyMeeting.setHours(15, 0, 0, 0) // 3 PM
      
      const quarterlyEndTime = addMinutes(nextQuarterlyMeeting, 120) // 2 hour meeting
      
      const quarterlyMeetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt" | "status" | "calendarEventId"> = {
        title: "Quarterly All-Hands",
        description: "Quarterly organization-wide update and alignment",
        startTime: formatISO(nextQuarterlyMeeting),
        endTime: formatISO(quarterlyEndTime),
        hostId: currentUser.uid,
        hostName: currentUser.displayName || "Unknown Host",
        participants: participantsWithStatus,
        meetingType: "organization",
        location: {
          type: "virtual",
          link: `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
        },
        recurrence: {
          frequency: "custom",
          interval: 13, // roughly quarterly
          daysOfWeek: [nextQuarterlyMeeting.getDay()]
        },
        agendaItems: [
          "Quarterly results",
          "Strategic direction",
          "Recognition and achievements",
          "Q&A"
        ],
      }
      
      const quarterlyMeetingId = await createMeeting(quarterlyMeetingData)
      meetingIds.push(quarterlyMeetingId)
    }
    
    return meetingIds
  }

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        upcomingMeetings,
        pastMeetings,
        createMeeting,
        updateMeeting,
        deleteMeeting,
        scheduleMeeting,
        getMeetingById,
        getUpcomingMeetingsByType,
        createRecurringMeetings
      }}
    >
      {children}
    </MeetingContext.Provider>
  )
}

export const useMeetings = () => {
  const context = useContext(MeetingContext)
  if (context === undefined) {
    throw new Error("useMeetings must be used within a MeetingProvider")
  }
  return context
}

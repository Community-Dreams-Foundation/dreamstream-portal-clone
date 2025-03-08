
import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, get, set } from "firebase/database"
import { CalendarSettings, CalendarCredentials, verifyCalendarCredentials } from "@/utils/calendar"
import { useToast } from "@/hooks/use-toast"

interface CalendarContextType {
  calendarSettings: CalendarSettings
  isConnected: boolean
  isLoading: boolean
  connectCalendar: (provider: "google" | "outlook") => Promise<void>
  disconnectCalendar: () => Promise<void>
  updateSettings: (settings: Partial<CalendarSettings>) => Promise<void>
  credentials?: CalendarCredentials
}

const defaultSettings: CalendarSettings = {
  provider: "none",
  autoSendInvites: true,
  defaultReminder: 15
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>(defaultSettings)
  const [credentials, setCredentials] = useState<CalendarCredentials | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  
  const isConnected = calendarSettings.provider !== "none" && Boolean(credentials)

  useEffect(() => {
    if (!currentUser) {
      setCalendarSettings(defaultSettings)
      setCredentials(undefined)
      setIsLoading(false)
      return
    }
    
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const db = getDatabase()
        
        // Load settings
        const settingsRef = ref(db, `users/${currentUser.uid}/calendarSettings`)
        const settingsSnapshot = await get(settingsRef)
        
        if (settingsSnapshot.exists()) {
          setCalendarSettings(settingsSnapshot.val())
        } else {
          setCalendarSettings(defaultSettings)
        }
        
        // Load credentials
        const credentialsRef = ref(db, `users/${currentUser.uid}/calendarCredentials`)
        const credentialsSnapshot = await get(credentialsRef)
        
        if (credentialsSnapshot.exists()) {
          const savedCredentials = credentialsSnapshot.val() as CalendarCredentials
          // Verify the credentials are still valid
          const isValid = await verifyCalendarCredentials(savedCredentials)
          
          if (isValid) {
            setCredentials(savedCredentials)
          } else {
            // Credentials expired, reset to none
            setCalendarSettings(prev => ({ ...prev, provider: "none" }))
            setCredentials(undefined)
            toast({
              title: "Calendar Disconnected",
              description: "Your calendar authentication has expired. Please reconnect your calendar.",
              variant: "destructive"
            })
          }
        }
      } catch (error) {
        console.error("Error loading calendar settings:", error)
        toast({
          title: "Error loading calendar settings",
          description: "There was an error loading your calendar settings. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSettings()
  }, [currentUser, toast])

  const connectCalendar = async (provider: "google" | "outlook") => {
    if (!currentUser) return
    
    try {
      // For this demo, we'll just set mock credentials
      // In a real app, this would redirect to OAuth flow
      
      const mockCredentials: CalendarCredentials = {
        accessToken: `mock_${provider}_token_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        expiresAt: Date.now() + 3600 * 1000
      }
      
      const db = getDatabase()
      
      // Save credentials
      await set(ref(db, `users/${currentUser.uid}/calendarCredentials`), mockCredentials)
      
      // Update settings
      const updatedSettings: CalendarSettings = { 
        ...calendarSettings,
        provider 
      }
      await set(ref(db, `users/${currentUser.uid}/calendarSettings`), updatedSettings)
      
      // Update state
      setCredentials(mockCredentials)
      setCalendarSettings(updatedSettings)
      
      toast({
        title: "Calendar Connected",
        description: `Your ${provider} calendar has been connected successfully.`
      })
    } catch (error) {
      console.error("Error connecting calendar:", error)
      toast({
        title: "Error Connecting Calendar",
        description: "There was an error connecting your calendar. Please try again.",
        variant: "destructive"
      })
    }
  }

  const disconnectCalendar = async () => {
    if (!currentUser) return
    
    try {
      const db = getDatabase()
      
      // Remove credentials
      await set(ref(db, `users/${currentUser.uid}/calendarCredentials`), null)
      
      // Update settings
      const updatedSettings: CalendarSettings = { 
        ...calendarSettings,
        provider: "none" 
      }
      await set(ref(db, `users/${currentUser.uid}/calendarSettings`), updatedSettings)
      
      // Update state
      setCredentials(undefined)
      setCalendarSettings(updatedSettings)
      
      toast({
        title: "Calendar Disconnected",
        description: "Your calendar has been disconnected successfully."
      })
    } catch (error) {
      console.error("Error disconnecting calendar:", error)
      toast({
        title: "Error Disconnecting Calendar",
        description: "There was an error disconnecting your calendar. Please try again.",
        variant: "destructive"
      })
    }
  }

  const updateSettings = async (settings: Partial<CalendarSettings>) => {
    if (!currentUser) return
    
    try {
      const updatedSettings: CalendarSettings = { ...calendarSettings, ...settings }
      
      const db = getDatabase()
      await set(ref(db, `users/${currentUser.uid}/calendarSettings`), updatedSettings)
      
      setCalendarSettings(updatedSettings)
      
      toast({
        title: "Settings Updated",
        description: "Your calendar settings have been updated successfully."
      })
    } catch (error) {
      console.error("Error updating calendar settings:", error)
      toast({
        title: "Error Updating Settings",
        description: "There was an error updating your calendar settings. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <CalendarContext.Provider value={{
      calendarSettings,
      isConnected,
      isLoading,
      connectCalendar,
      disconnectCalendar,
      updateSettings,
      credentials
    }}>
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendar = () => {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider")
  }
  return context
}

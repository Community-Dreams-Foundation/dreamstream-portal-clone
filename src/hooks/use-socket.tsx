
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import socketService from "@/utils/socketService"

export function useSocket() {
  const { currentUser } = useAuth()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    
    // Connect to socket when user is authenticated
    socketService.connect(currentUser.uid)
    setIsConnected(socketService.isConnected())
    
    // Check connection status periodically
    const interval = setInterval(() => {
      setIsConnected(socketService.isConnected())
    }, 5000)
    
    // Cleanup function
    return () => {
      clearInterval(interval)
      socketService.disconnect()
    }
  }, [currentUser])

  const subscribeToMeeting = (meetingId: string) => {
    if (!currentUser) return
    socketService.subscribeToMeetingUpdates(meetingId)
  }

  const unsubscribeFromMeeting = (meetingId: string) => {
    if (!currentUser) return
    socketService.unsubscribeFromMeetingUpdates(meetingId)
  }

  const sendMeetingChat = (meetingId: string, message: string) => {
    if (!currentUser) return
    socketService.sendMeetingChat(meetingId, message)
  }

  return {
    isConnected,
    subscribeToMeeting,
    unsubscribeFromMeeting,
    sendMeetingChat
  }
}

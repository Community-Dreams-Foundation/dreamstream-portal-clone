
import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useSocket } from "@/hooks/use-socket"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface MeetingChatProps {
  meetingId: string;
}

export function MeetingChat({ meetingId }: MeetingChatProps) {
  const { currentUser } = useAuth()
  const { subscribeToMeeting, unsubscribeFromMeeting, sendMeetingChat, isConnected } = useSocket()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!currentUser) return
    
    // Subscribe to meeting updates
    subscribeToMeeting(meetingId)
    
    // Listen for chat messages
    const handleChatMessage = (event: CustomEvent<any>) => {
      const data = event.detail
      
      if (data.meetingId === meetingId) {
        setMessages(prev => [...prev, {
          id: `${data.userId}-${data.timestamp}`,
          userId: data.userId,
          userName: data.userName || "Unknown User",
          message: data.message,
          timestamp: data.timestamp
        }])
      }
    }
    
    window.addEventListener("meeting:chat", handleChatMessage as EventListener)
    
    // Cleanup
    return () => {
      unsubscribeFromMeeting(meetingId)
      window.removeEventListener("meeting:chat", handleChatMessage as EventListener)
    }
  }, [currentUser, meetingId, subscribeToMeeting, unsubscribeFromMeeting])
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return
    
    // Add optimistic message to the UI
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      userId: currentUser.uid,
      userName: currentUser.displayName || "You",
      message: newMessage,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, tempMessage])
    
    // Send message through socket
    sendMeetingChat(meetingId, newMessage)
    
    // Clear input
    setNewMessage("")
  }
  
  return (
    <div className="flex flex-col h-full border rounded-md">
      <div className="p-3 border-b">
        <h3 className="font-medium">Meeting Chat</h3>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id}
                className={`flex gap-2 ${message.userId === currentUser?.uid ? 'justify-end' : ''}`}
              >
                {message.userId !== currentUser?.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${message.userId}`} />
                    <AvatarFallback>{message.userName[0]}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.userId === currentUser?.uid 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'} rounded-lg p-3`}
                >
                  <div className="text-sm">
                    {message.userId !== currentUser?.uid && (
                      <span className="font-semibold">{message.userName}</span>
                    )}
                    <div>{message.message}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                
                {message.userId === currentUser?.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${message.userId}`} />
                    <AvatarFallback>{message.userName[0]}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || !isConnected}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

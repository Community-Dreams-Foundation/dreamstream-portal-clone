import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MessageSquare, Filter, Bell } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { getDatabase, ref, onValue, off } from "firebase/database"
import { Message, MessageFormat } from "@/types/communication"
import { fetchMessages, sendMessage } from "@/services/messageService"
import { FormatControls } from "./communication/FormatControls"
import { MessageThread } from "./communication/MessageThread"
import { GroupDiscussion } from "./communication/GroupDiscussion"

export function CommunicationFeed() {
  const [newMessage, setNewMessage] = useState("")
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [messageFormat, setMessageFormat] = useState<MessageFormat>({
    bold: false,
    italic: false,
    code: false,
    quote: false
  })
  
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const { addNotification } = useNotifications()
  const queryClient = useQueryClient()

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', undefined],
    queryFn: fetchMessages
  })

  useEffect(() => {
    const db = getDatabase()
    const messagesRef = ref(db, 'messages')

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const latestMessage = Object.values(snapshot.val()).pop() as any
        if (latestMessage && latestMessage.userId !== currentUser?.uid) {
          addNotification({
            title: "New Message",
            message: `${latestMessage.userName}: ${latestMessage.content}`,
            type: "support"
          })
        }
      }
      queryClient.invalidateQueries({ queryKey: ["messages"] })
    })

    return () => {
      off(messagesRef)
      unsubscribe()
    }
  }, [queryClient, currentUser, addNotification])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return

    try {
      await sendMessage({
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        content: newMessage,
        timestamp: new Date().toISOString(),
        isRead: false,
        format: messageFormat
      })

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      })
      
      setNewMessage("")
      setMessageFormat({
        bold: false,
        italic: false,
        code: false,
        quote: false
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again."
      })
    }
  }

  const toggleFormat = (type: keyof MessageFormat) => {
    setMessageFormat(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const filteredMessages = messages.filter(msg => 
    filter === "all" || (filter === "unread" && !msg.isRead)
  )

  const groupedMessages = filteredMessages.reduce((acc, message) => {
    if (message.threadId) {
      if (!acc[message.threadId]) {
        acc[message.threadId] = []
      }
      acc[message.threadId].push(message)
    } else {
      if (!acc.standalone) {
        acc.standalone = []
      }
      acc.standalone.push(message)
    }
    return acc
  }, {} as Record<string, Message[]>)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Internal Communication Feed</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
          >
            <Filter className="h-4 w-4" />
            {filter === "all" ? "Show Unread" : "Show All"}
          </Button>
          
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
            <Badge variant="secondary" className="ml-1">
              {messages.filter(m => !m.isRead).length}
            </Badge>
          </Button>
        </div>
      </div>

      <GroupDiscussion 
        groupId="general"
        groupName="General Discussion"
      />

      <div className="space-y-4 mt-4">
        <h4 className="text-sm font-medium">Other Threads</h4>
        {Object.entries(groupedMessages).map(([threadId, threadMessages]) => (
          <MessageThread 
            key={threadId} 
            threadId={threadId} 
            messages={threadMessages} 
          />
        ))}
      </div>

      <div className="space-y-2">
        <FormatControls 
          messageFormat={messageFormat} 
          onToggleFormat={toggleFormat} 
        />
        
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="resize-none"
          />
          <Button onClick={handleSendMessage} disabled={!currentUser}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

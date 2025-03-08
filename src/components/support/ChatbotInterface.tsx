

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Bot, Send } from "lucide-react"
import { getDatabase, ref, push, onValue } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const { currentUser } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!currentUser) return
    
    const db = getDatabase()
    const messagesRef = ref(db, `chats/${currentUser.uid}/messages`)

    // Listen for messages in real-time
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          content: data.content,
          sender: data.sender,
          timestamp: new Date(data.timestamp),
        }))
        setMessages(messagesData)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [currentUser])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentUser) return

    const db = getDatabase()
    const messagesRef = ref(db, `chats/${currentUser.uid}/messages`)

    try {
      const newMessage = {
        content: inputMessage,
        sender: 'user' as const,
        timestamp: Date.now(),
      }

      await push(messagesRef, newMessage)
      setInputMessage('')

      // Simulate bot response
      setTimeout(async () => {
        const botResponse = {
          content: "I'm processing your request. Would you like to speak with a live agent?",
          sender: 'bot' as const,
          timestamp: Date.now(),
        }
        await push(messagesRef, botResponse)
      }, 1000)

    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      })
    }
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="p-4 border-b flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">DreamStream Support</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8">
                  <Bot className="h-5 w-5" />
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}


import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Headphones, Send, Paperclip } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LiveAgentStatus } from "./LiveAgentStatus"

interface LiveMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentName?: string;
}

export function LiveAgentSupport() {
  const [messages, setMessages] = useState<LiveMessage[]>([
    {
      id: '1',
      content: "Hi, I'm Sarah. I'll be your support agent today. How can I help you?",
      sender: 'agent',
      timestamp: new Date(),
      agentName: 'Sarah',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isAgentTyping, setIsAgentTyping] = useState(false)

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage: LiveMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')

    // Simulate agent typing
    setIsAgentTyping(true)
    setTimeout(() => {
      setIsAgentTyping(false)
      const agentResponse: LiveMessage = {
        id: (Date.now() + 1).toString(),
        content: "I understand your concern. Let me look into this for you.",
        sender: 'agent',
        timestamp: new Date(),
        agentName: 'Sarah',
      }
      setMessages(prev => [...prev, agentResponse])
    }, 2000)
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Live Support</h3>
        </div>
        <LiveAgentStatus />
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
              {message.sender === 'agent' && (
                <Avatar className="h-8 w-8">
                  <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-sm font-semibold">
                    {message.agentName?.[0]}
                  </div>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.sender === 'agent' && (
                  <p className="text-xs font-medium mb-1">{message.agentName}</p>
                )}
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isAgentTyping && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-8 w-8">
                <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-sm font-semibold">
                  S
                </div>
              </Avatar>
              <span>Sarah is typing...</span>
            </div>
          )}
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
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <Button type="submit" size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}

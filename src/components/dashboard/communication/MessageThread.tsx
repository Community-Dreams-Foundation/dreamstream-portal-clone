
import { Card } from "@/components/ui/card"
import { ListChecks, Users } from "lucide-react"
import { Message } from "@/types/communication"
import { MessageContent } from "./MessageContent"
import { useState } from "react"
import { addReply } from "@/services/messageService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface MessageThreadProps {
  threadId: string;
  messages: Message[];
  groupName?: string;
}

export function MessageThread({ threadId, messages, groupName }: MessageThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleReply = async (messageId: string) => {
    if (!replyContent.trim()) return

    await addReply(messageId, {
      userId: "current-user", // This should come from auth
      userName: "Current User", // This should come from auth
      content: replyContent,
      timestamp: new Date().toISOString(),
      isRead: true
    })

    setReplyContent("")
    setReplyingTo(null)
  }

  return (
    <Card className="p-4">
      {threadId !== "standalone" && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Thread</span>
          </div>
          
          {groupName && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {groupName}
            </Badge>
          )}
        </div>
      )}
      
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              !message.isRead ? "bg-muted/50 p-2 rounded-lg" : ""
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              {message.userName[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {message.userName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <MessageContent 
                message={message} 
                onReply={() => setReplyingTo(message.id)}
              />
              
              {replyingTo === message.id && (
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    size="sm"
                    onClick={() => handleReply(message.id)}
                  >
                    Reply
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

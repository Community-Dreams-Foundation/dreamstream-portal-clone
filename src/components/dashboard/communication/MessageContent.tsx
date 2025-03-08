
import { Message } from "@/types/communication"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageCircle, Tag, AtSign } from "lucide-react"
import { toggleLike } from "@/services/messageService"
import { Badge } from "@/components/ui/badge"

interface MessageContentProps {
  message: Message;
  onReply?: () => void;
}

export function MessageContent({ message, onReply }: MessageContentProps) {
  const handleLike = async () => {
    if (message.id) {
      await toggleLike(message.id, message.likes || 0)
    }
  }

  const parseContent = (content: string) => {
    // Parse mentions (@username)
    const mentionRegex = /@(\w+)/g
    content = content.replace(mentionRegex, '<span class="text-blue-500">@$1</span>')

    // Parse tags (#tag)
    const tagRegex = /#(\w+)/g
    content = content.replace(tagRegex, '<span class="text-green-500">#$1</span>')

    return <div dangerouslySetInnerHTML={{ __html: content }} />
  }

  const content = () => {
    if (message.format?.code) {
      return (
        <pre className="bg-muted p-2 rounded-md font-mono text-sm overflow-x-auto">
          <code>{message.content}</code>
        </pre>
      )
    }

    if (message.format?.quote) {
      return (
        <blockquote className="border-l-4 border-primary/50 pl-4 italic">
          {parseContent(message.content)}
        </blockquote>
      )
    }

    return (
      <p className={`text-sm ${message.format?.bold ? 'font-bold' : ''} ${message.format?.italic ? 'italic' : ''}`}>
        {parseContent(message.content)}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {content()}
      
      {/* Tags */}
      {message.tags && message.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {message.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Mentions */}
      {message.mentionedUsers && message.mentionedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {message.mentionedUsers.map((user) => (
            <Badge key={user} variant="outline" className="flex items-center gap-1">
              <AtSign className="h-3 w-3" />
              {user}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex gap-2 mt-2">
          {message.attachments.map((attachment, index) => (
            <a 
              key={index}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              {attachment.name}
            </a>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary"
          onClick={handleLike}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          {message.likes || 0}
        </Button>
        
        {onReply && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
            onClick={onReply}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {message.replies?.length || 0}
          </Button>
        )}
      </div>

      {/* Replies */}
      {message.replies && message.replies.length > 0 && (
        <div className="ml-6 mt-2 space-y-2 border-l-2 border-muted pl-4">
          {message.replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              <span className="font-medium">{reply.userName}</span>
              <p className="mt-1">{parseContent(reply.content)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

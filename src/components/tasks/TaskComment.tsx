
import { useState, useEffect, useRef } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { 
  Edit, 
  Trash2, 
  Reply, 
  Check, 
  X, 
  Smile,
  ThumbsUp,
  Heart,
  Laugh,
  MessageCircle,
  Paperclip,
  FileText,
  Image,
  Download,
  ExternalLink
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  deleteComment, 
  addCommentReply, 
  editComment,
  addReactionToComment,
  removeReactionFromComment
} from "@/utils/tasks/commentOperations"
import { Markdown } from "./Markdown"
import { CommentAttachment } from "./TaskCommentSection"
import { uploadCommentAttachment } from "@/utils/tasks/attachmentOperations"

interface CommentWithReplies {
  id: string
  text: string
  userId: string
  timestamp: number
  userName?: string
  parentId?: string
  taskId: string
  lastEdited?: number
  replies?: CommentWithReplies[]
  mentions?: string[]
  reactions?: Record<string, string[]>
  attachments?: CommentAttachment[]
}

interface TaskCommentProps {
  id: string
  text: string
  userId: string
  timestamp: number
  userName?: string
  taskId: string
  onReplyToggle: (commentId: string) => void
  showReplyForm: boolean
  parentId?: string
  replies?: CommentWithReplies[]
  lastEdited?: number
  mentions?: string[]
  reactions?: Record<string, string[]>
  attachments?: CommentAttachment[]
}

const reactionEmojis = [
  { emoji: "👍", key: "thumbsup", icon: ThumbsUp },
  { emoji: "❤️", key: "heart", icon: Heart },
  { emoji: "😄", key: "laugh", icon: Laugh },
  { emoji: "🎉", key: "celebrate", icon: MessageCircle },
  { emoji: "🚀", key: "rocket", icon: MessageCircle },
  { emoji: "🔥", key: "fire", icon: MessageCircle },
]

export function TaskComment({
  id,
  text,
  userId,
  timestamp,
  userName = "User",
  taskId,
  onReplyToggle,
  showReplyForm,
  parentId,
  replies,
  lastEdited,
  mentions = [],
  reactions = {},
  attachments = [],
}: TaskCommentProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(text)
  const [replyText, setReplyText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyAttachments, setReplyAttachments] = useState<CommentAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isOwner = currentUser?.uid === userId

  const handleDelete = async () => {
    if (!currentUser?.uid) return

    try {
      await deleteComment(currentUser.uid, taskId, id)
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        variant: "destructive",
        title: "Error deleting comment",
        description: "There was an error deleting your comment. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReply = async () => {
    if (!currentUser?.uid || !replyText.trim()) return

    setIsSubmittingReply(true)
    try {
      // Upload any attachments first
      const finalAttachments = await Promise.all(
        replyAttachments.map(async (attachment) => {
          if (!attachment.url.startsWith('http')) {
            // This attachment hasn't been uploaded yet
            const uploadedAttachment = await uploadCommentAttachment(
              currentUser.uid, 
              taskId, 
              attachment
            )
            return uploadedAttachment
          }
          return attachment
        })
      )

      await addCommentReply(currentUser.uid, taskId, replyText, id, finalAttachments)
      setReplyText("")
      setReplyAttachments([])
      onReplyToggle(id) // Close the reply form
      toast({
        title: "Reply added",
        description: "Your reply has been added successfully",
      })
    } catch (error) {
      console.error("Error adding reply:", error)
      toast({
        variant: "destructive",
        title: "Error adding reply",
        description: "There was an error adding your reply. Please try again.",
      })
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleEdit = async () => {
    if (!currentUser?.uid || !editedText.trim()) return

    try {
      await editComment(currentUser.uid, taskId, id, editedText)
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error editing comment:", error)
      toast({
        variant: "destructive",
        title: "Error updating comment",
        description: "There was an error updating your comment. Please try again.",
      })
    }
  }

  const handleReaction = async (emoji: string) => {
    if (!currentUser?.uid) return
    
    try {
      const userReacted = reactions[emoji]?.includes(currentUser.uid)
      
      if (userReacted) {
        await removeReactionFromComment(currentUser.uid, taskId, id, emoji)
      } else {
        await addReactionToComment(currentUser.uid, taskId, id, emoji)
      }
      
      setShowEmojiPicker(false)
    } catch (error) {
      console.error("Error handling reaction:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error updating your reaction. Please try again.",
      })
    }
  }

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const files = Array.from(e.target.files)
    setIsUploading(true)
    
    const newAttachments: CommentAttachment[] = []
    
    files.forEach(file => {
      // Create a temporary URL for preview
      const temporaryUrl = URL.createObjectURL(file)
      
      const newAttachment: CommentAttachment = {
        id: `temp-${Date.now()}-${file.name}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url: temporaryUrl,
        uploadedAt: Date.now(),
      }
      
      newAttachments.push(newAttachment)
    })
    
    setReplyAttachments(prev => [...prev, ...newAttachments])
    setIsUploading(false)
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (attachmentId: string) => {
    setReplyAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId))
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const getFileSizeString = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Function to render text with highlighted mentions
  const renderTextWithMentions = (text: string) => {
    return <Markdown>{text}</Markdown>
  }

  return (
    <div className="space-y-3">
      <Card className={`p-4 transition ${parentId ? "ml-6" : ""}`}>
        <div className="flex justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://avatar.vercel.sh/${userId}`} alt={userName} />
              <AvatarFallback>{userName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-sm">{userName}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {formatDistanceToNow(timestamp, { addSuffix: true })}
                {lastEdited && (
                  <> · Edited {formatDistanceToNow(lastEdited, { addSuffix: true })}</>
                )}
              </span>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex items-center gap-1">
              {!isEditing && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive" 
                    onClick={() => setIsDeleting(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
              
              {isEditing && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-green-500" 
                    onClick={handleEdit}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive" 
                    onClick={() => {
                      setIsEditing(false)
                      setEditedText(text)
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="mb-2"
          />
        ) : (
          <div className="text-sm whitespace-pre-wrap">
            {renderTextWithMentions(text)}
          </div>
        )}
        
        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              Attachments
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {attachments.map((file) => (
                <a 
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 border rounded-md text-xs group hover:bg-muted/50"
                >
                  {getFileIcon(file.fileType)}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate">{file.fileName}</p>
                    <p className="text-muted-foreground">{getFileSizeString(file.fileSize)}</p>
                  </div>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Reactions display */}
        {!isEditing && Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(reactions).map(([emoji, users]) => (
              <Button
                key={emoji}
                variant="outline"
                size="sm"
                className={`h-6 px-2 text-xs ${
                  currentUser && users.includes(currentUser.uid) 
                    ? "bg-gray-200 dark:bg-gray-700" 
                    : ""
                }`}
                onClick={() => handleReaction(emoji)}
              >
                {emoji} {users.length}
              </Button>
            ))}
          </div>
        )}
        
        {!isEditing && currentUser && (
          <div className="mt-2 flex justify-end gap-1">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs" 
                >
                  <Smile className="h-3 w-3 mr-1" />
                  React
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1">
                <div className="flex gap-1">
                  {reactionEmojis.map(({emoji, key}) => (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      className="text-lg p-1 h-8 w-8"
                      onClick={() => handleReaction(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {!parentId && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs" 
                onClick={() => onReplyToggle(id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>
        )}
      </Card>

      {showReplyForm && !parentId && (
        <div className="ml-6 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-[80px]"
          />
          
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-3.5 w-3.5 mr-1" />
              Attach File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={handleAttachmentUpload}
            />
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setReplyText("")
                  setReplyAttachments([])
                  onReplyToggle(id)
                }}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleReply}
                disabled={!replyText.trim() || isSubmittingReply}
              >
                {isSubmittingReply ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          </div>
          
          {replyAttachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Attachments</h4>
              <div className="grid grid-cols-2 gap-2">
                {replyAttachments.map((attachment) => (
                  <div 
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 border rounded-md text-sm"
                  >
                    {getFileIcon(attachment.fileType)}
                    <span className="truncate flex-1">{attachment.fileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {replies && replies.length > 0 && (
        <div className="space-y-3 mt-3">
          {replies.map((reply) => (
            <TaskComment
              key={reply.id}
              id={reply.id}
              text={reply.text}
              userId={reply.userId}
              timestamp={reply.timestamp}
              userName={reply.userName}
              taskId={taskId}
              onReplyToggle={() => {}}
              showReplyForm={false}
              parentId={id}
              lastEdited={reply.lastEdited}
              mentions={reply.mentions}
              reactions={reply.reactions}
              attachments={reply.attachments}
            />
          ))}
        </div>
      )}

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your comment and any replies.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

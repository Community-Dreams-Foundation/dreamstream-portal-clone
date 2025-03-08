
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskComment } from "./TaskComment"
import { TaskActivity } from "./TaskActivity"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/NotificationContext"
import { Task } from "@/types/task"
import { addComment, fetchComments } from "@/utils/tasks/commentOperations"
import { fetchUsers, UserSummary } from "@/utils/userOperations"
import { Input } from "@/components/ui/input"
import { Search, Paperclip, Type, Bold, Italic, Code, FileText, Image } from "lucide-react"
import { Markdown } from "./Markdown"
import { uploadCommentAttachment } from "@/utils/tasks/attachmentOperations"

interface TaskCommentSectionProps {
  task: Task
}

interface CommentWithReplies {
  id: string
  text: string
  userId: string
  timestamp: number
  userName?: string
  parentId?: string
  taskId: string
  replies?: CommentWithReplies[]
  mentions?: string[]
  reactions?: Record<string, string[]>
  lastEdited?: number
  attachments?: CommentAttachment[]
}

export interface CommentAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  uploadedAt: number
}

export function TaskCommentSection({ task }: TaskCommentSectionProps) {
  const { currentUser } = useAuth()
  const { addNotification } = useNotifications()
  const { toast } = useToast()
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<UserSummary[]>([])
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [mentionSearchPosition, setMentionSearchPosition] = useState({ top: 0, left: 0 })
  const [isUploading, setIsUploading] = useState(false)
  const [attachments, setAttachments] = useState<CommentAttachment[]>([])
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false)
  const [commentFilter, setCommentFilter] = useState("all")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!currentUser?.uid) return

    const loadComments = async () => {
      setIsLoading(true)
      try {
        const fetchedComments = await fetchComments(currentUser.uid, task.id)
        
        // Organize comments into a tree structure
        const commentMap = new Map<string, CommentWithReplies>()
        const rootComments: CommentWithReplies[] = []
        
        // First pass: Create all comment objects
        fetchedComments.forEach(comment => {
          commentMap.set(comment.id, { ...comment, taskId: task.id, replies: [] })
        })
        
        // Second pass: Organize into parent/child relationships
        fetchedComments.forEach(comment => {
          if (comment.parentId) {
            const parent = commentMap.get(comment.parentId)
            if (parent && parent.replies) {
              parent.replies.push(commentMap.get(comment.id)!)
            }
          } else {
            rootComments.push(commentMap.get(comment.id)!)
          }
        })
        
        // Sort comments by timestamp (newest first)
        const sortByTimestamp = (a: CommentWithReplies, b: CommentWithReplies) => 
          b.timestamp - a.timestamp
          
        rootComments.sort(sortByTimestamp)
        rootComments.forEach(comment => {
          if (comment.replies) {
            comment.replies.sort(sortByTimestamp)
          }
        })
        
        setComments(rootComments)
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          variant: "destructive",
          title: "Error fetching comments",
          description: "There was an error loading comments. Please try again."
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadComments()
  }, [currentUser?.uid, task.id, toast])

  useEffect(() => {
    // Load users for mentions
    const loadUsers = async () => {
      if (!currentUser?.uid) return
      
      try {
        const fetchedUsers = await fetchUsers()
        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }
    
    loadUsers()
  }, [currentUser])

  const handleAddComment = async () => {
    if (!currentUser?.uid || !commentText.trim()) return

    try {
      // Upload any attachments first
      const finalAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          if (!attachment.url.startsWith('http')) {
            // This attachment hasn't been uploaded yet
            const uploadedAttachment = await uploadCommentAttachment(
              currentUser.uid, 
              task.id, 
              attachment
            )
            return uploadedAttachment
          }
          return attachment
        })
      )

      await addComment(currentUser.uid, task.id, commentText, finalAttachments)
      setCommentText("")
      setAttachments([])
      
      // Refresh comments
      const fetchedComments = await fetchComments(currentUser.uid, task.id)
      
      // Similar organization logic as in useEffect
      const commentMap = new Map<string, CommentWithReplies>()
      const rootComments: CommentWithReplies[] = []
      
      fetchedComments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, taskId: task.id, replies: [] })
      })
      
      fetchedComments.forEach(comment => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId)
          if (parent && parent.replies) {
            parent.replies.push(commentMap.get(comment.id)!)
          }
        } else {
          rootComments.push(commentMap.get(comment.id)!)
        }
      })
      
      rootComments.sort((a, b) => b.timestamp - a.timestamp)
      rootComments.forEach(comment => {
        if (comment.replies) {
          comment.replies.sort((a, b) => b.timestamp - a.timestamp)
        }
      })
      
      setComments(rootComments)
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully"
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        variant: "destructive", 
        title: "Error adding comment",
        description: "There was an error adding your comment. Please try again."
      })
    }
  }

  const toggleReplyForm = (commentId: string) => {
    setActiveReplyId(activeReplyId === commentId ? null : commentId)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setCommentText(text)
    
    // Check if the last character is '@' to start mention search
    const lastAtPosition = text.lastIndexOf('@')
    if (lastAtPosition !== -1 && (lastAtPosition === 0 || text[lastAtPosition - 1] === ' ')) {
      // Extract search term after '@'
      const searchText = text.substring(lastAtPosition + 1).split(' ')[0]
      setSearchTerm(searchText)
      
      // Position the user search dropdown
      if (textareaRef.current) {
        const cursorPosition = textareaRef.current.selectionStart
        const textBeforeCursor = text.substring(0, cursorPosition)
        const lines = textBeforeCursor.split('\n')
        const currentLine = lines.length
        const lineLength = lines[lines.length - 1].length
        
        // Calculate position based on cursor location
        // These values are approximate and may need adjustment
        const lineHeight = 20 // approx line height in pixels
        const charWidth = 8 // approx character width in pixels
        
        setMentionSearchPosition({
          top: (currentLine * lineHeight) + 20, // add some offset
          left: (lineLength * charWidth) - (searchText.length * charWidth)
        })
      }
      
      setShowUserSearch(true)
    } else {
      setShowUserSearch(false)
    }
  }

  const insertMention = (user: UserSummary) => {
    if (!textareaRef.current) return
    
    const text = commentText
    const lastAtPosition = text.lastIndexOf('@')
    
    if (lastAtPosition !== -1) {
      // Replace the @searchterm with @[username](userId)
      const before = text.substring(0, lastAtPosition)
      const after = text.substring(lastAtPosition + searchTerm.length + 1)
      
      const newText = before + `@[${user.name}](${user.id})` + " " + after
      setCommentText(newText)
      
      // Focus back on textarea after insertion
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 0)
    }
    
    setShowUserSearch(false)
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
    
    setAttachments(prev => [...prev, ...newAttachments])
    setIsUploading(false)
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId))
  }

  const handleMarkdownButtonClick = (markdownSymbol: string) => {
    if (!textareaRef.current) return
    
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const text = commentText
    
    let newText
    if (start === end) {
      // No selection, just insert the symbol
      newText = text.substring(0, start) + markdownSymbol + markdownSymbol + text.substring(end)
      setCommentText(newText)
      
      // Position cursor between the symbols
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + markdownSymbol.length
          textareaRef.current.selectionEnd = start + markdownSymbol.length
          textareaRef.current.focus()
        }
      }, 0)
    } else {
      // Text is selected, wrap it with the symbol
      newText = text.substring(0, start) + markdownSymbol + text.substring(start, end) + markdownSymbol + text.substring(end)
      setCommentText(newText)
      
      // Focus back on textarea after insertion
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + markdownSymbol.length
          textareaRef.current.selectionEnd = end + markdownSymbol.length
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter comments based on search or filter
  const filteredComments = comments.filter(comment => {
    const matchesSearch = searchTerm === "" || 
      comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comment.userName && comment.userName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    if (commentFilter === "mentions" && currentUser) {
      return matchesSearch && (comment.mentions || []).includes(currentUser.uid);
    } else if (commentFilter === "attachments") {
      return matchesSearch && comment.attachments && comment.attachments.length > 0;
    }
    
    return matchesSearch;
  });

  return (
    <Tabs defaultValue="comments" className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      
      <TabsContent value="comments" className="space-y-4 mt-4">
        <div className="space-y-3 relative">
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search comments..."
                className="w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background"
              value={commentFilter}
              onChange={(e) => setCommentFilter(e.target.value)}
            >
              <option value="all">All Comments</option>
              {currentUser && <option value="mentions">Mentions Me</option>}
              <option value="attachments">With Attachments</option>
            </select>
          </div>
          
          <div className="relative">
            <Textarea 
              ref={textareaRef}
              placeholder="Add a comment... Use @ to mention someone or markdown for formatting"
              value={commentText}
              onChange={handleTextareaChange}
              className="min-h-[100px]"
            />
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleMarkdownButtonClick('**')}
              >
                <Bold className="h-3.5 w-3.5 mr-1" />
                Bold
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleMarkdownButtonClick('_')}
              >
                <Italic className="h-3.5 w-3.5 mr-1" />
                Italic
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleMarkdownButtonClick('`')}
              >
                <Code className="h-3.5 w-3.5 mr-1" />
                Code
              </Button>
              <Popover open={showMarkdownHelp} onOpenChange={setShowMarkdownHelp}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Markdown Help
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Markdown Cheatsheet</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>**Bold**</strong> or <strong>__Bold__</strong></p>
                      <p><em>*Italic*</em> or <em>_Italic_</em></p>
                      <p><code>`Code`</code></p>
                      <p>```<br/>Code block<br/>```</p>
                      <p># Heading 1</p>
                      <p>## Heading 2</p>
                      <p>[Link](url)</p>
                      <p>![Image](url)</p>
                      <p>* List item</p>
                      <p>1. Numbered item</p>
                      <p>&gt; Blockquote</p>
                      <p>--- Horizontal rule</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
            </div>
            
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Attachments</h4>
                <div className="grid grid-cols-2 gap-2">
                  {attachments.map((attachment) => (
                    <div 
                      key={attachment.id}
                      className="flex items-center gap-2 p-2 border rounded-md text-sm"
                    >
                      {attachment.fileType.startsWith('image/') ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
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
            
            {showUserSearch && filteredUsers.length > 0 && (
              <div 
                className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10 w-64"
                style={{ 
                  top: `${mentionSearchPosition.top}px`, 
                  left: `${mentionSearchPosition.left}px` 
                }}
              >
                <ScrollArea className="h-[200px]">
                  <div className="p-2">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                        onClick={() => insertMention(user)}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAddComment}
              disabled={!commentText.trim() || !currentUser?.uid || isUploading}
            >
              {isUploading ? "Uploading..." : "Add Comment"}
            </Button>
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          {isLoading ? (
            <div className="text-center py-4">Loading comments...</div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchTerm ? "No comments match your search" : "No comments yet. Be the first to comment!"}
            </div>
          ) : (
            filteredComments.map(comment => (
              <TaskComment 
                key={comment.id}
                id={comment.id}
                text={comment.text}
                userId={comment.userId}
                timestamp={comment.timestamp}
                userName={comment.userName}
                taskId={task.id}
                onReplyToggle={toggleReplyForm}
                showReplyForm={activeReplyId === comment.id}
                replies={comment.replies}
                mentions={comment.mentions}
                reactions={comment.reactions}
                lastEdited={comment.lastEdited}
                attachments={comment.attachments}
              />
            ))
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="activity" className="mt-4">
        <TaskActivity activities={task.activities || []} />
      </TabsContent>
    </Tabs>
  )
}

// Import the necessary components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

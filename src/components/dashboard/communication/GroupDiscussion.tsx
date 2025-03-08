
import { useState } from "react"
import { MessageSquare, Users, AtSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageThread } from "./MessageThread"
import { Message } from "@/types/communication"
import { useToast } from "@/hooks/use-toast"

interface GroupDiscussionProps {
  groupId?: string;
  groupName?: string;
}

export function GroupDiscussion({ groupId, groupName }: GroupDiscussionProps) {
  const [message, setMessage] = useState("")
  const [mentionOpen, setMentionOpen] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const { toast } = useToast()

  // Simulated members data - replace with actual data from your backend
  const members = [
    { id: "1", name: "John Doe", role: "member" },
    { id: "2", name: "Jane Smith", role: "moderator" },
    { id: "3", name: "Mike Johnson", role: "member" },
  ]

  // Simulated messages data - replace with actual data from your backend
  const messages: Message[] = [
    {
      id: "1",
      userId: "1",
      userName: "John Doe",
      content: "Hey @Jane, what do you think about the new feature?",
      timestamp: new Date().toISOString(),
      isRead: true,
      mentionedUsers: ["2"],
    },
    {
      id: "2",
      userId: "2",
      userName: "Jane Smith",
      content: "I think it looks great! Let's discuss it in our next meeting.",
      timestamp: new Date().toISOString(),
      isRead: true,
    },
  ]

  const handleMention = (memberId: string, memberName: string) => {
    const beforeMention = message.slice(0, cursorPosition).replace(/@\w*$/, "")
    const afterMention = message.slice(cursorPosition)
    setMessage(beforeMention + `@${memberName} ` + afterMention)
    setMentionOpen(false)
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)
    setCursorPosition(e.target.selectionStart || 0)

    // Open mention popover when @ is typed
    if (value.slice(-1) === "@") {
      setMentionOpen(true)
    }
  }

  const handleSendMessage = () => {
    if (!message.trim()) return

    toast({
      title: "Message sent",
      description: "Your message has been sent to the group.",
    })
    setMessage("")
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">
            {groupName || "Group Discussion"}
          </h3>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {messages.length} messages
        </Badge>
      </div>

      <ScrollArea className="h-[400px] mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageThread
              key={message.id}
              threadId="standalone"
              messages={[message]}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="relative">
        <Textarea
          value={message}
          onChange={handleMessageChange}
          placeholder="Type your message here... Use @ to mention someone"
          className="min-h-[100px] resize-none"
        />

        <Popover open={mentionOpen} onOpenChange={setMentionOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
            >
              <AtSign className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="end">
            <Command>
              <CommandInput placeholder="Search members..." />
              <CommandEmpty>No members found.</CommandEmpty>
              <CommandGroup>
                {members.map((member) => (
                  <CommandItem
                    key={member.id}
                    onSelect={() => handleMention(member.id, member.name)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      {member.name[0]}
                    </div>
                    <span>{member.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {member.role}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="mt-2 flex justify-end">
          <Button onClick={handleSendMessage}>
            Send Message
          </Button>
        </div>
      </div>
    </Card>
  )
}


import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Paperclip, Image, Mic, User } from "lucide-react";
import type { ConversationThread, ThreadMessage } from "@/types/conversation";

interface ConversationContentProps {
  activeThread: ConversationThread | undefined;
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  setIsCreatingThread: (isCreating: boolean) => void;
}

export function ConversationContent({
  activeThread,
  newMessage,
  setNewMessage,
  sendMessage,
  setIsCreatingThread,
}: ConversationContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    
    // Focus input when thread changes
    if (inputRef.current && activeThread) {
      inputRef.current.focus();
    }
  }, [activeThread, activeThread?.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fixed: Direct assignment instead of callback function
    setNewMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        sendMessage();
      }
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Simulate voice recording
    setTimeout(() => {
      setIsRecording(false);
      setNewMessage("This is a simulated voice transcription.");
    }, 2000);
  };

  const handleAttachFile = () => {
    setIsAttaching(true);
    // Simulate file selection
    setTimeout(() => {
      setIsAttaching(false);
      // In a real implementation, this would open a file picker
    }, 500);
  };

  if (!activeThread) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] p-6">
        <Bot className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Conversation Selected</h3>
        <p className="text-muted-foreground text-center mb-4">
          Select an existing conversation or start a new one
        </p>
        <Button onClick={() => setIsCreatingThread(true)}>
          Start New Conversation
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="border-b p-3">
        <h3 className="font-medium">{activeThread.title}</h3>
        <p className="text-xs text-muted-foreground">
          Started {new Date(activeThread.createdAt).toLocaleDateString()}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {activeThread.messages?.map((message: ThreadMessage) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.attachments?.map((attachment, index) => (
                  <div
                    key={index}
                    className="mt-2 p-2 bg-background/50 rounded text-xs"
                  >
                    {attachment.type === "image" ? (
                      <div className="flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        <span>{attachment.name || "Image"}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        <span>{attachment.name || "Attachment"}</span>
                      </div>
                    )}
                  </div>
                ))}
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newMessage.trim()) {
              sendMessage();
            }
          }}
          className="flex items-center gap-2"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${
              isRecording ? "text-red-500 animate-pulse" : ""
            }`}
            onClick={startVoiceRecording}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleAttachFile}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

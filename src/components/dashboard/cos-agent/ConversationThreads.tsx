
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, PlusCircle, Search, ClipboardList, Layers } from "lucide-react";
import { ConversationThread } from "@/types/conversation";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/task";

interface ConversationThreadsProps {
  threads: ConversationThread[];
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  isCreatingThread: boolean;
  setIsCreatingThread: (creating: boolean) => void;
  newThreadTitle: string;
  setNewThreadTitle: (title: string) => void;
  createNewThread: (title: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tasks?: Task[];
}

export function ConversationThreads({
  threads,
  activeThreadId,
  setActiveThreadId,
  isCreatingThread,
  setIsCreatingThread,
  newThreadTitle,
  setNewThreadTitle,
  createNewThread,
  searchQuery,
  setSearchQuery,
  tasks = []
}: ConversationThreadsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [showTaskCreate, setShowTaskCreate] = useState(false);

  const filteredThreads = threads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const taskRelatedThreads = threads.filter(thread => 
    thread.category === "task" || thread.title.toLowerCase().includes("task")
  );

  const recentThreads = [...threads].sort((a, b) => b.lastMessageAt - a.lastMessageAt).slice(0, 5);

  const getDisplayThreads = () => {
    switch (activeTab) {
      case "recent":
        return recentThreads;
      case "tasks":
        return taskRelatedThreads;
      case "archived":
        return threads.filter(thread => thread.category === "archived");
      default:
        return filteredThreads;
    }
  };

  const displayThreads = getDisplayThreads();

  const createTaskThread = (taskId: string, title: string) => {
    const taskTitle = `Task: ${title}`;
    createNewThread(taskTitle);
    setShowTaskCreate(false);
  };

  return (
    <div className="h-[600px] flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">Conversation Threads</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsCreatingThread(true)}
          className="h-8 w-8 p-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">New Thread</span>
        </Button>
      </div>
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {isCreatingThread ? (
          <div className="p-4">
            <div className="space-y-2">
              <Input
                placeholder="Thread title..."
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => createNewThread(newThreadTitle)}
                  disabled={!newThreadTitle.trim()}
                >
                  Create
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsCreatingThread(false);
                    setNewThreadTitle("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : showTaskCreate ? (
          <div className="p-4">
            <h4 className="text-sm font-medium mb-2">Select a task to discuss</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks available</p>
              ) : (
                tasks.map(task => (
                  <Button
                    key={task.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => createTaskThread(task.id, task.title)}
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    <span className="truncate">{task.title}</span>
                  </Button>
                ))
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => setShowTaskCreate(false)}
            >
              Cancel
            </Button>
          </div>
        ) : displayThreads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversation threads found
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {displayThreads.map(thread => (
              <Button
                key={thread.id}
                variant={thread.id === activeThreadId ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveThreadId(thread.id)}
              >
                <div className="flex items-center w-full overflow-hidden">
                  <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{thread.title}</span>
                  {thread.category === "task" && (
                    <Badge variant="outline" className="ml-1 text-primary">
                      <Layers className="h-3 w-3 mr-1" />
                      Task
                    </Badge>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                    {new Date(thread.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
        {!isCreatingThread && !showTaskCreate && (
          <div className="mt-2 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setIsCreatingThread(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Thread
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowTaskCreate(true)}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Task Thread
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, RecurringTaskConfig, TaskRecurrencePattern } from "@/types/task";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecurringTaskConfig as RecurringTaskConfigComponent } from "@/components/tasks/RecurringTaskConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ManualTaskFormProps {
  onTaskCreated: (task: Partial<Task>) => void;
  onClose: () => void;
}

const ManualTaskForm = ({ onTaskCreated, onClose }: ManualTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [tags, setTags] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const [recurringConfig, setRecurringConfig] = useState<RecurringTaskConfig>({
    isRecurring: false,
    pattern: "daily",
    interval: 1,
    daysOfWeek: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        variant: "destructive",
        title: "Title Required",
        description: "Please enter a task title"
      });
      return;
    }

    const newTask: Partial<Task> = {
      title,
      description,
      estimatedDuration,
      priority,
      status: "todo",
      actualDuration: 0,
      dueDate: dueDate ? dueDate.getTime() : undefined,
      tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
    };

    if (recurringConfig.isRecurring) {
      newTask.recurringConfig = recurringConfig;
    }

    onTaskCreated(newTask);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEstimatedDuration(60);
    setPriority("medium");
    setDueDate(undefined);
    setTags("");
    setRecurringConfig({
      isRecurring: false,
      pattern: "daily",
      interval: 1,
      daysOfWeek: [],
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="recurring" className="flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Recurring Options
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={180}
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(parseInt(e.target.value, 10))}
              />
              <p className="text-xs text-muted-foreground">Maximum 3 hours (180 minutes)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="due-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="development, bug, frontend"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="recurring" className="space-y-4">
          <RecurringTaskConfigComponent 
            config={recurringConfig}
            onChange={setRecurringConfig}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">Create Task</Button>
      </div>
    </form>
  );
};

export default ManualTaskForm;

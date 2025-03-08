
import { useState } from "react";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle, CalendarClock, History, Tag } from "lucide-react";
import { format } from "date-fns";
import { TaskHistoryDialog } from "./TaskHistoryDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onTimerToggle: (taskId: string) => void;
  formatDuration: (milliseconds: number) => string;
  canStartTask?: (taskId: string) => Promise<boolean>;
  onEdit?: (task: Task) => void;
  onTaskUpdated?: () => void;
  isSelected?: boolean;
  onSelectionToggle?: (task: Task, selected: boolean) => void;
}

export function TaskCard({
  task,
  onDragStart,
  onTimerToggle,
  formatDuration,
  canStartTask,
  onEdit,
  onTaskUpdated,
  isSelected = false,
  onSelectionToggle
}: TaskCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const { id, title, status, priority, tags, dueDate, isTimerRunning, totalElapsedTime, dependencies, activities } = task;
  const isMobile = useIsMobile();
  
  // Calculate if task is overdue
  const isOverdue = dueDate && dueDate < Date.now() && status !== "completed";
  
  // Define priority colors
  const priorityColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };
  
  const handleTaskClick = () => {
    if (onEdit) {
      onEdit(task);
    }
  };
  
  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectionToggle) {
      onSelectionToggle(task, !isSelected);
    }
  };

  return (
    <>
      <Card 
        draggable
        onDragStart={(e) => onDragStart(e, id)}
        className={`cursor-grab relative mb-3 hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}
        onClick={handleTaskClick}
      >
        {onSelectionToggle && (
          <div 
            className="absolute top-2 left-2 h-4 w-4 border rounded cursor-pointer z-10"
            onClick={handleSelectionToggle}
          >
            {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
          </div>
        )}
        
        <CardContent className={`p-3 ${onSelectionToggle ? 'pl-8' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-medium text-sm truncate ${isMobile ? 'max-w-[60%]' : 'max-w-[70%]'}`}>
              {title}
            </h3>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {isTimerRunning && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <Clock className="h-3 w-3 mr-1 animate-pulse" />
                  {!isMobile && "Active"}
                </Badge>
              )}
              {priority && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${priorityColors[priority]} ${isMobile ? 'px-1.5' : ''}`}
                >
                  {priority}
                </Badge>
              )}
            </div>
          </div>
          
          {isOverdue && (
            <div className="flex items-center text-xs text-red-600 my-1">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              <span>Overdue</span>
            </div>
          )}
          
          {dueDate && (
            <div className="flex items-center text-xs text-gray-500 my-1">
              <CalendarClock className="h-3.5 w-3.5 mr-1" />
              <span>{format(new Date(dueDate), isMobile ? "MMM d" : "MMM d, yyyy")}</span>
            </div>
          )}
          
          {tags && tags.length > 0 && (
            <div className="flex items-center mt-2 flex-wrap gap-1">
              {tags.slice(0, isMobile ? 1 : 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > (isMobile ? 1 : 2) && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - (isMobile ? 1 : 2)}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="px-3 py-2 border-t bg-muted/20 flex justify-between">
          <div className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {formatDuration(totalElapsedTime || 0)}
          </div>
          
          <div className="flex items-center space-x-1">
            {activities && activities.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHistory(true);
                }}
              >
                <History className="h-3.5 w-3.5" />
              </Button>
            )}
            
            <Button
              variant={isTimerRunning ? "destructive" : "default"}
              size="sm"
              className={`text-xs ${isMobile ? 'px-1.5 py-0 h-6' : 'px-2 py-0 h-7'}`}
              onClick={(e) => {
                e.stopPropagation();
                onTimerToggle(id);
              }}
            >
              {isTimerRunning ? "Stop" : "Start"}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {showHistory && (
        <TaskHistoryDialog
          open={showHistory}
          onOpenChange={setShowHistory}
          activities={activities || []}
          taskTitle={title}
        />
      )}
    </>
  );
}

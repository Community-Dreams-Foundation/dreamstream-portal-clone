
import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { TaskDetailDialog } from "@/components/tasks/TaskDetailDialog";

interface TaskPrioritizationMatrixProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
}

export function TaskPrioritizationMatrix({ tasks, onTaskUpdated }: TaskPrioritizationMatrixProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const isMobile = useIsMobile();
  
  // Filter tasks that are not completed
  const activeTasks = tasks.filter(task => task.status !== "completed");
  
  // Categorize tasks based on importance and urgency
  const categorizedTasks = {
    urgentImportant: activeTasks.filter(
      task => task.priority === "high" && (task.dueDate && task.dueDate < Date.now() + 86400000)
    ),
    urgentNotImportant: activeTasks.filter(
      task => task.priority !== "high" && (task.dueDate && task.dueDate < Date.now() + 86400000)
    ),
    notUrgentImportant: activeTasks.filter(
      task => task.priority === "high" && (!task.dueDate || task.dueDate >= Date.now() + 86400000)
    ),
    notUrgentNotImportant: activeTasks.filter(
      task => task.priority !== "high" && (!task.dueDate || task.dueDate >= Date.now() + 86400000)
    )
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };
  
  const getQuadrantStyle = (quadrant: string) => {
    switch(quadrant) {
      case "urgentImportant":
        return "bg-red-50 border-red-200";
      case "urgentNotImportant":
        return "bg-yellow-50 border-yellow-200";
      case "notUrgentImportant":
        return "bg-blue-50 border-blue-200";
      case "notUrgentNotImportant":
        return "bg-green-50 border-green-200";
      default:
        return "";
    }
  };
  
  const getQuadrantTitle = (quadrant: string) => {
    switch(quadrant) {
      case "urgentImportant":
        return "Urgent & Important";
      case "urgentNotImportant":
        return "Urgent, Not Important";
      case "notUrgentImportant":
        return "Important, Not Urgent";
      case "notUrgentNotImportant":
        return "Not Urgent, Not Important";
      default:
        return "";
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            Prioritization Matrix
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-2">
          <div className={`grid ${isMobile ? 'grid-rows-4 gap-3' : 'grid-cols-2 grid-rows-2 gap-4'}`}>
            {Object.entries(categorizedTasks).map(([quadrant, quadrantTasks]) => (
              <div 
                key={quadrant}
                className={`p-3 rounded-md border ${getQuadrantStyle(quadrant)} ${isMobile ? 'min-h-[100px]' : 'min-h-[150px]'}`}
              >
                <h3 className="font-medium text-sm mb-2">{getQuadrantTitle(quadrant)}</h3>
                
                <div className={`space-y-2 max-h-[${isMobile ? '150px' : '250px'}] overflow-y-auto`}>
                  {quadrantTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No tasks</p>
                  ) : (
                    quadrantTasks.map(task => (
                      <div 
                        key={task.id}
                        className="bg-white p-2 rounded border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-medium truncate max-w-[180px]">{task.title}</h4>
                          {task.priority && (
                            <Badge variant="outline" className="text-[10px]">
                              {task.priority}
                            </Badge>
                          )}
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center text-[10px] text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {format(new Date(task.dueDate), "MMM d")}
                              {task.dueDate < Date.now() && (
                                <span className="text-red-500 ml-1 flex items-center">
                                  <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                                  Overdue
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
      
      {selectedTask && (
        <TaskDetailDialog
          open={showTaskDetail}
          onOpenChange={setShowTaskDetail}
          task={selectedTask}
          onTaskUpdated={onTaskUpdated}
        />
      )}
    </Card>
  );
}

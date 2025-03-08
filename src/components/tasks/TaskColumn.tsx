
import { useState, useCallback } from "react";
import { Task, TaskStatus } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TaskCard } from "./TaskCard";
import { TaskDetailDialog } from "./TaskDetailDialog";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onTimerToggle: (taskId: string) => void;
  formatDuration: (milliseconds: number) => string;
  canStartTask?: (taskId: string) => Promise<boolean>;
  onTaskUpdated: () => void;
  selectedTasks?: string[];
  onTaskSelect?: (task: Task, selected: boolean) => void;
}

export function TaskColumn({
  title,
  status,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onTimerToggle,
  formatDuration,
  canStartTask,
  onTaskUpdated,
  selectedTasks = [],
  onTaskSelect
}: TaskColumnProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const tasksInColumn = tasks.filter(task => task.status === status);
  
  const handleTaskSelected = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);
  
  const handleTaskUpdated = useCallback(() => {
    setSelectedTask(null);
    onTaskUpdated();
  }, [onTaskUpdated]);

  return (
    <Card className="h-[70vh] flex flex-col">
      <CardHeader className="px-3 py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            {title}
            <Badge variant="secondary" className="ml-2">
              {tasksInColumn.length}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent 
        className="flex-1 overflow-y-auto p-3"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, status)}
      >
        {tasksInColumn.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed rounded-md">
            <p className="text-sm text-muted-foreground">Drag tasks here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasksInColumn.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={onDragStart}
                onTimerToggle={onTimerToggle}
                formatDuration={formatDuration}
                canStartTask={canStartTask}
                onEdit={handleTaskSelected}
                onTaskUpdated={onTaskUpdated}
                isSelected={selectedTasks.includes(task.id)}
                onSelectionToggle={onTaskSelect}
              />
            ))}
          </div>
        )}
      </CardContent>
      
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </Card>
  );
}

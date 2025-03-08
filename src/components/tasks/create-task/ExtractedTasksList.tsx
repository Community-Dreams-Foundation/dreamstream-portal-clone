
import React from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { toast } from "@/components/ui/use-toast";

interface ExtractedTasksListProps {
  tasks: Partial<Task>[];
  onTaskCreated: (task: Partial<Task>) => void;
}

const ExtractedTasksList = ({ tasks, onTaskCreated }: ExtractedTasksListProps) => {
  const handleCreateExtractedTask = (task: Partial<Task>) => {
    onTaskCreated(task);
    
    toast({
      title: "Task Created",
      description: `Added "${task.title}" to your tasks`
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Extracted Tasks</h3>
      <div className="border rounded-md divide-y">
        {tasks.map((task, index) => (
          <div key={index} className="p-3 flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium">{task.title}</h4>
              <p className="text-xs text-muted-foreground">
                {task.estimatedDuration} minutes • {task.priority} priority
              </p>
            </div>
            <Button 
              size="sm"
              onClick={() => handleCreateExtractedTask(task)}
            >
              Add Task
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractedTasksList;

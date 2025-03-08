
import React, { useMemo } from "react";
import { Task } from "@/types/task";
import { ArrowRight, GitBranch, GitMerge } from "lucide-react";

interface DependencyVisualizationProps {
  tasks: Task[];
  taskId: string;
  type: "dependencies" | "dependents" | "subtasks" | "parent";
  maxDepth?: number;
}

export function DependencyVisualization({
  tasks,
  taskId,
  type,
  maxDepth = 3,
}: DependencyVisualizationProps) {
  const taskMap = useMemo(() => {
    return tasks.reduce((map, task) => {
      map[task.id] = task;
      return map;
    }, {} as Record<string, Task>);
  }, [tasks]);

  const currentTask = taskMap[taskId];
  if (!currentTask) return null;

  const findDependencies = (task: Task, depth: number = 0): JSX.Element | null => {
    if (depth > maxDepth) return null;
    
    if (type === "dependencies" && (!task.dependencies || task.dependencies.length === 0)) {
      return null;
    }
    
    if (type === "subtasks" && (!task.metadata?.subtaskIds || task.metadata.subtaskIds.length === 0)) {
      return null;
    }

    return (
      <div className="pl-4 border-l border-dashed border-gray-300 ml-2">
        {type === "dependencies" && task.dependencies && task.dependencies.map(depId => {
          const depTask = taskMap[depId];
          if (!depTask) return null;
          
          return (
            <div key={depId} className="my-2">
              <div className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="text-sm font-medium">
                    {depTask.title}
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      depTask.status === "completed" ? "bg-green-100 text-green-700" :
                      depTask.status === "in-progress" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {depTask.status === "completed" ? "Completed" :
                       depTask.status === "in-progress" ? "In Progress" :
                       "To Do"}
                    </span>
                  </div>
                  {findDependencies(depTask, depth + 1)}
                </div>
              </div>
            </div>
          );
        })}
        
        {type === "dependents" && tasks.filter(t => 
          t.dependencies && t.dependencies.includes(task.id)
        ).map(depTask => (
          <div key={depTask.id} className="my-2">
            <div className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <div className="text-sm font-medium">
                  {depTask.title}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                    depTask.status === "completed" ? "bg-green-100 text-green-700" :
                    depTask.status === "in-progress" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {depTask.status === "completed" ? "Completed" :
                     depTask.status === "in-progress" ? "In Progress" :
                     "To Do"}
                  </span>
                </div>
                {findDependentTasks(depTask, depth + 1)}
              </div>
            </div>
          </div>
        ))}
        
        {type === "subtasks" && task.metadata?.subtaskIds && task.metadata.subtaskIds.map(subtaskId => {
          const subtask = taskMap[subtaskId];
          if (!subtask) return null;
          
          return (
            <div key={subtaskId} className="my-2">
              <div className="flex items-start gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="text-sm font-medium">
                    {subtask.title}
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      subtask.status === "completed" ? "bg-green-100 text-green-700" :
                      subtask.status === "in-progress" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {subtask.status === "completed" ? "Completed" :
                       subtask.status === "in-progress" ? "In Progress" :
                       "To Do"}
                    </span>
                  </div>
                  {findSubtasks(subtask, depth + 1)}
                </div>
              </div>
            </div>
          );
        })}
        
        {type === "parent" && task.metadata?.parentTaskId && (
          <div className="my-2">
            <div className="flex items-start gap-2">
              <GitMerge className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <div className="text-sm font-medium">
                  {taskMap[task.metadata.parentTaskId]?.title || "Unknown Parent Task"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const findDependentTasks = (task: Task, depth: number = 0): JSX.Element | null => {
    if (depth > maxDepth) return null;
    
    const dependentTasks = tasks.filter(t => 
      t.dependencies && t.dependencies.includes(task.id)
    );
    
    if (dependentTasks.length === 0) return null;
    
    return (
      <div className="pl-4 border-l border-dashed border-gray-300 ml-2">
        {dependentTasks.map(depTask => (
          <div key={depTask.id} className="my-2">
            <div className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <div className="text-sm font-medium">
                  {depTask.title}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                    depTask.status === "completed" ? "bg-green-100 text-green-700" :
                    depTask.status === "in-progress" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {depTask.status === "completed" ? "Completed" :
                     depTask.status === "in-progress" ? "In Progress" :
                     "To Do"}
                  </span>
                </div>
                {depth < maxDepth - 1 && findDependentTasks(depTask, depth + 1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const findSubtasks = (task: Task, depth: number = 0): JSX.Element | null => {
    if (depth > maxDepth) return null;
    if (!task.metadata?.subtaskIds || task.metadata.subtaskIds.length === 0) return null;
    
    return (
      <div className="pl-4 border-l border-dashed border-gray-300 ml-2">
        {task.metadata.subtaskIds.map(subtaskId => {
          const subtask = taskMap[subtaskId];
          if (!subtask) return null;
          
          return (
            <div key={subtaskId} className="my-2">
              <div className="flex items-start gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="text-sm font-medium">
                    {subtask.title}
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      subtask.status === "completed" ? "bg-green-100 text-green-700" :
                      subtask.status === "in-progress" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {subtask.status === "completed" ? "Completed" :
                       subtask.status === "in-progress" ? "In Progress" :
                       "To Do"}
                    </span>
                  </div>
                  {findSubtasks(subtask, depth + 1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dependency-visualization">
      {type === "dependencies" && (
        <>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Dependencies</h4>
          {currentTask.dependencies && currentTask.dependencies.length > 0 ? (
            findDependencies(currentTask)
          ) : (
            <p className="text-sm text-muted-foreground">No dependencies</p>
          )}
        </>
      )}
      
      {type === "dependents" && (
        <>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Dependant Tasks</h4>
          {findDependentTasks(currentTask) || (
            <p className="text-sm text-muted-foreground">No dependant tasks</p>
          )}
        </>
      )}
      
      {type === "subtasks" && (
        <>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Subtasks</h4>
          {currentTask.metadata?.subtaskIds && currentTask.metadata.subtaskIds.length > 0 ? (
            findSubtasks(currentTask)
          ) : (
            <p className="text-sm text-muted-foreground">No subtasks</p>
          )}
        </>
      )}
      
      {type === "parent" && (
        <>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Parent Task</h4>
          {currentTask.metadata?.parentTaskId ? (
            <div className="flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{taskMap[currentTask.metadata.parentTaskId]?.title || "Unknown Parent Task"}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No parent task</p>
          )}
        </>
      )}
    </div>
  );
}

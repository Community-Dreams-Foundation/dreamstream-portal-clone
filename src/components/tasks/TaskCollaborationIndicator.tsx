
import { useState, useEffect } from 'react';
import { useRealTimeCollaboration } from '@/hooks/useRealTimeCollaboration';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users } from 'lucide-react';

interface TaskCollaborationIndicatorProps {
  taskId: string;
}

export function TaskCollaborationIndicator({ taskId }: TaskCollaborationIndicatorProps) {
  const { isTaskBeingEditedByOthers, getTaskEditors } = useRealTimeCollaboration();
  const [editors, setEditors] = useState<string[]>([]);
  
  useEffect(() => {
    // Update editors every second
    const interval = setInterval(() => {
      setEditors(getTaskEditors(taskId));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [taskId, getTaskEditors]);
  
  if (!isTaskBeingEditedByOthers(taskId) || editors.length === 0) {
    return null;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {editors.slice(0, 3).map((editor, index) => (
                <Avatar key={index} className="h-5 w-5 border border-background">
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                    {editor.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {editors.length > 3 && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                  +{editors.length - 3}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground animate-pulse">
              <Users className="h-3 w-3" />
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="font-semibold">Currently being edited by:</p>
            <ul className="list-disc pl-4 mt-1">
              {editors.map((editor, index) => (
                <li key={index}>{editor}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

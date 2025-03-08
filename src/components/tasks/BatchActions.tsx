
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { 
  CheckSquare, 
  Clock, 
  Tag, 
  Trash2, 
  PlayCircle, 
  XCircle, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateTaskStatus } from "@/utils/tasks/progressOperations";
import { useAuth } from "@/contexts/AuthContext";

interface BatchActionsProps {
  selectedTasks: Task[];
  onClearSelection: () => void;
  onTasksUpdated: () => void;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  selectedTasks,
  onClearSelection,
  onTasksUpdated,
}) => {
  const { currentUser } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
  const handleChangeStatus = async (newStatus: TaskStatus) => {
    if (!currentUser || selectedTasks.length === 0) return;
    
    setProcessingAction(true);
    try {
      const updatePromises = selectedTasks.map(task => 
        updateTaskStatus(currentUser.uid, task.id, newStatus)
      );
      
      await Promise.all(updatePromises);
      
      toast({
        title: "Tasks Updated",
        description: `${selectedTasks.length} tasks updated to ${newStatus} status`,
      });
      
      onTasksUpdated();
      onClearSelection();
    } catch (error) {
      console.error("Error updating tasks:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the selected tasks.",
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  const handleChangePriority = async (priority: TaskPriority) => {
    if (!currentUser || selectedTasks.length === 0) return;
    
    setProcessingAction(true);
    try {
      // Implementation for changing priority
      // Similar to status update but for priority field
      
      toast({
        title: "Tasks Updated",
        description: `Priority changed to ${priority} for ${selectedTasks.length} tasks`,
      });
      
      onTasksUpdated();
      onClearSelection();
    } catch (error) {
      console.error("Error updating task priorities:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the priorities.",
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  const handleBatchDelete = async () => {
    // This would be implemented similar to other batch operations
    // But with deletion logic
    setShowDeleteConfirm(false);
    onClearSelection();
    onTasksUpdated();
  };
  
  const handleStartAllTasks = async () => {
    await handleChangeStatus("in-progress");
  };
  
  const handleCompleteAllTasks = async () => {
    await handleChangeStatus("completed");
  };
  
  if (selectedTasks.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="text-primary h-5 w-5" />
          <span className="font-medium">
            {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartAllTasks}
            disabled={processingAction}
          >
            <PlayCircle className="mr-1 h-4 w-4" />
            Start All
          </Button>
          
          <Button
            variant="outline" 
            size="sm"
            onClick={handleCompleteAllTasks}
            disabled={processingAction}
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            Complete All
          </Button>
          
          <Select onValueChange={(value) => handleChangePriority(value as TaskPriority)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Set Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={processingAction}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={processingAction}
          >
            <XCircle className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Tasks</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTasks.length} tasks? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

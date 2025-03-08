
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoSRecommendation, Task } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import ManualTaskForm from "./ManualTaskForm";
import DocumentImportTab from "./DocumentImportTab";
import ExtractedTasksList from "./ExtractedTasksList";

interface CreateTaskDialogProps {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: Partial<Task>) => void;
  onRecommendationsGenerated?: (recommendations: CoSRecommendation[]) => void;
}

const CreateTaskDialog = ({ 
  open,
  onOpenChange,
  onTaskCreated,
  onRecommendationsGenerated 
}: CreateTaskDialogProps) => {
  const { currentUser } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<Partial<Task>[]>([]);

  const dialogOpen = open !== undefined ? open : internalOpen;
  const setDialogOpen = (value: boolean) => {
    if (open !== undefined) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const handleTasksExtracted = (tasks: Partial<Task>[]) => {
    setExtractedTasks(tasks);
  };

  const handleRecommendationsGenerated = (recommendations: CoSRecommendation[]) => {
    if (onRecommendationsGenerated) {
      onRecommendationsGenerated(recommendations);
    }
  };

  const resetForm = () => {
    setExtractedTasks([]);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create a new task</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="document">Document Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4">
            <ManualTaskForm 
              onTaskCreated={onTaskCreated} 
              onClose={() => {
                resetForm();
                setDialogOpen(false);
              }}
            />
          </TabsContent>
          
          <TabsContent value="document" className="mt-4">
            <div className="space-y-4">
              <DocumentImportTab
                onTasksExtracted={handleTasksExtracted}
                onRecommendationsGenerated={handleRecommendationsGenerated}
              />
              
              {extractedTasks.length > 0 && (
                <ExtractedTasksList 
                  tasks={extractedTasks} 
                  onTaskCreated={(task) => {
                    onTaskCreated(task);
                    setExtractedTasks(extractedTasks.filter(t => t.title !== task.title));
                  }}
                />
              )}
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;

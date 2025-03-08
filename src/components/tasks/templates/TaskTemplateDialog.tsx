import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createTaskTemplate, fetchTaskTemplates, createTaskFromTemplate } from "@/utils/tasks/templateOperations";
import { TaskTemplateInput, TaskTemplate } from "@/types/template";
import { Task } from "@/types/task";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, Plus, Save, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: (task: Partial<Task>) => void;
}

export function TaskTemplateDialog({ open, onOpenChange, onTaskCreated }: TaskTemplateDialogProps) {
  const [activeTab, setActiveTab] = useState<"create" | "use">("use");
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("general");
  const [templateTags, setTemplateTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>(undefined);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (open && currentUser?.uid) {
      loadTemplates();
    }
  }, [open, currentUser]);
  
  useEffect(() => {
    if (selectedTemplate && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setTaskTitle("");
        setTaskDescription("");
        setTaskDueDate(undefined);
      }
    }
  }, [selectedTemplate]);
  
  const loadTemplates = async () => {
    if (!currentUser?.uid) return;
    
    setLoading(true);
    try {
      const loadedTemplates = await fetchTaskTemplates(currentUser.uid);
      setTemplates(loadedTemplates);
      if (loadedTemplates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(loadedTemplates[0].id);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        variant: "destructive",
        title: "Failed to load templates",
        description: "An error occurred while loading your task templates."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !templateTags.includes(tagInput.trim())) {
      setTemplateTags([...templateTags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTemplateTags(templateTags.filter(t => t !== tag));
  };
  
  const handleCreateTemplate = async () => {
    if (!currentUser?.uid) return;
    if (!templateName.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide a name for your template."
      });
      return;
    }
    
    setLoading(true);
    try {
      const templateInput: TaskTemplateInput = {
        name: templateName,
        description: templateDescription,
        category: templateCategory,
        templateData: {
          status: "todo",
          estimatedDuration: 30,
          actualDuration: 0,
          priority: "medium",
          tags: templateTags
        },
        createdBy: currentUser.uid,
        isPublic: false,
        tags: templateTags
      };
      
      await createTaskTemplate(currentUser.uid, templateInput);
      
      toast({
        title: "Template created",
        description: "Your task template has been saved successfully."
      });
      
      setTemplateName("");
      setTemplateDescription("");
      setTemplateCategory("general");
      setTemplateTags([]);
      
      loadTemplates();
      
      setActiveTab("use");
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        variant: "destructive",
        title: "Failed to create template",
        description: "An error occurred while saving your template."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUseTemplate = async () => {
    if (!currentUser?.uid || !selectedTemplate) return;
    if (!taskTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide a title for your task."
      });
      return;
    }
    
    setLoading(true);
    try {
      const taskId = await createTaskFromTemplate(currentUser.uid, selectedTemplate, {
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate ? taskDueDate.getTime() : undefined
      });
      
      toast({
        title: "Task created",
        description: "Your task has been created from the template."
      });
      
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate(undefined);
      
      if (onTaskCreated) {
        onTaskCreated({ id: taskId, title: taskTitle });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating task from template:", error);
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: "An error occurred while creating your task from the template."
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Task Templates
          </DialogTitle>
          <DialogDescription>
            Create and use templates for common, repeatable tasks.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "create" | "use")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="use">Use Template</TabsTrigger>
            <TabsTrigger value="create">Create Template</TabsTrigger>
          </TabsList>
          
          <TabsContent value="use" className="space-y-4 py-4">
            {templates.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium">No Templates Available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't created any task templates yet.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("create")}
                >
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="select-template">Select a Template</Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedTemplate && (
                  <>
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="task-title">Task Title</Label>
                      <Input
                        id="task-title"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="Enter task title"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="task-description">Task Description</Label>
                      <Textarea
                        id="task-description"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Enter task description"
                        disabled={loading}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="due-date">Due Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !taskDueDate && "text-muted-foreground"
                            )}
                            disabled={loading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {taskDueDate ? format(taskDueDate, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={taskDueDate}
                            onSelect={setTaskDueDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                      </Button>
                      <Button onClick={handleUseTemplate} disabled={loading}>
                        {loading ? <span className="animate-spin mr-2">•</span> : null}
                        Create Task
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="E.g., Sprint Planning Task"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-description">Template Description</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is for"
                disabled={loading}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select 
                value={templateCategory} 
                onValueChange={setTemplateCategory}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  size="sm"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={loading || !tagInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {templateTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {templateTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={loading}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={loading}>
                {loading ? <span className="animate-spin mr-2">•</span> : <Save className="h-4 w-4 mr-2" />}
                Save Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default TaskTemplateDialog;


import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KanbanBoard } from "@/components/dashboard/KanbanBoard"
import { ChevronRight, Kanban, Filter, Plus, Search, RotateCw, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog"
import { ViewAllTasksDialog } from "@/components/tasks/ViewAllTasksDialog"
import TaskTemplateDialog from "@/components/tasks/templates/TaskTemplateDialog"
import { useCosRecommendations } from "@/hooks/useCosRecommendations"
import { Task } from "@/types/task"
import { TaskFilters, TaskFiltersState } from "@/components/tasks/TaskFilters"
import { useAuth } from "@/contexts/AuthContext"
import { fetchTasks } from "@/utils/tasks/basicOperations"
import { TaskPrioritizationMatrix } from "@/components/tasks/prioritization/TaskPrioritizationMatrix"
import { useIsMobile } from "@/hooks/use-mobile"

export function KanbanSection() {
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showAllTasks, setShowAllTasks] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const kanbanBoardRef = useRef<any>(null)
  const { createTaskRecommendation } = useCosRecommendations()
  const { currentUser } = useAuth()
  const isMobile = useIsMobile()
  
  const [filters, setFilters] = useState<TaskFiltersState>({
    searchQuery: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    priorities: [],
    tags: [],
  })
  
  // Load tasks
  useEffect(() => {
    if (!currentUser?.uid) return
    
    const loadTasks = async () => {
      try {
        const fetchedTasks = await fetchTasks(currentUser.uid)
        setTasks(fetchedTasks)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      }
    }
    
    loadTasks()
  }, [currentUser?.uid])
  
  // Load all tags for filter dropdown
  useEffect(() => {
    const loadTags = async () => {
      if (!currentUser?.uid) return
      
      try {
        const fetchedTasks = await fetchTasks(currentUser.uid)
        
        // Extract all unique tags
        const tags = new Set<string>()
        fetchedTasks.forEach(task => {
          if (task.tags && task.tags.length > 0) {
            task.tags.forEach(tag => tags.add(tag))
          }
        })
        
        setAllTags(Array.from(tags).sort())
      } catch (error) {
        console.error("Error fetching task tags:", error)
      }
    }
    
    loadTags()
  }, [currentUser?.uid])
  
  const handleClearFilters = () => {
    setFilters({
      searchQuery: "",
      dateRange: {
        from: undefined,
        to: undefined,
      },
      priorities: [],
      tags: [],
    })
  }
  
  const handleTaskCreated = (task: Partial<Task>) => {
    // Force reload tasks in KanbanBoard
    if (kanbanBoardRef.current && kanbanBoardRef.current.loadTasks) {
      kanbanBoardRef.current.loadTasks()
    }
    
    // Generate a recommendation if we have task info
    if (task.id && task.title) {
      createTaskRecommendation(
        task.id,
        task.title,
        `Consider breaking down "${task.title}" into smaller subtasks for better management and tracking.`,
        "medium"
      )
      
      // If it's a recurring task, generate a specific recommendation
      if (task.recurringConfig?.isRecurring) {
        createTaskRecommendation(
          task.id,
          task.title,
          `You've created "${task.title}" as a recurring ${task.recurringConfig.pattern} task. The CoS system will help you track completions and create new instances automatically.`,
          "medium"
        )
      }
    }
    
    // Reopen if needed
    setShowAllTasks(prev => {
      if (prev) return true // Keep open if it was already open
      return false
    })
  }
  
  return (
    <div className="col-span-full">
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Kanban className="mr-2 h-5 w-5 text-primary" />
              Task Management Board
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant={showFilters ? "default" : "outline"} 
                size="sm" 
                className="text-sm gap-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-sm gap-1"
                onClick={() => setShowTemplates(true)}
              >
                <FileText className="h-4 w-4" />
                Templates
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="text-sm gap-1"
                onClick={() => setShowCreateTask(true)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-primary hover:underline flex items-center"
                onClick={() => setShowAllTasks(true)}
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and organize your tasks by dragging them across different stages
          </p>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <TaskFilters
                availableTags={allTags}
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-4">
          {/* Task Prioritization Matrix */}
          <div className="mb-6">
            <TaskPrioritizationMatrix 
              tasks={tasks} 
              onTaskUpdated={() => {
                if (kanbanBoardRef.current && kanbanBoardRef.current.loadTasks) {
                  kanbanBoardRef.current.loadTasks()
                }
              }}
            />
          </div>
          
          {/* Kanban Board */}
          <KanbanBoard 
            ref={kanbanBoardRef} 
            filters={filters}
            showRecurring={true}
          />
        </CardContent>
      </Card>
      
      {/* Create Task Dialog */}
      <CreateTaskDialog 
        open={showCreateTask} 
        onOpenChange={setShowCreateTask} 
        onTaskCreated={handleTaskCreated}
      />
      
      {/* View All Tasks Dialog */}
      <ViewAllTasksDialog
        open={showAllTasks}
        onOpenChange={setShowAllTasks}
      />
      
      {/* Task Templates Dialog */}
      <TaskTemplateDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}

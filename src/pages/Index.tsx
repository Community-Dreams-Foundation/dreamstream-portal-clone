
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { KanbanSection } from "@/components/dashboard/sections/KanbanSection"
import { DashboardOverview } from "@/components/dashboard/sections/DashboardOverview"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useGamification } from "@/hooks/useGamification"
import { fetchTasks } from "@/utils/tasks/basicOperations"
import { Task } from "@/types/task"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { useRealTimeCollaboration } from "@/hooks/useRealTimeCollaboration"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export default function Index() {
  const { currentUser } = useAuth();
  const { checkStreak } = useGamification();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeUsers } = useRealTimeCollaboration();
  
  // Check if user has activity today when they load the dashboard
  useEffect(() => {
    if (currentUser) {
      checkStreak();
    }
  }, [currentUser, checkStreak]);

  // Fetch tasks for the dashboard
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        const fetchedTasks = await fetchTasks(currentUser.uid);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          variant: "destructive",
          title: "Error loading tasks",
          description: "Failed to load your tasks. Please refresh the page."
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [currentUser?.uid, toast]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Task Dashboard</h1>
          <div className="flex gap-4 items-center">
            <Button asChild variant="outline" size="sm">
              <Link to="/submit-idea">
                <Plus className="mr-2 h-4 w-4" />
                Submit Project Idea
              </Link>
            </Button>
            
            {/* Active collaborators display */}
            {activeUsers.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {activeUsers.slice(0, 3).map((user, index) => (
                          <Avatar key={index} className="h-7 w-7 border-2 border-background">
                            {user.photoURL ? (
                              <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                            ) : (
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        ))}
                        {activeUsers.length > 3 && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium border-2 border-background">
                            +{activeUsers.length - 3}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{activeUsers.length} active</span>
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-semibold">Active team members:</p>
                      <ul className="list-disc pl-4 mt-1">
                        {activeUsers.map((user, index) => (
                          <li key={index}>
                            {user.displayName || user.email || 'Anonymous user'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <p className="text-muted-foreground flex items-center">
              Welcome back{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}
            </p>
          </div>
        </div>
        
        {/* Task Analytics Overview */}
        <DashboardOverview tasks={tasks} />
        
        {/* Task Management Board */}
        <div className="grid gap-6">
          <KanbanSection />
        </div>
      </div>
    </DashboardLayout>
  );
}

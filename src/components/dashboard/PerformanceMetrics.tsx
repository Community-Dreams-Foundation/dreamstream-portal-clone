
import { useState } from "react"
import { Trophy, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { fetchPerformanceData, addPersonalGoal } from "@/utils/performanceUtils"
import { ExperienceProgress } from "./metrics/ExperienceProgress"
import { StatsGrid } from "./metrics/StatsGrid"
import { WeeklyActivityChart } from "./metrics/WeeklyActivityChart"
import { PersonalGoalsList } from "./metrics/PersonalGoalsList"
import { AchievementsList } from "./metrics/AchievementsList"

export function PerformanceMetrics() {
  const { currentUser } = useAuth()
  const [newGoal, setNewGoal] = useState({
    title: "",
    target: 0,
    current: 0,
    type: "tasks" as const,
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000
  })

  const { data: performance, refetch } = useQuery({
    queryKey: ['performanceData', currentUser?.uid],
    queryFn: () => fetchPerformanceData(currentUser?.uid || ''),
    enabled: !!currentUser,
  })

  const handleAddGoal = async () => {
    if (!currentUser) return;
    
    try {
      await addPersonalGoal(currentUser.uid, newGoal);
      toast({
        title: "Goal Added",
        description: "Your new personal goal has been set!",
      });
      refetch();
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add goal. Please try again.",
      });
    }
  };

  if (!performance) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[400px]">
          Loading performance data...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Performance & Achievements
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Set New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set a Personal Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      placeholder="Complete 10 tasks this week"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Number</Label>
                    <Input
                      id="target"
                      type="number"
                      placeholder="10"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <Button onClick={handleAddGoal} className="w-full">
                    Add Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ExperienceProgress
              level={performance.level}
              experience={performance.experience}
              experienceToNextLevel={performance.experienceToNextLevel}
            />
            
            <StatsGrid
              efficiency={performance.efficiency}
              completedTasks={performance.tasksThisWeek}
              totalTasks={performance.totalTasks}
            />
            
            <WeeklyActivityChart weeklyTasks={performance.weeklyTasks} />
            
            <PersonalGoalsList goals={performance.goals} />
            
            <AchievementsList achievements={performance.achievements} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

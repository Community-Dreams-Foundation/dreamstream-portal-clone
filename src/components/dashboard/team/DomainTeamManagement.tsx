
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, ActivitySquare, Brain, Code, LineChart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import type { Team, LeadershipDomain } from "@/types/leadership"
import { createTeam, addTeamMember, getDomainTeams, getTeamPerformance } from "@/utils/teamUtils"

export function DomainTeamManagement() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedDomain, setSelectedDomain] = useState<LeadershipDomain>("strategy")

  const domains: Array<{ id: LeadershipDomain; icon: any; label: string }> = [
    { id: "strategy", icon: Brain, label: "Strategy" },
    { id: "product-design", icon: ActivitySquare, label: "Product Design" },
    { id: "data-engineering", icon: LineChart, label: "Data Engineering" },
    { id: "software-development", icon: Code, label: "Software Development" },
    { id: "engagement", icon: Users, label: "Engagement" }
  ]

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const domainTeams = await getDomainTeams(selectedDomain)
        setTeams(domainTeams)
      } catch (error) {
        console.error("Error loading teams:", error)
        toast({
          title: "Error",
          description: "Failed to load teams. Please try again.",
          variant: "destructive"
        })
      }
    }

    loadTeams()
  }, [selectedDomain, toast])

  const handleCreateTeam = async () => {
    if (!currentUser) return

    try {
      const newTeam = await createTeam(currentUser.uid, selectedDomain)
      setTeams(prev => [...prev, newTeam])
      toast({
        title: "Team Created",
        description: `New ${selectedDomain} team has been created successfully!`
      })
    } catch (error) {
      console.error("Error creating team:", error)
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleJoinTeam = async (teamId: string) => {
    if (!currentUser) return

    try {
      await addTeamMember(teamId, currentUser.uid)
      const updatedTeams = await getDomainTeams(selectedDomain)
      setTeams(updatedTeams)
      toast({
        title: "Team Joined",
        description: "You have successfully joined the team!"
      })
    } catch (error) {
      console.error("Error joining team:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join team",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Domain Teams
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {domains.map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant={selectedDomain === id ? "default" : "outline"}
                className="flex items-center gap-2"
                onClick={() => setSelectedDomain(id)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Available Teams</h3>
            <Button onClick={handleCreateTeam}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map(team => (
              <Card key={team.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge>
                      {team.domain.split("-").map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(" ")}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {team.memberIds.length}/{team.maxMembers} members
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Performance Metrics:</div>
                    {team.performance && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Efficiency: {team.performance.teamEfficiency}%</div>
                        <div>Innovation: {team.performance.innovationScore}%</div>
                        <div>Collaboration: {team.performance.collaborationRate}%</div>
                        <div>Success Rate: {team.performance.projectSuccessRate}%</div>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    disabled={team.memberIds.length >= team.maxMembers || 
                             (currentUser && team.memberIds.includes(currentUser.uid))}
                    onClick={() => handleJoinTeam(team.id)}
                  >
                    {currentUser && team.memberIds.includes(currentUser.uid)
                      ? "Already Joined"
                      : team.memberIds.length >= team.maxMembers
                      ? "Team Full"
                      : "Join Team"
                    }
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


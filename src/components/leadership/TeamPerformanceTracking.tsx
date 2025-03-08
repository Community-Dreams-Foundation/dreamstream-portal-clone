import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, ChartLine } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Team, LeadershipDomain } from "@/types/leadership"
import { getDatabase, ref, update, get } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"

export function TeamPerformanceTracking({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<Team | null>(null)
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const db = getDatabase()

  useEffect(() => {
    if (!teamId || !currentUser) return

    const teamRef = ref(db, `teams/${teamId}`)
    const unsubscribe = get(teamRef).then((snapshot) => {
      if (snapshot.exists()) {
        setTeam(snapshot.val() as Team)
      }
    })

    return () => {
      unsubscribe
    }
  }, [teamId, currentUser])

  const updateTeamPerformance = async (metrics: Partial<Team['performance']>) => {
    if (!team || !currentUser) return

    try {
      const updatedPerformance = {
        ...team.performance,
        ...metrics
      }

      await update(ref(db, `teams/${teamId}/performance`), updatedPerformance)

      toast({
        title: "Performance Updated",
        description: "Team performance metrics have been updated successfully."
      })

      setTeam({
        ...team,
        performance: updatedPerformance
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update team performance metrics."
      })
    }
  }

  const handleAddMember = async (userId: string) => {
    if (!team || !currentUser) return
    if (team.memberIds.length >= team.maxMembers) {
      toast({
        variant: "destructive",
        title: "Team Full",
        description: "Cannot add more members. Team is at maximum capacity."
      })
      return
    }

    try {
      const updatedMembers = [...team.memberIds, userId]
      await update(ref(db, `teams/${teamId}`), {
        memberIds: updatedMembers
      })

      toast({
        title: "Member Added",
        description: "New member has been added to the team."
      })

      setTeam({
        ...team,
        memberIds: updatedMembers
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Add Member",
        description: "Could not add member to the team."
      })
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!team || !currentUser) return

    try {
      const updatedMembers = team.memberIds.filter(id => id !== userId)
      await update(ref(db, `teams/${teamId}`), {
        memberIds: updatedMembers
      })

      toast({
        title: "Member Removed",
        description: "Member has been removed from the team."
      })

      setTeam({
        ...team,
        memberIds: updatedMembers
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Remove Member",
        description: "Could not remove member from the team."
      })
    }
  }

  if (!team) {
    return <div>Loading team data...</div>
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Performance</h3>
          <p className="text-sm text-muted-foreground">{team.domain}</p>
        </div>
        <Badge variant="secondary">
          {team.memberIds.length}/{team.maxMembers} Members
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Team Efficiency</span>
            <span>{team.performance?.teamEfficiency || 0}%</span>
          </div>
          <Progress value={team.performance?.teamEfficiency || 0} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Collaboration Rate</span>
            <span>{team.performance?.collaborationRate || 0}%</span>
          </div>
          <Progress value={team.performance?.collaborationRate || 0} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Innovation Score</span>
            <span>{team.performance?.innovationScore || 0}%</span>
          </div>
          <Progress value={team.performance?.innovationScore || 0} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddMember("new-member-id")}
          disabled={team.memberIds.length >= team.maxMembers}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRemoveMember(team.memberIds[team.memberIds.length - 1])}
          disabled={team.memberIds.length === 0}
        >
          <UserMinus className="w-4 h-4 mr-2" />
          Remove Member
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateTeamPerformance({
            teamEfficiency: Math.min(100, (team.performance?.teamEfficiency || 0) + 5),
            collaborationRate: Math.min(100, (team.performance?.collaborationRate || 0) + 5),
            innovationScore: Math.min(100, (team.performance?.innovationScore || 0) + 5)
          })}
        >
          <ChartLine className="w-4 h-4 mr-2" />
          Update Metrics
        </Button>
      </div>
    </Card>
  )
}

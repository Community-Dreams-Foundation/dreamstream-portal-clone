
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, Trophy, Timer, Activity, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { Agent } from "@/types/task"

interface AgentsListProps {
  agents: Agent[]
  onDeploy?: (agentId: string, targetId: string) => void
  deploymentTarget?: string | null
  setDeploymentTarget?: (targetId: string | null) => void
}

export function AgentsList({ 
  agents,
  onDeploy,
  deploymentTarget,
  setDeploymentTarget
}: AgentsListProps) {
  const { toast } = useToast()

  const handleDeploy = async (agent: Agent) => {
    if (!onDeploy || !deploymentTarget) return
    
    if (agent.currentLoad >= 80) {
      toast({
        title: "Agent Overloaded",
        description: "This agent's workload is too high. Consider deploying another agent.",
        variant: "destructive"
      })
      return
    }

    onDeploy(agent.id, deploymentTarget)
    toast({
      title: "Agent Deployed",
      description: `${agent.name} has been deployed successfully.`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "overloaded":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <Card key={agent.id} className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="font-medium">{agent.name}</span>
              <div className="flex items-center gap-2">
                <span 
                  className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`}
                />
                <Badge variant="outline">
                  {agent.status}
                </Badge>
              </div>
            </div>
            {onDeploy && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeploy(agent)}
                disabled={agent.status === "inactive" || agent.status === "overloaded" || !deploymentTarget}
                className="ml-2"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Deploy
              </Button>
            )}
          </div>
          
          <Progress 
            value={agent.currentLoad} 
            className={`mt-2 ${agent.currentLoad > 80 ? "[--progress-background:hsl(var(--destructive))]" : ""}`}
          />
          
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {(agent.performance.successRate * 100).toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {agent.performance.averageTaskTime}m
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {agent.performance.tasksCompleted} completed
            </span>
          </div>

          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Specializations: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(agent.specializationScore || {}).map(([domain, score]) => (
                score > 0 && (
                  <Badge key={domain} variant="secondary" className="text-xs">
                    {domain}: {score}%
                  </Badge>
                )
              ))}
            </div>
          </div>

          {agent.assignedTasks.length > 0 && (
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Assigned Tasks: </span>
              <span className="font-medium">{agent.assignedTasks.length}</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

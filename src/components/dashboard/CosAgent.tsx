import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import type { Agent } from "@/types/task"
import { PerformanceMetrics } from "@/types/performance"
import { useCosData } from "@/hooks/useCosData"
import { useCosRecommendations } from "@/hooks/useCosRecommendations"
import { usePersonalizedRecommendations } from "@/hooks/usePersonalizedRecommendations"
import { useNavigate } from "react-router-dom"
import { AgentHeader } from "./cos-agent/AgentHeader"
import { AgentTabs } from "./cos-agent/AgentTabs"

export function CosAgent() {
  const [agents, setAgents] = useState<Agent[]>([])
  const { preferences, agents: fetchedAgents } = useCosData()
  const { 
    recommendations, 
    setRecommendations, 
    handleFeedback, 
    handleAction 
  } = useCosRecommendations()
  
  const {
    learningProfile,
    adaptiveScore,
    refreshRecommendations
  } = usePersonalizedRecommendations()
  
  const navigate = useNavigate()
  const [deploymentTarget, setDeploymentTarget] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showMultiModal, setShowMultiModal] = useState(false)

  const [metrics] = useState<PerformanceMetrics>({
    taskCompletionRate: 0.85,
    avgTaskTime: 45,
    delegationEfficiency: 0.78,
    feedbackScore: 92,
    efficiency: 92,
    totalTasks: 150,
    tasksThisWeek: 25,
    averageTaskTime: 45,
    level: 5,
    experience: 2500,
    experienceToNextLevel: 5000,
    leaderboardRank: 12,
    totalParticipants: 100,
    achievements: [
      {
        id: "first-milestone",
        title: "First Milestone",
        description: "Completed first 10 tasks",
        icon: "trophy",
        earnedAt: Date.now()
      }
    ],
    goals: [],
    weeklyTasks: [
      { name: "Mon", tasks: 5 },
      { name: "Tue", tasks: 7 },
      { name: "Wed", tasks: 4 },
      { name: "Thu", tasks: 6 },
      { name: "Fri", tasks: 3 }
    ],
    feedback: [],
    portfolioAnalytics: {
      views: [],
      uniqueVisitors: 0,
      sectionEngagement: [],
      platformPerformance: {
        linkedin: {
          shares: 0,
          clicks: 0,
          impressions: 0
        },
        github: {
          stars: 0,
          forks: 0,
          views: 0
        }
      },
      clickThroughRate: 0
    }
  })

  useEffect(() => {
    if (fetchedAgents) {
      setAgents(fetchedAgents)
    }
  }, [fetchedAgents])

  useEffect(() => {
    const refreshTimer = setTimeout(() => {
      refreshRecommendations();
    }, 2000);
    
    return () => clearTimeout(refreshTimer);
  }, [refreshRecommendations]);

  const handleAgentCreated = (newAgent: Agent) => {
    setAgents(prev => [...prev, newAgent])
  }

  const handleAgentDeployment = (agentId: string, targetId: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        return {
          ...agent,
          assignedTasks: [...agent.assignedTasks, targetId],
          currentLoad: Math.min(agent.currentLoad + 20, 100),
          status: agent.currentLoad >= 80 ? "overloaded" : "active"
        }
      }
      return agent
    }))
    setDeploymentTarget(null)
  }

  const handleRecommendationAction = (recId: string, actionType: string) => {
    handleAction(recId, actionType)
  }

  const toggleVoiceRecording = () => {
    setIsRecording(prev => !prev)
    if (!isRecording) {
      console.log("Starting voice recording...")
      setTimeout(() => {
        setIsRecording(false)
        const mockRecommendation = {
          id: `voice-rec-${Date.now()}`,
          type: "task" as const,
          content: "I detected you mentioned creating a presentation. Would you like to create a task for this?",
          timestamp: Date.now(),
          priority: "medium" as const,
          impact: 70
        }
        setRecommendations([mockRecommendation, ...recommendations])
      }, 3000)
    }
  }

  return (
    <Card className="p-6">
      <AgentHeader 
        isRecording={isRecording}
        toggleVoiceRecording={toggleVoiceRecording}
        showMultiModal={showMultiModal}
        setShowMultiModal={setShowMultiModal}
      />

      <AgentTabs 
        agents={agents}
        preferences={preferences}
        metrics={metrics}
        recommendations={recommendations}
        learningProfile={learningProfile}
        adaptiveScore={adaptiveScore}
        handleAgentCreated={handleAgentCreated}
        handleAgentDeployment={handleAgentDeployment}
        handleRecommendationAction={handleRecommendationAction}
        handleFeedback={handleFeedback}
        deploymentTarget={deploymentTarget}
        setDeploymentTarget={setDeploymentTarget}
      />
    </Card>
  )
}

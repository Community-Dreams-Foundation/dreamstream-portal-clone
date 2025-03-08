import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { getDatabase, ref, set, get } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"
import type { AssessmentScenario, AssessmentResult } from "@/types/assessment"
import { AgentsList } from "@/components/dashboard/cos-agent/AgentsList"
import type { Agent } from "@/types/task"
import type { LeadershipTier, LeadershipDomain } from "@/types/leadership"

const INITIAL_SCENARIOS = [
  {
    id: "scenario-1",
    title: "Team Resource Management",
    description: "Allocate resources and delegate tasks to a small team facing tight deadlines.",
    type: "delegation",
    difficulty: "beginner",
    expectedOutcomes: [
      "Efficient task distribution",
      "Balanced workload across team",
      "Meeting project deadlines"
    ],
    timeLimit: 15,
    agentConfig: {
      count: 3,
      types: ["general", "project-management"],
      initialLoad: 30
    },
    tasks: []
  }
] as AssessmentScenario[]

export function InitialAssessment() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [currentScenario, setCurrentScenario] = useState(0)
  const [activeAgents, setActiveAgents] = useState<Agent[]>([])
  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const { data: assessmentResult } = useQuery({
    queryKey: ['assessmentResult', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return null
      const db = getDatabase()
      const resultRef = ref(db, `users/${currentUser.uid}/assessmentResults/initial`)
      const snapshot = await get(resultRef)
      return snapshot.val() as AssessmentResult | null
    },
    enabled: !!currentUser
  })

  const handleStartAssessment = async () => {
    if (!currentUser) return
    
    setIsRunning(true)
    const scenario = INITIAL_SCENARIOS[currentScenario]
    
    try {
      const newAgents: Agent[] = await Promise.all(
        Array(scenario.agentConfig.count).fill(null).map(async (_, index) => {
          const agent: Agent = {
            id: `agent-${Date.now()}-${index}`,
            type: scenario.agentConfig.types[index % scenario.agentConfig.types.length],
            name: `Assessment Agent ${index + 1}`,
            skills: [],
            currentLoad: scenario.agentConfig.initialLoad,
            assignedTasks: [],
            performance: {
              successRate: 100,
              averageTaskTime: 0,
              tasksCompleted: 0
            },
            createdAt: Date.now(),
            lastActive: Date.now(),
            status: "active",
            specializationScore: {}
          }
          
          const db = getDatabase()
          await set(ref(db, `users/${currentUser.uid}/agents/${agent.id}`), agent)
          return agent
        })
      )
      
      setActiveAgents(newAgents)
      
      const intervalId = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (scenario.timeLimit * 60))
          if (newProgress >= 100) {
            clearInterval(intervalId)
            handleScenarioComplete()
            return 100
          }
          return newProgress
        })
      }, 1000)
      
    } catch (error) {
      console.error("Error starting assessment:", error)
      toast({
        variant: "destructive",
        title: "Assessment Error",
        description: "Failed to start the assessment. Please try again."
      })
      setIsRunning(false)
    }
  }

  const handleScenarioComplete = async () => {
    if (!currentUser) return
    
    setIsRunning(false)
    
    const agentPerformanceScores = activeAgents.map(agent => ({
      agentId: agent.id,
      efficiency: agent.performance.successRate,
      satisfaction: 85,
      taskCompletion: agent.performance.tasksCompleted
    }))
    
    const overallScore = agentPerformanceScores.reduce(
      (acc, curr) => acc + curr.efficiency, 0
    ) / agentPerformanceScores.length
    
    const initialTier = determineInitialTier(overallScore)
    
    const result: AssessmentResult = {
      userId: currentUser.uid,
      timestamp: Date.now(),
      tier: initialTier,
      domainStrengths: [
        {
          domain: getLeadershipDomain(),
          score: overallScore
        }
      ],
      feedback: `Initial assessment complete. You've demonstrated ${
        overallScore >= 90 ? "exceptional" :
        overallScore >= 75 ? "strong" :
        "developing"
      } leadership capabilities in project management.`,
      recommendedScenarios: [],
      areasForImprovement: ["delegation", "resource-optimization"],
      readyForPromotion: overallScore >= 90
    }
    
    try {
      const db = getDatabase()
      await set(
        ref(db, `users/${currentUser.uid}/assessmentResults/initial`),
        result
      )
      
      toast({
        title: "Assessment Complete",
        description: `You've been initially assessed at ${initialTier} tier.`
      })
      
    } catch (error) {
      console.error("Error saving assessment results:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save assessment results. Please try again."
      })
    }
  }

  const determineInitialTier = (overallScore: number): LeadershipTier => {
    if (overallScore >= 90) return "team-lead";
    if (overallScore >= 75) return "captain";
    return "emerging";
  };

  const getLeadershipDomain = (): LeadershipDomain => {
    return "product-design";
  }

  if (assessmentResult) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Assessment Complete</h2>
          <p className="text-muted-foreground">
            You've already completed your initial assessment.
            Current tier: <span className="font-semibold">{assessmentResult.tier}</span>
          </p>
          <p className="text-sm">
            Completed on: {new Date(assessmentResult.timestamp).toLocaleDateString()}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Leadership Assessment</h2>
          <p className="text-muted-foreground">
            Complete this initial assessment to determine your leadership tier and receive
            personalized recommendations.
          </p>
          
          {isRunning ? (
            <div className="space-y-4">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">
                Assessment in progress... {Math.round(progress)}% complete
              </p>
            </div>
          ) : (
            <Button 
              onClick={handleStartAssessment}
              disabled={isRunning}
              className="w-full"
            >
              Start Assessment
            </Button>
          )}
        </div>
      </Card>

      {activeAgents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Active Agents</h3>
          <AgentsList agents={activeAgents} />
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Current Scenario</h3>
        <div className="space-y-2">
          <p className="font-medium">{INITIAL_SCENARIOS[currentScenario].title}</p>
          <p className="text-muted-foreground">
            {INITIAL_SCENARIOS[currentScenario].description}
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Time Limit: {INITIAL_SCENARIOS[currentScenario].timeLimit} minutes</p>
            <p>Difficulty: {INITIAL_SCENARIOS[currentScenario].difficulty}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}


import { AgentType, Task } from "./task"
import { LeadershipTier, LeadershipDomain } from "./leadership"

export interface AssessmentScenario {
  id: string
  title: string
  description: string
  type: "decision-making" | "delegation" | "crisis-management" | "team-building"
  difficulty: "beginner" | "intermediate" | "advanced"
  expectedOutcomes: string[]
  timeLimit: number // in minutes
  agentConfig: {
    count: number
    types: AgentType[]
    initialLoad: number
  }
  tasks: Task[]
}

export interface AssessmentResponse {
  scenarioId: string
  userId: string
  decisions: Array<{
    timestamp: number
    type: "delegation" | "communication" | "resource-allocation"
    details: string
    impact: number // -100 to 100
  }>
  completionTime: number
  agentPerformance: Array<{
    agentId: string
    efficiency: number
    satisfaction: number
    taskCompletion: number
  }>
  overallScore: number
}

export interface AssessmentResult {
  userId: string
  timestamp: number
  tier: LeadershipTier
  domainStrengths: Array<{
    domain: LeadershipDomain
    score: number // 0-100
  }>
  feedback: string
  recommendedScenarios: string[] // scenario IDs
  areasForImprovement: string[]
  readyForPromotion: boolean
}

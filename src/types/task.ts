
export type TaskStatus = "todo" | "not-started" | "in-progress" | "completed" | "blocked"
export type TaskPriority = "high" | "medium" | "low"
export type SkillLevel = "beginner" | "intermediate" | "advanced"
export type TaskRecurrencePattern = "daily" | "weekly" | "biweekly" | "monthly" | "custom"
export type AgentType = "general" | "data-analysis" | "content-creation" | "project-management"

export interface Activity {
  type: "status_change" | "timer_update" | "comment" | "dependency_update" | "tag_update" | "priority_change" | "completion" | "split"
  timestamp: number
  details: string
}

export interface CoSRecommendation {
  id: string
  type: "task" | "time" | "leadership" | "agent" | "learning" | "efficiency"
  content: string
  timestamp: number
  feedback?: "positive" | "negative"
  priority?: "low" | "medium" | "high"
  impact?: number // 0-100 score for recommendation impact
  actualDuration?: number // in minutes
  actedUpon?: boolean // whether the user has acted on this recommendation
  appliedAt?: number // timestamp when recommendation was applied
  metadata?: {
    taskId?: string
    taskTitle?: string
    moduleId?: number
    resourceUrl?: string
    [key: string]: any
  }
}

export interface RecurringTaskConfig {
  isRecurring: boolean
  pattern: TaskRecurrencePattern
  interval: number // 1 = every day/week/month, 2 = every other day/week/month
  daysOfWeek?: number[] // 0-6 for Sunday-Saturday
  endAfterOccurrences?: number
  endDate?: number // timestamp
  nextOccurrence?: number // timestamp for the next occurrence
  occurrencesCompleted?: number
  parentTaskId?: string // for tasks created from a recurring template
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  estimatedDuration: number // in minutes
  actualDuration: number // in minutes
  priority?: TaskPriority
  dependencies?: string[] // array of task IDs
  tags?: string[]
  createdAt?: number
  updatedAt?: number
  dueDate?: number // timestamp for task due date
  isTimerRunning?: boolean
  startTime?: number // timestamp when timer was last started
  totalElapsedTime?: number // total time spent on task in milliseconds
  assignedTo?: string // user ID of assigned person
  completionPercentage?: number // 0-100
  lastActivity?: Activity
  activities?: Activity[]
  recurringConfig?: RecurringTaskConfig
  comments?: Array<{
    id: string
    text: string
    userId: string
    timestamp: number
    parentId?: string // for threaded discussions
    lastEdited?: number // timestamp when comment was last edited
  }>
  metadata?: {
    complexity: "low" | "medium" | "high"
    impact: "low" | "medium" | "high"
    businessValue: number // 1-10
    learningOpportunity: number // 1-10
    domain?: string
    skillRequirements?: SkillLevel[]
    aiEligible?: boolean
    externalStakeholder?: boolean
    hasSubtasks?: boolean // Added this property
    subtaskIds?: string[] // Added this property
    parentTaskId?: string // Added this property
    performanceHistory?: {
      averageCompletionTime: number
      accuracyRate: number
    }
    timeExpectation?: number // expected completion time in minutes
    autoSplitEligible?: boolean // whether the task can be auto-split
    personalizationScore?: number // 0-100, calculated based on user match
    remindedAt?: boolean // Added for task reminders
    overdueReminded?: number // Added for tracking when we reminded about overdue tasks
    agentRecommendations?: {
      suggestedAgentType?: AgentType
      confidence: number
      reasoning: string
    }
    gamification?: {
      points: number
      badges: string[]
      achievements: string[]
      leaderboardPosition?: number
      skillProgress?: Record<string, number> // skill name -> progress (0-100)
    }
  }
}

export interface TaskInput extends Omit<Task, "id" | "createdAt" | "updatedAt" | "isTimerRunning" | "totalElapsedTime" | "lastActivity" | "activities"> {}

export interface PersonalizationPreferences {
  workloadThreshold: number // hours per week
  notificationFrequency: "high" | "medium" | "low"
  delegationPreference: "aggressive" | "balanced" | "conservative"
  communicationStyle: "formal" | "casual"
  skillFocus: string[]
  learningGoals: string[]
  agentInteractionLevel: "proactive" | "reactive" | "minimal"
  preferredAgentTypes: AgentType[]
}

export interface Agent {
  id: string
  type: AgentType
  name: string
  skills: string[]
  currentLoad: number // percentage
  assignedTasks: string[] // task IDs
  performance: {
    successRate: number
    averageTaskTime: number
    tasksCompleted: number
  }
  createdAt: number
  lastActive: number
  status: "active" | "inactive" | "overloaded"
  specializationScore: Record<string, number> // domain -> score
}

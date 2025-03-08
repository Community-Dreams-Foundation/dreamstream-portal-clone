
import { Task } from "@/types/task"
import { LeadershipTier } from "@/types/leadership"

export const getTaskWeight = (task: Task) => {
  const complexityWeight = {
    low: 1,
    medium: 1.5,
    high: 2
  }[task.metadata?.complexity || "medium"]

  const priorityWeight = {
    low: 1,
    medium: 1.5,
    high: 2
  }[task.priority || "medium"]

  return complexityWeight * priorityWeight
}

export const calculateWeightedEfficiencyScore = (completedTasks: Task[]) => {
  return completedTasks.reduce((acc, task) => {
    if (!task.actualDuration || !task.estimatedDuration) return acc
    const weight = getTaskWeight(task)
    const efficiency = task.actualDuration <= task.estimatedDuration ? 1 : 
      task.estimatedDuration / task.actualDuration
    return acc + (efficiency * weight)
  }, 0) / completedTasks.length || 0
}

export const calculateLeadershipImpactScore = (completedTasks: Task[]) => {
  return completedTasks.reduce((acc, task) => {
    const businessValue = task.metadata?.businessValue || 5
    const efficiency = task.metadata?.performanceHistory?.accuracyRate || 0.5
    const stakeholderImpact = task.metadata?.externalStakeholder ? 1.5 : 1
    return acc + (businessValue * efficiency * stakeholderImpact)
  }, 0) / (completedTasks.length || 1)
}

export const calculateInnovationScore = (tasks: Task[]) => {
  return tasks.reduce((acc, task) => {
    if (!task.metadata) return acc
    const complexity = task.metadata.complexity === 'high' ? 2 : 
                      task.metadata.complexity === 'medium' ? 1.5 : 1
    const learningOpportunity = task.metadata.learningOpportunity || 5
    return acc + (complexity * learningOpportunity / 10)
  }, 0) / (tasks.length || 1) * 100
}

export const calculateDomainPerformance = (tasks: Task[]) => {
  return tasks.reduce((acc, task) => {
    const domain = task.metadata?.domain
    if (!domain) return acc
    if (!acc[domain]) acc[domain] = { total: 0, completed: 0 }
    acc[domain].total++
    if (task.status === 'completed') acc[domain].completed++
    return acc
  }, {} as Record<string, { total: number, completed: number }>)
}

export const determineTierEligibility = (metrics: {
  taskCompletion: number;
  efficiency: number;
  impact: number;
  innovation: number;
}): LeadershipTier => {
  if (metrics.taskCompletion > 0.9 && metrics.efficiency > 0.9 && 
      metrics.impact > 8 && metrics.innovation > 0.8) {
    return "executive"
  } else if (metrics.taskCompletion > 0.8 && metrics.efficiency > 0.8 && 
             metrics.impact > 7) {
    return "product-owner"
  } else if (metrics.taskCompletion > 0.7 && metrics.efficiency > 0.7) {
    return "team-lead"
  } else if (metrics.taskCompletion > 0.6) {
    return "captain"
  }
  return "emerging"
}


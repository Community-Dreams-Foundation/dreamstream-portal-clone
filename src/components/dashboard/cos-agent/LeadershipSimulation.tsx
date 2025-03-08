
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Brain, Target, MessageSquare, Trophy } from "lucide-react"
import type { LeadershipDomain } from "@/types/leadership"

type SimulationScenario = {
  id: string
  title: string
  description: string
  domain: LeadershipDomain
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDuration: number // in minutes
  completed?: boolean
  progress?: number
  feedback?: string
  coachingPoints?: string[]
}

const SAMPLE_SCENARIOS: SimulationScenario[] = [
  {
    id: "scenario-1",
    title: "Team Conflict Resolution",
    description: "Navigate a complex conflict between team members with different working styles.",
    domain: "engagement",
    difficulty: "intermediate",
    estimatedDuration: 20,
    progress: 0,
    coachingPoints: [
      "Focus on active listening",
      "Consider each team member's perspective",
      "Work towards a collaborative solution"
    ]
  },
  {
    id: "scenario-2",
    title: "Strategic Planning Session",
    description: "Lead a strategic planning session to define quarterly objectives.",
    domain: "strategy",
    difficulty: "advanced",
    estimatedDuration: 30,
    progress: 0,
    coachingPoints: [
      "Align objectives with company vision",
      "Ensure SMART goal setting",
      "Consider resource constraints"
    ]
  },
  {
    id: "scenario-3",
    title: "Resource Allocation",
    description: "Optimize resource allocation across multiple concurrent projects.",
    domain: "product-design",
    difficulty: "intermediate",
    estimatedDuration: 25,
    progress: 0,
    coachingPoints: [
      "Balance team workload",
      "Prioritize based on business impact",
      "Consider skill requirements"
    ]
  }
]

export function LeadershipSimulation() {
  const [selectedDomain, setSelectedDomain] = useState<LeadershipDomain>("strategy")
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(SAMPLE_SCENARIOS)
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null)

  const filteredScenarios = selectedDomain === "strategy" 
    ? scenarios 
    : scenarios.filter(s => s.domain === selectedDomain)

  const startScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId)
    if (scenario) {
      setActiveScenario(scenario)
      setScenarios(prev => prev.map(s => {
        if (s.id === scenarioId) {
          return { ...s, progress: 0 }
        }
        return s
      }))
    }
  }

  const simulateProgress = (scenarioId: string) => {
    setScenarios(prev => prev.map(s => {
      if (s.id === scenarioId) {
        const newProgress = Math.min((s.progress || 0) + 20, 100)
        return { 
          ...s, 
          progress: newProgress,
          completed: newProgress === 100,
          feedback: newProgress === 100 ? "Great job! You've successfully completed this scenario." : undefined
        }
      }
      return s
    }))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Scenarios
          </TabsTrigger>
          <TabsTrigger value="coaching" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Coaching
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Leadership Simulation</h3>
            <Select
              value={selectedDomain}
              onValueChange={(value: LeadershipDomain) => setSelectedDomain(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strategy">Strategy</SelectItem>
                <SelectItem value="product-design">Product Design</SelectItem>
                <SelectItem value="data-engineering">Data Engineering</SelectItem>
                <SelectItem value="software-development">Software Development</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredScenarios.map((scenario) => (
              <Card key={scenario.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{scenario.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {scenario.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{scenario.difficulty}</Badge>
                      <Badge variant="outline">{scenario.estimatedDuration} min</Badge>
                      <Badge variant="outline">{scenario.domain}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => startScenario(scenario.id)}
                      disabled={scenario.completed}
                    >
                      {scenario.completed ? "Completed" : "Start Simulation"}
                    </Button>
                    {!scenario.completed && scenario.progress !== undefined && scenario.progress > 0 && (
                      <Button
                        size="sm"
                        onClick={() => simulateProgress(scenario.id)}
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
                {typeof scenario.progress === "number" && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{scenario.progress}%</span>
                    </div>
                    <Progress value={scenario.progress} />
                    {scenario.feedback && (
                      <p className="text-sm text-green-600 mt-2">{scenario.feedback}</p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coaching" className="space-y-4">
          {activeScenario ? (
            <Card className="p-4">
              <h4 className="font-medium mb-4">Coaching Points for: {activeScenario.title}</h4>
              <ul className="space-y-2">
                {activeScenario.coachingPoints?.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 mt-1 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-2 font-semibold">No Active Scenario</h3>
              <p className="text-muted-foreground">Start a scenario to receive coaching feedback</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card className="p-4">
            <h4 className="font-medium mb-4">Overall Progress</h4>
            <div className="space-y-4">
              {Object.entries(
                scenarios.reduce((acc, scenario) => {
                  const domain = scenario.domain
                  if (!acc[domain]) {
                    acc[domain] = { total: 0, completed: 0 }
                  }
                  acc[domain].total++
                  if (scenario.completed) {
                    acc[domain].completed++
                  }
                  return acc
                }, {} as Record<string, { total: number; completed: number }>)
              ).map(([domain, stats]) => (
                <div key={domain} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{domain}</span>
                    <span className="text-muted-foreground">
                      {stats.completed}/{stats.total} completed
                    </span>
                  </div>
                  <Progress
                    value={(stats.completed / stats.total) * 100}
                  />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


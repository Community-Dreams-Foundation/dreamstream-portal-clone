
import React from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { LeadershipDomain } from "@/types/leadership"

interface SimulationScenario {
  id: string
  title: string
  description: string
  domain: LeadershipDomain
  difficulty: "beginner" | "intermediate" | "advanced"
  metrics: {
    delegationAccuracy?: number
    teamEfficiency?: number
    communicationScore?: number
    overallScore?: number
    innovationScore?: number
    mentorshipScore?: number
  }
}

const defaultScenarios: SimulationScenario[] = [
  {
    id: "scenario-1",
    title: "Team Conflict Resolution",
    description: "Handle a conflict between team members while maintaining productivity",
    domain: "strategy",
    difficulty: "intermediate",
    metrics: {
      delegationAccuracy: 85,
      teamEfficiency: 75,
      communicationScore: 80
    }
  },
  {
    id: "scenario-2",
    title: "Strategic Decision Making",
    description: "Make critical decisions under time pressure with limited information",
    domain: "strategy",
    difficulty: "advanced",
    metrics: {
      overallScore: 90,
      innovationScore: 85,
      mentorshipScore: 70
    }
  },
]

export function LeadershipSimulation() {
  const [activeScenario, setActiveScenario] = React.useState<SimulationScenario | null>(null)
  const [isSimulating, setIsSimulating] = React.useState(false)

  const startSimulation = (scenario: SimulationScenario) => {
    setActiveScenario(scenario)
    setIsSimulating(true)
  }

  const completeSimulation = () => {
    setIsSimulating(false)
    setActiveScenario(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items
-center justify-between">
        <h2 className="text-2xl font-bold">Leadership Simulation</h2>
      </div>

      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          {defaultScenarios.map((scenario) => (
            <div key={scenario.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{scenario.title}</h3>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{scenario.domain}</Badge>
                    <Badge variant="outline">{scenario.difficulty}</Badge>
                  </div>
                </div>
                <button
                  onClick={() => startSimulation(scenario)}
                  disabled={isSimulating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
                >
                  Start Simulation
                </button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="metrics">
          <div className="rounded-lg border p-4">
            {activeScenario ? (
              <div className="space-y-4">
                <h3 className="font-semibold">Current Simulation Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(activeScenario.metrics).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{key}</p>
                      <p className="text-lg font-semibold">{value}%</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={completeSimulation}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
                >
                  Complete Simulation
                </button>
              </div>
            ) : (
              <p className="text-muted-foreground">No active simulation</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-4">AI-Driven Insights</h3>
            <p className="text-sm text-muted-foreground">
              Real-time AI analysis of your leadership performance will appear here during simulations.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import type { Agent } from "@/types/task"
import { Play, Pause, RotateCw } from "lucide-react"

interface AgentSimulationProps {
  assessmentId: string;
}

export function AgentSimulation({ assessmentId }: AgentSimulationProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentScenario, setCurrentScenario] = useState(0)

  const scenarios = [
    {
      title: "Team Resource Allocation",
      description: "Distribute tasks among team members based on their skills and workload",
      duration: 300 // 5 minutes in seconds
    },
    {
      title: "Crisis Management",
      description: "Handle an unexpected system failure while maintaining team morale",
      duration: 420 // 7 minutes in seconds
    },
    {
      title: "Strategic Planning",
      description: "Plan and delegate a complex project with multiple dependencies",
      duration: 600 // 10 minutes in seconds
    }
  ]

  const toggleSimulation = () => {
    setIsRunning(!isRunning)
    if (!isRunning && progress < 100) {
      runSimulation()
    }
  }

  const runSimulation = () => {
    const scenario = scenarios[currentScenario]
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          if (currentScenario < scenarios.length - 1) {
            setCurrentScenario(prev => prev + 1)
          }
          return 100
        }
        return prev + (100 / (scenario.duration * 10)) // Update every 100ms
      })
    }, 100)
  }

  const resetSimulation = () => {
    setProgress(0)
    setCurrentScenario(0)
    setIsRunning(false)
  }

  const currentScenarioData = scenarios[currentScenario]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{currentScenarioData.title}</h3>
          <p className="text-sm text-muted-foreground">
            {currentScenarioData.description}
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSimulation}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetSimulation}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Progress value={progress} className="w-full" />

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-medium mb-2">Active Agents</h4>
          <div className="space-y-2">
            <AgentStatus
              name="Data Analysis Agent"
              status="active"
              load={75}
            />
            <AgentStatus
              name="Project Management Agent"
              status="active"
              load={45}
            />
            <AgentStatus
              name="Content Creation Agent"
              status="inactive"
              load={0}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2">Scenario Progress</h4>
          <div className="space-y-1">
            {scenarios.map((scenario, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className={
                  index === currentScenario
                    ? "font-medium"
                    : "text-muted-foreground"
                }>
                  {scenario.title}
                </span>
                {index < currentScenario ? (
                  <span className="text-green-500">Completed</span>
                ) : index === currentScenario ? (
                  <span className="text-blue-500">In Progress</span>
                ) : (
                  <span className="text-muted-foreground">Pending</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function AgentStatus({ name, status, load }: { name: string; status: "active" | "inactive"; load: number }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground capitalize">{status}</p>
      </div>
      {status === "active" && (
        <Progress value={load} className="w-20" />
      )}
    </div>
  )
}

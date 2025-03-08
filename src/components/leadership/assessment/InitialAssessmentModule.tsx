
import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, set, get } from "firebase/database"
import type { LeadershipAssessment } from "@/types/leadership"
import { AgentSimulation } from "./AgentSimulation"
import { PerformanceTracking } from "./PerformanceTracking"
import { AssessmentResults } from "./AssessmentResults"
import { useQuery } from "@tanstack/react-query"

export function InitialAssessmentModule() {
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const { data: activeAssessment } = useQuery({
    queryKey: ['leadershipAssessment', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null
      const db = getDatabase()
      const assessmentRef = ref(db, `users/${currentUser.uid}/currentAssessment`)
      const snapshot = await get(assessmentRef)
      return snapshot.exists() ? snapshot.val() as LeadershipAssessment : null
    },
    enabled: !!currentUser
  })

  const startNewAssessment = async () => {
    if (!currentUser) return

    const newAssessment: LeadershipAssessment = {
      id: `assessment-${Date.now()}`,
      userId: currentUser.uid,
      projectId: "initial-assessment",
      startDate: Date.now(),
      endDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days duration
      status: "in-progress",
      metrics: {
        assessmentId: `assessment-${Date.now()}`,
        userId: currentUser.uid,
        tier: "emerging",
        averageTaskTime: 0,
        tasksCompleted: 0,
        delegationAccuracy: 0,
        teamEfficiency: 0,
        overallScore: 0,
        feedback: "",
        timestamp: Date.now()
      }
    }

    const db = getDatabase()
    await set(ref(db, `users/${currentUser.uid}/currentAssessment`), newAssessment)
    
    toast({
      title: "Assessment Started",
      description: "Your leadership assessment has begun. Complete all sections to receive your results.",
    })
  }

  if (!activeAssessment) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Leadership Assessment</h2>
          <p className="text-muted-foreground">
            Begin your leadership journey by taking our comprehensive assessment.
            This will help us understand your current capabilities and create a
            personalized development path.
          </p>
          <Button onClick={startNewAssessment}>Start Assessment</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Leadership Assessment</h2>
        <Tabs defaultValue="simulation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="simulation">Agent Simulation</TabsTrigger>
            <TabsTrigger value="tracking">Performance Tracking</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          <TabsContent value="simulation">
            <AgentSimulation assessmentId={activeAssessment.id} />
          </TabsContent>
          <TabsContent value="tracking">
            <PerformanceTracking assessmentId={activeAssessment.id} />
          </TabsContent>
          <TabsContent value="results">
            <AssessmentResults assessment={activeAssessment} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

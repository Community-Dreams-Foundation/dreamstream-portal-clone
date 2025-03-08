
import React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InitialAssessment } from "./InitialAssessment"
import { AgentSimulation } from "./AgentSimulation"
import { AssessmentResults } from "./AssessmentResults"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, get } from "firebase/database"
import type { LeadershipAssessment } from "@/types/leadership"

export function LeadershipAssessmentModule() {
  const { currentUser } = useAuth();
  
  const { data: activeAssessment } = useQuery({
    queryKey: ['leadershipAssessment', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      const db = getDatabase();
      const assessmentRef = ref(db, `users/${currentUser.uid}/currentAssessment`);
      const snapshot = await get(assessmentRef);
      return snapshot.exists() ? snapshot.val() as LeadershipAssessment : null;
    },
    enabled: !!currentUser
  });

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
            <AgentSimulation assessmentId={activeAssessment?.id || ''} />
          </TabsContent>
          <TabsContent value="tracking">
            <InitialAssessment />
          </TabsContent>
          <TabsContent value="results">
            {activeAssessment && <AssessmentResults assessment={activeAssessment} />}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

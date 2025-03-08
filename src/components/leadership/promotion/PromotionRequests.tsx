
import { useQuery } from "@tanstack/react-query"
import { getDatabase, ref, get, update } from "firebase/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { PromotionRequest } from "@/types/leadership"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function PromotionRequests() {
  const { currentUser } = useAuth()
  const [feedback, setFeedback] = useState<Record<string, string>>({})

  const { data: requests, refetch } = useQuery({
    queryKey: ['promotionRequests'],
    queryFn: async () => {
      const db = getDatabase()
      const requestsRef = ref(db, 'promotionRequests')
      const snapshot = await get(requestsRef)
      if (!snapshot.exists()) return []
      
      const allRequests: PromotionRequest[] = []
      Object.values(snapshot.val()).forEach((userRequests: any) => {
        Object.values(userRequests).forEach((request: PromotionRequest) => {
          if (request.status === "pending") {
            allRequests.push(request)
          }
        })
      })
      return allRequests
    },
    enabled: !!currentUser?.role && ["team-lead", "product-owner", "executive"].includes(currentUser.role)
  })

  const handleReview = async (requestId: string, userId: string, approved: boolean) => {
    const db = getDatabase()
    const requestRef = ref(db, `promotionRequests/${userId}/${requestId}`)
    
    try {
      await update(requestRef, {
        status: approved ? "approved" : "rejected",
        reviewedAt: Date.now(),
        reviewedBy: currentUser?.uid,
        feedback: feedback[requestId] || ""
      })

      if (approved) {
        const profileRef = ref(db, `users/${userId}/leadership`)
        const snapshot = await get(profileRef)
        const profile = snapshot.val()
        
        if (profile) {
          await update(profileRef, {
            currentTier: profile.requestedTier,
            promotionHistory: [
              ...(profile.promotionHistory || []),
              {
                fromTier: profile.currentTier,
                toTier: profile.requestedTier,
                timestamp: Date.now(),
                approvedBy: currentUser?.uid
              }
            ]
          })
        }
      }

      toast({
        title: `Promotion ${approved ? "Approved" : "Rejected"}`,
        description: `The promotion request has been ${approved ? "approved" : "rejected"}.`,
      })
      
      refetch()
    } catch (error) {
      console.error("Error reviewing promotion:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the promotion review.",
      })
    }
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Promotion Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No pending promotion requests
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Promotion Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Promotion Request</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{request.currentTier}</Badge>
                    →
                    <Badge>{request.requestedTier}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(request.submittedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Metrics</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tasks Completed</p>
                    <p className="font-medium">{request.metrics.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Team Efficiency</p>
                    <p className="font-medium">{(request.metrics.teamEfficiency * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Overall Score</p>
                    <p className="font-medium">{request.metrics.overallScore}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delegation Accuracy</p>
                    <p className="font-medium">{(request.metrics.delegationAccuracy * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              <Textarea
                placeholder="Provide feedback (required for rejection)"
                value={feedback[request.id] || ""}
                onChange={(e) => setFeedback(prev => ({
                  ...prev,
                  [request.id]: e.target.value
                }))}
                className="min-h-[100px]"
              />

              <div className="flex items-center gap-4">
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleReview(request.id, request.userId, false)}
                  disabled={!feedback[request.id]}
                >
                  Reject
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={() => handleReview(request.id, request.userId, true)}
                >
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}


import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LeadershipTier } from "@/types/leadership"
import { getDatabase, ref, push } from "firebase/database"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const tierNames: Record<LeadershipTier, string> = {
  emerging: "Emerging Leader",
  captain: "Captain",
  "team-lead": "Team Lead",
  "product-owner": "Product Owner",
  executive: "Executive"
}

export function PromotionRequestForm({ 
  currentTier, 
  onRequestSubmitted 
}: { 
  currentTier: LeadershipTier,
  onRequestSubmitted?: () => void 
}) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [targetTier, setTargetTier] = useState<LeadershipTier | null>(null)
  const [justification, setJustification] = useState("")
  
  // Get available next tiers based on current tier
  const getAvailableTiers = (): LeadershipTier[] => {
    switch (currentTier) {
      case "emerging":
        return ["captain"]
      case "captain":
        return ["team-lead"]
      case "team-lead":
        return ["product-owner"]
      case "product-owner":
        return ["executive"]
      case "executive":
        return []
      default:
        return []
    }
  }
  
  const availableTiers = getAvailableTiers()
  
  const promotionRequestMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.uid || !targetTier) return
      
      const db = getDatabase()
      const requestsRef = ref(db, 'promotionRequests')
      
      return push(requestsRef, {
        userId: currentUser.uid,
        currentTier,
        requestedTier: targetTier,
        justification,
        status: "pending",
        submittedAt: Date.now()
      })
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your leadership promotion request has been submitted for review.",
      })
      setTargetTier(null)
      setJustification("")
      if (onRequestSubmitted) {
        onRequestSubmitted()
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit promotion request. Please try again later.",
      })
      console.error("Error submitting promotion request:", error)
    }
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetTier) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a target leadership tier.",
      })
      return
    }
    
    if (justification.length < 50) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a detailed justification (at least 50 characters).",
      })
      return
    }
    
    promotionRequestMutation.mutate()
  }
  
  if (availableTiers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leadership Promotion</CardTitle>
          <CardDescription>
            Request to advance to the next leadership tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Promotions Available</AlertTitle>
            <AlertDescription>
              You have reached the highest leadership tier or no promotions are available at this time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leadership Promotion</CardTitle>
        <CardDescription>
          Request to advance to the next leadership tier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="mb-2">Current Tier: <span className="font-medium">{tierNames[currentTier]}</span></p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <label htmlFor="targetTier" className="text-sm font-medium">
              Target Leadership Tier
            </label>
            <Select onValueChange={(value) => setTargetTier(value as LeadershipTier)}>
              <SelectTrigger>
                <SelectValue placeholder="Select target tier" />
              </SelectTrigger>
              <SelectContent>
                {availableTiers.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {tierNames[tier]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="justification" className="text-sm font-medium">
              Justification
            </label>
            <Textarea
              id="justification"
              placeholder="Explain why you should be promoted to this tier..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide specific examples of your leadership contributions, achievements, and impact.
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={promotionRequestMutation.isPending}
          >
            {promotionRequestMutation.isPending ? "Submitting..." : "Submit Promotion Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

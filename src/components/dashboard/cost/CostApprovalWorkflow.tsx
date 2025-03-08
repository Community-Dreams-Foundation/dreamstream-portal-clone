
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { requestCostApproval } from "@/utils/tasks/progressOperations"

interface CostApprovalWorkflowProps {
  taskId: string
  amount: number
}

export function CostApprovalWorkflow({ taskId, amount }: CostApprovalWorkflowProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending")
  
  const handleApprovalRequest = async () => {
    if (!currentUser) return
    
    try {
      const justification = `Cost approval request for $${amount} on task ${taskId}`
      await requestCostApproval(currentUser.uid, taskId, amount, justification)
      
      toast({
        title: "Approval Request Submitted",
        description: "Your cost approval request has been submitted for review.",
      })
      
      setStatus("pending")
    } catch (error) {
      console.error("Error requesting approval:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit approval request. Please try again."
      })
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {status === "pending" && <AlertCircle className="text-yellow-500" />}
          {status === "approved" && <CheckCircle className="text-green-500" />}
          {status === "rejected" && <XCircle className="text-red-500" />}
          <h3 className="text-lg font-semibold">Cost Approval Status</h3>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cost Threshold Exceeded</AlertTitle>
          <AlertDescription>
            This task requires approval as it exceeds the cost threshold of ${amount}.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setStatus("rejected")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprovalRequest}
            disabled={status === "approved"}
          >
            Request Approval
          </Button>
        </div>
      </div>
    </Card>
  )
}

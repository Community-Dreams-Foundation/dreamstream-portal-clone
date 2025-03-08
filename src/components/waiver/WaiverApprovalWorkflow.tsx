
import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, update } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"

interface WaiverApprovalWorkflowProps {
  waiverId: string
  waiverData: {
    type: string
    status: string
    recruit_count?: number
    approved_duration?: string
    requestor_id: string
    request_date: string
    details: string
  }
  isOpen: boolean
  onClose: () => void
  onApprovalComplete: () => void
}

export function WaiverApprovalWorkflow({
  waiverId,
  waiverData,
  isOpen,
  onClose,
  onApprovalComplete,
}: WaiverApprovalWorkflowProps) {
  const [reviewComments, setReviewComments] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const { addNotification } = useNotifications()

  const handleApproval = async (approved: boolean) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to approve waivers",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const db = getDatabase()
      const waiverRef = ref(db, `waivers/${waiverId}`)
      const status = approved ? "approved" : "rejected"

      await update(waiverRef, {
        status,
        review_comments: reviewComments,
        reviewer_id: currentUser.uid,
        review_date: new Date().toISOString(),
      })

      // Send notification to the requestor
      await addNotification({
        title: `Waiver ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your ${waiverData.type} waiver request has been ${status}. ${
          reviewComments ? `Comments: ${reviewComments}` : ""
        }`,
        type: "waiver",
        metadata: {
          waiverId,
          priority: status === "rejected" ? "high" : "medium",
          actionRequired: status === "rejected",
          action: {
            type: "view_waiver",
            link: `/waivers/${waiverId}`,
          },
        },
      })

      toast({
        title: "Success",
        description: `Waiver has been ${status}.`,
      })

      onApprovalComplete()
      onClose()
    } catch (error) {
      console.error("Error processing waiver:", error)
      toast({
        title: "Error",
        description: "Failed to process waiver. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Review Waiver Request
          </DialogTitle>
          <DialogDescription>
            Review the waiver request details and provide your decision.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Type:</span>
              <Badge variant="secondary">{waiverData.type}</Badge>
            </div>
            {waiverData.recruit_count && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Recruits:</span>
                <span>{waiverData.recruit_count}</span>
              </div>
            )}
            {waiverData.approved_duration && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Duration:</span>
                <span>{waiverData.approved_duration}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-medium">Request Date:</span>
              <span>{new Date(waiverData.request_date).toLocaleDateString()}</span>
            </div>
            <div className="mt-2">
              <span className="font-medium">Details:</span>
              <p className="mt-1 text-sm text-muted-foreground">{waiverData.details}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="comments" className="text-sm font-medium">
              Review Comments
            </label>
            <Textarea
              id="comments"
              placeholder="Add your review comments here..."
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex w-full gap-2 sm:justify-end">
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleApproval(false)}
              disabled={isProcessing}
              className="flex-1 sm:flex-none"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              type="button"
              onClick={() => handleApproval(true)}
              disabled={isProcessing}
              className="flex-1 sm:flex-none"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

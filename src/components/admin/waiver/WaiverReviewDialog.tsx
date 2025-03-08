
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
import { useState } from "react"
import type { WaiverRequest } from "@/types/waiver"
import { Badge } from "@/components/ui/badge"
import { WaiverService } from "@/services/WaiverService"
import { useToast } from "@/hooks/use-toast"

interface WaiverReviewDialogProps {
  waiver: WaiverRequest
  open: boolean
  onOpenChange: (open: boolean) => void
  onReviewComplete: () => void
}

export function WaiverReviewDialog({
  waiver,
  open,
  onOpenChange,
  onReviewComplete,
}: WaiverReviewDialogProps) {
  const [reviewComments, setReviewComments] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleReview = async (status: "approved" | "rejected") => {
    setIsProcessing(true)
    try {
      await WaiverService.updateWaiverStatus(waiver.waiver_id, status, reviewComments)
      toast({
        title: "Waiver Review Complete",
        description: `The waiver has been ${status}.`,
      })
      onReviewComplete()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process waiver review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review Waiver Request</DialogTitle>
          <DialogDescription>
            Review the waiver request details and provide your decision.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Type:</span>
              <Badge>{waiver.type}</Badge>
            </div>
            {waiver.recruit_count && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Recruits:</span>
                <span>{waiver.recruit_count}</span>
              </div>
            )}
            {waiver.approved_duration && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Duration:</span>
                <span>{waiver.approved_duration}</span>
              </div>
            )}
          </div>
          <Textarea
            placeholder="Add review comments..."
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleReview("rejected")}
            disabled={isProcessing}
          >
            Reject
          </Button>
          <Button
            type="button"
            onClick={() => handleReview("approved")}
            disabled={isProcessing}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

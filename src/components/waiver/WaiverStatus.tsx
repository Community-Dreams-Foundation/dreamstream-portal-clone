
import { Badge } from "@/components/ui/badge"

interface WaiverStatusProps {
  status: "pending" | "approved" | "rejected"
}

export function WaiverStatus({ status }: WaiverStatusProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "secondary" as const,
    },
    approved: {
      label: "Approved",
      variant: "success" as const,
    },
    rejected: {
      label: "Rejected",
      variant: "destructive" as const,
    },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

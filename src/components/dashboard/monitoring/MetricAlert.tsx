
import { LucideIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface MetricAlertProps {
  icon: LucideIcon
  title: string
  value: number
  maxValue?: number
  description: string
  suffix?: string
  showProgress?: boolean
}

export function MetricAlert({ 
  icon: Icon, 
  title, 
  value, 
  maxValue = 100, 
  description, 
  suffix = "", 
  showProgress = false 
}: MetricAlertProps) {
  const progress = (value / maxValue) * 100

  return (
    <Alert className="relative overflow-hidden">
      <Icon className="h-4 w-4 text-primary" />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {value.toFixed(1)}{suffix}
          </span>
          <span className="text-sm text-muted-foreground">
            {description}
          </span>
        </div>
        
        {showProgress && (
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

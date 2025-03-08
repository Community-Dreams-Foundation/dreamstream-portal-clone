
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Building,
  CheckCircle2,
  Clock,
  MessagesSquare,
  Timer
} from "lucide-react"
import type { RecruitmentFunnel as RecruitmentFunnelType } from "@/types/agent"

interface RecruitmentFunnelProps {
  data: RecruitmentFunnelType;
}

export function RecruitmentFunnel({ data }: RecruitmentFunnelProps) {
  const getStageIcon = (status: string) => {
    switch (status) {
      case "researching":
        return <Building className="h-4 w-4" />
      case "applied":
        return <CheckCircle2 className="h-4 w-4" />
      case "interviewing":
        return <MessagesSquare className="h-4 w-4" />
      case "offered":
        return <Timer className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recruitment Pipeline</h3>
          <Badge variant="secondary">
            {data.metrics.activeProcesses} Active
          </Badge>
        </div>

        <div className="space-y-6">
          {data.stages.map((stage) => (
            <div key={stage.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.name}</span>
                <span className="text-muted-foreground">
                  {stage.companies.length} companies
                </span>
              </div>

              <div className="space-y-2">
                {stage.companies.map((company) => (
                  <div key={company.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStageIcon(company.status)}
                        <span>{company.name}</span>
                      </div>
                      <Badge
                        variant={company.status === "offered" ? "default" : "outline"}
                      >
                        {company.status}
                      </Badge>
                    </div>
                    {company.probability !== undefined && (
                      <Progress
                        value={company.probability}
                        className="h-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {(data.metrics.successRate * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Success Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round(data.metrics.averageTimeToOffer / (24 * 60 * 60 * 1000))}d
            </div>
            <div className="text-sm text-muted-foreground">
              Avg. Time to Offer
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}


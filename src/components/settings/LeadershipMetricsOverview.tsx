
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Trophy, 
  Users, 
  Target, 
  Star, 
  Award, 
  BarChart,
  Zap 
} from "lucide-react"
import { LeadershipProfile, LeadershipTier } from "@/types/leadership"

const tierColors: Record<LeadershipTier, string> = {
  emerging: "bg-blue-500",
  captain: "bg-green-500",
  "team-lead": "bg-purple-500",
  "product-owner": "bg-orange-500",
  executive: "bg-red-500"
}

const tierNames: Record<LeadershipTier, string> = {
  emerging: "Emerging Leader",
  captain: "Captain",
  "team-lead": "Team Lead",
  "product-owner": "Product Owner",
  executive: "Executive"
}

interface LeadershipMetricsOverviewProps {
  profile: LeadershipProfile
}

export function LeadershipMetricsOverview({ profile }: LeadershipMetricsOverviewProps) {
  const { currentTier, metrics } = profile
  
  // Calculate progress to next tier
  const getTierProgress = (): number => {
    switch (currentTier) {
      case "emerging":
        return Math.min(100, (metrics.overallScore / 70) * 100)
      case "captain":
        return Math.min(100, (metrics.overallScore / 80) * 100)
      case "team-lead":
        return Math.min(100, (metrics.overallScore / 85) * 100)
      case "product-owner":
        return Math.min(100, (metrics.overallScore / 90) * 100)
      case "executive":
        return 100
      default:
        return 0
    }
  }

  const nextTier = (): LeadershipTier | null => {
    switch (currentTier) {
      case "emerging":
        return "captain"
      case "captain":
        return "team-lead"
      case "team-lead":
        return "product-owner"
      case "product-owner":
        return "executive"
      default:
        return null
    }
  }
  
  const tierProgress = getTierProgress()
  const next = nextTier()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Leadership Metrics</span>
          <Badge 
            className={`${tierColors[currentTier]} text-white`}
          >
            {tierNames[currentTier]}
          </Badge>
        </CardTitle>
        <CardDescription>
          Your performance and progress overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {next && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress to {tierNames[next]}</span>
              <span className="text-sm text-muted-foreground">{Math.round(tierProgress)}%</span>
            </div>
            <Progress value={tierProgress} className="h-2" />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <p className="text-sm font-medium">Overall Score</p>
            </div>
            <p className="mt-1 text-xl font-semibold">{metrics.overallScore}</p>
          </Card>
          
          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-purple-500" />
              <p className="text-sm font-medium">Leaderboard Rank</p>
            </div>
            <p className="mt-1 text-xl font-semibold">#{metrics.leaderboardRank}</p>
          </Card>
          
          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium">Team Impact</p>
            </div>
            <p className="mt-1 text-xl font-semibold">{metrics.mentorshipScore || "-"}</p>
          </Card>
          
          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium">Innovation</p>
            </div>
            <p className="mt-1 text-xl font-semibold">{metrics.innovationImpact || "-"}</p>
          </Card>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium text-sm mb-3 flex items-center">
            <Award className="h-4 w-4 mr-1 text-indigo-500" />
            Leadership Development
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BarChart className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-sm">Project Delivery</span>
              </div>
              <Badge variant="outline">{metrics.projectDeliveryRate || "-"}%</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-green-400" />
                <span className="text-sm">Team Growth</span>
              </div>
              <Badge variant="outline">{metrics.teamGrowthRate || "-"}%</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                <span className="text-sm">Team Efficiency</span>
              </div>
              <Badge variant="outline">{metrics.teamEfficiency || "-"}%</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Medal, Award, Trophy, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: "medal" | "award" | "trophy" | "star";
  category: "achievement" | "skill" | "participation" | "special";
  earnedAt?: number;
  isUnlocked: boolean;
}

interface BadgeShowcaseProps {
  badges: BadgeData[];
  title?: string;
}

export function BadgeShowcase({ badges, title = "Recent Badges" }: BadgeShowcaseProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "achievement": return "bg-green-100 text-green-800";
      case "skill": return "bg-blue-100 text-blue-800";
      case "participation": return "bg-purple-100 text-purple-800";
      case "special": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case "medal": return <Medal className="w-5 h-5" />;
      case "award": return <Award className="w-5 h-5" />;
      case "trophy": return <Trophy className="w-5 h-5" />;
      case "star": return <Star className="w-5 h-5" />;
      default: return <Medal className="w-5 h-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {badges.map((badge) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all",
                      badge.isUnlocked 
                        ? "bg-card border hover:border-primary cursor-pointer" 
                        : "bg-gray-100 opacity-50 border-dashed border-gray-300 cursor-not-allowed"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                        badge.isUnlocked ? getCategoryColor(badge.category) : "bg-gray-200 text-gray-400"
                      )}
                    >
                      {getIcon(badge.icon)}
                    </div>
                    <span className="text-xs text-center font-medium truncate w-full">
                      {badge.name}
                    </span>
                    {badge.isUnlocked && badge.earnedAt && (
                      <Badge 
                        variant="outline" 
                        className="absolute -top-2 -right-2 text-[10px] px-1 py-0"
                      >
                        New
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-xs opacity-70">
                        Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                    {!badge.isUnlocked && (
                      <p className="text-xs text-yellow-600">Complete challenges to unlock</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

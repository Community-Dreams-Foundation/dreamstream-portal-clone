
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ExperienceProgressProps {
  level: number
  experience: number
  experienceToNextLevel: number
}

export function ExperienceProgress({ level, experience, experienceToNextLevel }: ExperienceProgressProps) {
  const experienceProgress = (experience / experienceToNextLevel) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">Level {level}</span>
        </div>
        <Badge variant="secondary">
          {experience} / {experienceToNextLevel} XP
        </Badge>
      </div>
      <Progress value={experienceProgress} className="h-2" />
    </div>
  );
}



import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Brain, 
  TrendingUp, 
  Star, 
  Zap, 
  Award, 
  BookOpen 
} from "lucide-react";

interface LearningInsightsProps {
  adaptiveScore: number;
  learningProfile: any;
}

export function LearningInsights({ adaptiveScore, learningProfile }: LearningInsightsProps) {
  if (!learningProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Learning Insights
          </CardTitle>
          <CardDescription>
            Not enough data yet. Your CoS agent is still learning about your preferences.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Find top skills based on positive feedback
  const topSkills = Object.entries(learningProfile.skillInterests || {})
    .map(([skill, data]: [string, any]) => ({
      skill,
      score: data.positive / (data.total || 1)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  // Calculate recommendation type preferences
  const typePreferences = Object.entries(learningProfile.preferredRecommendationTypes || {})
    .map(([type, data]: [string, any]) => ({
      type,
      score: data.positive / (data.total || 1) * 100
    }))
    .sort((a, b) => b.score - a.score);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Learning Insights
        </CardTitle>
        <CardDescription>
          Your CoS agent's understanding of your preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Adaptive Score</h4>
            <span className="text-sm font-bold">{adaptiveScore}%</span>
          </div>
          <Progress value={adaptiveScore} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Based on how well recommendations match your preferences
          </p>
        </div>
        
        {topSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Top Skill Interests
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {topSkills.map(skill => (
                <div 
                  key={skill.skill} 
                  className="p-2 bg-muted rounded-md text-center"
                >
                  <span className="text-xs font-medium">{skill.skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {typePreferences.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Recommendation Preferences
            </h4>
            {typePreferences.slice(0, 3).map(pref => (
              <div key={pref.type} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs capitalize">{pref.type}</span>
                  <span className="text-xs">{Math.round(pref.score)}%</span>
                </div>
                <Progress value={pref.score} className="h-1" />
              </div>
            ))}
          </div>
        )}
        
        <div className="pt-2 border-t">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Learning Progress
          </h4>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Feedback provided: {learningProfile.feedbackHistory?.length || 0}</span>
            <span>Skills tracked: {Object.keys(learningProfile.skillInterests || {}).length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ThumbsUp, 
  ThumbsDown, 
  Timer, 
  BrainCircuit, 
  ChevronRight, 
  Bot, 
  Play, 
  Calendar, 
  Bookmark, 
  Info, 
  BarChart
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { CoSRecommendation } from "@/types/task"

interface RecommendationsProps {
  recommendations: CoSRecommendation[];
  onFeedback: (recId: string, feedback: "positive" | "negative") => void;
  onAction?: (recId: string, actionType: string) => void;
}

export function Recommendations({ recommendations, onFeedback, onAction }: RecommendationsProps) {
  const getRecommendationIcon = (type: CoSRecommendation["type"]) => {
    switch (type) {
      case "task":
        return <Timer className="h-4 w-4 text-blue-500" />
      case "time":
        return <BrainCircuit className="h-4 w-4 text-green-500" />
      case "leadership":
        return <ChevronRight className="h-4 w-4 text-purple-500" />
      case "agent":
        return <Bot className="h-4 w-4 text-orange-500" />
      case "learning":
        return <Bookmark className="h-4 w-4 text-teal-500" />
      case "efficiency":
        return <Calendar className="h-4 w-4 text-indigo-500" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const getActionButtons = (rec: CoSRecommendation) => {
    if (!onAction) return null;
    
    const actionButtons = [];
    
    if (rec.type === "task") {
      actionButtons.push(
        <Button 
          key="start"
          variant="outline" 
          size="sm" 
          className="h-8 flex items-center gap-1 text-xs"
          onClick={() => onAction(rec.id, "start")}
        >
          <Play className="h-3 w-3" /> Start Task
        </Button>
      );
    }
    
    if (rec.type === "learning") {
      actionButtons.push(
        <Button 
          key="view"
          variant="outline" 
          size="sm" 
          className="h-8 flex items-center gap-1 text-xs"
          onClick={() => onAction(rec.id, "view")}
        >
          <Info className="h-3 w-3" /> View Resource
        </Button>
      );
    }
    
    if (rec.type === "efficiency" || rec.type === "time") {
      actionButtons.push(
        <Button 
          key="apply"
          variant="outline" 
          size="sm" 
          className="h-8 flex items-center gap-1 text-xs"
          onClick={() => onAction(rec.id, "apply")}
        >
          <Calendar className="h-3 w-3" /> Apply
        </Button>
      );
    }
    
    return actionButtons.length > 0 ? (
      <div className="flex gap-2 mt-2">
        {actionButtons}
      </div>
    ) : null;
  }

  // Group recommendations by type
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.type]) {
      acc[rec.type] = [];
    }
    acc[rec.type].push(rec);
    return acc;
  }, {} as Record<string, CoSRecommendation[]>);

  const typeLabels: Record<string, string> = {
    task: "Task Management",
    time: "Time Management",
    leadership: "Leadership Development",
    agent: "Agent Suggestions",
    learning: "Learning Opportunities",
    efficiency: "Efficiency Improvements"
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedRecommendations).map(([type, recs]) => (
        <div key={type} className="space-y-3">
          <div className="flex items-center gap-2">
            {getRecommendationIcon(type as CoSRecommendation["type"])}
            <h3 className="text-sm font-medium">{typeLabels[type] || type}</h3>
          </div>
          
          <div className="space-y-3">
            {recs.map((rec) => (
              <Card key={rec.id} className="p-4 relative group hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                      
                      {rec.impact !== undefined && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1">
                                <BarChart className="h-3 w-3 text-muted-foreground" />
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  Impact: {rec.impact}%
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Estimated improvement to your productivity</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {rec.actualDuration !== undefined && (
                        <Badge variant="outline" className="text-sky-500">
                          {rec.actualDuration}m
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm">{rec.content}</p>
                    
                    {getActionButtons(rec)}
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => onFeedback(rec.id, "positive")}
                        disabled={rec.feedback === "positive"}
                      >
                        <ThumbsUp className={`h-4 w-4 ${
                          rec.feedback === "positive" ? "text-green-500" : ""
                        }`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => onFeedback(rec.id, "negative")}
                        disabled={rec.feedback === "negative"}
                      >
                        <ThumbsDown className={`h-4 w-4 ${
                          rec.feedback === "negative" ? "text-red-500" : ""
                        }`} />
                      </Button>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(rec.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
      
      {recommendations.length === 0 && (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-sm font-medium">No Recommendations</h3>
          <p className="text-xs text-muted-foreground">
            Your CoS agent will provide personalized recommendations soon
          </p>
        </div>
      )}
    </div>
  )
}


import { Brain, Bot, Target, Users, BarChart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentPreferences } from "./AgentPreferences"
import { AgentMetrics } from "./AgentMetrics"
import { Recommendations } from "./Recommendations"
import { LeadershipSimulation } from "./LeadershipSimulation"
import { AgentsList } from "./AgentsList"
import { CreateAgentDialog } from "./CreateAgentDialog"
import { LearningInsights } from "./LearningInsights"
import { Agent } from "@/types/task"
import { PerformanceMetrics } from "@/types/performance"
import { CoSPreferences } from "@/types/agent"
import { CoSRecommendation } from "@/types/task"

interface AgentTabsProps {
  agents: Agent[];
  preferences: CoSPreferences | null;
  metrics: PerformanceMetrics;
  recommendations: CoSRecommendation[];
  learningProfile: any;
  adaptiveScore: number;
  handleAgentCreated: (newAgent: Agent) => void;
  handleAgentDeployment: (agentId: string, targetId: string) => void;
  handleRecommendationAction: (recId: string, actionType: string) => void;
  handleFeedback: (recId: string, feedback: "positive" | "negative") => void;
  deploymentTarget: string | null;
  setDeploymentTarget: (targetId: string | null) => void;
}

export function AgentTabs({
  agents,
  preferences,
  metrics,
  recommendations,
  learningProfile,
  adaptiveScore,
  handleAgentCreated,
  handleAgentDeployment,
  handleRecommendationAction,
  handleFeedback,
  deploymentTarget,
  setDeploymentTarget
}: AgentTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid grid-cols-5 gap-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          Insights
        </TabsTrigger>
        <TabsTrigger value="simulation" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Simulation
        </TabsTrigger>
        <TabsTrigger value="agents" className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Agents
        </TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {preferences && <AgentPreferences preferences={preferences} />}
        <AgentMetrics metrics={metrics} />
        <h4 className="text-sm font-medium mb-3">Personalized Recommendations</h4>
        <Recommendations 
          recommendations={recommendations}
          onFeedback={handleFeedback}
          onAction={handleRecommendationAction}
        />
      </TabsContent>
      
      <TabsContent value="insights" className="space-y-4">
        <LearningInsights 
          adaptiveScore={adaptiveScore}
          learningProfile={learningProfile}
        />
      </TabsContent>

      <TabsContent value="simulation" className="space-y-4">
        <LeadershipSimulation />
      </TabsContent>

      <TabsContent value="agents" className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Active Agents</h4>
          <CreateAgentDialog onAgentCreated={handleAgentCreated} />
        </div>
        <AgentsList 
          agents={agents}
          onDeploy={handleAgentDeployment}
          deploymentTarget={deploymentTarget}
          setDeploymentTarget={setDeploymentTarget}
        />
      </TabsContent>

      <TabsContent value="team" className="space-y-4">
        <div className="text-center p-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-2 font-semibold">Team Management</h3>
          <p className="text-muted-foreground">Coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

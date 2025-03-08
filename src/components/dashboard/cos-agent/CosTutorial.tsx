
import { Bot, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CosTutorialProps {
  tutorialStep: number;
  agentName: string;
  handleNextTutorialStep: () => void;
}

export function CosTutorial({ tutorialStep, agentName, handleNextTutorialStep }: CosTutorialProps) {
  const tutorialSteps = [
    {
      title: `Welcome to your new ${agentName}!`,
      description: "I'll be your AI assistant to help you be more productive and manage your tasks efficiently.",
      action: "Next"
    },
    {
      title: "Get Started with Tasks",
      description: "Create and manage your tasks in the Task Dashboard. I'll help you prioritize and stay on track.",
      action: "Next"
    },
    {
      title: "Check Recommendations",
      description: "I'll make personalized recommendations based on your preferences and work style. Check them regularly for productivity tips!",
      action: "Start Using My CoS Agent"
    }
  ];

  return (
    <Card className="p-6 border-primary/20">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{tutorialSteps[tutorialStep - 1].title}</h2>
            <p className="text-muted-foreground">{tutorialSteps[tutorialStep - 1].description}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Progress value={(tutorialStep / 3) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Getting Started</span>
            <span>Step {tutorialStep} of 3</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleNextTutorialStep}>
            {tutorialSteps[tutorialStep - 1].action}
            {tutorialStep < 3 ? <ArrowRight className="ml-2 h-4 w-4" /> : <Check className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}

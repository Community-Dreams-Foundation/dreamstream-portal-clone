
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IntakeFormData } from "@/components/intake/types";
import type { CosCustomizationData } from "@/components/customize/types";

interface MorningBriefingProps {
  userData: IntakeFormData;
  cosData: CosCustomizationData;
  currentStep: number;
  onStepComplete: () => void;
  isLastStep: boolean;
}

export const MorningBriefingScenario = ({
  userData,
  cosData,
  currentStep,
  onStepComplete,
  isLastStep,
}: MorningBriefingProps) => {
  const briefingStyle = {
    Direct: "Here's your morning brief:",
    Collaborative: "Let's review your morning priorities together:",
    Diplomatic: "I've prepared your morning overview:",
    Analytical: "Based on the current data, here's your morning analysis:",
  }[cosData.communicationStyle];

  const focusArea = {
    "Strategic Planning": "strategic initiatives",
    "Project Management": "project milestones",
    "Team Coordination": "team activities",
    "Resource Optimization": "resource allocation",
    "Process Improvement": "process efficiency",
  }[cosData.primaryFocus];

  const steps = [
    {
      title: "Introduction",
      content: `${briefingStyle}\nGood morning ${userData.fullName}. As your ${cosData.communicationStyle} Chief of Staff, I'll be focusing on ${focusArea} today.`,
    },
    {
      title: "Daily Overview",
      content: "I've analyzed your calendar and priorities for today. Here's what needs your attention:",
    },
    {
      title: "Priority Tasks",
      content: "1. Review and approve the quarterly strategy document\n2. Team standup at 10 AM\n3. Client presentation preparation\n4. Budget review for Q2",
    },
    {
      title: "Recommendations",
      content: "Based on your workload, I recommend focusing on the client presentation first, as it has the highest impact on this week's objectives.",
    },
  ];

  const currentContent = steps[currentStep];

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium">{currentContent.title}</h4>
        <p className="whitespace-pre-line">{currentContent.content}</p>
      </div>
      <div className="flex justify-end">
        <Button onClick={onStepComplete}>
          {isLastStep ? "Complete Scenario" : "Continue"}
        </Button>
      </div>
    </Card>
  );
};

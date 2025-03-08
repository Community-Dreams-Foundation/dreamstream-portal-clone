
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IntakeFormData } from "@/components/intake/types";
import type { CosCustomizationData } from "@/components/customize/types";

interface ProjectPlanningProps {
  userData: IntakeFormData;
  cosData: CosCustomizationData;
  currentStep: number;
  onStepComplete: () => void;
  isLastStep: boolean;
}

export const ProjectPlanningScenario = ({
  userData,
  cosData,
  currentStep,
  onStepComplete,
  isLastStep,
}: ProjectPlanningProps) => {
  const planningStyle = {
    Direct: "Let's create a structured project plan following our task management system:",
    Collaborative: "I'll guide you through our task management process. Let's start with:",
    Diplomatic: "I suggest we follow our established task management workflow:",
    Analytical: "Based on our task management system, here's my analysis:",
  }[cosData.communicationStyle];

  const focusEmphasis = {
    "Strategic Planning": "strategic alignment and project scope",
    "Project Management": "comprehensive documentation and task breakdown",
    "Team Coordination": "team roles and task distribution",
    "Resource Optimization": "resource allocation and time estimation",
    "Process Improvement": "workflow optimization and task automation",
  }[cosData.primaryFocus];

  const steps = [
    {
      title: "Input Phase",
      content: `${planningStyle}\n${userData.fullName}, let's begin with the project input phase. I'll help ensure we capture all the essential details with a focus on ${focusEmphasis}.\n\nPlease provide:\n1. Project Title\n2. Description/Context\n3. Priority Level\n4. Initial Documentation\n5. Expected Deadline`,
    },
    {
      title: "Documentation Parsing",
      content: "Based on the input, I'll help generate comprehensive documentation:\n\n1. Project Charter\n2. Product Requirements Document (PRD)\n3. 6-Week Calendar\n4. 2-Week Sprint Plan\n\nI'll also ensure we have domain-specific documentation for design, engineering, and operational requirements.",
    },
    {
      title: "Task Breakdown",
      content: "Now, I'll help break down the project into micro-tasks:\n\n1. Each task will be time-bound (max 3 hours)\n2. Tasks will be structured with clear objectives\n3. Dependencies will be mapped\n4. Success criteria will be defined\n\nWould you like me to start with the high-level task breakdown?",
    },
    {
      title: "Task Verification & Deployment",
      content: "Let's review and deploy the tasks:\n\n1. Verify task accuracy and alignment\n2. Confirm time estimates\n3. Set up task monitoring\n4. Deploy to the task marketplace\n\nOnce verified, we can begin assigning tasks based on team member skills and availability.",
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

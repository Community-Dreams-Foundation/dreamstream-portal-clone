
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type { CosCustomizationData } from "@/components/customize/types";
import type { IntakeFormData } from "@/components/intake/types";
import { ScenarioCard } from "@/components/simulate/ScenarioCard";
import { MorningBriefingScenario } from "@/components/simulate/MorningBriefingScenario";
import { ProjectPlanningScenario } from "@/components/simulate/ProjectPlanningScenario";

const SimulateCoS = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState<IntakeFormData | null>(null);
  const [cosData, setCosData] = useState<CosCustomizationData | null>(null);
  const [isScenarioActive, setIsScenarioActive] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<"morning" | "project" | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);

  useEffect(() => {
    const intakeData = localStorage.getItem("intakeFormData");
    const customizationData = localStorage.getItem("cosCustomizationData");

    if (!intakeData || !customizationData) {
      toast({
        title: "Missing Information",
        description: "Please complete the previous steps first.",
        variant: "destructive",
      });
      navigate("/intake");
      return;
    }

    const parsedUserData: IntakeFormData = JSON.parse(intakeData);
    const parsedCosData: CosCustomizationData = JSON.parse(customizationData);
    setUserData(parsedUserData);
    setCosData(parsedCosData);
    console.log("User data for simulation:", { parsedUserData, parsedCosData });
  }, [navigate, toast]);

  const handleStartScenario = (scenario: "morning" | "project") => {
    setIsScenarioActive(true);
    setCurrentScenario(scenario);
    setCurrentStep(0);
    toast({
      title: "Scenario Started",
      description: scenario === "morning" 
        ? "Welcome to your morning briefing with your AI Chief of Staff."
        : "Let's plan a new project together with your AI Chief of Staff.",
    });
  };

  const handleStepComplete = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Mark scenario as completed
      if (currentScenario && !completedScenarios.includes(currentScenario)) {
        setCompletedScenarios(prev => [...prev, currentScenario]);
      }
      
      setIsScenarioActive(false);
      setCurrentStep(0);
      setCurrentScenario(null);
      toast({
        title: "Scenario Completed",
        description: "Great work! You've completed this simulation scenario.",
      });
    }
  };

  const handleContinue = () => {
    navigate("/finalize-cos");
  };

  const atLeastOneScenarioCompleted = completedScenarios.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Interactive CoS Simulation</h1>
            <p className="text-muted-foreground mt-2">
              Step 3 of 4: Let's simulate working with your AI Chief of Staff
            </p>
          </div>
          
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: "75%" }}
            />
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Welcome to the Simulation</h2>
              <p className="text-muted-foreground">
                Experience working with your customized AI Chief of Staff through a series of 
                interactive scenarios. This will help you understand how your CoS will assist 
                you in real-world situations.
              </p>
            </div>

            <div className="grid gap-6">
              <ScenarioCard
                title="Scenario 1: Morning Briefing"
                description="Your AI Chief of Staff prepares your daily brief, highlighting key priorities 
                and upcoming commitments."
                onStart={() => handleStartScenario("morning")}
                disabled={isScenarioActive && currentScenario !== "morning"}
                isInProgress={isScenarioActive && currentScenario === "morning"}
                isCompleted={completedScenarios.includes("morning")}
              >
                {isScenarioActive && currentScenario === "morning" && userData && cosData && (
                  <MorningBriefingScenario
                    userData={userData}
                    cosData={cosData}
                    currentStep={currentStep}
                    onStepComplete={handleStepComplete}
                    isLastStep={currentStep === 3}
                  />
                )}
              </ScenarioCard>

              <ScenarioCard
                title="Scenario 2: Project Planning"
                description="Work with your CoS to plan and organize a new project initiative."
                onStart={() => handleStartScenario("project")}
                disabled={isScenarioActive && currentScenario !== "project"}
                isInProgress={isScenarioActive && currentScenario === "project"}
                isCompleted={completedScenarios.includes("project")}
              >
                {isScenarioActive && currentScenario === "project" && userData && cosData && (
                  <ProjectPlanningScenario
                    userData={userData}
                    cosData={cosData}
                    currentStep={currentStep}
                    onStepComplete={handleStepComplete}
                    isLastStep={currentStep === 3}
                  />
                )}
              </ScenarioCard>

              <ScenarioCard
                title="Scenario 3: Team Coordination"
                description="See how your CoS helps manage team communications and assignments."
                onStart={() => {}}
                disabled={true}
              />
            </div>

            <div className="pt-6 flex justify-end">
              <Button 
                onClick={handleContinue}
                disabled={!atLeastOneScenarioCompleted}
                size="lg"
              >
                Continue to Deployment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulateCoS;

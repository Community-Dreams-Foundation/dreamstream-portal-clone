
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { type IntakeFormData } from "@/components/intake/types";
import { CustomizationForm } from "@/components/customize/CustomizationForm";

const CustomizeCoS = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user completed the intake form
    const intakeData = localStorage.getItem("intakeFormData");
    if (!intakeData) {
      toast({
        title: "Missing Information", 
        description: "Please complete your profile information first.",
        variant: "destructive"
      });
      navigate("/intake");
      return;
    }

    const userData: IntakeFormData = JSON.parse(intakeData);
    console.log("User data for CoS customization:", userData);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Customize Your AI Chief of Staff</h1>
            <p className="text-muted-foreground mt-2">
              Step 2 of 4: Let's personalize your AI assistant
            </p>
          </div>
          
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: "50%" }}
            />
          </div>

          <CustomizationForm />
        </div>
      </div>
    </div>
  );
};

export default CustomizeCoS;

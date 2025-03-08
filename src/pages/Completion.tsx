
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IntakeFormData } from "@/components/intake/types";
import type { CosCustomizationData } from "@/components/customize/types";
import { toast } from "@/components/ui/use-toast";

const Completion = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<IntakeFormData | null>(null);
  const [cosData, setCosData] = useState<CosCustomizationData | null>(null);

  useEffect(() => {
    // Load stored data
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

    setUserData(JSON.parse(intakeData));
    setCosData(JSON.parse(customizationData));
  }, [navigate]);

  if (!userData || !cosData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Setup Complete!</h1>
            <p className="text-muted-foreground mt-2">
              Your Chief of Staff is ready to assist you
            </p>
          </div>

          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: "100%" }}
            />
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Personal and professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-base">{userData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{userData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Position</p>
                    <p className="text-base">{userData.position}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Weekly Hours</p>
                    <p className="text-base">{userData.availability} hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Chief of Staff Settings</CardTitle>
                <CardDescription>Customized preferences for your AI assistant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Communication Style</p>
                    <p className="text-base">{cosData.communicationStyle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Primary Focus</p>
                    <p className="text-base">{cosData.primaryFocus}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Decision Style</p>
                    <p className="text-base">{cosData.decisionStyle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Feedback Preference</p>
                    <p className="text-base">{cosData.feedbackPreference}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Here's how to get started with your Chief of Staff</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Access your personalized dashboard to view your tasks and projects</li>
                  <li>Review the quick start guide to understand key features</li>
                  <li>Set up your first project with your Chief of Staff</li>
                  <li>Configure your notification preferences</li>
                </ol>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
              <Button 
                size="lg" 
                className="w-full md:w-auto"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completion;

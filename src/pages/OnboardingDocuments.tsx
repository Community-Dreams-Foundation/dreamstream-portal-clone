import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentAgreement } from "@/components/intake/DocumentAgreement";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNotifications } from "@/contexts/NotificationContext";
import { sendExecutedDocumentsEmail } from "@/utils/emailService";
import { documentTitles } from "@/components/intake/DocumentConstants";

const OnboardingDocuments = () => {
  const navigate = useNavigate();
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);
  const { addNotification } = useNotifications();

  const handleBackClick = () => {
    navigate("/intake");
  };

  const handleContinueClick = () => {
    if (!hasAgreedToTerms) {
      toast({
        variant: "destructive",
        title: "Document Submission Required",
        description: "You must review, sign, and agree to all onboarding documents before proceeding.",
      });
      return;
    }

    // Send a notification about document submission
    setDocumentsSubmitted(true);
    
    // Add a system notification
    addNotification({
      title: "Onboarding Documents Received",
      message: "Your signed documents have been received. Final executed copies will be emailed to you shortly.",
      type: "system",
      metadata: {
        actionRequired: false,
        priority: "medium"
      }
    });

    // Trigger email delivery with executed documents
    // In production, we would get the user's email and name from authentication or form data
    const userEmail = "user@example.com"; // This would come from auth context in real app
    const userName = "New Dreamer"; // This would come from auth context in real app
    const documentTypes = Object.values(documentTitles);
    
    sendExecutedDocumentsEmail(userEmail, userName, documentTypes)
      .then((emailId) => {
        console.log(`Executed documents email queued with ID: ${emailId}`);
      })
      .catch((error) => {
        console.error("Error sending executed documents email:", error);
        // We could add error handling here, but not showing the error to users
        // to avoid confusion as they'll still proceed with onboarding
      });

    // Show a toast message
    toast({
      title: "Documents Submitted Successfully",
      description: "Final executed copies will be emailed to you and available in your account.",
    });

    // Navigate to the CoS customization page after a longer delay (increased from 3000ms to 7000ms)
    setTimeout(() => {
      navigate("/customize-cos");
    }, 7000); // Increased delay to 7 seconds
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Onboarding Documents</h1>
            <p className="text-muted-foreground mt-2">
              Step 2 of 4: Review and sign your onboarding documents
            </p>
          </div>
          
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: "50%" }}
            />
          </div>

          <div className="max-w-3xl mx-auto p-6">
            <p className="text-muted-foreground mb-6">
              Before proceeding to customize your AI Chief of Staff, please review and sign all of the following documents. 
              These documents outline our working relationship and are essential for your onboarding process.
            </p>
            
            {documentsSubmitted ? (
              <Alert className="mb-6 bg-green-50">
                <AlertDescription className="text-center py-4">
                  <div className="font-semibold text-green-600 mb-2">Documents Successfully Submitted!</div>
                  <p className="text-sm">
                    Your signed documents have been received. Final executed copies with all signatures will be:
                  </p>
                  <ul className="list-disc list-inside text-sm mt-2 text-left">
                    <li>Emailed to your registered email address</li>
                    <li>Available for download in your account dashboard</li>
                  </ul>
                  <p className="text-sm mt-3">Redirecting to the next step...</p>
                </AlertDescription>
              </Alert>
            ) : (
              <DocumentAgreement onAgreementChange={setHasAgreedToTerms} agreed={hasAgreedToTerms} />
            )}
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handleBackClick}
                className="flex items-center"
                disabled={documentsSubmitted}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Button>
              
              <Button 
                onClick={handleContinueClick}
                className="flex items-center"
                disabled={!hasAgreedToTerms || documentsSubmitted}
              >
                {documentsSubmitted ? "Processing..." : "Submit Documents & Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDocuments;

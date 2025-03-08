
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { DocumentSignatureMethod } from "./DocumentSignatureMethod";
import { DocumentTabs } from "./DocumentTabs";
import { DocumentAgreementCheckbox } from "./DocumentAgreementCheckbox";
import { documentTitles, documentDescriptions } from "./DocumentConstants";

interface DocumentAgreementProps {
  onAgreementChange: (agreed: boolean) => void;
  agreed: boolean;
}

export function DocumentAgreement({ onAgreementChange, agreed }: DocumentAgreementProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    offerLetter: null,
    agreement: null, 
    handbook: null
  });
  const [signatureMethod, setSignatureMethod] = useState<"upload" | "sign" | null>(null);
  const [signatureValues, setSignatureValues] = useState<Record<string, string>>({
    offerLetter: "",
    agreement: "", 
    handbook: ""
  });
  const [activeTab, setActiveTab] = useState("offerLetter");
  
  const allDocumentsHandled = () => {
    if (signatureMethod === "upload") {
      return Object.values(uploadedFiles).every(file => file !== null);
    } else if (signatureMethod === "sign") {
      return Object.values(signatureValues).every(value => value.length > 3);
    }
    return false;
  };
  
  const handleFileUpload = (documentType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles(prev => ({
        ...prev,
        [documentType]: e.target.files![0]
      }));
      
      // Check if all documents are uploaded and update agreement status
      setTimeout(() => {
        if (allDocumentsHandled()) {
          updateAgreement(true);
        }
      }, 100);
    }
  };
  
  const handleSignedAgreement = (documentType: string, value: string) => {
    setSignatureValues(prev => ({
      ...prev,
      [documentType]: value
    }));
    
    // Check if all documents are signed and update agreement status
    setTimeout(() => {
      if (allDocumentsHandled()) {
        updateAgreement(true);
      }
    }, 100);
  };
  
  // Update parent component when either method is completed
  const updateAgreement = (value: boolean) => {
    onAgreementChange(value);
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (checked && !allDocumentsHandled()) {
      toast({
        variant: "destructive",
        title: "Document Submission Required",
        description: "Please sign or upload all required documents before proceeding.",
      });
      return;
    }
    updateAgreement(checked);
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium text-lg">Onboarding Documents</h3>
              <p className="text-muted-foreground">
                Please review and sign all required documents before proceeding to the next step.
              </p>
            </div>
          </div>
          
          <DocumentSignatureMethod 
            signatureMethod={signatureMethod} 
            setSignatureMethod={setSignatureMethod} 
          />
          
          {signatureMethod && (
            <DocumentTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              signatureMethod={signatureMethod}
              uploadedFiles={uploadedFiles}
              signatureValues={signatureValues}
              documentTitles={documentTitles}
              documentDescriptions={documentDescriptions}
              handleFileUpload={handleFileUpload}
              handleSignedAgreement={handleSignedAgreement}
            />
          )}
          
          <DocumentAgreementCheckbox 
            agreed={agreed} 
            onAgreementChange={handleCheckboxChange} 
          />
        </div>
      </Card>
    </div>
  );
}


import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentTabContent } from "./DocumentTabContent";

interface DocumentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  signatureMethod: "upload" | "sign" | null;
  uploadedFiles: Record<string, File | null>;
  signatureValues: Record<string, string>;
  documentTitles: Record<string, string>;
  documentDescriptions: Record<string, string>;
  handleFileUpload: (documentType: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSignedAgreement: (documentType: string, value: string) => void;
}

export function DocumentTabs({
  activeTab,
  setActiveTab,
  signatureMethod,
  uploadedFiles,
  signatureValues,
  documentTitles,
  documentDescriptions,
  handleFileUpload,
  handleSignedAgreement
}: DocumentTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="offerLetter" className="relative">
          Offer Letter
          {((uploadedFiles.offerLetter && signatureMethod === "upload") || 
            (signatureValues.offerLetter.length > 3 && signatureMethod === "sign")) && (
            <Check className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
          )}
        </TabsTrigger>
        <TabsTrigger value="agreement" className="relative">
          Agreement
          {((uploadedFiles.agreement && signatureMethod === "upload") || 
            (signatureValues.agreement.length > 3 && signatureMethod === "sign")) && (
            <Check className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
          )}
        </TabsTrigger>
        <TabsTrigger value="handbook" className="relative">
          Handbook
          {((uploadedFiles.handbook && signatureMethod === "upload") || 
            (signatureValues.handbook.length > 3 && signatureMethod === "sign")) && (
            <Check className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
          )}
        </TabsTrigger>
      </TabsList>
      
      {Object.keys(documentTitles).map((docType) => (
        <TabsContent key={docType} value={docType}>
          <DocumentTabContent
            docType={docType}
            documentTitle={documentTitles[docType]}
            documentDescription={documentDescriptions[docType]}
            signatureMethod={signatureMethod}
            uploadedFile={uploadedFiles[docType]}
            signatureValue={signatureValues[docType]}
            handleFileUpload={handleFileUpload}
            handleSignedAgreement={handleSignedAgreement}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

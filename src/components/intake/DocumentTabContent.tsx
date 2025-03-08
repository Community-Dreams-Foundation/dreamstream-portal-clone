
import { Input } from "@/components/ui/input";

interface DocumentTabContentProps {
  docType: string;
  documentTitle: string;
  documentDescription: string;
  signatureMethod: "upload" | "sign" | null;
  uploadedFile: File | null;
  signatureValue: string;
  handleFileUpload: (documentType: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSignedAgreement: (documentType: string, value: string) => void;
}

export function DocumentTabContent({
  docType,
  documentTitle,
  documentDescription,
  signatureMethod,
  uploadedFile,
  signatureValue,
  handleFileUpload,
  handleSignedAgreement
}: DocumentTabContentProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold">{documentTitle}</h4>
      <p className="text-sm text-muted-foreground mb-4">{documentDescription}</p>
      
      <div className="text-sm border rounded p-3 h-40 overflow-y-auto">
        <h4 className="font-semibold mb-2">DreamStream {documentTitle}</h4>
        <p className="mb-2">
          This is a sample of the {documentTitle.toLowerCase()} content. In a production environment,
          this would contain the full text of the document for review.
        </p>
        <p className="mb-2">
          By signing this document, you acknowledge that you have read,
          understood, and agree to all terms and conditions outlined in the full {documentTitle.toLowerCase()}.
        </p>
        <p>
          This document constitutes a legally binding agreement between you and DreamStream.
        </p>
      </div>
      
      {signatureMethod === "upload" && (
        <div className="space-y-2">
          <Input 
            type="file" 
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
            onChange={(e) => handleFileUpload(docType, e)}
          />
          {uploadedFile && (
            <p className="text-sm text-muted-foreground">
              Uploaded: {uploadedFile.name}
            </p>
          )}
        </div>
      )}
      
      {signatureMethod === "sign" && (
        <div className="space-y-2">
          <Input 
            type="text" 
            placeholder="Type your full name to sign"
            value={signatureValue}
            onChange={(e) => {
              const value = e.target.value;
              handleSignedAgreement(docType, value);
            }}
          />
          <p className="text-xs text-muted-foreground">
            By typing your name above, you acknowledge this as your electronic signature.
          </p>
        </div>
      )}
    </div>
  );
}

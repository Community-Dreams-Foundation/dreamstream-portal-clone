
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

interface DocumentSignatureMethodProps {
  signatureMethod: "upload" | "sign" | null;
  setSignatureMethod: (method: "upload" | "sign") => void;
}

export function DocumentSignatureMethod({ 
  signatureMethod, 
  setSignatureMethod 
}: DocumentSignatureMethodProps) {
  return (
    <div className="flex gap-4">
      <Button 
        type="button" 
        variant={signatureMethod === "upload" ? "default" : "outline"} 
        size="sm"
        onClick={() => setSignatureMethod("upload")}
        className="flex-1"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Signed Documents
      </Button>
      
      <Button 
        type="button" 
        variant={signatureMethod === "sign" ? "default" : "outline"} 
        size="sm"
        onClick={() => setSignatureMethod("sign")}
        className="flex-1"
      >
        <FileText className="h-4 w-4 mr-2" />
        Sign Electronically
      </Button>
    </div>
  );
}

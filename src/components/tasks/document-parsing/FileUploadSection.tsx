
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";

interface FileUploadSectionProps {
  file: File | null;
  isLoading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileIcon?: React.ReactNode;
  acceptedFormats?: string;
}

export function FileUploadSection({
  file,
  isLoading,
  handleFileChange,
  fileIcon,
  acceptedFormats = ".md,.txt,.csv,.json,.docx,.pdf,.xlsx"
}: FileUploadSectionProps) {
  return (
    <CardContent className="p-4 border-2 border-dashed rounded-lg">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Upload your document</h4>
          <p className="text-xs text-muted-foreground max-w-xs">
            Supported formats: Markdown, Text, CSV, JSON, Word, PDF, Excel
          </p>
        </div>
        
        <Input
          id="file-upload"
          type="file"
          accept={acceptedFormats}
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        
        <Button
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={isLoading}
          className="relative"
        >
          Choose File
        </Button>
        
        {file && (
          <div className="mt-4 text-sm flex items-center gap-2 p-2 bg-muted rounded-md">
            {fileIcon || <FileText className="h-5 w-5 text-blue-500" />}
            <span>{file.name}</span>
            <span className="text-xs text-muted-foreground">
              ({Math.round(file.size / 1024)} KB)
            </span>
          </div>
        )}
      </div>
    </CardContent>
  );
}

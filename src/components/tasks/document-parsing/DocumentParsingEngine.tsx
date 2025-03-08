
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { processDocumentForTaskCreation } from "@/services/recommendationService";
import { CoSRecommendation, Task } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileText, FileCode, FileSpreadsheet, FileImage, Copy, ClipboardList } from "lucide-react";
import { FileUploadSection } from "./FileUploadSection";
import { ProgressIndicator } from "./ProgressIndicator";
import { ErrorDisplay } from "./ErrorDisplay";
import { ParsingResults } from "./ParsingResults";
import { AiInsightPanel } from "./AiInsightPanel";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DomainCategory } from "@/utils/documents/types";

interface DocumentParsingEngineProps {
  onTasksExtracted: (tasks: Partial<Task>[]) => void;
  onRecommendationsGenerated: (recommendations: CoSRecommendation[]) => void;
}

export function DocumentParsingEngine({
  onTasksExtracted,
  onRecommendationsGenerated
}: DocumentParsingEngineProps) {
  const { currentUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory>("strategy");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [estimatedEffort, setEstimatedEffort] = useState(0);
  const [parsingComplete, setParsingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedTaskCount, setExtractedTaskCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setParsingComplete(false);
      setInsights([]);
      setSuggestedSkills([]);
      setEstimatedEffort(0);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    const fileType = file.type.toLowerCase();
    
    if (fileType.includes('text') || fileType.includes('markdown') || fileType.includes('md')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    } else if (fileType.includes('json') || fileType.includes('xml') || fileType.includes('html')) {
      return <FileCode className="h-5 w-5 text-purple-500" />;
    } else if (fileType.includes('image')) {
      return <FileImage className="h-5 w-5 text-orange-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleProcess = async () => {
    if ((!file && !text) || !currentUser) {
      setError("Please provide document content and ensure you're logged in");
      return;
    }

    setIsLoading(true);
    setProgress(10);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // For text-only input, we need to adapt since the function expects a File
      let result;
      if (activeTab === "upload" && file) {
        // When using file upload
        result = await processDocumentForTaskCreation(
          currentUser.uid, 
          file
        );
      } else if (activeTab === "paste" && text) {
        // When using pasted text, we need to create a temporary file
        const textBlob = new Blob([text], { type: 'text/plain' });
        const textFile = new File([textBlob], 'pasted-text.txt', { type: 'text/plain' });
        
        result = await processDocumentForTaskCreation(
          currentUser.uid, 
          textFile
        );
      } else {
        throw new Error("No content provided");
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success) {
        setParsingComplete(true);
        setInsights(result.insights);
        setExtractedTaskCount(result.tasks.length);
        
        // Extract skills and effort from tasks
        const allSkills = new Set<string>();
        let totalEffort = 0;
        
        result.tasks.forEach(task => {
          totalEffort += task.estimatedDuration || 0;
          if (task.tags) {
            task.tags.forEach(tag => allSkills.add(tag));
          }
        });
        
        setSuggestedSkills(Array.from(allSkills));
        setEstimatedEffort(totalEffort);
        
        // Pass tasks and recommendations to parent components
        onTasksExtracted(result.tasks);
        onRecommendationsGenerated(result.recommendations);
        
        toast({
          title: "Document Processed",
          description: `Successfully extracted ${result.tasks.length} tasks and generated ${result.recommendations.length} recommendations.`
        });
      } else {
        setError("Failed to process document. Please try again with a different file.");
      }
    } catch (error) {
      console.error("Error processing document:", error);
      setError("An unexpected error occurred while processing the document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
    setParsingComplete(false);
    setInsights([]);
    setSuggestedSkills([]);
    setEstimatedEffort(0);
  };

  const handleDomainChange = (value: string) => {
    setSelectedDomain(value as DomainCategory);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Enhanced Document Parsing Engine</h3>
        <p className="text-sm text-muted-foreground">
          Upload project documentation to automatically extract tasks and generate intelligent recommendations.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "paste")} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload Document
          </TabsTrigger>
          <TabsTrigger value="paste" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Paste Text
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <FileUploadSection 
            file={file} 
            isLoading={isLoading} 
            handleFileChange={handleFileChange}
            fileIcon={getFileIcon()}  
          />
        </TabsContent>
        
        <TabsContent value="paste">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="document-text" className="text-sm font-medium">
                Paste document content
              </label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={() => navigator.clipboard.readText().then(text => setText(text))}
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Paste from clipboard
              </Button>
            </div>
            <Textarea
              id="document-text"
              placeholder="Paste project documentation, requirements, PRD, or other text content here..."
              value={text}
              onChange={handleTextChange}
              rows={10}
              className="font-mono text-sm"
              disabled={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-2">
        <label htmlFor="domain-selector" className="text-sm font-medium">
          Select Document Domain
        </label>
        <Select
          value={selectedDomain}
          onValueChange={handleDomainChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full" id="domain-selector">
            <SelectValue placeholder="Select domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strategy">Strategy</SelectItem>
            <SelectItem value="product-design">Product Design</SelectItem>
            <SelectItem value="frontend">Frontend</SelectItem>
            <SelectItem value="data-engineering">Data Engineering</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          The domain helps categorize tasks and determine appropriate skill requirements.
        </p>
      </div>
      
      <ProgressIndicator isLoading={isLoading} progress={progress} />
      
      <ErrorDisplay error={error} />
      
      {parsingComplete && (
        <>
          <Separator />
          
          <ParsingResults 
            parsingComplete={parsingComplete} 
            insights={[`Successfully extracted ${extractedTaskCount} tasks from the document.`]} 
          />
          
          <AiInsightPanel 
            insights={insights}
            suggestedSkills={suggestedSkills}
            estimatedEffort={estimatedEffort}
          />
        </>
      )}

      <Button
        onClick={handleProcess}
        disabled={(!file && !text) || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing with CoS AI...
          </>
        ) : (
          "Process Document"
        )}
      </Button>
    </Card>
  );
}

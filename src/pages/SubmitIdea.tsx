
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DomainCategory, 
  generateFullProjectDocumentation 
} from "@/utils/documents";
import { processDocumentForTaskCreation } from "@/services/recommendationService";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
  deadline: z.string().min(1, "Please select a deadline"),
  primaryDomain: z.enum(["strategy", "data-engineering", "frontend", "product-design", "engagement"]),
});

const SubmitIdea = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<Record<string, Record<string, string>>>({});
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [documentProcessingComplete, setDocumentProcessingComplete] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      deadline: "",
      primaryDomain: "product-design",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to submit an idea",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      setProcessingProgress(10);
      
      // Generate full project documentation for all domains
      const fullDocumentation = generateFullProjectDocumentation(
        values.title,
        values.description,
        values.priority,
        values.deadline
      );
      
      setProcessingProgress(30);
      setGeneratedDocuments(fullDocumentation.documents);
      setGeneratedTasks(fullDocumentation.tasks);
      
      // Process documents to extract more insights and recommendations
      if (currentUser?.uid) {
        let processedCount = 0;
        const totalDocuments = Object.values(fullDocumentation.documents)
          .reduce((count, domainDocs) => count + Object.keys(domainDocs).length, 0);
        
        // Process each document across all domains
        for (const [domain, domainDocs] of Object.entries(fullDocumentation.documents)) {
          for (const [docType, content] of Object.entries(domainDocs)) {
            // Create a file blob from the document content
            const file = new File(
              [content], 
              `${domain}-${docType}.md`, 
              { type: "text/markdown" }
            );

            // Process the document using our existing document parsing engine
            if (currentUser?.uid) {
              try {
                const result = await processDocumentForTaskCreation(currentUser.uid, file);
                
                if (result.success) {
                  console.log(`Processed document ${domain}/${docType} with ${result.tasks.length} tasks and ${result.recommendations.length} recommendations`);
                }
              } catch (error) {
                console.error(`Error processing document ${domain}/${docType}:`, error);
              }
              
              // Update progress
              processedCount++;
              setProcessingProgress(30 + Math.floor((processedCount / totalDocuments) * 60));
            }
          }
        }
      }
      
      setProcessingProgress(100);
      setDocumentProcessingComplete(true);

      toast({
        title: "Success!",
        description: "Your idea has been submitted and documents have been created across all domains.",
      });

      // We don't immediately navigate away so the user can see the confirmation
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error submitting idea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your idea.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/dashboard")} 
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Submit New Project Idea</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear and concise title for your project idea
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project idea..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide detailed information about your project idea
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="primaryDomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Domain Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select primary domain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="strategy">Strategy</SelectItem>
                            <SelectItem value="data-engineering">Data Engineering</SelectItem>
                            <SelectItem value="frontend">Frontend</SelectItem>
                            <SelectItem value="product-design">Product & Design</SelectItem>
                            <SelectItem value="engagement">Engagement</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the primary domain for your project (all domains will be covered)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the priority level for your project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When do you need this project completed?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 
                      `Processing... ${processingProgress}%` : 
                      "Submit Project Idea"}
                  </Button>
                  <FormDescription className="text-center mt-2">
                    This will create documents and tasks for all domains of your project
                  </FormDescription>
                </div>
              </form>
            </Form>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Document Generation</CardTitle>
                <CardDescription>
                  Documents that will be created for your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Standard Documents (All Domains):</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Project Charter</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Product Requirements Document</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>10-Day Execution Calendar</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Sprint Plan</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Domain Documents:</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <p className="font-medium text-primary">Strategy</p>
                      <ul className="text-muted-foreground">
                        <li>Market Analysis</li>
                        <li>Competitive Landscape</li>
                        <li>Strategic Roadmap</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-primary">Data Engineering</p>
                      <ul className="text-muted-foreground">
                        <li>Data Schema</li>
                        <li>ETL Workflow</li>
                        <li>Data Governance</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-primary">Frontend</p>
                      <ul className="text-muted-foreground">
                        <li>UI Mockups</li>
                        <li>Component Library</li>
                        <li>Accessibility Guidelines</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-primary">Product & Design</p>
                      <ul className="text-muted-foreground">
                        <li>Design System</li>
                        <li>User Flow</li>
                        <li>UX Research</li>
                      </ul>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="font-medium text-primary">Engagement</p>
                      <ul className="text-muted-foreground">
                        <li>Communication Plan</li>
                        <li>Stakeholder Matrix</li>
                        <li>Client Feedback Process</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {isSubmitting && !documentProcessingComplete && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-md border border-primary/20">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Processing documents...</p>
                      <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300 ease-in-out"
                          style={{ width: `${processingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {documentProcessingComplete && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-md border border-primary/20">
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Processing Complete</span>
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {Object.values(generatedDocuments)
                        .reduce((count, domainDocs) => count + Object.keys(domainDocs).length, 0)} documents created
                      and {generatedTasks.length} tasks generated
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitIdea;

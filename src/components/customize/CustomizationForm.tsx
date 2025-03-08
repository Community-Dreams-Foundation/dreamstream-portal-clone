
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { CosCustomizationData, cosCustomizationSchema } from "./types";

export function CustomizationForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CosCustomizationData>({
    resolver: zodResolver(cosCustomizationSchema),
    defaultValues: {
      communicationStyle: "Collaborative",
      primaryFocus: "Project Management",
      decisionStyle: "Balanced",
      feedbackPreference: "Real-time",
      specialInstructions: ""
    },
  });

  async function onSubmit(values: CosCustomizationData) {
    try {
      setIsSubmitting(true);
      
      // Store form data in localStorage for use in next steps
      localStorage.setItem("cosCustomizationData", JSON.stringify(values));
      
      toast({
        title: "CoS preferences saved!",
        description: "Let's see your AI Chief of Staff in action.",
      });
      
      // Navigate to the simulation page
      navigate("/simulate");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving your preferences.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-card rounded-lg shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Communication Preferences</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Communication Style</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={form.watch("communicationStyle") === "Direct" ? "default" : "outline"}
                        onClick={() => form.setValue("communicationStyle", "Direct")}
                        className="flex-1"
                      >
                        Direct
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("communicationStyle") === "Collaborative" ? "default" : "outline"}
                        onClick={() => form.setValue("communicationStyle", "Collaborative")}
                        className="flex-1"
                      >
                        Collaborative
                      </Button>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        type="button"
                        variant={form.watch("communicationStyle") === "Diplomatic" ? "default" : "outline"}
                        onClick={() => form.setValue("communicationStyle", "Diplomatic")}
                        className="flex-1"
                      >
                        Diplomatic
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("communicationStyle") === "Analytical" ? "default" : "outline"}
                        onClick={() => form.setValue("communicationStyle", "Analytical")}
                        className="flex-1"
                      >
                        Analytical
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Feedback Preference</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={form.watch("feedbackPreference") === "Real-time" ? "default" : "outline"}
                        onClick={() => form.setValue("feedbackPreference", "Real-time")}
                        className="flex-1 text-xs"
                      >
                        Real-time
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("feedbackPreference") === "Scheduled" ? "default" : "outline"}
                        onClick={() => form.setValue("feedbackPreference", "Scheduled")}
                        className="flex-1 text-xs"
                      >
                        Scheduled
                      </Button>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        type="button"
                        variant={form.watch("feedbackPreference") === "As-needed" ? "default" : "outline"}
                        onClick={() => form.setValue("feedbackPreference", "As-needed")}
                        className="flex-1 text-xs"
                      >
                        As-needed
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("feedbackPreference") === "Milestone-based" ? "default" : "outline"}
                        onClick={() => form.setValue("feedbackPreference", "Milestone-based")}
                        className="flex-1 text-xs"
                      >
                        Milestone-based
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Work Management</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Primary Focus</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={form.watch("primaryFocus") === "Strategic Planning" ? "default" : "outline"}
                        onClick={() => form.setValue("primaryFocus", "Strategic Planning")}
                        className="text-xs"
                      >
                        Strategic Planning
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("primaryFocus") === "Project Management" ? "default" : "outline"}
                        onClick={() => form.setValue("primaryFocus", "Project Management")}
                        className="text-xs"
                      >
                        Project Management
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("primaryFocus") === "Team Coordination" ? "default" : "outline"}
                        onClick={() => form.setValue("primaryFocus", "Team Coordination")}
                        className="text-xs"
                      >
                        Team Coordination
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("primaryFocus") === "Resource Optimization" ? "default" : "outline"}
                        onClick={() => form.setValue("primaryFocus", "Resource Optimization")}
                        className="text-xs"
                      >
                        Resource Optimization
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("primaryFocus") === "Process Improvement" ? "default" : "outline"}
                        onClick={() => form.setValue("primaryFocus", "Process Improvement")}
                        className="text-xs"
                      >
                        Process Improvement
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Decision Style</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={form.watch("decisionStyle") === "Data-Driven" ? "default" : "outline"}
                        onClick={() => form.setValue("decisionStyle", "Data-Driven")}
                        className="flex-1 text-xs"
                      >
                        Data-Driven
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("decisionStyle") === "Intuitive" ? "default" : "outline"}
                        onClick={() => form.setValue("decisionStyle", "Intuitive")}
                        className="flex-1 text-xs"
                      >
                        Intuitive
                      </Button>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        type="button"
                        variant={form.watch("decisionStyle") === "Balanced" ? "default" : "outline"}
                        onClick={() => form.setValue("decisionStyle", "Balanced")}
                        className="flex-1 text-xs"
                      >
                        Balanced
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("decisionStyle") === "Consultative" ? "default" : "outline"}
                        onClick={() => form.setValue("decisionStyle", "Consultative")}
                        className="flex-1 text-xs"
                      >
                        Consultative
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Special Instructions</h3>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md h-24"
                placeholder="Add any specific instructions for your CoS agent..."
                {...form.register("specialInstructions")}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Continue to Simulation"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

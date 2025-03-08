
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { PersonalInfoFields } from "./intake/PersonalInfoFields";
import { AvailabilityField } from "./intake/AvailabilityField";
import { DreamerStatement } from "./intake/DreamerStatement";
import { ResumeUpload } from "./intake/ResumeUpload";
import { intakeFormSchema, type IntakeFormData } from "./intake/types";
import { useState } from "react";

export function IntakeForm() {
  const navigate = useNavigate();
  
  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      position: "",
      membershipStatus: "",
      availability: 40,
      dreamerStatement: "",
    },
  });

  async function onSubmit(values: IntakeFormData) {
    try {
      // Store form data in localStorage for use in next steps
      localStorage.setItem("intakeFormData", JSON.stringify(values));
      
      toast({
        title: "Profile saved!",
        description: "Continue to review and sign your onboarding documents.",
      });
      
      // Navigate to the onboarding documents page
      navigate("/onboarding-documents");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving your profile.",
      });
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <PersonalInfoFields form={form} />
          <AvailabilityField form={form} />
          <DreamerStatement form={form} />
          <ResumeUpload form={form} />

          <Button type="submit" className="w-full">
            Continue to Onboarding Documents
          </Button>
        </form>
      </Form>
    </div>
  );
}


import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsFormProps<T extends z.ZodTypeAny> {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (values: z.infer<T>) => Promise<void> | void;
  children: React.ReactNode;
  submitButtonText?: string;
  className?: string;
  id?: string; // Added id prop
}

export function SettingsForm<T extends z.ZodTypeAny>({
  schema,
  defaultValues,
  onSubmit,
  children,
  submitButtonText = "Save Changes",
  className,
  id, // Added id prop
}: SettingsFormProps<T>) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (values: z.infer<T>) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className={className}
        id={id} // Added id to the form element
      >
        {children}
        <div className="flex justify-end mt-4">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Save className="h-4 w-4 animate-spin" />}
            {!isSubmitting && <Save className="h-4 w-4" />}
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}

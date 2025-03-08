
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { IntakeFormData } from "./types";

interface ResumeUploadProps {
  form: UseFormReturn<IntakeFormData>;
}

export function ResumeUpload({ form }: ResumeUploadProps) {
  return (
    <FormField
      control={form.control}
      name="resume"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Upload Your Resume</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                field.onChange(e.target.files ? e.target.files[0] : null)
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

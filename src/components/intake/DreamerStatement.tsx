
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { IntakeFormData } from "./types";

interface DreamerStatementProps {
  form: UseFormReturn<IntakeFormData>;
}

export function DreamerStatement({ form }: DreamerStatementProps) {
  return (
    <FormField
      control={form.control}
      name="dreamerStatement"
      render={({ field }) => (
        <FormItem>
          <FormLabel>What Makes You a Dreamer?</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Please describe what makes you a Dreamer and why you are passionate about contributing to Community Dreams Foundation."
              className="min-h-[200px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

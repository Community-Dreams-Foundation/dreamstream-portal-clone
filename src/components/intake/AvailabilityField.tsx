
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { IntakeFormData } from "./types";
import { availabilityOptions } from "./constants";

interface AvailabilityFieldProps {
  form: UseFormReturn<IntakeFormData>;
}

export function AvailabilityField({ form }: AvailabilityFieldProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const handleAvailabilityChange = (value: string) => {
    const numValue = Number(value);
    form.setValue("availability", numValue);
    setShowCustomInput(numValue === -1);
    
    if (numValue !== -1) {
      form.clearErrors("availability");
    }
  };
  
  const handleCustomHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = Number(e.target.value);
    if (hours > 0) {
      form.setValue("availability", hours);
      form.clearErrors("availability");
    } else {
      form.setError("availability", { 
        type: "min", 
        message: "Please enter a valid number of hours" 
      });
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="availability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weekly Availability</FormLabel>
            <Select 
              onValueChange={handleAvailabilityChange} 
              value={field.value === -1 || !availabilityOptions.some(opt => opt.value === field.value) 
                ? "-1" 
                : field.value.toString()
              }
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your availability" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availabilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showCustomInput && (
        <FormItem>
          <FormLabel>Custom Hours</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              placeholder="Enter custom hours"
              min={1}
              onChange={handleCustomHoursChange}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    </div>
  );
}


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WaiverType } from "@/types/waiver"

const waiverFormSchema = z.object({
  type: z.enum(["leadership", "sweat-equity", "competition", "hardship", "referral"] as const),
  justification: z.string().min(50, {
    message: "Justification must be at least 50 characters.",
  }),
  recruitCount: z.string().optional(),
  duration: z.string().optional(),
})

export function WaiverRequestForm() {
  const form = useForm<z.infer<typeof waiverFormSchema>>({
    resolver: zodResolver(waiverFormSchema),
    defaultValues: {
      type: "leadership",
      justification: "",
    },
  })

  function onSubmit(values: z.infer<typeof waiverFormSchema>) {
    // TODO: Implement actual submission
    console.log(values)
    toast({
      title: "Waiver request submitted",
      description: "Your request has been submitted for review.",
    })
  }

  const waiverTypes: { value: WaiverType; label: string }[] = [
    { value: "leadership", label: "Leadership Track" },
    { value: "sweat-equity", label: "Sweat Equity" },
    { value: "competition", label: "Competition Entry" },
    { value: "hardship", label: "Hardship" },
    { value: "referral", label: "Referral Program" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waiver Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a waiver type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {waiverTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justification</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide detailed justification for your waiver request..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Explain why you are requesting this waiver and how it aligns with your goals.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("type") === "referral" && (
          <FormField
            control={form.control}
            name="recruitCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Recruits</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the number of successful referrals
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(form.watch("type") === "leadership" || form.watch("type") === "sweat-equity") && (
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requested Duration</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g., 3 months" {...field} />
                </FormControl>
                <FormDescription>
                  Specify the duration for which you are requesting the waiver
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit">Submit Waiver Request</Button>
      </form>
    </Form>
  )
}

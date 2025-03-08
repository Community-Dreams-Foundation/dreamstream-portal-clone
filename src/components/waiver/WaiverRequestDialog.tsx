
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"

const waiverFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  reason: z.string().min(10, "Please provide a detailed reason"),
  additionalDetails: z.string().optional(),
})

type WaiverFormData = z.infer<typeof waiverFormSchema>

export function WaiverRequestDialog() {
  const { currentUser } = useAuth()
  const [open, setOpen] = useState(false)
  
  const form = useForm<WaiverFormData>({
    resolver: zodResolver(waiverFormSchema),
    defaultValues: {
      title: "",
      reason: "",
      additionalDetails: "",
    },
  })

  async function onSubmit(data: WaiverFormData) {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a waiver request",
        variant: "destructive",
      })
      return
    }

    try {
      await addDoc(collection(db, "waivers"), {
        ...data,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      toast({
        title: "Request submitted",
        description: "Your waiver request has been submitted for review",
      })
      
      setOpen(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit waiver request. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Request Waiver</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a Waiver</DialogTitle>
          <DialogDescription>
            Submit your waiver request for review. Please provide detailed information
            to help us process your request efficiently.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title for your request" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please explain why you are requesting this waiver"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional information that might help your case"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

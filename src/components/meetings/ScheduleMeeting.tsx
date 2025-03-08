
import { useState } from "react"
import { useMeetings } from "@/contexts/MeetingContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarPlus, Users, Clock } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { formatISO, addMinutes, parseISO, format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { fetchUsers, UserSummary } from "@/utils/userOperations"
import { useQuery } from "@tanstack/react-query"

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  meetingType: z.enum(["team", "one-on-one", "leadership", "organization"]),
  date: z.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  participants: z.array(z.string()).min(1, "Select at least one participant"),
  location: z.object({
    type: z.enum(["virtual", "physical"]),
    link: z.string().optional(),
    address: z.string().optional(),
  }),
})

export function ScheduleMeeting() {
  const { createMeeting } = useMeetings()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [selectedParticipants, setSelectedParticipants] = useState<UserSummary[]>([])

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      meetingType: "team",
      date: new Date(),
      time: "10:00",
      duration: 30,
      participants: [],
      location: {
        type: "virtual",
      },
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!currentUser) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to schedule meetings",
        })
        return
      }

      // Parse time and create start/end times
      const [hours, minutes] = values.time.split(":").map(Number)
      const startDate = new Date(values.date)
      startDate.setHours(hours, minutes, 0, 0)
      
      const endDate = addMinutes(startDate, values.duration)
      
      // Get participant details
      const participantDetails = values.participants.map(id => {
        const user = users.find(u => u.id === id)
        return {
          id,
          name: user?.name || "Unknown User",
          status: "pending" as const
        }
      })
      
      const meetingData = {
        title: values.title,
        description: values.description || "",
        startTime: formatISO(startDate),
        endTime: formatISO(endDate),
        hostId: currentUser.uid,
        hostName: currentUser.displayName || "Unknown Host",
        participants: participantDetails,
        meetingType: values.meetingType,
        location: {
          type: values.location.type, // Ensure type is required
          link: values.location.link,
          address: values.location.address,
        },
      }
      
      const meetingId = await createMeeting(meetingData)
      
      toast({
        title: "Meeting Scheduled",
        description: `Your meeting has been scheduled for ${format(startDate, "MMMM d, yyyy 'at' h:mm a")}`,
      })
      
      // Reset form
      form.reset({
        title: "",
        description: "",
        meetingType: "team",
        date: new Date(),
        time: "10:00",
        duration: 30,
        participants: [],
        location: {
          type: "virtual",
        },
      })
      setSelectedParticipants([])
      
    } catch (error) {
      console.error("Error scheduling meeting:", error)
      toast({
        variant: "destructive",
        title: "Failed to schedule meeting",
        description: "There was an error scheduling your meeting. Please try again.",
      })
    }
  }

  const handleAddParticipant = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user && !selectedParticipants.some(p => p.id === userId)) {
      setSelectedParticipants([...selectedParticipants, user])
      form.setValue("participants", [...form.getValues("participants"), userId])
    }
  }

  const handleRemoveParticipant = (userId: string) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== userId))
    form.setValue(
      "participants", 
      form.getValues("participants").filter(id => id !== userId)
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="h-5 w-5" />
          Schedule a Meeting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Team Sync" {...field} />
                      </FormControl>
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
                          placeholder="Discuss project updates and blockers" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="meetingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a meeting type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="team">Team Meeting</SelectItem>
                          <SelectItem value="one-on-one">One-on-One</SelectItem>
                          <SelectItem value="leadership">Leadership Meeting</SelectItem>
                          <SelectItem value="organization">Organization Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="physical">Physical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("location.type") === "virtual" && (
                  <FormField
                    control={form.control}
                    name="location.link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://meet.google.com/abc-defg-hij" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave empty to auto-generate a Google Meet link
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch("location.type") === "physical" && (
                  <FormField
                    control={form.control}
                    name="location.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Conference Room A, Floor 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <div className="border rounded-md p-3">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input type="time" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participants</FormLabel>
                      <div className="mt-2 space-y-3">
                        <div className="flex items-center gap-2">
                          <Select onValueChange={handleAddParticipant}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Add participants" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.filter(user => 
                                user.id !== currentUser?.uid && 
                                !selectedParticipants.some(p => p.id === user.id)
                              ).map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        {selectedParticipants.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedParticipants.map(participant => (
                              <Badge 
                                key={participant.id}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {participant.name}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 rounded-full"
                                  onClick={() => handleRemoveParticipant(participant.id)}
                                >
                                  ×
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Schedule Meeting
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

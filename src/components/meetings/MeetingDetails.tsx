
import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Meeting, useMeetings } from "@/contexts/MeetingContext"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  Clipboard, 
  Edit, 
  Trash, 
  ListChecks, 
  MessageSquare,
  ChevronLeft
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { Markdown } from "@/components/tasks/Markdown"

interface MeetingDetailsProps {
  meetingId: string;
  onBack?: () => void;
}

export function MeetingDetails({ meetingId, onBack }: MeetingDetailsProps) {
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getMeetingById, updateMeeting, deleteMeeting } = useMeetings()
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const { addNotification } = useNotifications()
  
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setLoading(true)
        const meetingData = await getMeetingById(meetingId)
        setMeeting(meetingData)
      } catch (err) {
        console.error("Error fetching meeting:", err)
        setError("Failed to load meeting details")
      } finally {
        setLoading(false)
      }
    }
    
    fetchMeeting()
  }, [meetingId, getMeetingById])
  
  const isHost = meeting?.hostId === currentUser?.uid
  
  const getTypeBadgeVariant = (type: Meeting["meetingType"]) => {
    switch (type) {
      case "team": return "default"
      case "one-on-one": return "secondary"
      case "leadership": return "outline"
      case "organization": return "destructive"
      default: return "default"
    }
  }
  
  const handleCopyLink = () => {
    if (meeting?.location?.type === "virtual" && meeting.location.link) {
      navigator.clipboard.writeText(meeting.location.link)
      toast({
        title: "Link copied",
        description: "Meeting link copied to clipboard"
      })
    }
  }
  
  const handleCancel = async () => {
    if (!meeting) return
    
    try {
      await updateMeeting(meeting.id, { status: "cancelled" })
      
      toast({
        title: "Meeting cancelled",
        description: "The meeting has been cancelled successfully"
      })
      
      // Add a notification for each participant
      for (const participant of meeting.participants) {
        if (participant.id !== currentUser?.uid) {
          await addNotification({
            title: "Meeting Cancelled",
            message: `The meeting "${meeting.title}" has been cancelled`,
            type: "meeting",
            metadata: {
              meetingId: meeting.id,
              priority: "high",
              actionRequired: false
            }
          })
        }
      }
      
      // Refresh meeting data
      const updatedMeeting = await getMeetingById(meeting.id)
      setMeeting(updatedMeeting)
    } catch (error) {
      console.error("Error cancelling meeting:", error)
      toast({
        variant: "destructive",
        title: "Failed to cancel meeting",
        description: "There was an error cancelling the meeting. Please try again."
      })
    }
  }
  
  const handleDelete = async () => {
    if (!meeting) return
    
    try {
      await deleteMeeting(meeting.id)
      
      toast({
        title: "Meeting deleted",
        description: "The meeting has been deleted successfully"
      })
      
      if (onBack) {
        onBack()
      }
    } catch (error) {
      console.error("Error deleting meeting:", error)
      toast({
        variant: "destructive",
        title: "Failed to delete meeting",
        description: "There was an error deleting the meeting. Please try again."
      })
    }
  }
  
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p>Loading meeting details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (error || !meeting) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40 flex-col">
            <p className="text-destructive">{error || "Meeting not found"}</p>
            {onBack && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={onBack}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Meetings
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const isPast = new Date(meeting.endTime) < new Date()
  const isCancelled = meeting.status === "cancelled"
  
  return (
    <Card>
      {onBack && (
        <div className="pt-6 px-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Meetings
          </Button>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{meeting.title}</CardTitle>
            <CardDescription>
              Hosted by {meeting.hostName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getTypeBadgeVariant(meeting.meetingType)}>
              {meeting.meetingType}
            </Badge>
            {isCancelled && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {format(parseISO(meeting.startTime), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(parseISO(meeting.startTime), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {format(parseISO(meeting.startTime), "h:mm a")} - {format(parseISO(meeting.endTime), "h:mm a")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / 60000)} minutes
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Participants ({meeting.participants.length})</p>
                <div className="mt-1 space-y-1">
                  {meeting.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2">
                      <Badge variant="outline" className="font-normal">
                        {participant.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {participant.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {meeting.location && (
              <div className="flex items-start gap-2">
                {meeting.location.type === "virtual" ? (
                  <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {meeting.location.type === "virtual" ? "Virtual Meeting" : "Physical Location"}
                  </p>
                  {meeting.location.type === "virtual" && meeting.location.link ? (
                    <div className="flex items-center gap-2 mt-1">
                      <a 
                        href={meeting.location.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all"
                      >
                        {meeting.location.link}
                      </a>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleCopyLink}
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : meeting.location.type === "physical" && meeting.location.address ? (
                    <p className="text-sm">{meeting.location.address}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {meeting.description && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Description</h3>
                <Markdown>{meeting.description}</Markdown>
              </div>
            )}
            
            {meeting.agendaItems && meeting.agendaItems.length > 0 && (
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Agenda</h3>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {meeting.agendaItems.map((item, index) => (
                    <li key={index} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {meeting.notes && (
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Meeting Notes</h3>
                </div>
                <Markdown>{meeting.notes}</Markdown>
              </div>
            )}
          </div>
        </div>
        
        {meeting.recordingUrl && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Recording</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                View Recording
              </Button>
              {meeting.transcriptUrl && (
                <Button variant="outline">
                  View Transcript
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <div className="flex justify-between w-full">
          <div>
            {isHost && !isPast && !isCancelled && (
              <Button 
                variant="destructive"
                onClick={handleCancel}
              >
                Cancel Meeting
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {!isPast && !isCancelled && meeting.location?.type === "virtual" && meeting.location.link && (
              <Button>
                <Video className="mr-2 h-4 w-4" />
                Join Meeting
              </Button>
            )}
            
            {isHost && (
              <>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDelete}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

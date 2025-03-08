
import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMeetings } from "@/contexts/MeetingContext"
import { useSocket } from "@/hooks/use-socket"
import { useAuth } from "@/contexts/AuthContext"
import { format } from "date-fns"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, Clock, MapPin, Video, Users, User, FileText, Mic, MessageSquare } from "lucide-react"
import { MeetingChat } from "./MeetingChat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Meeting } from "@/contexts/MeetingContext"
import { toast } from "@/hooks/use-toast"

export function MeetingDetail() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const { getMeetingById, updateMeeting, deleteMeeting } = useMeetings()
  const { currentUser } = useAuth()
  const { subscribeToMeeting, isConnected } = useSocket()
  const navigate = useNavigate()
  
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!meetingId) return
    
    const loadMeeting = async () => {
      try {
        setLoading(true)
        const meetingData = await getMeetingById(meetingId)
        setMeeting(meetingData)
      } catch (error) {
        console.error("Error loading meeting:", error)
        toast({ 
          title: "Error", 
          description: "Failed to load meeting details",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadMeeting()
  }, [meetingId, getMeetingById])
  
  useEffect(() => {
    if (!meetingId || !currentUser) return
    
    // Subscribe to real-time updates for this meeting
    subscribeToMeeting(meetingId)
    
    // Listen for meeting update events
    const handleMeetingUpdated = (event: CustomEvent<any>) => {
      const data = event.detail
      if (data.meetingId === meetingId) {
        // Refresh meeting data
        getMeetingById(meetingId).then(meetingData => {
          setMeeting(meetingData)
        })
      }
    }
    
    window.addEventListener("meeting:updated", handleMeetingUpdated as EventListener)
    
    return () => {
      window.removeEventListener("meeting:updated", handleMeetingUpdated as EventListener)
    }
  }, [meetingId, currentUser, subscribeToMeeting, getMeetingById])
  
  const handleStartMeeting = async () => {
    if (!meeting) return
    
    try {
      await updateMeeting(meeting.id, { status: "ongoing" })
      toast({
        title: "Meeting Started",
        description: "The meeting has been marked as started."
      })
    } catch (error) {
      console.error("Error starting meeting:", error)
      toast({
        title: "Error",
        description: "Failed to start the meeting.",
        variant: "destructive"
      })
    }
  }
  
  const handleEndMeeting = async () => {
    if (!meeting) return
    
    try {
      await updateMeeting(meeting.id, { status: "completed" })
      toast({
        title: "Meeting Ended",
        description: "The meeting has been marked as completed."
      })
    } catch (error) {
      console.error("Error ending meeting:", error)
      toast({
        title: "Error",
        description: "Failed to end the meeting.",
        variant: "destructive"
      })
    }
  }
  
  const handleDeleteMeeting = async () => {
    if (!meeting) return
    
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        await deleteMeeting(meeting.id)
        toast({
          title: "Meeting Deleted",
          description: "The meeting has been deleted successfully."
        })
        navigate("/meetings")
      } catch (error) {
        console.error("Error deleting meeting:", error)
        toast({
          title: "Error",
          description: "Failed to delete the meeting.",
          variant: "destructive"
        })
      }
    }
  }
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading meeting details...</div>
  }
  
  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2">Meeting Not Found</h2>
        <p className="text-muted-foreground mb-4">The meeting you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate("/meetings")}>Back to Meetings</Button>
      </div>
    )
  }
  
  const isHost = currentUser?.uid === meeting.hostId
  const isMeetingActive = meeting.status === "scheduled" || meeting.status === "ongoing"
  const canJoin = meeting.status === "ongoing"
  const showRecording = meeting.status === "completed" && meeting.recordingUrl
  
  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{meeting.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={
              meeting.status === "scheduled" ? "outline" :
              meeting.status === "ongoing" ? "default" :
              meeting.status === "completed" ? "secondary" :
              "destructive"
            }>
              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {meeting.meetingType.charAt(0).toUpperCase() + meeting.meetingType.slice(1)} Meeting
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isHost && meeting.status === "scheduled" && (
            <Button onClick={handleStartMeeting}>Start Meeting</Button>
          )}
          
          {isHost && meeting.status === "ongoing" && (
            <Button onClick={handleEndMeeting} variant="secondary">End Meeting</Button>
          )}
          
          {canJoin && meeting.location?.type === "virtual" && meeting.location.link && (
            <Button onClick={() => window.open(meeting.location.link, "_blank")}>
              Join Meeting
            </Button>
          )}
          
          {isHost && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/meetings/edit/${meeting.id}`)}
            >
              Edit
            </Button>
          )}
          
          {isHost && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteMeeting}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              {showRecording && <TabsTrigger value="recordings">Recordings</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">{meeting.description || "No description provided."}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">Date</h4>
                        <p className="text-muted-foreground">
                          {format(new Date(meeting.startTime), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">Time</h4>
                        <p className="text-muted-foreground">
                          {format(new Date(meeting.startTime), "h:mm a")} - {format(new Date(meeting.endTime), "h:mm a")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">Host</h4>
                        <p className="text-muted-foreground">{meeting.hostName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">Participants</h4>
                        <p className="text-muted-foreground">{meeting.participants.length} invited</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 col-span-2">
                      {meeting.location?.type === "virtual" ? (
                        <>
                          <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <h4 className="font-medium">Location</h4>
                            <p className="text-muted-foreground">
                              Virtual Meeting
                              {meeting.location.link && (
                                <Button 
                                  variant="link" 
                                  className="p-0 h-auto text-primary"
                                  onClick={() => navigator.clipboard.writeText(meeting.location!.link!)}
                                >
                                  Copy link
                                </Button>
                              )}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <h4 className="font-medium">Location</h4>
                            <p className="text-muted-foreground">
                              {meeting.location?.address || "No location specified"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {meeting.recurrence && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-2">Recurrence</h3>
                        <p className="text-muted-foreground">
                          This meeting repeats 
                          {meeting.recurrence.frequency === "daily" && " daily"}
                          {meeting.recurrence.frequency === "weekly" && " weekly"}
                          {meeting.recurrence.frequency === "biweekly" && " every two weeks"}
                          {meeting.recurrence.frequency === "monthly" && " monthly"}
                          {meeting.recurrence.interval && meeting.recurrence.interval > 1 && ` every ${meeting.recurrence.interval} ${meeting.recurrence.frequency.slice(0, -2)}s`}
                          {meeting.recurrence.endsOn && ` until ${format(new Date(meeting.recurrence.endsOn), "MMMM d, yyyy")}`}
                          {meeting.recurrence.count && ` for ${meeting.recurrence.count} occurrences`}
                          .
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="participants">
              <Card>
                <CardHeader>
                  <CardTitle>Participants ({meeting.participants.length})</CardTitle>
                  <CardDescription>People invited to this meeting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Host */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${meeting.hostId}`} />
                          <AvatarFallback>{meeting.hostName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{meeting.hostName}</div>
                          <div className="text-sm text-muted-foreground">Host</div>
                        </div>
                      </div>
                      <Badge>Host</Badge>
                    </div>
                    
                    {/* Participants */}
                    {meeting.participants.map((participant) => (
                      <div 
                        key={participant.id} 
                        className="flex items-center justify-between p-3 bg-background border rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://avatar.vercel.sh/${participant.id}`} />
                            <AvatarFallback>{participant.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{participant.name}</div>
                            <div className="text-sm text-muted-foreground">{participant.email || "No email provided"}</div>
                          </div>
                        </div>
                        <Badge variant={
                          participant.status === "accepted" ? "default" :
                          participant.status === "declined" ? "destructive" :
                          participant.status === "tentative" ? "secondary" :
                          "outline"
                        }>
                          {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                    
                    {meeting.participants.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        No participants have been invited to this meeting yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="agenda">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Agenda</CardTitle>
                  <CardDescription>Topics to be discussed during this meeting</CardDescription>
                </CardHeader>
                <CardContent>
                  {meeting.agendaItems && meeting.agendaItems.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-2 pl-2">
                      {meeting.agendaItems.map((item, index) => (
                        <li key={index} className="text-md">{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No agenda items have been added to this meeting yet.
                    </div>
                  )}
                </CardContent>
                {isHost && (
                  <CardFooter>
                    <Button variant="outline">Edit Agenda</Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            
            {showRecording && (
              <TabsContent value="recordings">
                <Card>
                  <CardHeader>
                    <CardTitle>Recordings & Transcripts</CardTitle>
                    <CardDescription>Access meeting recordings and transcripts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {meeting.recordingUrl && (
                      <div className="p-4 border rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Video className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Meeting Recording</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(meeting.createdAt), "MMMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => window.open(meeting.recordingUrl, "_blank")}
                        >
                          View Recording
                        </Button>
                      </div>
                    )}
                    
                    {meeting.transcriptUrl && (
                      <div className="p-4 border rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Meeting Transcript</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(meeting.createdAt), "MMMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => window.open(meeting.transcriptUrl, "_blank")}
                          variant="outline"
                        >
                          View Transcript
                        </Button>
                      </div>
                    )}
                    
                    {!meeting.recordingUrl && !meeting.transcriptUrl && (
                      <div className="text-center py-6 text-muted-foreground">
                        No recordings or transcripts are available for this meeting.
                      </div>
                    )}
                    
                    {isHost && isMeetingActive && (
                      <div className="border border-dashed rounded-md p-4 text-center">
                        <Mic className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <h3 className="font-medium mb-1">Meeting Recording</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          You can start recording this meeting anytime during the session.
                        </p>
                        <Button>Start Recording</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Meeting Chat
              </CardTitle>
              <CardDescription>
                {isConnected ? 'Chat is active' : 'Connecting to chat...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[500px]">
              <MeetingChat meetingId={meeting.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


import { useState, useEffect } from "react"
import { useMeetings } from "@/contexts/MeetingContext"
import { useCalendar } from "@/contexts/CalendarContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { format, parseISO } from "date-fns"
import { FileVideo, FileText, Search, Calendar, Clock, Download, AlertTriangle } from "lucide-react"
import { getMeetingRecording, RecordingDetails, generateTranscription, saveTranscriptionToDrive } from "@/utils/calendar"
import { useToast } from "@/hooks/use-toast"
import SocketService from "@/utils/socketService"

export function MeetingRecordings() {
  const { pastMeetings } = useMeetings()
  const { credentials } = useCalendar()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null)
  const [recordingDetails, setRecordingDetails] = useState<RecordingDetails | null>(null)
  const [loadingRecording, setLoadingRecording] = useState(false)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false)
  const [transcriptionProgress, setTranscriptionProgress] = useState(0)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  
  // Filter meetings that have a recording URL or might have one (completed meetings)
  const meetingsWithRecordings = pastMeetings.filter(
    meeting => meeting.status === "completed" || meeting.recordingUrl
  )
  
  // Filter by search term
  const filteredMeetings = meetingsWithRecordings.filter(
    meeting => 
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Listen for transcript events from socket
  useEffect(() => {
    if (!selectedRecording) return
    
    const handleTranscriptEvent = (event: CustomEvent) => {
      const data = event.detail
      if (data.meetingId === selectedRecording) {
        toast({
          title: "Transcript Updated",
          description: "Transcript generation has been completed",
        })
        
        // Reload recording details to get the updated transcript URL
        handleViewRecording(selectedRecording)
      }
    }
    
    window.addEventListener("meeting:transcript" as any, handleTranscriptEvent)
    
    return () => {
      window.removeEventListener("meeting:transcript" as any, handleTranscriptEvent)
    }
  }, [selectedRecording, toast])
  
  const handleViewRecording = async (meetingId: string) => {
    setSelectedRecording(meetingId)
    setLoadingRecording(true)
    setTranscription(null)
    setTranscriptionError(null)
    
    try {
      // Try to get the recording from Google Drive
      const details = await getMeetingRecording(meetingId, credentials)
      setRecordingDetails(details)
      
      // If there's a transcript URL, we'll assume there's already a transcript
      if (details?.transcriptUrl) {
        // In a real app, you would fetch and parse the transcript file
        setTranscription("Transcript is available for download")
      }
    } catch (error) {
      console.error("Error loading recording:", error)
      toast({
        title: "Error Loading Recording",
        description: "There was an error loading the recording. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingRecording(false)
    }
  }
  
  const handleGenerateTranscript = async () => {
    if (!recordingDetails?.recordingUrl || !selectedRecording) return
    
    setIsGeneratingTranscript(true)
    setTranscriptionProgress(0)
    setTranscriptionError(null)
    
    try {
      toast({
        title: "Generating Transcript",
        description: "Please wait while we generate the transcript. This may take a few minutes.",
      })
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setTranscriptionProgress(prev => {
          // Simulate progress up to 90% (real completion will come from API)
          if (prev < 90) {
            return prev + Math.random() * 5;
          }
          return prev;
        });
      }, 3000);
      
      // Generate the transcript
      const transcript = await generateTranscription(recordingDetails.recordingUrl, credentials);
      
      clearInterval(progressInterval);
      setTranscriptionProgress(100);
      
      if (!transcript) {
        throw new Error("Failed to generate transcript");
      }
      
      // Save the transcript to Google Drive
      const transcriptUrl = await saveTranscriptionToDrive(selectedRecording, transcript, credentials);
      
      if (transcriptUrl) {
        // Update the recording details with the new transcript URL
        setRecordingDetails({
          ...recordingDetails,
          transcriptUrl
        });
        
        // Notify other users that a transcript is available
        if (SocketService.isConnected()) {
          // Use the emit method to send the message
          SocketService.emit("meeting:transcript", {
            meetingId: selectedRecording,
            transcriptUrl,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      setTranscription(transcript);
      
      toast({
        title: "Transcript Generated",
        description: "The transcript has been successfully generated and saved.",
      });
    } catch (error: any) {
      console.error("Error generating transcript:", error);
      setTranscriptionError(error.message || "There was an error generating the transcript");
      toast({
        title: "Error Generating Transcript",
        description: "There was an error generating the transcript. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingTranscript(false);
    }
  };
  
  const selectedMeeting = pastMeetings.find(m => m.id === selectedRecording);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meeting Recordings & Transcripts</CardTitle>
          <CardDescription>
            Access recordings and transcripts of your past meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recordings by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recordings found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMeetings.map(meeting => (
                <Card key={meeting.id} className="overflow-hidden">
                  <div className="bg-muted aspect-video flex items-center justify-center">
                    <FileVideo className="h-12 w-12 text-primary/40" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1">{meeting.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(parseISO(meeting.startTime), "MMM d, yyyy")}
                      <Clock className="h-3 w-3 mx-1 ml-2" />
                      {format(parseISO(meeting.startTime), "h:mm a")}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline">{meeting.meetingType}</Badge>
                      <Button 
                        size="sm" 
                        onClick={() => handleViewRecording(meeting.id)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedRecording && selectedMeeting && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedMeeting.title}</CardTitle>
            <CardDescription>
              {format(parseISO(selectedMeeting.startTime), "MMMM d, yyyy 'at' h:mm a")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRecording ? (
              <div className="text-center py-8">
                <p>Loading recording...</p>
              </div>
            ) : !recordingDetails ? (
              <div className="text-center py-8">
                <p>Recording not found or still processing</p>
              </div>
            ) : (
              <Tabs defaultValue="recording">
                <TabsList className="mb-4">
                  <TabsTrigger value="recording">Recording</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="details">Meeting Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recording">
                  <div className="rounded-md overflow-hidden bg-muted aspect-video">
                    {recordingDetails.recordingUrl ? (
                      <iframe 
                        src={recordingDetails.recordingUrl.includes('drive.google.com') ? 
                          recordingDetails.recordingUrl.replace('/view', '/preview') : 
                          recordingDetails.recordingUrl}
                        className="w-full h-full" 
                        allow="autoplay; encrypted-media" 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-4">
                        <FileVideo className="h-16 w-16 text-primary/40 mb-2" />
                        <p className="text-center text-sm text-muted-foreground mb-4">
                          Video recording from {format(parseISO(selectedMeeting.startTime), "MMM d, yyyy")}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => window.open(recordingDetails.recordingUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                      Download Recording
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="transcript">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Meeting Transcript</CardTitle>
                        {recordingDetails.transcriptUrl ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={() => window.open(recordingDetails.transcriptUrl, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={handleGenerateTranscript}
                            disabled={isGeneratingTranscript}
                          >
                            {isGeneratingTranscript ? 'Generating...' : 'Generate Transcript'}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isGeneratingTranscript ? (
                        <div className="space-y-4 py-4">
                          <p className="text-center text-sm text-muted-foreground">
                            Generating transcript... This may take a few minutes.
                          </p>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                              style={{ width: `${transcriptionProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-center text-muted-foreground">
                            {transcriptionProgress < 100 
                              ? "Processing audio and converting to text..." 
                              : "Finalizing transcript..."}
                          </p>
                        </div>
                      ) : transcriptionError ? (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-md">
                          <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <p className="font-medium">Error generating transcript</p>
                          </div>
                          <p className="text-sm text-red-600">{transcriptionError}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleGenerateTranscript}
                            className="mt-4"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : transcription || recordingDetails.transcriptUrl ? (
                        <div className="p-4 bg-muted rounded-md max-h-[400px] overflow-y-auto">
                          {transcription ? (
                            <div className="space-y-4 whitespace-pre-line">
                              {transcription}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-32">
                              <p>Transcript is available for download</p>
                              <Button 
                                variant="link" 
                                className="mt-2"
                                onClick={() => window.open(recordingDetails.transcriptUrl, '_blank')}
                              >
                                Open transcript
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-muted rounded-md flex flex-col items-center justify-center h-32">
                          <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                          <p>No transcript available for this recording</p>
                          <Button 
                            variant="link" 
                            className="mt-2"
                            onClick={handleGenerateTranscript}
                            disabled={isGeneratingTranscript}
                          >
                            Generate transcript
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Description</h3>
                      <p className="text-sm text-muted-foreground">{selectedMeeting.description || "No description provided"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Participants</h3>
                      <div className="grid gap-2 md:grid-cols-2">
                        {selectedMeeting.participants.map(participant => (
                          <div key={participant.id} className="flex items-center p-2 rounded-md border">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              {participant.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{participant.name}</p>
                              <p className="text-xs text-muted-foreground">{participant.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedMeeting.agendaItems && selectedMeeting.agendaItems.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-1">Agenda</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedMeeting.agendaItems.map((item, index) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


import { useState } from "react"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { MeetingCalendar } from "@/components/meetings/MeetingCalendar"
import { UpcomingMeetings } from "@/components/meetings/UpcomingMeetings"
import { ScheduleMeeting } from "@/components/meetings/ScheduleMeeting"
import { CalendarIntegration } from "@/components/meetings/CalendarIntegration"
import { MeetingRecordings } from "@/components/meetings/MeetingRecordings"
import { Meeting, useMeetings } from "@/contexts/MeetingContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, parseISO, format } from "date-fns"

export function MeetingsDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const { upcomingMeetings, pastMeetings } = useMeetings()
  
  const getTypeBadgeVariant = (type: Meeting["meetingType"]) => {
    switch (type) {
      case "team": return "default"
      case "one-on-one": return "secondary"
      case "leadership": return "outline"
      case "organization": return "destructive"
      default: return "default"
    }
  }
  
  const getStatusBadge = (meeting: Meeting) => {
    switch (meeting.status) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>
      case "ongoing":
        return <Badge variant="default">Ongoing</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return null
    }
  }
  
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <UpcomingMeetings />
        <MeetingCalendar />
      </div>
      
      <Tabs defaultValue="upcoming" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming Meetings
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Meetings
            </TabsTrigger>
            <TabsTrigger value="recordings">
              Recordings
            </TabsTrigger>
            <TabsTrigger value="schedule">
              Schedule Meeting
            </TabsTrigger>
            <TabsTrigger value="settings">
              Calendar Settings
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>
                View and manage your upcoming meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming meetings scheduled</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab("schedule")}
                  >
                    Schedule a Meeting
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingMeetings.map(meeting => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">{meeting.title}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(meeting.meetingType)}>
                            {meeting.meetingType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{format(parseISO(meeting.startTime), "MMM d, yyyy")}</span>
                            <span className="text-muted-foreground text-xs">
                              {format(parseISO(meeting.startTime), "h:mm a")} - {format(parseISO(meeting.endTime), "h:mm a")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(parseISO(meeting.startTime), { addSuffix: true })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{meeting.participants.length}</TableCell>
                        <TableCell>{getStatusBadge(meeting)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {meeting.location?.type === "virtual" && meeting.location.link && (
                              <Button size="sm" variant="default">
                                Join
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Past Meetings</CardTitle>
              <CardDescription>
                View recordings and transcripts of past meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pastMeetings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No past meetings found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Recording</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastMeetings.map(meeting => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">{meeting.title}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(meeting.meetingType)}>
                            {meeting.meetingType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{format(parseISO(meeting.startTime), "MMM d, yyyy")}</span>
                            <span className="text-muted-foreground text-xs">
                              {format(parseISO(meeting.startTime), "h:mm a")} - {format(parseISO(meeting.endTime), "h:mm a")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{meeting.participants.length}</TableCell>
                        <TableCell>
                          {meeting.recordingUrl ? (
                            <Button size="sm" variant="outline">
                              View Recording
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not available</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recordings">
          <MeetingRecordings />
        </TabsContent>
        
        <TabsContent value="schedule">
          <ScheduleMeeting />
        </TabsContent>
        
        <TabsContent value="settings">
          <CalendarIntegration />
        </TabsContent>
      </Tabs>
    </div>
  )
}

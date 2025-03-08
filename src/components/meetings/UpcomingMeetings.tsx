
import { useMeetings, Meeting } from "@/contexts/MeetingContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, Video, Users, Calendar as CalendarIcon } from "lucide-react"
import { formatRelative, parseISO, format } from "date-fns"

export function UpcomingMeetings() {
  const { upcomingMeetings } = useMeetings()
  
  const getTimeBadgeColor = (meeting: Meeting) => {
    const startTime = new Date(meeting.startTime)
    const now = new Date()
    const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) return "bg-red-500 hover:bg-red-600"
    if (diffHours < 24) return "bg-yellow-500 hover:bg-yellow-600"
    return "bg-green-500 hover:bg-green-600"
  }
  
  const getTypeBadgeVariant = (type: Meeting["meetingType"]) => {
    switch (type) {
      case "team": return "default"
      case "one-on-one": return "secondary"
      case "leadership": return "outline"
      case "organization": return "destructive"
      default: return "default"
    }
  }
  
  if (upcomingMeetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No upcoming meetings scheduled</p>
            <Button className="mt-4">Schedule a Meeting</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Upcoming Meetings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingMeetings.slice(0, 5).map((meeting) => {
            const startTime = parseISO(meeting.startTime)
            
            return (
              <div 
                key={meeting.id}
                className="flex flex-col space-y-2 rounded-lg border p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{meeting.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {meeting.hostName} + {meeting.participants.length} attendees
                      </span>
                    </div>
                  </div>
                  <Badge variant={getTypeBadgeVariant(meeting.meetingType)}>
                    {meeting.meetingType}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getTimeBadgeColor(meeting)}>
                      {formatRelative(startTime, new Date())}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(startTime, "h:mm a")} - {format(parseISO(meeting.endTime), "h:mm a")}
                    </span>
                  </div>
                  
                  {meeting.location?.type === "virtual" && (
                    <Button variant="outline" size="sm" className="gap-1">
                      <Video className="h-3.5 w-3.5" />
                      Join
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
          
          {upcomingMeetings.length > 5 && (
            <Button variant="outline" className="w-full">
              View All ({upcomingMeetings.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

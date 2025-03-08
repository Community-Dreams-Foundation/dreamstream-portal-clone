
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { useMeetings, Meeting } from "@/contexts/MeetingContext"
import { Button } from "@/components/ui/button"
import { format, isSameDay, parseISO } from "date-fns"

export function MeetingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { meetings } = useMeetings()
  
  // Filter meetings for the selected date
  const meetingsOnSelectedDate = date 
    ? meetings.filter(meeting => {
        const meetingDate = parseISO(meeting.startTime)
        return isSameDay(meetingDate, date)
      })
    : []
    
  // Sort by start time
  meetingsOnSelectedDate.sort((a, b) => 
    parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
  )
  
  const getTypeBadgeVariant = (type: Meeting["meetingType"]) => {
    switch (type) {
      case "team": return "default"
      case "one-on-one": return "secondary"
      case "leadership": return "outline"
      case "organization": return "destructive"
      default: return "default"
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Meeting Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          
          <div>
            {date && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {format(date, "MMMM d, yyyy")}
                  </h3>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        const prevDay = new Date(date)
                        prevDay.setDate(prevDay.getDate() - 1)
                        setDate(prevDay)
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        const nextDay = new Date(date)
                        nextDay.setDate(nextDay.getDate() + 1)
                        setDate(nextDay)
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  {meetingsOnSelectedDate.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No meetings scheduled for this day
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meetingsOnSelectedDate.map(meeting => (
                        <div 
                          key={meeting.id}
                          className="flex items-start justify-between p-3 border rounded-md"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getTypeBadgeVariant(meeting.meetingType)}>
                                {meeting.meetingType}
                              </Badge>
                              <span className="font-medium">{meeting.title}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Clock className="mr-1 h-3.5 w-3.5" />
                              <span>
                                {format(parseISO(meeting.startTime), "h:mm a")} - {format(parseISO(meeting.endTime), "h:mm a")}
                              </span>
                            </div>
                          </div>
                          
                          {meeting.location?.type === "virtual" && meeting.location.link && (
                            <Button size="sm" variant="outline">Join</Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

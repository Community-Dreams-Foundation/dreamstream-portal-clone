
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  
  return (
    <div className="container py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Meetings Dashboard</CardTitle>
          <CardDescription>
            Manage your meetings and calendar integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Calendar Functionality Unavailable</AlertTitle>
            <AlertDescription>
              The calendar and meeting functionality is currently unavailable. Please try again later.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button disabled>Schedule Meeting</Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
          <TabsTrigger value="past">Past Meetings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No upcoming meetings found.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Past Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No past meetings found.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Calendar functionality is currently unavailable.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

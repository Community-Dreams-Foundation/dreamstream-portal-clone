
import { useState } from "react"
import { useCalendar } from "@/contexts/CalendarContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCalendarAuthUrl } from "@/utils/calendar"
import { CalendarClock, RefreshCw, Unlink, Calendar as CalendarIcon } from "lucide-react"

export function CalendarIntegration() {
  const { 
    calendarSettings, 
    isConnected, 
    isLoading,
    connectCalendar, 
    disconnectCalendar, 
    updateSettings 
  } = useCalendar()
  
  const [provider, setProvider] = useState<"google" | "outlook">("google")
  
  const handleConnect = async () => {
    // In a real implementation, we would redirect to the OAuth URL
    // window.location.href = getCalendarAuthUrl()
    
    // For this mock implementation, we'll just simulate connecting
    await connectCalendar(provider)
  }
  
  const handleDisconnect = async () => {
    await disconnectCalendar()
  }
  
  const handleToggleAutoSend = async () => {
    await updateSettings({ autoSendInvites: !calendarSettings.autoSendInvites })
  }
  
  const handleChangeReminder = async (value: string) => {
    await updateSettings({ defaultReminder: parseInt(value) })
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
        <CardDescription>
          Connect your calendar to automatically send meeting invites
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connected to {calendarSettings.provider}</p>
                <p className="text-sm text-muted-foreground">
                  Your {calendarSettings.provider} calendar is connected and syncing
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisconnect} className="gap-1">
                <Unlink className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-send"
                  checked={calendarSettings.autoSendInvites}
                  onCheckedChange={handleToggleAutoSend}
                />
                <Label htmlFor="auto-send">Automatically send calendar invites</Label>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="reminder-time">Default reminder time</Label>
                <Select 
                  value={calendarSettings.defaultReminder.toString()}
                  onValueChange={handleChangeReminder}
                >
                  <SelectTrigger id="reminder-time">
                    <SelectValue placeholder="Select reminder time" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="10">10 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Not connected</p>
                <p className="text-sm text-muted-foreground">
                  Connect your calendar to automatically send meeting invites
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calendar-provider">Calendar provider</Label>
              <Select
                value={provider} 
                onValueChange={(value: "google" | "outlook") => setProvider(value)}
              >
                <SelectTrigger id="calendar-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleConnect} className="w-full gap-1">
              <CalendarIcon className="h-4 w-4" />
              Connect {provider === "google" ? "Google Calendar" : "Outlook"}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between text-xs text-muted-foreground">
        <p>Last sync: {isConnected ? "Just now" : "Never"}</p>
        {isConnected && (
          <Button variant="ghost" size="sm" className="h-7 gap-1">
            <RefreshCw className="h-3 w-3" />
            Sync now
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

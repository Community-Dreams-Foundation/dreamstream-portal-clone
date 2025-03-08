
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Clock, Mail, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskReminders } from "@/hooks/useTaskReminders";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskReminderSettings() {
  const { reminderSettings, saveSettings, loading } = useTaskReminders();
  const [localSettings, setLocalSettings] = useState(reminderSettings);
  const [isSaving, setIsSaving] = useState(false);
  
  // Update local state when settings are loaded
  React.useEffect(() => {
    if (!loading) {
      setLocalSettings(reminderSettings);
    }
  }, [reminderSettings, loading]);
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    await saveSettings(localSettings);
    setIsSaving(false);
  };
  
  const handleDayBeforeToggle = (day: number) => {
    setLocalSettings(prev => {
      const newDaysBefore = prev.daysBefore.includes(day)
        ? prev.daysBefore.filter(d => d !== day)
        : [...prev.daysBefore, day].sort((a, b) => a - b);
      
      return { ...prev, daysBefore: newDaysBefore };
    });
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32 ml-auto" />
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Task Reminder Settings
        </CardTitle>
        <CardDescription>
          Configure how and when you want to be reminded about upcoming tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-toggle">Enable Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for tasks approaching their due dates.
              </p>
            </div>
            <Switch
              id="reminder-toggle"
              checked={localSettings.enabled}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className={localSettings.enabled ? "space-y-4" : "space-y-4 opacity-50 pointer-events-none"}>
            <div>
              <Label className="text-base">Reminder Schedule</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Choose when you want to be reminded before a task's due date.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {[1, 2, 3, 5, 7, 14, 30].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={localSettings.daysBefore.includes(day)}
                      onCheckedChange={() => handleDayBeforeToggle(day)}
                    />
                    <label
                      htmlFor={`day-${day}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day} {day === 1 ? "day" : "days"} before
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-base">Notification Channels</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Choose how you want to receive task reminders.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-app"
                    checked={localSettings.notifyInApp}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({ 
                        ...prev, 
                        notifyInApp: checked === true 
                      }))
                    }
                  />
                  <label
                    htmlFor="in-app"
                    className="text-sm font-medium leading-none flex items-center gap-1"
                  >
                    <Bell className="h-4 w-4" /> In-app notifications
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={localSettings.notifyEmail}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({ 
                        ...prev, 
                        notifyEmail: checked === true 
                      }))
                    }
                  />
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none flex items-center gap-1"
                  >
                    <Mail className="h-4 w-4" /> Email notifications
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving || JSON.stringify(localSettings) === JSON.stringify(reminderSettings)}
          className="ml-auto"
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">•</span>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default TaskReminderSettings;

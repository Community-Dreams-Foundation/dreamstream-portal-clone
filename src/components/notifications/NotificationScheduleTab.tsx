
import React from "react";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, Moon, Sun } from "lucide-react";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { NotificationSchedule } from "./types";

interface NotificationScheduleTabProps {
  schedule: NotificationSchedule;
  updateSchedule: (updates: Partial<NotificationSchedule>) => void;
  onSaveSchedule: (values: any) => Promise<void>;
}

const notificationSchema = z.object({
  schedule: z.object({
    quietHoursEnabled: z.boolean(),
    quietHoursStart: z.string(),
    quietHoursEnd: z.string(),
    weekendsOff: z.boolean(),
    customDays: z.object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean(),
    }),
  }),
});

export default function NotificationScheduleTab({
  schedule,
  updateSchedule,
  onSaveSchedule,
}: NotificationScheduleTabProps) {
  return (
    <SettingsForm
      schema={notificationSchema}
      defaultValues={{
        schedule: schedule,
      }}
      onSubmit={onSaveSchedule}
    >
      <SettingsCard
        title="Do Not Disturb Schedule"
        description="Set quiet hours and days when you don't want to receive notifications."
      >
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="quiet-hours"
                checked={schedule.quietHoursEnabled}
                onCheckedChange={(checked) => updateSchedule({ quietHoursEnabled: checked })}
              />
              <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
            </div>
            
            {schedule.quietHoursEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4 text-muted-foreground" />
                    <input
                      id="start-time"
                      type="time"
                      value={schedule.quietHoursStart}
                      onChange={(e) => updateSchedule({ quietHoursStart: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <input
                      id="end-time"
                      type="time"
                      value={schedule.quietHoursEnd}
                      onChange={(e) => updateSchedule({ quietHoursEnd: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="weekends-off"
                checked={schedule.weekendsOff}
                onCheckedChange={(checked) => updateSchedule({ 
                  weekendsOff: checked,
                  customDays: {
                    ...schedule.customDays,
                    saturday: !checked,
                    sunday: !checked
                  }
                })}
              />
              <Label htmlFor="weekends-off">Disable weekend notifications</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Custom Days</Label>
              <div className="grid grid-cols-7 gap-2">
                {Object.entries({
                  monday: "M",
                  tuesday: "T",
                  wednesday: "W",
                  thursday: "T",
                  friday: "F",
                  saturday: "S",
                  sunday: "S"
                }).map(([day, label]) => {
                  const isWeekend = day === "saturday" || day === "sunday";
                  const disabled = isWeekend && schedule.weekendsOff;
                  
                  return (
                    <div key={day} className="text-center">
                      <button
                        type="button"
                        disabled={disabled}
                        className={`w-10 h-10 rounded-full ${
                          schedule.customDays[day as keyof typeof schedule.customDays] && !disabled
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        onClick={() => {
                          if (!disabled) {
                            updateSchedule({
                              customDays: {
                                ...schedule.customDays,
                                [day]: !schedule.customDays[day as keyof typeof schedule.customDays]
                              }
                            });
                          }
                        }}
                      >
                        {label}
                      </button>
                      <span className="text-xs block mt-1 capitalize">{day.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Notification Schedule</AlertTitle>
            <AlertDescription>
              During quiet hours and on disabled days, you will not receive push or email notifications. 
              In-app notifications will still be collected and available when you log in.
            </AlertDescription>
          </Alert>
        </div>
      </SettingsCard>
    </SettingsForm>
  );
}

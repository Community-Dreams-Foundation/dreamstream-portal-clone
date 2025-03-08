
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDatabase, ref, update, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import NotificationPreferencesTab from "./NotificationPreferencesTab";
import NotificationScheduleTab from "./NotificationScheduleTab";
import NotificationExamplesTab from "./NotificationExamplesTab";
import { NotificationPreference, NotificationSchedule } from "./types";

const defaultSchedule: NotificationSchedule = {
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  weekendsOff: false,
  customDays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  },
};

export default function NotificationSettings() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<
    Record<string, NotificationPreference>
  >({});
  const [schedule, setSchedule] = useState<NotificationSchedule>(defaultSchedule);
  const [activeTab, setActiveTab] = useState("categories");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const loadPreferences = async () => {
      try {
        const db = getDatabase();
        const prefsRef = ref(db, `users/${currentUser.uid}/notificationPreferences`);
        const scheduleRef = ref(db, `users/${currentUser.uid}/notificationSchedule`);
        
        const [prefsSnapshot, scheduleSnapshot] = await Promise.all([
          get(prefsRef),
          get(scheduleRef)
        ]);

        if (prefsSnapshot.exists()) {
          setPreferences(prefsSnapshot.val());
        } else {
          // Set default preferences for all notification groups from types
          const defaults: Record<string, NotificationPreference> = {};
          
          // Import notification groups from types
          const { notificationGroups } = await import("./types");
          
          Object.values(notificationGroups).forEach(group => {
            group.types.forEach(type => {
              defaults[type] = {
                enabled: true,
                channel: "both",
                frequency: "immediate",
              };
            });
          });
          setPreferences(defaults);
        }
        
        if (scheduleSnapshot.exists()) {
          setSchedule(scheduleSnapshot.val());
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error);
        toast({
          title: "Error",
          description: "Failed to load notification preferences",
          variant: "destructive",
        });
      }
    };

    loadPreferences();
  }, [currentUser, toast]);

  const handleUpdatePreference = (
    type: string,
    field: keyof NotificationPreference,
    value: any
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleSavePreferences = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      const db = getDatabase();
      await update(ref(db, `users/${currentUser.uid}`), {
        notificationPreferences: preferences,
      });
      
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveSchedule = async (values: any) => {
    if (!currentUser) return;
    
    try {
      const db = getDatabase();
      await update(ref(db, `users/${currentUser.uid}`), {
        notificationSchedule: values.schedule,
      });
      
      setSchedule(values.schedule);
      
      toast({
        title: "Schedule Saved",
        description: "Your notification schedule has been updated",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving notification schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save notification schedule",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSchedule = (updates: Partial<NotificationSchedule>) => {
    setSchedule(prevSchedule => {
      // Handle the special case for customDays to ensure it's always complete
      const updatedCustomDays = updates.customDays 
        ? { ...prevSchedule.customDays, ...updates.customDays }
        : prevSchedule.customDays;
        
      // Return a complete NotificationSchedule object
      return {
        ...prevSchedule,
        ...updates,
        // Always ensure customDays is complete even if updates.customDays is partial
        customDays: updatedCustomDays
      };
    });
  };

  const hasPreferences = Object.keys(preferences).length > 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold">Notification Settings</h2>
        <p className="text-muted-foreground">
          Manage how and when you receive notifications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="examples">Notification Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="mt-6">
          <NotificationPreferencesTab 
            preferences={preferences}
            hasPreferences={hasPreferences}
            onUpdatePreference={handleUpdatePreference}
            onSavePreferences={handleSavePreferences}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-6">
          <NotificationScheduleTab 
            schedule={schedule}
            updateSchedule={updateSchedule}
            onSaveSchedule={handleSaveSchedule}
          />
        </TabsContent>
        
        <TabsContent value="examples" className="mt-6">
          <NotificationExamplesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

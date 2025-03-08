
import React from "react";
import { Bell, BellOff } from "lucide-react";
import { NotificationPreference } from "./types";
import { notificationGroups } from "./types";
import { SettingsCard } from "@/components/settings/SettingsCard";
import NotificationPreferenceItem from "./NotificationPreferenceItem";

interface NotificationPreferencesTabProps {
  preferences: Record<string, NotificationPreference>;
  hasPreferences: boolean;
  onUpdatePreference: (type: string, field: keyof NotificationPreference, value: any) => void;
  onSavePreferences: () => Promise<void>;
  saving: boolean;
}

export default function NotificationPreferencesTab({
  preferences,
  hasPreferences,
  onUpdatePreference,
  onSavePreferences,
  saving,
}: NotificationPreferencesTabProps) {
  return (
    <SettingsCard
      title="Notification Categories"
      description="Configure which notifications you want to receive and how you want to receive them."
      footer={
        <div className="flex justify-end mt-4">
          <button
            onClick={onSavePreferences}
            disabled={saving}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            {saving ? <span className="animate-spin">•</span> : <Bell className="h-4 w-4" />}
            Save Preferences
          </button>
        </div>
      }
    >
      {hasPreferences ? (
        <div className="space-y-6">
          {Object.entries(notificationGroups).map(([groupKey, group]) => (
            <div key={groupKey} className="space-y-4">
              <div className="flex items-center gap-2">
                {group.icon}
                <h3 className="text-lg font-medium">{group.label}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{group.description}</p>
              <div className="space-y-1 border rounded-lg p-4">
                {group.types.map((type) => (
                  <NotificationPreferenceItem
                    key={type}
                    type={type}
                    preference={
                      preferences[type] || {
                        enabled: true,
                        channel: "both",
                        frequency: "immediate",
                      }
                    }
                    onUpdate={onUpdatePreference}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Preferences Set</h3>
          <p className="text-muted-foreground">
            Loading your notification preferences...
          </p>
        </div>
      )}
    </SettingsCard>
  );
}

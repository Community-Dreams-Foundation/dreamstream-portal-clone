
import React from "react";
import { SettingsCard } from "@/components/settings/SettingsCard";
import NotificationExample from "./NotificationExample";
import { notificationGroups } from "./types";

export default function NotificationExamplesTab() {
  return (
    <SettingsCard
      title="Notification Examples"
      description="Preview how different types of notifications will appear in the app."
    >
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(notificationGroups).map(([groupKey, group]) => (
          <div key={groupKey} className="space-y-4">
            <div className="flex items-center gap-2">
              {group.icon}
              <h3 className="text-lg font-medium">{group.label}</h3>
            </div>
            <div className="border rounded-lg p-4 space-y-4">
              {group.types.map((type) => (
                <NotificationExample key={type} type={type} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}


import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationPreference } from "./types";
import { getNotificationIcon } from "./types";

interface NotificationPreferenceItemProps {
  type: string;
  preference: NotificationPreference;
  onUpdate: (type: string, field: keyof NotificationPreference, value: any) => void;
}

export default function NotificationPreferenceItem({
  type,
  preference,
  onUpdate,
}: NotificationPreferenceItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        {getNotificationIcon(type)}
        <span className="capitalize font-medium">
          {type.replace(/_/g, " ")}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`${type}-enabled`}
            checked={preference.enabled}
            onCheckedChange={(checked) => onUpdate(type, "enabled", checked)}
          />
          <Label htmlFor={`${type}-enabled`}>Enabled</Label>
        </div>

        <Select
          value={preference.channel}
          onValueChange={(value) =>
            onUpdate(type, "channel", value as "in-app" | "email" | "both")
          }
          disabled={!preference.enabled}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in-app">In-app Only</SelectItem>
            <SelectItem value="email">Email Only</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={preference.frequency}
          onValueChange={(value) =>
            onUpdate(
              type,
              "frequency",
              value as "immediate" | "hourly" | "daily"
            )
          }
          disabled={!preference.enabled || preference.channel === "in-app"}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediate</SelectItem>
            <SelectItem value="hourly">Hourly Digest</SelectItem>
            <SelectItem value="daily">Daily Digest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

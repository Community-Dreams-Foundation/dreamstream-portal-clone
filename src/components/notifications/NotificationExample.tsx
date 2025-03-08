
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/contexts/NotificationContext";
import { getNotificationIcon, getNotificationColor } from "./types";

interface NotificationExampleProps {
  type: string;
}

export default function NotificationExample({ type }: NotificationExampleProps) {
  const exampleNotification = getExampleNotification(type);

  return (
    <div className="relative rounded-lg border p-4 my-2 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getNotificationColor(type, exampleNotification.metadata?.priority)} text-white`}>
          {getNotificationIcon(type, 5)}
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{exampleNotification.title}</h4>
            <Badge variant={
              exampleNotification.metadata?.priority === "high" ? "destructive" :
              exampleNotification.metadata?.priority === "medium" ? "default" :
              "outline"
            }>
              {exampleNotification.metadata?.priority || "normal"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{exampleNotification.message}</p>
          {exampleNotification.metadata?.actionRequired && (
            <Badge variant="outline" className="mt-1">Action Required</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

const getExampleNotification = (type: string): Notification => {
  const baseNotification = {
    id: `example-${type}`,
    status: "unread" as const,
    timestamp: Date.now(),
  };

  switch (type) {
    case "meeting":
      return {
        ...baseNotification,
        title: "Meeting Reminder",
        message: "Weekly Sync starts in 15 minutes",
        type: "meeting",
        metadata: {
          meetingId: "123",
          priority: "medium" as const,
          actionRequired: true,
          action: {
            type: "join_meeting",
            link: "/meetings/123",
          },
        },
      };
    case "task_alert":
      return {
        ...baseNotification,
        title: "Task Due Soon",
        message: "Project milestone due in 2 days",
        type: "task_alert",
        metadata: {
          taskId: "456",
          priority: "high" as const,
          actionRequired: true,
        },
      };
    case "leadership":
      return {
        ...baseNotification,
        title: "Leadership Challenge",
        message: "New team leadership challenge available",
        type: "leadership",
        metadata: {
          priority: "medium" as const,
        },
      };
    case "fee_reminder":
      return {
        ...baseNotification,
        title: "Payment Due",
        message: "Monthly subscription payment due in 3 days",
        type: "fee_reminder",
        metadata: {
          amount: 199,
          dueDate: "2023-06-15",
          priority: "high" as const,
        },
      };
    case "system":
      return {
        ...baseNotification,
        title: "System Update",
        message: "Platform updates scheduled for tonight at 2AM",
        type: "system",
        metadata: {
          priority: "low" as const,
        },
      };
    default:
      return {
        ...baseNotification,
        title: "Notification Example",
        message: `This is an example ${type} notification`,
        type: type as any,
        metadata: {
          priority: "medium" as const,
        },
      };
  }
};

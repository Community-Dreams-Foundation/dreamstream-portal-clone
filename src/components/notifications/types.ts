
import { 
  Bell,
  BellOff,
  Calendar,
  ClipboardList,
  Clock,
  CreditCard,
  MessageSquare,
  Moon,
  Shield,
  Star,
  Sun,
  User,
  Wrench,
  AlertTriangle,
  Check,
  Info,
  Timer,
} from "lucide-react";
import React from "react";

export interface NotificationPreference {
  enabled: boolean;
  channel: "in-app" | "email" | "both";
  frequency: "immediate" | "hourly" | "daily";
}

export type NotificationGroup = "system" | "leadership" | "productivity" | "meetings" | "financial";

export type GroupedPreferences = {
  [key in NotificationGroup]: {
    types: string[];
    label: string;
    icon: React.ReactNode;
    description: string;
  }
};

export interface NotificationSchedule {
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  weekendsOff: boolean;
  customDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

// Create icon components functions to avoid using JSX directly in the object
const createWrenchIcon = () => React.createElement(Wrench, { className: "h-4 w-4" });
const createShieldIcon = () => React.createElement(Shield, { className: "h-4 w-4" });
const createClipboardListIcon = () => React.createElement(ClipboardList, { className: "h-4 w-4" });
const createCalendarIcon = () => React.createElement(Calendar, { className: "h-4 w-4" });
const createCreditCardIcon = () => React.createElement(CreditCard, { className: "h-4 w-4" });

export const notificationGroups: GroupedPreferences = {
  system: {
    types: ["system"],
    label: "System",
    icon: createWrenchIcon(),
    description: "Platform updates, maintenance notifications, and service announcements",
  },
  leadership: {
    types: ["leadership", "performance_update"],
    label: "Leadership",
    icon: createShieldIcon(),
    description: "Leadership assessments, challenges, and tier updates",
  },
  productivity: {
    types: ["task_alert", "comment", "waiver"],
    label: "Tasks & Productivity",
    icon: createClipboardListIcon(),
    description: "Task assignments, deadlines, comments, and waiver notifications",
  },
  meetings: {
    types: ["meeting", "support"],
    label: "Meetings & Support",
    icon: createCalendarIcon(),
    description: "Meeting reminders, recording availability, and support tickets",
  },
  financial: {
    types: ["fee_reminder", "payment"],
    label: "Financial",
    icon: createCreditCardIcon(),
    description: "Fee reminders, payment confirmations, and financial updates",
  },
};

export const getNotificationIcon = (type: string, size = 4) => {
  const className = `h-${size} w-${size}`;
  
  switch (type) {
    case "meeting":
      return React.createElement(Calendar, { className });
    case "support":
      return React.createElement(MessageSquare, { className });
    case "task_alert":
      return React.createElement(ClipboardList, { className });
    case "fee_reminder":
      return React.createElement(CreditCard, { className });
    case "performance_update":
      return React.createElement(Star, { className });
    case "leadership":
      return React.createElement(Shield, { className });
    case "waiver":
      return React.createElement(User, { className });
    case "payment":
      return React.createElement(CreditCard, { className });
    case "comment":
      return React.createElement(MessageSquare, { className });
    case "system":
      return React.createElement(Wrench, { className });
    default:
      return React.createElement(Bell, { className });
  }
};

export const getNotificationColor = (type: string, priority?: string) => {
  if (priority === "high") return "bg-red-500";
  if (priority === "medium") return "bg-yellow-500";
  if (priority === "low") return "bg-green-500";
  
  switch (type) {
    case "fee_reminder":
    case "task_alert":
      return "bg-red-500";
    case "leadership":
    case "performance_update":
      return "bg-green-500";
    case "meeting":
      return "bg-blue-500";
    default:
      return "bg-primary";
  }
};

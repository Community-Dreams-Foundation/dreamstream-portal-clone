
export interface CalendarCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface CalendarSettings {
  provider: "google" | "outlook" | "none";
  autoSendInvites: boolean;
  defaultReminder: number; // minutes
  credentials?: CalendarCredentials;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  meetingId: string;
  status: "pending" | "confirmed" | "cancelled";
  eventUrl?: string;
  createdAt: string;
}

export interface RecordingDetails {
  recordingUrl: string;
  transcriptUrl?: string;
  duration: number;
  generatedAt: string;
}

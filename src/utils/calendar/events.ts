
import { calendar_v3 } from '@googleapis/calendar'
import { Meeting } from "@/contexts/MeetingContext"
import { CalendarCredentials, CalendarEvent } from './types'
import { createOAuth2Client } from './auth'

/**
 * Create a new calendar event for a meeting
 */
export async function createCalendarEvent(meeting: Meeting, credentials?: CalendarCredentials): Promise<CalendarEvent | null> {
  if (!credentials) {
    console.log("No calendar credentials provided");
    return null;
  }

  try {
    const { calendar } = await import('@googleapis/calendar');
    const oauth2Client = createOAuth2Client(credentials);
    const calendarClient = calendar({ version: 'v3', auth: oauth2Client });

    // Define the event with the correct type
    const event: calendar_v3.Schema$Event = {
      summary: meeting.title,
      description: meeting.description,
      start: {
        dateTime: meeting.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: meeting.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: meeting.participants.map(p => ({ email: p.email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    if (meeting.location?.type === 'virtual') {
      event.conferenceData = {
        createRequest: {
          requestId: meeting.id,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    } else if (meeting.location?.type === 'physical') {
      event.location = meeting.location.address;
    }

    const result = await calendarClient.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    if (!result.data || !result.data.id) {
      throw new Error('Failed to create calendar event');
    }

    return {
      id: result.data.id,
      calendarId: 'primary',
      meetingId: meeting.id,
      status: 'confirmed',
      eventUrl: result.data.htmlLink || undefined,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  meetingId: string,
  meeting: Meeting,
  credentials?: CalendarCredentials
): Promise<CalendarEvent | null> {
  if (!credentials) {
    console.log("No calendar credentials provided");
    return null;
  }

  try {
    const { calendar } = await import('@googleapis/calendar');
    const oauth2Client = createOAuth2Client(credentials);
    const calendarClient = calendar({ version: 'v3', auth: oauth2Client });

    // Define the event with the correct type
    const event: calendar_v3.Schema$Event = {
      summary: meeting.title,
      description: meeting.description,
      start: {
        dateTime: meeting.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: meeting.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: meeting.participants.map(p => ({ email: p.email })),
    };

    if (meeting.location?.type === 'virtual') {
      event.conferenceData = {
        createRequest: {
          requestId: meeting.id,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    } else if (meeting.location?.type === 'physical') {
      event.location = meeting.location.address;
    }

    const result = await calendarClient.events.update({
      calendarId: 'primary',
      eventId: meeting.calendarEventId,
      requestBody: event,
      sendUpdates: 'all',
    });

    if (!result.data || !result.data.id) {
      throw new Error('Failed to update calendar event');
    }

    return {
      id: result.data.id,
      calendarId: 'primary',
      meetingId: meeting.id,
      status: 'confirmed',
      eventUrl: result.data.htmlLink || undefined,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  meetingId: string,
  eventId: string,
  credentials?: CalendarCredentials
): Promise<boolean> {
  if (!credentials) {
    console.log("No calendar credentials provided");
    return false;
  }

  try {
    const { calendar } = await import('@googleapis/calendar');
    const oauth2Client = createOAuth2Client(credentials);
    const calendarClient = calendar({ version: 'v3', auth: oauth2Client });

    await calendarClient.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all',
    });

    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}

/**
 * Generate a conference link for a virtual meeting
 */
export function generateConferenceLink(provider: "google" | "zoom" | "teams"): string {
  const randomId = Math.random().toString(36).substring(2, 10)
  
  if (provider === "google") {
    return `https://meet.google.com/${randomId}`
  }
  
  // Fallback to Google Meet regardless of provider to ensure Google-only solution
  return `https://meet.google.com/${randomId}`
}

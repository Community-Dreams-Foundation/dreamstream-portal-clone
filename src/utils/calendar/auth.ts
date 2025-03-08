
import { auth } from '@googleapis/calendar'
import { CalendarCredentials } from './types'

/**
 * Generate the Google Calendar authentication URL
 */
export function getCalendarAuthUrl(): string {
  const oauth2Client = new auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/speech'
    ]
  });
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<CalendarCredentials | null> {
  try {
    const oauth2Client = new auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return null;
  }
}

/**
 * Create an OAuth2 client with the provided credentials
 */
export function createOAuth2Client(credentials: CalendarCredentials) {
  const oauth2Client = new auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: credentials.accessToken,
    refresh_token: credentials.refreshToken
  });
  
  return oauth2Client;
}

/**
 * Verify if calendar credentials are valid
 */
export async function verifyCalendarCredentials(credentials: CalendarCredentials): Promise<boolean> {
  try {
    const { calendar } = await import('@googleapis/calendar');
    const oauth2Client = createOAuth2Client(credentials);
    const calendarClient = calendar({ version: 'v3', auth: oauth2Client });
    
    // Try to list a single event to verify credentials
    await calendarClient.events.list({
      calendarId: 'primary',
      maxResults: 1,
    });

    return true;
  } catch (error) {
    console.error('Error verifying calendar credentials:', error);
    return false;
  }
}

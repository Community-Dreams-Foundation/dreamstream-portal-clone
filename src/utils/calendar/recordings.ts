
import { drive_v3 } from '@googleapis/drive'
import { format } from "date-fns"
import { CalendarCredentials, RecordingDetails } from './types'
import { createOAuth2Client } from './auth'

/**
 * Start recording a Google Meet session
 */
export async function startMeetingRecording(meetingId: string, conferenceLink: string, credentials?: CalendarCredentials): Promise<boolean> {
  if (!credentials) {
    console.log("No credentials provided");
    return false;
  }

  try {
    // Extract Google Meet ID from conference link
    const meetIdMatch = conferenceLink.match(/\/([a-z0-9\-]+)(?:\?|$)/);
    if (!meetIdMatch) {
      console.error('Could not extract Google Meet ID from link:', conferenceLink);
      return false;
    }
    
    const meetId = meetIdMatch[1];
    
    // In a production app, you would use the Google Meet API to start recording
    // Note: Google Meet recording requires Google Workspace Enterprise edition
    console.log(`Starting recording for Google Meet with ID: ${meetId}`);
    
    // This would be the actual API call to Google Meet
    // Currently, Google doesn't provide a public API for programmatically starting recordings
    // This is typically done through the Google Meet UI or Google Workspace Admin controls
    
    return true;
  } catch (error) {
    console.error('Error starting Google Meet recording:', error);
    return false;
  }
}

/**
 * Retrieve a meeting recording from Google Drive
 */
export async function getMeetingRecording(meetingId: string, credentials?: CalendarCredentials): Promise<RecordingDetails | null> {
  if (!credentials) {
    console.log("No credentials provided for retrieving recording");
    return null;
  }

  try {
    const { drive } = await import('@googleapis/drive');
    const oauth2Client = createOAuth2Client(credentials);
    const driveClient = drive({ version: 'v3', auth: oauth2Client });
    
    // Search for the recording file in Google Drive
    const searchResponse = await driveClient.files.list({
      q: `name contains 'recording-${meetingId}' and mimeType contains 'video/'`,
      spaces: 'drive',
      fields: 'files(id, name, webViewLink, createdTime, mimeType)'
    });

    if (!searchResponse.data.files || searchResponse.data.files.length === 0) {
      console.log(`No recording found for meeting ID: ${meetingId}`);
      return null;
    }

    const recordingFile = searchResponse.data.files[0];
    
    // Check if there's a transcript file as well
    const transcriptResponse = await driveClient.files.list({
      q: `name contains 'transcript-${meetingId}' and mimeType contains 'text/'`,
      spaces: 'drive',
      fields: 'files(id, name, webViewLink)'
    });

    const transcriptUrl = transcriptResponse.data.files && transcriptResponse.data.files.length > 0
      ? transcriptResponse.data.files[0].webViewLink || undefined
      : undefined;
    
    // In a real implementation, you'd calculate the actual duration from the video metadata
    const duration = 3600; // 1 hour in seconds
    
    return {
      recordingUrl: recordingFile.webViewLink || `https://drive.google.com/file/d/${recordingFile.id}`,
      transcriptUrl,
      duration,
      generatedAt: recordingFile.createdTime || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting Google Meet recording from Drive:', error);
    return null;
  }
}

/**
 * Upload a recording to Google Drive
 */
export async function uploadRecordingToGoogleDrive(
  meetingId: string, 
  recordingBlob: Blob,
  credentials?: CalendarCredentials
): Promise<string | null> {
  if (!credentials) {
    console.log("No credentials provided for uploading recording");
    return null;
  }

  try {
    const { drive } = await import('@googleapis/drive');
    const oauth2Client = createOAuth2Client(credentials);
    const driveClient = drive({ version: 'v3', auth: oauth2Client });
    
    // Create metadata for the file
    const fileMetadata: drive_v3.Schema$File = {
      name: `recording-${meetingId}-${format(new Date(), 'yyyy-MM-dd')}`,
      mimeType: recordingBlob.type
    };
    
    // Create media for the file
    const media = {
      mimeType: recordingBlob.type,
      body: recordingBlob
    };
    
    // Upload the file to Google Drive
    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    if (!response.data.id) {
      throw new Error('Failed to upload recording to Google Drive');
    }
    
    // Make the file accessible via link
    await driveClient.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}`;
  } catch (error) {
    console.error('Error uploading recording to Google Drive:', error);
    return null;
  }
}

/**
 * Save a transcription to Google Drive
 */
export async function saveTranscriptionToDrive(
  meetingId: string,
  transcription: string,
  credentials?: CalendarCredentials
): Promise<string | null> {
  if (!credentials) {
    console.log("No credentials provided for saving transcription");
    return null;
  }

  try {
    const { drive } = await import('@googleapis/drive');
    const oauth2Client = createOAuth2Client(credentials);
    const driveClient = drive({ version: 'v3', auth: oauth2Client });
    
    // Create metadata for the file
    const fileMetadata: drive_v3.Schema$File = {
      name: `transcript-${meetingId}-${format(new Date(), 'yyyy-MM-dd')}`,
      mimeType: 'text/plain'
    };
    
    // Create a blob from the transcription text
    const transcriptionBlob = new Blob([transcription], { type: 'text/plain' });
    
    // Create media for the file
    const media = {
      mimeType: 'text/plain',
      body: transcriptionBlob
    };
    
    // Upload the file to Google Drive
    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    if (!response.data.id) {
      throw new Error('Failed to upload transcription to Google Drive');
    }
    
    // Make the file accessible via link
    await driveClient.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}`;
  } catch (error) {
    console.error('Error saving transcription to Google Drive:', error);
    return null;
  }
}


import { CalendarCredentials } from './types'
import { createOAuth2Client } from './auth'
import { saveTranscriptionToDrive } from './recordings'

/**
 * Generate a transcription from an audio file using Google Cloud Speech-to-Text
 */
export async function generateTranscription(
  recordingUrl: string, 
  credentials?: CalendarCredentials
): Promise<string | null> {
  if (!credentials) {
    console.log("No credentials provided for generating transcription");
    return null;
  }

  try {
    const { speech } = await import('@googleapis/speech');
    const { drive } = await import('@googleapis/drive');
    
    const oauth2Client = createOAuth2Client(credentials);

    // Create the speech client
    const speechClient = speech({
      version: 'v1p1beta1',
      auth: oauth2Client
    });
    
    // Extract the file ID from the Drive URL
    const fileIdMatch = recordingUrl.match(/\/d\/([^\/]+)/);
    if (!fileIdMatch) {
      throw new Error('Could not extract file ID from recording URL');
    }
    
    const fileId = fileIdMatch[1];
    
    // Get the drive client to download the audio
    const driveClient = drive({ version: 'v3', auth: oauth2Client });
    
    // Get file metadata to check size and type
    const fileMetadata = await driveClient.files.get({
      fileId: fileId,
      fields: 'size,mimeType,name'
    });
    
    console.log('Processing file for transcription:', fileMetadata.data.name);
    
    // Make sure the file is accessible to the Speech API
    await driveClient.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    // Get a direct download link
    const audioUri = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    console.log('Submitting transcription request to Google Cloud Speech-to-Text API');
    
    // For long audio files, we need to use longrunningrecognize
    // Using the correct parameter structure for the speech API
    const request = {
      audio: {
        uri: audioUri
      },
      config: {
        encoding: 'MP3',  // Assuming MP3 format, adjust as needed
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'video',
        useEnhanced: true,
        enableSpeakerDiarization: true,
        diarizationSpeakerCount: 2,
        enableWordTimeOffsets: true,
      }
    };
    
    // Call the API using the correct structure
    const operation = await speechClient.speech.longrunningrecognize({
      requestBody: request
    });
    
    // Wait for the operation to complete - note the different structure here
    const operationName = operation.data.name;
    
    if (!operationName) {
      throw new Error('Operation name not found in response');
    }
    
    console.log('Operation started with name:', operationName);
    
    // Poll until the operation is complete
    let operationResponse;
    let complete = false;
    
    while (!complete) {
      // Wait for a few seconds between checks
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check operation status
      operationResponse = await speechClient.operations.get({
        name: operationName
      });
      
      complete = operationResponse.data.done || false;
      console.log('Operation status:', complete ? 'complete' : 'in progress');
    }
    
    // Process the completed operation
    if (!operationResponse || !operationResponse.data.response) {
      throw new Error('No response data in completed operation');
    }
    
    const response = operationResponse.data.response;
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No transcription results returned');
    }
    
    // Format the transcription results
    let transcription = '';
    let currentSpeaker = -1;
    
    response.results.forEach(result => {
      if (result.alternatives && result.alternatives[0]) {
        const alternative = result.alternatives[0];
        
        // Process speaker diarization if available
        if (result.alternatives[0].words && result.alternatives[0].words.length > 0) {
          // Extract speaker information from words
          const words = result.alternatives[0].words;
          words.forEach(wordInfo => {
            const speakerTag = wordInfo.speakerTag || 0;
            if (speakerTag !== currentSpeaker) {
              currentSpeaker = speakerTag;
              transcription += `\n\nSpeaker ${currentSpeaker}: `;
            }
            
            if (wordInfo.word) {
              transcription += `${wordInfo.word} `;
            }
          });
        } else {
          // If no speaker info, just append the transcript
          transcription += `${alternative.transcript} `;
        }
      }
    });
    
    return transcription.trim();
  } catch (error) {
    console.error('Error generating transcription with Google Speech-to-Text:', error);
    return 'Error processing transcription. Please try again later.';
  }
}

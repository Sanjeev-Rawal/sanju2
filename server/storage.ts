// This file provides a storage interface for the application
// For the speech to text application, we don't need to store any data,
// but we're including this file as it's referenced in routes.ts

// This can be extended in the future if we need to store user transcriptions,
// settings, or other data

export const storage = {
  // Example method for future use
  async saveTranscription(userId: string, transcription: string) {
    // Implementation would go here if needed
    console.log(`Would save transcription for user ${userId}`);
    return true;
  },
  
  // Example method for future use
  async getTranscriptions(userId: string) {
    // Implementation would go here if needed
    console.log(`Would retrieve transcriptions for user ${userId}`);
    return [];
  }
};

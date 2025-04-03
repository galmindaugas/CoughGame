/**
 * Calculates the duration of an audio file
 * @param file The audio file to calculate duration for
 * @returns Promise that resolves with the duration in seconds
 */
export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';

    audio.onloadedmetadata = () => {
      window.URL.revokeObjectURL(audio.src);
      resolve(audio.duration);
    };

    audio.onerror = (err) => {
      reject(err);
    };

    audio.src = URL.createObjectURL(file);
  });
};

/**
 * Check if an audio file is valid (correct format and duration)
 * @param file The audio file to validate
 * @returns Promise<string | null> - null if valid, error message if invalid
 */
export const validateAudioFile = async (file: File): Promise<string | null> => {
  // Check file type
  if (!file.type.match('audio/(mpeg|wav)')) {
    return 'Only MP3 and WAV files are allowed';
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return 'File size exceeds 10MB limit';
  }

  try {
    // Check duration (2-10 seconds)
    const duration = await getAudioDuration(file);
    if (duration < 2 || duration > 10) {
      return 'Audio must be between 2 and 10 seconds long';
    }
    
    return null; // Valid file
  } catch (error) {
    return 'Error processing audio file';
  }
};

/**
 * Format duration in seconds to a readable string
 * @param seconds Duration in seconds
 * @returns Formatted duration string (e.g., "5.2s")
 */
export const formatDuration = (seconds: number): string => {
  return `${seconds.toFixed(1)}s`;
};

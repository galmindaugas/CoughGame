import { feedbackMessages } from "@shared/schema";

/**
 * Gets a random feedback message from the predefined list
 * @returns A random feedback message
 */
export const getRandomFeedbackMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * feedbackMessages.length);
  return feedbackMessages[randomIndex];
};

/**
 * Formats a session ID for display
 * @param sessionId The raw session ID
 * @returns Formatted session ID for display
 */
export const formatSessionId = (sessionId: string): string => {
  return `#${sessionId}`;
};

/**
 * Checks if a participant has completed all evaluations
 * @param completedCount Number of completed evaluations
 * @param totalCount Total number of evaluations
 * @returns Boolean indicating completion status
 */
export const hasCompletedAllEvaluations = (
  completedCount: number,
  totalCount: number
): boolean => {
  return completedCount >= totalCount;
};

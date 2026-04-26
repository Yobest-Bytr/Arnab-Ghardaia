import { parseISO, isValid } from 'date-fns';

/**
 * Safely parses an ISO date string.
 * Returns a valid Date object or the current date if the input is invalid or missing.
 */
export const safeParseISO = (dateStr: string | undefined | null): Date => {
  if (!dateStr) return new Date();
  try {
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? parsed : new Date();
  } catch (error) {
    return new Date();
  }
};

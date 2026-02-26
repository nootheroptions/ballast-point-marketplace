import 'server-only';

import type { CalendarProvider } from '@prisma/client';
import { createGoogleCalendarService } from './google-calendar';
import { createOutlookCalendarService } from './outlook-calendar';
import type { CalendarService } from './types';

export * from './types';
export { createGoogleCalendarService } from './google-calendar';
export { createOutlookCalendarService } from './outlook-calendar';

/**
 * Create a calendar service instance for the specified provider
 */
export function createCalendarService(provider: CalendarProvider): CalendarService {
  switch (provider) {
    case 'GOOGLE':
      return createGoogleCalendarService();
    case 'OUTLOOK':
      return createOutlookCalendarService();
    default:
      throw new Error(`Unsupported calendar provider: ${provider}`);
  }
}

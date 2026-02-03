import { ClientResponsibility } from './types';

/**
 * Platform-defined client responsibility options
 * Providers can select from these to clarify what clients need to provide
 */
export const CLIENT_RESPONSIBILITIES: ClientResponsibility[] = [
  {
    key: 'PROVIDE_SURVEY',
    label: 'Provide survey',
    description: 'Client must provide a current survey of the property',
  },
  {
    key: 'PROVIDE_EXISTING_PLANS',
    label: 'Provide existing plans',
    description: 'Client must provide existing architectural plans',
  },
  {
    key: 'PROVIDE_PHOTOS',
    label: 'Provide photos',
    description: 'Client must provide photos of the site/property',
  },
  {
    key: 'PROVIDE_MEASUREMENTS',
    label: 'Provide measurements',
    description: 'Client must provide basic measurements of the space',
  },
  {
    key: 'ATTEND_MEETINGS',
    label: 'Attend meetings',
    description: 'Client must be available for scheduled meetings/touchpoints',
  },
  {
    key: 'SITE_ACCESS',
    label: 'Provide site access',
    description: 'Client must provide access to the site for visits',
  },
  {
    key: 'PAY_AUTHORITY_FEES',
    label: 'Pay authority fees',
    description: 'Client is responsible for council and authority fees',
  },
  {
    key: 'PAY_CONSULTANT_FEES',
    label: 'Pay consultant fees',
    description: 'Client is responsible for any required consultant fees',
  },
  {
    key: 'TIMELY_FEEDBACK',
    label: 'Provide timely feedback',
    description: 'Client must provide feedback within agreed timeframes',
  },
  {
    key: 'DECISION_MAKING',
    label: 'Make timely decisions',
    description: 'Client must make decisions on design options within agreed timeframes',
  },
];

/**
 * Get client responsibility by key
 */
export function getClientResponsibility(key: string): ClientResponsibility | undefined {
  return CLIENT_RESPONSIBILITIES.find((r) => r.key === key);
}

/**
 * Get multiple client responsibilities by keys
 */
export function getClientResponsibilities(keys: string[]): ClientResponsibility[] {
  return keys.map((key) => getClientResponsibility(key)).filter(Boolean) as ClientResponsibility[];
}

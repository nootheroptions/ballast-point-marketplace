import { z } from 'zod';

/**
 * Valid country codes
 */
export const countryCodeEnum = z.enum(['AU']);
export type CountryCodeValue = z.infer<typeof countryCodeEnum>;

/**
 * Common types for location data across all countries
 */

/**
 * Supported country codes (ISO 3166-1 alpha-2)
 *
 * Currently just start in Australia
 */
export type SupportedCountryCodes = 'AU'; // Add more as needed: 'US' | 'UK' | etc.

/**
 * Base jurisdiction info shared across countries
 */
export interface JurisdictionInfo {
  code: string;
  label: string;
  shortLabel: string;
}

/**
 * Region type within a jurisdiction
 */
export interface RegionTypeInfo {
  code: string;
  label: string;
}

/**
 * Locality (council, county, borough, etc.) info
 */
export interface LocalityInfo {
  name: string;
  jurisdiction: string;
  type?: string; // "council", "county", "borough", etc.
}

/**
 * Country configuration defining all location data for a country
 */
export interface CountryConfig {
  code: SupportedCountryCodes;
  name: string;
  jurisdictions: JurisdictionInfo[];
  regionTypes: RegionTypeInfo[];
  localities: Record<string, string[]>; // jurisdiction code -> locality names
  getMetroLabel: (jurisdiction: string) => string;
  getRegionLabel: (jurisdiction: string, regionType: string) => string;
}

/**
 * Service area entry for forms/validation
 */
export interface ServiceAreaEntry {
  country: SupportedCountryCodes;
  jurisdiction: string;
  regionType: string;
}

/**
 * Local experience entry for forms/validation
 */
export interface LocalExperienceEntry {
  country: SupportedCountryCodes;
  jurisdiction: string;
  localityName: string;
  localityType?: string;
}

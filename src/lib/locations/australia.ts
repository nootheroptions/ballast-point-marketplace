/**
 * Australian location data
 */

import type { CountryConfig, JurisdictionInfo, RegionTypeInfo } from './types';

/**
 * Australian state/territory codes
 */
export type AustralianJurisdiction = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'ACT' | 'NT';

/**
 * Australian region types
 */
export type AustralianRegionType = 'METRO' | 'REGIONAL' | 'STATEWIDE';

/**
 * Australian states/territories
 */
export const AU_JURISDICTIONS: JurisdictionInfo[] = [
  { code: 'NSW', label: 'New South Wales', shortLabel: 'NSW' },
  { code: 'VIC', label: 'Victoria', shortLabel: 'VIC' },
  { code: 'QLD', label: 'Queensland', shortLabel: 'QLD' },
  { code: 'SA', label: 'South Australia', shortLabel: 'SA' },
  { code: 'WA', label: 'Western Australia', shortLabel: 'WA' },
  { code: 'TAS', label: 'Tasmania', shortLabel: 'TAS' },
  { code: 'ACT', label: 'Australian Capital Territory', shortLabel: 'ACT' },
  { code: 'NT', label: 'Northern Territory', shortLabel: 'NT' },
];

/**
 * Australian region types
 */
export const AU_REGION_TYPES: RegionTypeInfo[] = [
  { code: 'METRO', label: 'Metropolitan' },
  { code: 'REGIONAL', label: 'Regional' },
  { code: 'STATEWIDE', label: 'Statewide' },
];

/**
 * Metro area labels by state
 */
const AU_METRO_LABELS: Record<AustralianJurisdiction, string> = {
  NSW: 'Sydney Metro',
  VIC: 'Melbourne Metro',
  QLD: 'Brisbane Metro',
  SA: 'Adelaide Metro',
  WA: 'Perth Metro',
  TAS: 'Hobart Metro',
  ACT: 'Canberra',
  NT: 'Darwin Metro',
};

/**
 * NSW Regions and their councils
 * Source: Based on NSW planning regions
 */
export const NSW_REGIONS: Record<string, string[]> = {
  'Greater Sydney': [
    'City of Sydney',
    'Inner West Council',
    'Woollahra Municipal Council',
    'Waverley Council',
    'Randwick City Council',
    'North Sydney Council',
    'Willoughby City Council',
    'Northern Beaches Council',
    'City of Parramatta',
    'Blacktown City Council',
    'Bayside Council',
    'Georges River Council',
    'Sutherland Shire Council',
    'Penrith City Council',
  ],
  'Central Coast': ['Central Coast Council'],
  Hunter: [
    'City of Newcastle',
    'Lake Macquarie City Council',
    'Maitland City Council',
    'Cessnock City Council',
    'Port Stephens Council',
    'Singleton Council',
    'Muswellbrook Shire Council',
    'Upper Hunter Shire Council',
    'Dungog Shire Council',
  ],
  'Illawarra-Shoalhaven': [
    'Wollongong City Council',
    'Shellharbour City Council',
    'Kiama Municipal Council',
    'Shoalhaven City Council',
    'Wingecarribee Shire Council',
  ],
  'Mid North Coast': [
    'Mid-Coast Council',
    'Port Macquarie-Hastings Council',
    'Kempsey Shire Council',
    'Coffs Harbour City Council',
    'Bellingen Shire Council',
    'Nambucca Valley Council',
  ],
  'Northern Rivers': [
    'Tweed Shire Council',
    'Byron Shire Council',
    'Ballina Shire Council',
    'Lismore City Council',
    'Richmond Valley Council',
    'Clarence Valley Council',
    'Kyogle Council',
  ],
  'New England & North West': [
    'Tamworth Regional Council',
    'Armidale Regional Council',
    'Gunnedah Shire Council',
    'Narrabri Shire Council',
    'Inverell Shire Council',
    'Glen Innes Severn Council',
    'Tenterfield Shire Council',
    'Liverpool Plains Shire Council',
    'Walcha Council',
    'Moree Plains Shire Council',
  ],
  'Central West & Orana': [
    'Bathurst Regional Council',
    'Orange City Council',
    'Dubbo Regional Council',
    'Parkes Shire Council',
    'Forbes Shire Council',
    'Lachlan Shire Council',
    'Cabonne Council',
    'Blayney Shire Council',
    'Cowra Shire Council',
    'Warrumbungle Shire Council',
    'Narromine Shire Council',
    'Mid-Western Regional Council',
  ],
  Riverina: [
    'Wagga Wagga City Council',
    'Griffith City Council',
    'Leeton Shire Council',
    'Narrandera Shire Council',
    'Coolamon Shire Council',
    'Junee Shire Council',
    'Temora Shire Council',
    'Lockhart Shire Council',
    'Bland Shire Council',
    'Snowy Valleys Council',
  ],
  Murray: [
    'Albury City Council',
    'City of Greater Hume Council',
    'Federation Council',
    'Berrigan Shire Council',
    'Edward River Council',
    'Murray River Council',
    'Balranald Shire Council',
  ],
  'Far West': ['Broken Hill City Council', 'Central Darling Shire Council'],
};

/**
 * Get all councils for NSW (flattened from regions)
 */
function getAllNswCouncils(): string[] {
  return Object.values(NSW_REGIONS).flat();
}

/**
 * Find which region a council belongs to (NSW only)
 */
export function getNswRegionForCouncil(councilName: string): string | undefined {
  for (const [regionName, councils] of Object.entries(NSW_REGIONS)) {
    if (councils.includes(councilName)) {
      return regionName;
    }
  }
  return undefined;
}

/**
 * Australian councils by state
 * Source: Hardcoded for now (data.gov.au ASGS LGA dataset for production)
 */
export const AU_LOCALITIES: Record<AustralianJurisdiction, string[]> = {
  NSW: getAllNswCouncils(),
  VIC: [
    'City of Melbourne',
    'City of Yarra',
    'City of Port Phillip',
    'City of Stonnington',
    'City of Boroondara',
    'Merri-bek City Council',
    'City of Darebin',
    'City of Maribyrnong',
    'City of Moonee Valley',
    'City of Bayside',
    'City of Glen Eira',
    'City of Monash',
    'City of Whitehorse',
    'City of Kingston',
    'City of Greater Geelong',
  ],
  QLD: [
    'Brisbane City Council',
    'Gold Coast City Council',
    'Sunshine Coast Council',
    'Moreton Bay Regional Council',
    'Logan City Council',
    'Redland City Council',
    'Ipswich City Council',
    'Cairns Regional Council',
    'Townsville City Council',
  ],
  SA: [
    'City of Adelaide',
    'City of Norwood Payneham & St Peters',
    'City of Unley',
    'City of Burnside',
    'City of Charles Sturt',
    'City of Port Adelaide Enfield',
    'City of Marion',
  ],
  WA: [
    'City of Perth',
    'City of Subiaco',
    'City of Fremantle',
    'City of Stirling',
    'City of Joondalup',
    'City of Cockburn',
    'City of Melville',
    'City of Canning',
  ],
  TAS: [
    'City of Hobart',
    'City of Launceston',
    'City of Glenorchy',
    'City of Clarence',
    'City of Devonport',
    'City of Burnie',
  ],
  ACT: ['ACT (single jurisdiction)'],
  NT: ['City of Darwin', 'City of Palmerston', 'Litchfield Council', 'Alice Springs Town Council'],
};

/**
 * Get the metro label for an Australian jurisdiction
 */
function getAuMetroLabel(jurisdiction: string): string {
  return AU_METRO_LABELS[jurisdiction as AustralianJurisdiction] || `${jurisdiction} Metro`;
}

/**
 * Get the region label for an Australian jurisdiction and region type
 */
function getAuRegionLabel(jurisdiction: string, regionType: string): string {
  const info = AU_JURISDICTIONS.find((j) => j.code === jurisdiction);
  const shortLabel = info?.shortLabel || jurisdiction;

  switch (regionType) {
    case 'METRO':
      return getAuMetroLabel(jurisdiction);
    case 'REGIONAL':
      return `${shortLabel} Regional`;
    case 'STATEWIDE':
      return `${shortLabel} Statewide`;
    default:
      return regionType;
  }
}

/**
 * Australia country configuration
 */
export const AUSTRALIA_CONFIG: CountryConfig = {
  code: 'AU',
  name: 'Australia',
  jurisdictions: AU_JURISDICTIONS,
  regionTypes: AU_REGION_TYPES,
  localities: AU_LOCALITIES,
  getMetroLabel: getAuMetroLabel,
  getRegionLabel: getAuRegionLabel,
};

/**
 * Valid Australian jurisdiction codes for validation
 */
export const VALID_AU_JURISDICTIONS = AU_JURISDICTIONS.map((j) => j.code);

/**
 * Valid Australian region types for validation
 */
export const VALID_AU_REGION_TYPES = AU_REGION_TYPES.map((r) => r.code);

/**
 * Check if a jurisdiction code is valid for Australia
 */
export function isValidAuJurisdiction(code: string): code is AustralianJurisdiction {
  return VALID_AU_JURISDICTIONS.includes(code);
}

/**
 * Check if a region type is valid for Australia
 */
export function isValidAuRegionType(code: string): code is AustralianRegionType {
  return VALID_AU_REGION_TYPES.includes(code);
}

/**
 * Get jurisdiction info by code
 */
export function getAuJurisdictionInfo(code: string): JurisdictionInfo | undefined {
  return AU_JURISDICTIONS.find((j) => j.code === code);
}

/**
 * Get localities for a jurisdiction
 */
export function getAuLocalities(jurisdiction: string): string[] {
  return AU_LOCALITIES[jurisdiction as AustralianJurisdiction] || [];
}

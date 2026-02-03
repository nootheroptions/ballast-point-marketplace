import { AssumptionPreset } from './types';

/**
 * Platform-defined assumption presets
 * Providers can select from these to clarify assumptions about the scope
 */
export const ASSUMPTION_PRESETS: AssumptionPreset[] = [
  {
    key: 'STANDARD_COMPLEXITY',
    text: 'Assumes standard complexity with no unusual site conditions',
  },
  {
    key: 'NO_STRUCTURAL_CHANGES',
    text: 'Assumes no major structural changes required',
  },
  {
    key: 'SINGLE_STOREY_ADDITION',
    text: 'Assumes single-storey addition only',
  },
  {
    key: 'NO_CONSULTANT_REQUIRED',
    text: 'Assumes no specialist consultants required (structural, hydraulic, etc.)',
  },
  {
    key: 'CONSULTANT_COORDINATION_EXCLUDED',
    text: 'Does not include coordination of specialist consultants',
  },
  {
    key: 'STANDARD_MATERIALS',
    text: 'Assumes standard building materials and finishes',
  },
  {
    key: 'NO_HERITAGE_CONSTRAINTS',
    text: 'Assumes no heritage or conservation constraints',
  },
  {
    key: 'NO_PLANNING_OVERLAYS',
    text: 'Assumes no planning overlays (bushfire, flood, etc.)',
  },
  {
    key: 'COMPLYING_DEVELOPMENT',
    text: 'Assumes project is eligible for complying development pathway',
  },
  {
    key: 'STANDARD_COUNCIL_PATHWAY',
    text: 'Assumes standard council approval pathway',
  },
  {
    key: 'CLIENT_LODGES',
    text: 'Client is responsible for lodging application with council',
  },
  {
    key: 'SITE_ACCESSIBLE',
    text: 'Assumes site is easily accessible for visits',
  },
  {
    key: 'EXISTING_DOCUMENTATION_ACCURATE',
    text: 'Assumes existing documentation provided is accurate and current',
  },
  {
    key: 'NO_DEMOLITION',
    text: 'Assumes no demolition work required',
  },
  {
    key: 'STANDARD_SITE_CONDITIONS',
    text: 'Assumes standard site conditions (level, no contamination, no flooding)',
  },
];

/**
 * Get assumption preset by key
 */
export function getAssumptionPreset(key: string): AssumptionPreset | undefined {
  return ASSUMPTION_PRESETS.find((p) => p.key === key);
}

/**
 * Get multiple assumption presets by keys
 */
export function getAssumptionPresets(keys: string[]): AssumptionPreset[] {
  return keys.map((key) => getAssumptionPreset(key)).filter(Boolean) as AssumptionPreset[];
}

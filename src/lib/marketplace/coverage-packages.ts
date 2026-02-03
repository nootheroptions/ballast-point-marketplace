import { TemplateKey } from '@prisma/client';
import { CoveragePackage } from './types';

/**
 * Platform-defined coverage packages for each template
 * These define objective eligibility rules and default configurations
 */

/**
 * CONSULTATION coverage packages
 * Consultations are typically less scope-constrained, so coverage is simpler
 */
export const CONSULTATION_COVERAGE_PACKAGES: CoveragePackage[] = [
  {
    key: 'STANDARD',
    label: 'Standard consultation',
    description: 'Suitable for most residential projects at any stage',
    eligibilityRules: [],
    defaultValues: {},
  },
];

/**
 * FEASIBILITY coverage packages
 */
export const FEASIBILITY_COVERAGE_PACKAGES: CoveragePackage[] = [
  {
    key: 'BASIC',
    label: 'Up to 150sqm, 1-2 storeys, no overlays',
    description: 'Simple sites with no heritage, bushfire, flood or other constraints',
    eligibilityRules: [
      {
        field: 'floorArea',
        operator: 'lte',
        value: 150,
        label: 'Floor area up to 150sqm',
      },
      {
        field: 'storeys',
        operator: 'lte',
        value: 2,
        label: '1-2 storeys',
      },
      {
        field: 'hasOverlays',
        operator: 'eq',
        value: false,
        label: 'No heritage, bushfire, flood or other overlays',
      },
      {
        field: 'inputsRequired',
        operator: 'in',
        value: ['PHOTOS_MEASUREMENTS', 'EXISTING_PLANS'],
        label: 'Photos + measurements or existing plans OK',
      },
    ],
    defaultValues: {},
  },
  {
    key: 'STANDARD',
    label: 'Up to 300sqm, 1-2 storeys, no overlays',
    description: 'Medium-sized sites with no constraints',
    eligibilityRules: [
      {
        field: 'floorArea',
        operator: 'lte',
        value: 300,
        label: 'Floor area up to 300sqm',
      },
      {
        field: 'storeys',
        operator: 'lte',
        value: 2,
        label: '1-2 storeys',
      },
      {
        field: 'hasOverlays',
        operator: 'eq',
        value: false,
        label: 'No heritage, bushfire, flood or other overlays',
      },
      {
        field: 'inputsRequired',
        operator: 'in',
        value: ['EXISTING_PLANS'],
        label: 'Existing plans preferred',
      },
    ],
    defaultValues: {},
  },
  {
    key: 'COMPLEX',
    label: 'Any size with overlays/constraints',
    description: 'Sites with heritage, bushfire, flood or other planning constraints',
    eligibilityRules: [
      {
        field: 'hasOverlays',
        operator: 'eq',
        value: true,
        label: 'Heritage, bushfire, flood or other constraints present',
      },
    ],
    defaultValues: {},
  },
];

/**
 * CONCEPT_DESIGN coverage packages
 */
export const CONCEPT_DESIGN_COVERAGE_PACKAGES: CoveragePackage[] = [
  {
    key: 'BASIC',
    label: 'Up to 150sqm, 1-2 storeys, no overlays',
    description: 'Simple residential projects',
    eligibilityRules: [
      {
        field: 'floorArea',
        operator: 'lte',
        value: 150,
        label: 'Floor area up to 150sqm',
      },
      {
        field: 'storeys',
        operator: 'lte',
        value: 2,
        label: '1-2 storeys',
      },
      {
        field: 'hasOverlays',
        operator: 'eq',
        value: false,
        label: 'No heritage, bushfire, flood or other overlays',
      },
    ],
    defaultValues: {
      revisionsIncluded: 2,
      touchpointsIncluded: 2,
    },
  },
  {
    key: 'STANDARD',
    label: '150-300sqm, 1-2 storeys, no overlays',
    description: 'Medium-sized residential projects',
    eligibilityRules: [
      {
        field: 'floorArea',
        operator: 'gt',
        value: 150,
        label: 'Floor area 150-300sqm',
      },
      {
        field: 'floorArea',
        operator: 'lte',
        value: 300,
        label: 'Floor area 150-300sqm',
      },
      {
        field: 'storeys',
        operator: 'lte',
        value: 2,
        label: '1-2 storeys',
      },
      {
        field: 'hasOverlays',
        operator: 'eq',
        value: false,
        label: 'No heritage, bushfire, flood or other overlays',
      },
    ],
    defaultValues: {
      revisionsIncluded: 3,
      touchpointsIncluded: 3,
    },
  },
  {
    key: 'COMPLEX',
    label: 'Any size with overlays/constraints',
    description: 'Projects with heritage, bushfire, flood or other constraints',
    eligibilityRules: [
      {
        field: 'hasOverlays',
        operator: 'eq',
        value: true,
        label: 'Heritage, bushfire, flood or other constraints present',
      },
    ],
    defaultValues: {
      revisionsIncluded: 3,
      touchpointsIncluded: 4,
    },
  },
];

/**
 * PLANNING_APPROVALS coverage packages
 */
export const PLANNING_APPROVALS_COVERAGE_PACKAGES: CoveragePackage[] = [
  {
    key: 'STANDARD',
    label: 'Standard council pathway',
    description: 'Single lot, no heritage/bushfire/flood or other planning overlays',
    eligibilityRules: [
      {
        field: 'hasOverlays',
        operator: 'eq',
        value: false,
        label: 'No heritage, bushfire, flood or other overlays',
      },
      {
        field: 'lotType',
        operator: 'eq',
        value: 'SINGLE',
        label: 'Single lot',
      },
    ],
    defaultValues: {},
  },
  {
    key: 'COMPLEX',
    label: 'Overlays/constraints present',
    description: 'Heritage, bushfire, flood or other planning constraints',
    eligibilityRules: [
      {
        field: 'hasOverlays',
        operator: 'eq',
        value: true,
        label: 'Heritage, bushfire, flood or other constraints present',
      },
    ],
    defaultValues: {},
  },
];

/**
 * REVIEW coverage packages
 */
export const REVIEW_COVERAGE_PACKAGES: CoveragePackage[] = [
  {
    key: 'STANDARD',
    label: 'Standard review',
    description: 'Suitable for most document reviews',
    eligibilityRules: [],
    defaultValues: {},
  },
];

/**
 * Map of template keys to their coverage packages
 */
export const COVERAGE_PACKAGES_BY_TEMPLATE: Record<TemplateKey, CoveragePackage[]> = {
  [TemplateKey.CONSULTATION]: CONSULTATION_COVERAGE_PACKAGES,
  [TemplateKey.FEASIBILITY]: FEASIBILITY_COVERAGE_PACKAGES,
  [TemplateKey.CONCEPT_DESIGN]: CONCEPT_DESIGN_COVERAGE_PACKAGES,
  [TemplateKey.PLANNING_APPROVALS]: PLANNING_APPROVALS_COVERAGE_PACKAGES,
  [TemplateKey.REVIEW]: REVIEW_COVERAGE_PACKAGES,
};

/**
 * Get coverage packages for a specific template
 */
export function getCoveragePackagesForTemplate(templateKey: TemplateKey): CoveragePackage[] {
  return COVERAGE_PACKAGES_BY_TEMPLATE[templateKey] || [];
}

/**
 * Get a specific coverage package by template and key
 */
export function getCoveragePackage(
  templateKey: TemplateKey,
  packageKey: string
): CoveragePackage | undefined {
  const packages = getCoveragePackagesForTemplate(templateKey);
  return packages.find((pkg) => pkg.key === packageKey);
}

/**
 * Build the full coverage package key for storage
 * Format: "{templateKey}_{packageKey}"
 */
export function buildCoveragePackageKey(templateKey: TemplateKey, packageKey: string): string {
  return `${templateKey}_${packageKey}`;
}

/**
 * Parse a coverage package key into template and package parts
 */
export function parseCoveragePackageKey(fullKey: string): {
  templateKey: TemplateKey;
  packageKey: string;
} | null {
  const parts = fullKey.split('_');
  if (parts.length < 2) return null;

  const templateKey = parts[0] as TemplateKey;
  const packageKey = parts.slice(1).join('_');

  return { templateKey, packageKey };
}

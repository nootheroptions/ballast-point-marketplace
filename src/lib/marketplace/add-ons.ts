import { TemplateKey } from '@prisma/client';

/**
 * Platform-defined add-on types
 * Providers can attach these to services with their own pricing
 */

export interface AddOnDefinition {
  key: string; // Unique identifier
  name: string;
  description: string;
  type: string; // Category for grouping (e.g., "SUSTAINABILITY", "HERITAGE", "EXPEDITED")
  allowedTemplates: TemplateKey[]; // Which templates can use this add-on
  defaultTurnaroundImpactDays?: number; // Typical impact on delivery time
}

/**
 * All platform-defined add-ons
 */
export const ADD_ON_DEFINITIONS: AddOnDefinition[] = [
  // Sustainability add-ons
  {
    key: 'SUSTAINABILITY_ASSESSMENT',
    name: 'Sustainability assessment',
    description: 'Environmental performance review and recommendations',
    type: 'SUSTAINABILITY',
    allowedTemplates: [TemplateKey.FEASIBILITY, TemplateKey.CONCEPT_DESIGN],
    defaultTurnaroundImpactDays: 3,
  },
  {
    key: 'PASSIVE_DESIGN_ANALYSIS',
    name: 'Passive design analysis',
    description: 'Solar orientation, natural ventilation, and thermal comfort analysis',
    type: 'SUSTAINABILITY',
    allowedTemplates: [TemplateKey.CONCEPT_DESIGN],
    defaultTurnaroundImpactDays: 2,
  },

  // Heritage add-ons
  {
    key: 'HERITAGE_CONSULTANT_INPUT',
    name: 'Heritage consultant input',
    description: 'Specialist heritage advice and documentation',
    type: 'HERITAGE',
    allowedTemplates: [
      TemplateKey.FEASIBILITY,
      TemplateKey.CONCEPT_DESIGN,
      TemplateKey.PLANNING_APPROVALS,
    ],
    defaultTurnaroundImpactDays: 5,
  },
  {
    key: 'HERITAGE_IMPACT_STATEMENT',
    name: 'Heritage impact statement',
    description: 'Formal heritage impact assessment document',
    type: 'HERITAGE',
    allowedTemplates: [TemplateKey.PLANNING_APPROVALS],
    defaultTurnaroundImpactDays: 7,
  },

  // Design add-ons
  {
    key: 'ADDITIONAL_DESIGN_OPTION',
    name: 'Additional design option',
    description: 'Extra design direction to explore',
    type: 'DESIGN',
    allowedTemplates: [TemplateKey.FEASIBILITY, TemplateKey.CONCEPT_DESIGN],
    defaultTurnaroundImpactDays: 3,
  },
  {
    key: 'EXTRA_REVISION_ROUND',
    name: 'Extra revision round',
    description: 'Additional opportunity to refine the design',
    type: 'DESIGN',
    allowedTemplates: [TemplateKey.CONCEPT_DESIGN],
    defaultTurnaroundImpactDays: 2,
  },
  {
    key: 'DETAILED_3D_RENDERS',
    name: 'Detailed 3D renders',
    description: 'High-quality photorealistic renders',
    type: 'DESIGN',
    allowedTemplates: [TemplateKey.CONCEPT_DESIGN],
    defaultTurnaroundImpactDays: 3,
  },

  // Process add-ons
  {
    key: 'EXPEDITED_TURNAROUND',
    name: 'Expedited turnaround',
    description: 'Priority delivery with reduced timeline',
    type: 'EXPEDITED',
    allowedTemplates: [
      TemplateKey.CONSULTATION,
      TemplateKey.FEASIBILITY,
      TemplateKey.CONCEPT_DESIGN,
      TemplateKey.REVIEW,
    ],
    defaultTurnaroundImpactDays: -7, // Reduces time
  },
  {
    key: 'ADDITIONAL_MEETING',
    name: 'Additional meeting',
    description: 'Extra client meeting or site visit',
    type: 'PROCESS',
    allowedTemplates: [
      TemplateKey.CONSULTATION,
      TemplateKey.FEASIBILITY,
      TemplateKey.CONCEPT_DESIGN,
    ],
    defaultTurnaroundImpactDays: 0,
  },

  // Specialist input
  {
    key: 'COST_PLANNER_INPUT',
    name: 'Cost planner input',
    description: 'Quantity surveyor cost estimate',
    type: 'SPECIALIST',
    allowedTemplates: [TemplateKey.FEASIBILITY, TemplateKey.CONCEPT_DESIGN],
    defaultTurnaroundImpactDays: 5,
  },
  {
    key: 'STRUCTURAL_ENGINEER_INPUT',
    name: 'Structural engineer input',
    description: 'Preliminary structural advice',
    type: 'SPECIALIST',
    allowedTemplates: [TemplateKey.FEASIBILITY, TemplateKey.CONCEPT_DESIGN],
    defaultTurnaroundImpactDays: 5,
  },
  {
    key: 'LANDSCAPE_ARCHITECT_INPUT',
    name: 'Landscape architect input',
    description: 'Landscape design coordination',
    type: 'SPECIALIST',
    allowedTemplates: [TemplateKey.CONCEPT_DESIGN],
    defaultTurnaroundImpactDays: 4,
  },

  // Planning add-ons
  {
    key: 'PRE_LODGEMENT_MEETING',
    name: 'Pre-lodgement meeting',
    description: 'Attendance at council pre-lodgement consultation',
    type: 'PLANNING',
    allowedTemplates: [TemplateKey.PLANNING_APPROVALS],
    defaultTurnaroundImpactDays: 7,
  },
  {
    key: 'TOWN_PLANNER_INPUT',
    name: 'Town planner input',
    description: 'Specialist planning consultant advice',
    type: 'PLANNING',
    allowedTemplates: [TemplateKey.FEASIBILITY, TemplateKey.PLANNING_APPROVALS],
    defaultTurnaroundImpactDays: 5,
  },
];

/**
 * Map of add-on keys to definitions
 */
export const ADD_ONS_BY_KEY: Record<string, AddOnDefinition> = ADD_ON_DEFINITIONS.reduce(
  (acc, addOn) => {
    acc[addOn.key] = addOn;
    return acc;
  },
  {} as Record<string, AddOnDefinition>
);

/**
 * Get add-on definition by key
 */
export function getAddOn(key: string): AddOnDefinition | undefined {
  return ADD_ONS_BY_KEY[key];
}

/**
 * Get all add-ons allowed for a specific template
 */
export function getAddOnsForTemplate(templateKey: TemplateKey): AddOnDefinition[] {
  return ADD_ON_DEFINITIONS.filter((addOn) => addOn.allowedTemplates.includes(templateKey));
}

/**
 * Get add-ons grouped by type for a template
 */
export function getAddOnsForTemplateGrouped(
  templateKey: TemplateKey
): Record<string, AddOnDefinition[]> {
  const addOns = getAddOnsForTemplate(templateKey);
  return addOns.reduce(
    (acc, addOn) => {
      if (!acc[addOn.type]) {
        acc[addOn.type] = [];
      }
      acc[addOn.type].push(addOn);
      return acc;
    },
    {} as Record<string, AddOnDefinition[]>
  );
}

/**
 * Validate that an add-on can be attached to a service with a given template
 */
export function isAddOnAllowedForTemplate(addOnKey: string, templateKey: TemplateKey): boolean {
  const addOn = getAddOn(addOnKey);
  if (!addOn) return false;
  return addOn.allowedTemplates.includes(templateKey);
}

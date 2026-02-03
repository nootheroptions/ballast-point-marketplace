import { TemplateKey } from '@prisma/client';
import { TemplateConfiguration, Capability } from '../types';
import { FEASIBILITY_COVERAGE_PACKAGES } from '../coverage-packages';

export const FEASIBILITY_TEMPLATE: TemplateConfiguration = {
  key: TemplateKey.FEASIBILITY,
  label: 'Feasibility',
  description: 'Viability assessment and high-level options',
  purpose: 'Viability + high-level options.',

  fields: [
    {
      key: 'analysisTypes',
      label: 'Analysis types',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'PLANNING_REVIEW', label: 'Planning review' },
        { value: 'SITE_CONSTRAINTS', label: 'Site constraints analysis' },
        { value: 'YIELD_STUDY', label: 'Yield study' },
        { value: 'OPTIONS_ANALYSIS', label: 'Options analysis' },
        { value: 'BUDGET_RANGE', label: 'Budget range estimate' },
      ],
      helpText: 'Select all types of analysis included',
    },
    {
      key: 'optionsCount',
      label: 'Number of options',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: '1 option' },
        { value: '2', label: '2 options' },
        { value: '3', label: '3 options' },
      ],
      defaultValue: 1,
      helpText: 'How many different approaches will be explored',
    },
  ],

  deliverables: [
    'Feasibility summary PDF',
    'High-level option sketches',
    'Risk & constraints checklist',
    'Budget range estimate (if selected)',
  ],

  exclusions: [
    'Concept design',
    'Planning application',
    'Construction drawings',
    'Detailed design',
    'Submissions to council',
  ],

  allowedCapabilities: [Capability.CAN_CREATE_SCALED_PLANS],

  forbiddenCapabilities: [
    Capability.CAN_CREATE_CONCEPT_3D,
    Capability.CAN_SUBMIT_TO_COUNCIL,
    Capability.CAN_PRODUCE_CONSTRUCTION_DOCS,
  ],

  coveragePackages: FEASIBILITY_COVERAGE_PACKAGES,
};

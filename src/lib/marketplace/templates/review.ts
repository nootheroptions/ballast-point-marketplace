import { TemplateKey } from '@prisma/client';
import { TemplateConfiguration, Capability } from '../types';
import { REVIEW_COVERAGE_PACKAGES } from '../coverage-packages';

export const REVIEW_TEMPLATE: TemplateConfiguration = {
  key: TemplateKey.REVIEW,
  label: 'Review',
  description: 'Second opinion / audit',
  purpose: 'Second opinion / audit.',

  fields: [
    {
      key: 'reviewTarget',
      label: 'Review target',
      type: 'select',
      required: true,
      options: [
        { value: 'CONCEPT_DESIGN', label: 'Concept design' },
        { value: 'PLANNING_REFUSAL', label: 'Planning refusal' },
        { value: 'BUILDER_DRAWINGS', label: 'Builder drawings' },
        { value: 'CONSULTANT_DOCS', label: 'Consultant documentation' },
      ],
      helpText: 'What will be reviewed',
    },
    {
      key: 'reviewDepth',
      label: 'Review depth',
      type: 'select',
      required: true,
      options: [
        { value: 'HIGH_LEVEL', label: 'High-level review' },
        { value: 'DETAILED_ANNOTATED', label: 'Detailed annotated review' },
      ],
      defaultValue: 'HIGH_LEVEL',
    },
    {
      key: 'inputsRequired',
      label: 'Inputs required',
      type: 'select',
      required: true,
      options: [
        { value: 'PDFS_ONLY', label: 'PDFs only' },
        { value: 'CAD_FILES', label: 'CAD files available' },
        { value: 'PHOTOS_MEASUREMENTS', label: 'Photos + measurements' },
      ],
      defaultValue: 'PDFS_ONLY',
      helpText: 'What the client needs to provide',
    },
  ],

  deliverables: ['Annotated PDFs', 'Written recommendations', 'Follow-up call (if included)'],

  exclusions: [
    'New design work',
    'Submissions',
    'Construction documentation',
    'Detailed redesign',
    'Implementation of recommendations',
  ],

  allowedCapabilities: [],

  forbiddenCapabilities: [
    Capability.CAN_CREATE_SCALED_PLANS,
    Capability.CAN_CREATE_CONCEPT_3D,
    Capability.CAN_SUBMIT_TO_COUNCIL,
    Capability.CAN_PRODUCE_CONSTRUCTION_DOCS,
  ],

  coveragePackages: REVIEW_COVERAGE_PACKAGES,
};

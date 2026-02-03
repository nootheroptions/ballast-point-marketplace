import { TemplateKey } from '@prisma/client';
import { TemplateConfiguration, Capability } from '../types';
import { PLANNING_APPROVALS_COVERAGE_PACKAGES } from '../coverage-packages';

export const PLANNING_APPROVALS_TEMPLATE: TemplateConfiguration = {
  key: TemplateKey.PLANNING_APPROVALS,
  label: 'Planning Approvals',
  description: 'Get council/authority approval',
  purpose: 'Get council/authority approval.',

  fields: [
    {
      key: 'jurisdiction',
      label: 'Jurisdiction',
      type: 'select',
      required: true,
      options: [
        { value: 'NSW', label: 'NSW' },
        { value: 'VIC', label: 'VIC' },
        { value: 'QLD', label: 'QLD' },
        { value: 'SA', label: 'SA' },
        { value: 'WA', label: 'WA' },
        { value: 'TAS', label: 'TAS' },
        { value: 'NT', label: 'NT' },
        { value: 'ACT', label: 'ACT' },
      ],
      helpText: 'State/territory where the project is located',
    },
    {
      key: 'submissionType',
      label: 'Submission type',
      type: 'select',
      required: true,
      options: [
        { value: 'DA', label: 'DA (Development Application)' },
        { value: 'CDC', label: 'CDC (Complying Development Certificate)' },
        { value: 'PLANNING_PERMIT', label: 'Planning Permit (VIC)' },
        { value: 'HERITAGE', label: 'Heritage application' },
      ],
    },
    {
      key: 'scope',
      label: 'Scope included',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'PLANNING_DRAWINGS', label: 'Planning drawings' },
        { value: 'SUBMISSION_COORDINATION', label: 'Submission coordination' },
        { value: 'PRE_LODGEMENT', label: 'Pre-lodgement meeting' },
        { value: 'RFI_RESPONSES', label: 'RFI responses' },
      ],
      helpText: 'Select all items included in the service',
    },
    {
      key: 'lodgementLead',
      label: 'Lodgement lead',
      type: 'select',
      required: true,
      options: [
        {
          value: 'ARCHITECT',
          label: 'Architect leads lodgement',
        },
        {
          value: 'CLIENT',
          label: 'Client lodges with architect support',
        },
      ],
      helpText: 'Who is responsible for lodging the application',
    },
    {
      key: 'consultantCoordination',
      label: 'Consultant coordination included',
      type: 'boolean',
      required: true,
      defaultValue: false,
      helpText: 'Does this service include coordination of specialist consultants?',
    },
  ],

  deliverables: [
    'Lodged application (or application package if client lodges)',
    'Council response handling',
    'Conditions summary',
    'RFI responses (if included)',
  ],

  exclusions: [
    'Concept design',
    'Construction documentation',
    'Detailed specifications',
    'Tender documentation',
    'Post-approval variations',
  ],

  allowedCapabilities: [
    Capability.CAN_CREATE_SCALED_PLANS,
    Capability.CAN_SUBMIT_TO_COUNCIL,
    Capability.CAN_COORDINATE_CONSULTANTS,
  ],

  forbiddenCapabilities: [Capability.CAN_PRODUCE_CONSTRUCTION_DOCS],

  coveragePackages: PLANNING_APPROVALS_COVERAGE_PACKAGES,
};

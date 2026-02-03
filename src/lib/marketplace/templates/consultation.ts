import { TemplateKey } from '@prisma/client';
import { TemplateConfiguration, Capability } from '../types';
import { CONSULTATION_COVERAGE_PACKAGES } from '../coverage-packages';

export const CONSULTATION_TEMPLATE: TemplateConfiguration = {
  key: TemplateKey.CONSULTATION,
  label: 'Consultation',
  description: 'Professional advice and guidance session',
  purpose: 'Advice only. No drawings. No submissions.',

  fields: [
    {
      key: 'duration',
      label: 'Duration',
      type: 'select',
      required: true,
      options: [
        { value: '30', label: '30 minutes' },
        { value: '60', label: '60 minutes' },
        { value: '90', label: '90 minutes' },
        { value: '120', label: '120 minutes' },
      ],
      defaultValue: 60,
    },
    {
      key: 'delivery',
      label: 'Delivery method',
      type: 'select',
      required: true,
      options: [
        { value: 'VIDEO', label: 'Video call' },
        { value: 'PHONE', label: 'Phone call' },
        { value: 'ON_SITE', label: 'On-site visit' },
      ],
      defaultValue: 'VIDEO',
    },
    {
      key: 'focus',
      label: 'Focus areas',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'RENOVATION_ADVICE', label: 'Renovation advice' },
        { value: 'NEW_BUILD_ADVICE', label: 'New build advice' },
        { value: 'PLANNING_PATHWAY', label: 'Planning pathway' },
        { value: 'BUDGET_STRATEGY', label: 'Budget strategy' },
        { value: 'DESIGN_SECOND_OPINION', label: 'Design second opinion' },
      ],
      helpText: 'Select all areas that apply',
    },
    {
      key: 'followUp',
      label: 'Follow-up included',
      type: 'select',
      required: true,
      options: [
        { value: 'NONE', label: 'None' },
        { value: 'EMAIL_SUMMARY', label: 'Email summary' },
        { value: 'WRITTEN_SUMMARY_PDF', label: 'Written summary PDF' },
      ],
      defaultValue: 'EMAIL_SUMMARY',
    },
    {
      key: 'siteContext',
      label: 'Site context',
      type: 'select',
      required: true,
      options: [
        { value: 'PHOTOS_MEASUREMENTS', label: 'Client provides photos + measurements' },
        { value: 'EXISTING_PLANS', label: 'Existing plans' },
        { value: 'ON_SITE_WALKTHROUGH', label: 'On-site walk-through (if on-site delivery)' },
      ],
      defaultValue: 'PHOTOS_MEASUREMENTS',
      helpText: 'What the client needs to provide for context',
    },
  ],

  deliverables: ['Call recording', 'Written summary PDF (if selected)', 'Follow-up email'],

  exclusions: [
    'Drawings',
    'Concept design',
    'Planning submissions',
    'Construction documentation',
    'Detailed design work',
  ],

  allowedCapabilities: [],

  forbiddenCapabilities: [
    Capability.CAN_CREATE_SCALED_PLANS,
    Capability.CAN_CREATE_CONCEPT_3D,
    Capability.CAN_SUBMIT_TO_COUNCIL,
    Capability.CAN_PRODUCE_CONSTRUCTION_DOCS,
  ],

  coveragePackages: CONSULTATION_COVERAGE_PACKAGES,
};

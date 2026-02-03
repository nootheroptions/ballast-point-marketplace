import { TemplateKey } from '@prisma/client';
import { TemplateConfiguration, Capability } from '../types';
import { CONCEPT_DESIGN_COVERAGE_PACKAGES } from '../coverage-packages';

export const CONCEPT_DESIGN_TEMPLATE: TemplateConfiguration = {
  key: TemplateKey.CONCEPT_DESIGN,
  label: 'Concept Design',
  description: 'Explore and define design direction',
  purpose: 'Explore and define design direction.',

  fields: [
    {
      key: 'projectType',
      label: 'Project type',
      type: 'select',
      required: true,
      options: [
        { value: 'RENOVATION', label: 'Renovation' },
        { value: 'NEW_BUILD', label: 'New build' },
        { value: 'INTERIOR_RECONFIGURATION', label: 'Interior reconfiguration' },
        { value: 'SECONDARY_DWELLING', label: 'Secondary dwelling' },
      ],
    },
    {
      key: 'optionsCount',
      label: 'Number of design options',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: '1 option' },
        { value: '2', label: '2 options' },
        { value: '3', label: '3 options' },
      ],
      defaultValue: 2,
      helpText: 'How many different design directions will be explored',
    },
    {
      key: 'drawingTypes',
      label: 'Drawing types included',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'FLOOR_PLANS', label: 'Floor plans' },
        { value: 'ROOF_SITE', label: 'Roof/site plan' },
        { value: 'BASIC_ELEVATIONS', label: 'Basic elevations' },
        { value: 'FURNITURE_LAYOUTS', label: 'Furniture layouts' },
      ],
      helpText: 'Select all drawing types to be included',
    },
    {
      key: 'threeDLevel',
      label: '3D visualisation level',
      type: 'select',
      required: true,
      options: [
        { value: 'NONE', label: 'None' },
        { value: 'BASIC_MASSING', label: 'Basic massing' },
        { value: 'SIMPLE_MODEL', label: 'Simple 3D model' },
        { value: 'RENDERED_VIEWS', label: 'Rendered views' },
      ],
      defaultValue: 'NONE',
    },
    {
      key: 'revisionsIncluded',
      label: 'Revisions included',
      type: 'number',
      required: false,
      helpText: 'Number of revision rounds (defaults from coverage package)',
    },
    {
      key: 'touchpointsIncluded',
      label: 'Meetings/touchpoints included',
      type: 'number',
      required: false,
      helpText: 'Number of client meetings (defaults from coverage package)',
    },
  ],

  deliverables: [
    'Concept plans PDF',
    '3D model file (if selected)',
    'Render pack (if selected)',
    'Design notes',
  ],

  exclusions: [
    'Planning application',
    'Council liaison',
    'Construction documentation',
    'Detailed specifications',
    'Tender documentation',
  ],

  allowedCapabilities: [Capability.CAN_CREATE_SCALED_PLANS, Capability.CAN_CREATE_CONCEPT_3D],

  forbiddenCapabilities: [
    Capability.CAN_SUBMIT_TO_COUNCIL,
    Capability.CAN_PRODUCE_CONSTRUCTION_DOCS,
  ],

  coveragePackages: CONCEPT_DESIGN_COVERAGE_PACKAGES,
};

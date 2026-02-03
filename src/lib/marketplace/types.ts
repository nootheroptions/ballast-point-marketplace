import { TemplateKey, DeliveryMode, BundlePricingType } from '@prisma/client';

/**
 * Core marketplace type definitions
 */

// Re-export Prisma enums for convenience
export { TemplateKey, DeliveryMode, BundlePricingType };

/**
 * Coverage Package
 * Represents a platform-defined package with objective eligibility rules
 */
export interface CoveragePackage {
  key: string; // Unique identifier (e.g., "BASIC", "STANDARD", "PREMIUM")
  label: string; // Display name (e.g., "Up to 150sqm, 1-2 storeys")
  description: string; // Detailed description
  eligibilityRules: EligibilityRule[];
  defaultValues?: Record<string, unknown>; // Default template data values for this package
}

/**
 * Eligibility Rule
 * Objective criteria for determining if a project fits a coverage package
 */
export interface EligibilityRule {
  field: string; // Field to check (e.g., "floorArea", "storeys", "hasOverlays")
  operator: 'eq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'notIn';
  value: string | number | boolean | string[];
  label: string; // Human-readable description
}

/**
 * Capability
 * Internal scope flag that gates UI and validation
 */
export enum Capability {
  CAN_CREATE_SCALED_PLANS = 'CAN_CREATE_SCALED_PLANS',
  CAN_CREATE_CONCEPT_3D = 'CAN_CREATE_CONCEPT_3D',
  CAN_SUBMIT_TO_COUNCIL = 'CAN_SUBMIT_TO_COUNCIL',
  CAN_PRODUCE_CONSTRUCTION_DOCS = 'CAN_PRODUCE_CONSTRUCTION_DOCS',
  CAN_COORDINATE_CONSULTANTS = 'CAN_COORDINATE_CONSULTANTS',
  CAN_PROVIDE_HERITAGE_INPUT = 'CAN_PROVIDE_HERITAGE_INPUT',
  CAN_PROVIDE_SUSTAINABILITY_INPUT = 'CAN_PROVIDE_SUSTAINABILITY_INPUT',
}

/**
 * Template Field Definition
 * Defines a field that can be configured in a template
 */
export interface TemplateFieldDefinition {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'number' | 'text' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: unknown;
  helpText?: string;
}

/**
 * Template Configuration
 * Defines the structure and rules for a specific template
 */
export interface TemplateConfiguration {
  key: TemplateKey;
  label: string;
  description: string;
  purpose: string; // Short purpose statement
  fields: TemplateFieldDefinition[];
  deliverables: string[]; // What's included
  exclusions: string[]; // What's NOT included
  allowedCapabilities: Capability[];
  forbiddenCapabilities: Capability[];
  coveragePackages: CoveragePackage[];
}

/**
 * Template-specific data types

/**
 * Client responsibility option
 */
export interface ClientResponsibility {
  key: string;
  label: string;
  description: string;
}

/**
 * Assumption preset
 */
export interface AssumptionPreset {
  key: string;
  text: string;
}

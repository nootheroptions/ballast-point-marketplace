import { TemplateKey } from '@prisma/client';
import { TemplateConfiguration } from '../types';
import { CONSULTATION_TEMPLATE } from './consultation';
import { FEASIBILITY_TEMPLATE } from './feasibility';
import { CONCEPT_DESIGN_TEMPLATE } from './concept-design';
import { PLANNING_APPROVALS_TEMPLATE } from './planning-approvals';
import { REVIEW_TEMPLATE } from './review';

/**
 * All template configurations
 */
export const TEMPLATES: TemplateConfiguration[] = [
  CONSULTATION_TEMPLATE,
  FEASIBILITY_TEMPLATE,
  CONCEPT_DESIGN_TEMPLATE,
  PLANNING_APPROVALS_TEMPLATE,
  REVIEW_TEMPLATE,
];

/**
 * Map of template keys to configurations
 */
export const TEMPLATES_BY_KEY: Record<TemplateKey, TemplateConfiguration> = {
  [TemplateKey.CONSULTATION]: CONSULTATION_TEMPLATE,
  [TemplateKey.FEASIBILITY]: FEASIBILITY_TEMPLATE,
  [TemplateKey.CONCEPT_DESIGN]: CONCEPT_DESIGN_TEMPLATE,
  [TemplateKey.PLANNING_APPROVALS]: PLANNING_APPROVALS_TEMPLATE,
  [TemplateKey.REVIEW]: REVIEW_TEMPLATE,
};

/**
 * Get template configuration by key
 */
export function getTemplate(key: TemplateKey): TemplateConfiguration {
  const template = TEMPLATES_BY_KEY[key];
  if (!template) {
    throw new Error(`Template not found: ${key}`);
  }
  return template;
}

/**
 * Get all templates
 */
export function getAllTemplates(): TemplateConfiguration[] {
  return TEMPLATES;
}

/**
 * Template stage order (for bundle validation)
 */
export const TEMPLATE_STAGE_ORDER: TemplateKey[] = [
  TemplateKey.CONSULTATION,
  TemplateKey.FEASIBILITY,
  TemplateKey.CONCEPT_DESIGN,
  TemplateKey.PLANNING_APPROVALS,
  TemplateKey.REVIEW,
];

/**
 * Get the stage order index for a template
 * Lower index = earlier stage
 */
export function getTemplateStageIndex(templateKey: TemplateKey): number {
  return TEMPLATE_STAGE_ORDER.indexOf(templateKey);
}

/**
 * Check if template A comes before template B in the stage order
 */
export function isTemplateBefore(templateA: TemplateKey, templateB: TemplateKey): boolean {
  return getTemplateStageIndex(templateA) < getTemplateStageIndex(templateB);
}

/**
 * Validate that templates in a bundle follow the correct stage order
 */
export function validateBundleTemplateOrder(templateKeys: TemplateKey[]): {
  valid: boolean;
  error?: string;
} {
  if (templateKeys.length < 2) {
    return { valid: false, error: 'Bundle must include at least 2 services' };
  }

  // Check for duplicates
  const uniqueKeys = new Set(templateKeys);
  if (uniqueKeys.size !== templateKeys.length) {
    return { valid: false, error: 'Bundle cannot include multiple services of the same template' };
  }

  // Check that templates are in order
  for (let i = 0; i < templateKeys.length - 1; i++) {
    if (!isTemplateBefore(templateKeys[i], templateKeys[i + 1])) {
      return {
        valid: false,
        error: `Templates must follow stage order. ${templateKeys[i]} should come before ${templateKeys[i + 1]}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Re-export individual templates
 */
export {
  CONSULTATION_TEMPLATE,
  FEASIBILITY_TEMPLATE,
  CONCEPT_DESIGN_TEMPLATE,
  PLANNING_APPROVALS_TEMPLATE,
  REVIEW_TEMPLATE,
};

import { TemplateKey } from '@prisma/client';
import { z } from 'zod';
import { TEMPLATES_BY_KEY } from '../marketplace/templates';
import { buildTemplateSchema } from '../marketplace/templates/schema-builder';

/**
 * Auto-generated Zod schemas from template configurations
 * These schemas validate template data based on the field definitions
 */

export const consultationTemplateDataSchema = buildTemplateSchema(
  TEMPLATES_BY_KEY[TemplateKey.CONSULTATION]
);

export const feasibilityTemplateDataSchema = buildTemplateSchema(
  TEMPLATES_BY_KEY[TemplateKey.FEASIBILITY]
);

export const conceptDesignTemplateDataSchema = buildTemplateSchema(
  TEMPLATES_BY_KEY[TemplateKey.CONCEPT_DESIGN]
);

export const planningApprovalsTemplateDataSchema = buildTemplateSchema(
  TEMPLATES_BY_KEY[TemplateKey.PLANNING_APPROVALS]
);

export const reviewTemplateDataSchema = buildTemplateSchema(TEMPLATES_BY_KEY[TemplateKey.REVIEW]);

/**
 * TypeScript types inferred from the generated schemas
 * These replace the manual type definitions
 */
export type ConsultationTemplateData = z.infer<typeof consultationTemplateDataSchema>;
export type FeasibilityTemplateData = z.infer<typeof feasibilityTemplateDataSchema>;
export type ConceptDesignTemplateData = z.infer<typeof conceptDesignTemplateDataSchema>;
export type PlanningApprovalsTemplateData = z.infer<typeof planningApprovalsTemplateDataSchema>;
export type ReviewTemplateData = z.infer<typeof reviewTemplateDataSchema>;

/**
 * Union type for all template data
 */
export type TemplateData =
  | ConsultationTemplateData
  | FeasibilityTemplateData
  | ConceptDesignTemplateData
  | PlanningApprovalsTemplateData
  | ReviewTemplateData;

/**
 * Helper to get the schema for a specific template
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTemplateDataSchema(templateKey: TemplateKey): z.ZodObject<any> {
  switch (templateKey) {
    case TemplateKey.CONSULTATION:
      return consultationTemplateDataSchema;
    case TemplateKey.FEASIBILITY:
      return feasibilityTemplateDataSchema;
    case TemplateKey.CONCEPT_DESIGN:
      return conceptDesignTemplateDataSchema;
    case TemplateKey.PLANNING_APPROVALS:
      return planningApprovalsTemplateDataSchema;
    case TemplateKey.REVIEW:
      return reviewTemplateDataSchema;
    default:
      throw new Error(`Unknown template key: ${templateKey}`);
  }
}

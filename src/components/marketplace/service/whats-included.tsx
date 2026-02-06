import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TemplateKey } from '@prisma/client';
import { TemplateData } from '@/lib/validations/template-data';
import { formatTemplateValue, formatTemplateValues } from '@/lib/utils/format-template-value';

interface WhatsIncludedProps {
  templateKey: TemplateKey;
  templateData: TemplateData;
  coveragePackageKey?: string;
  leadTimeDays: number;
  turnaroundDays: number;
}

export function WhatsIncluded({
  templateKey,
  templateData,
  coveragePackageKey,
  leadTimeDays,
  turnaroundDays,
}: WhatsIncludedProps) {
  const inclusions = getInclusionsForTemplate(templateKey, templateData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>What&apos;s Included</CardTitle>
        <CardDescription>Everything you&apos;ll receive with this service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {inclusions.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lead time</span>
            <span className="font-medium">{leadTimeDays} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery time</span>
            <span className="font-medium">{turnaroundDays} days</span>
          </div>
          {coveragePackageKey && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Coverage</span>
              <span className="font-medium">{formatCoverageKey(coveragePackageKey)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to extract inclusions from template data
function getInclusionsForTemplate(templateKey: TemplateKey, templateData: TemplateData): string[] {
  const inclusions: string[] = [];

  switch (templateKey) {
    case 'CONSULTATION':
      if (templateData.duration) {
        inclusions.push(`${templateData.duration}-minute consultation`);
      }
      if (templateData.delivery) {
        const deliveryLabel = formatTemplateValue(
          templateKey,
          'delivery',
          String(templateData.delivery)
        );
        inclusions.push(deliveryLabel);
      }
      if (templateData.focus && Array.isArray(templateData.focus)) {
        const focusLabels = formatTemplateValues(
          templateKey,
          'focus',
          templateData.focus as string[]
        );
        focusLabels.forEach((label) => inclusions.push(label));
      }
      if (templateData.followUp) {
        const followUpLabel = formatTemplateValue(
          templateKey,
          'followUp',
          String(templateData.followUp)
        );
        if (followUpLabel !== 'None') {
          inclusions.push(followUpLabel);
        }
      }
      break;

    case 'FEASIBILITY':
      if (templateData.analysisTypes && Array.isArray(templateData.analysisTypes)) {
        const analysisLabels = formatTemplateValues(
          templateKey,
          'analysisTypes',
          templateData.analysisTypes as string[]
        );
        analysisLabels.forEach((label) => inclusions.push(label));
      }
      if (templateData.optionsCount) {
        inclusions.push(`${templateData.optionsCount} design options`);
      }
      inclusions.push('Feasibility summary PDF');
      inclusions.push('Risk & constraints checklist');
      break;

    case 'CONCEPT_DESIGN':
      if (templateData.optionsCount) {
        inclusions.push(`${templateData.optionsCount} concept options`);
      }
      if (templateData.drawingTypes && Array.isArray(templateData.drawingTypes)) {
        const drawingLabels = formatTemplateValues(
          templateKey,
          'drawingTypes',
          templateData.drawingTypes as string[]
        );
        drawingLabels.forEach((label) => inclusions.push(label));
      }
      if (templateData.threeDLevel && templateData.threeDLevel !== 'NONE') {
        const threeDLabel = formatTemplateValue(
          templateKey,
          'threeDLevel',
          String(templateData.threeDLevel)
        );
        if (threeDLabel !== 'None') {
          inclusions.push(`${threeDLabel} 3D visualisation`);
        }
      }
      inclusions.push('Concept plans PDF');
      inclusions.push('Design notes');
      break;

    case 'PLANNING_APPROVALS':
      if (templateData.submissionType) {
        const submissionLabel = formatTemplateValue(
          templateKey,
          'submissionType',
          String(templateData.submissionType)
        );
        inclusions.push(submissionLabel);
      }
      if (templateData.scope && Array.isArray(templateData.scope)) {
        const scopeLabels = formatTemplateValues(
          templateKey,
          'scope',
          templateData.scope as string[]
        );
        scopeLabels.forEach((label) => inclusions.push(label));
      }
      inclusions.push('Lodged application');
      inclusions.push('Council response handling');
      break;

    case 'REVIEW':
      if (templateData.reviewTarget) {
        const targetLabel = formatTemplateValue(
          templateKey,
          'reviewTarget',
          String(templateData.reviewTarget)
        );
        inclusions.push(`${targetLabel} review`);
      }
      if (templateData.reviewDepth) {
        const depthLabel = formatTemplateValue(
          templateKey,
          'reviewDepth',
          String(templateData.reviewDepth)
        );
        inclusions.push(depthLabel);
      }
      inclusions.push('Annotated PDFs');
      inclusions.push('Written recommendations');
      break;
  }

  return inclusions;
}

function formatCoverageKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

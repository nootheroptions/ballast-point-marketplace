import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TemplateKey } from '@prisma/client';
import type { TemplateData } from '@/lib/validations/template-data';

interface ClientRequirementsProps {
  templateKey: TemplateKey;
  templateData: TemplateData;
  clientResponsibilities?: string[];
  assumptions?: string;
}

export function ClientRequirements({
  templateKey,
  templateData,
  clientResponsibilities,
  assumptions,
}: ClientRequirementsProps) {
  const requirements = getRequirementsForTemplate(templateKey, templateData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>What We Need From You</CardTitle>
        <CardDescription>Help us deliver the best results by providing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {requirements.map((requirement, index) => (
            <div key={index} className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <span>{requirement}</span>
            </div>
          ))}
        </div>

        {clientResponsibilities && clientResponsibilities.length > 0 && (
          <>
            <div className="border-t pt-4">
              <h4 className="mb-2 font-semibold">Your Responsibilities</h4>
              <div className="space-y-2">
                {clientResponsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                    <span className="text-sm">{responsibility}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {assumptions && (
          <div className="border-t pt-4">
            <h4 className="mb-2 font-semibold">Assumptions</h4>
            <p className="text-muted-foreground text-sm">{assumptions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getRequirementsForTemplate(
  templateKey: TemplateKey,
  templateData: TemplateData
): string[] {
  const requirements: string[] = [];

  switch (templateKey) {
    case 'CONSULTATION':
      if (templateData.siteContext) {
        requirements.push(templateData.siteContext as string);
      }
      requirements.push('Clear description of your project goals and constraints');
      if (templateData.delivery === 'On-site') {
        requirements.push('Site access for in-person consultation');
      }
      break;

    case 'FEASIBILITY':
      if (templateData.inputsRequired) {
        requirements.push(templateData.inputsRequired as string);
      } else {
        requirements.push('Photos and measurements of the property');
        requirements.push('Existing plans (if available)');
      }
      requirements.push('Property address for planning research');
      requirements.push('Key project requirements and constraints');
      break;

    case 'CONCEPT_DESIGN':
      requirements.push('Site measurements or existing plans');
      requirements.push('Photos of the property (interior and exterior)');
      requirements.push('Clear brief of your design preferences and requirements');
      requirements.push('Budget range');
      requirements.push('Attendance at design review meetings');
      break;

    case 'PLANNING_APPROVALS':
      requirements.push('Approved concept designs');
      requirements.push('Property title and survey (if required by council)');
      requirements.push('Payment of council fees');
      requirements.push('Response to any council requests within required timeframes');
      break;

    case 'REVIEW':
      if (templateData.inputsRequired) {
        requirements.push(templateData.inputsRequired as string);
      } else {
        requirements.push('Complete set of documents to review (PDFs)');
      }
      requirements.push('Specific concerns or questions to address');
      break;
  }

  return requirements;
}

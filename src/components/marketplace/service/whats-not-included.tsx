import { X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TemplateKey } from '@prisma/client';

interface WhatsNotIncludedProps {
  templateKey: TemplateKey;
}

export function WhatsNotIncluded({ templateKey }: WhatsNotIncludedProps) {
  const exclusions = getExclusionsForTemplate(templateKey);

  return (
    <Card>
      <CardHeader>
        <CardTitle>What&apos;s NOT Included</CardTitle>
        <CardDescription>
          To avoid surprises, here&apos;s what this service doesn&apos;t cover
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {exclusions.map((exclusion, index) => (
            <div key={index} className="flex items-start gap-3">
              <X className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
              <span className="text-muted-foreground">{exclusion}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getExclusionsForTemplate(templateKey: TemplateKey): string[] {
  switch (templateKey) {
    case 'CONSULTATION':
      return [
        'Design drawings or plans',
        'Planning applications',
        'Construction documentation',
        'On-site measurements (unless on-site delivery selected)',
        'Detailed cost estimates',
      ];

    case 'FEASIBILITY':
      return [
        'Detailed design work',
        'Planning application submission',
        'Construction drawings',
        'Detailed cost estimates',
        'Site surveys (unless specified)',
      ];

    case 'CONCEPT_DESIGN':
      return [
        'Planning application submission',
        'Council liaison and approvals',
        'Construction documentation',
        'Engineering or consultant reports',
        'Site survey',
      ];

    case 'PLANNING_APPROVALS':
      return [
        'Concept design work (must be completed first)',
        'Construction documentation',
        'Engineering design',
        'Consultant reports (unless coordination included)',
        'Post-approval construction drawings',
      ];

    case 'REVIEW':
      return [
        'New design work',
        'Planning applications',
        'Full redesign services',
        'Construction documentation',
        'Ongoing project management',
      ];

    default:
      return [];
  }
}

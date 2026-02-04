import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceDetailHeaderProps {
  serviceName: string;
  providerName: string;
  rating?: number;
  reviewCount?: number;
  positioning?: string;
  templateKey: string;
}

// Template display names
const TEMPLATE_LABELS: Record<string, string> = {
  CONSULTATION: 'Consultation',
  FEASIBILITY: 'Feasibility Study',
  CONCEPT_DESIGN: 'Concept Design',
  PLANNING_APPROVALS: 'Planning & Approvals',
  REVIEW: 'Design Review',
};

export function ServiceDetailHeader({
  serviceName,
  providerName,
  rating,
  reviewCount,
  positioning,
  templateKey,
}: ServiceDetailHeaderProps) {
  return (
    <div className="space-y-3">
      <Badge variant="secondary">{TEMPLATE_LABELS[templateKey] || templateKey}</Badge>
      <h1 className="text-3xl font-bold md:text-4xl">{serviceName}</h1>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          by <span className="text-foreground font-semibold">{providerName}</span>
        </span>

        {rating !== undefined && (
          <>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              {reviewCount !== undefined && (
                <span className="text-muted-foreground">({reviewCount} reviews)</span>
              )}
            </div>
          </>
        )}
      </div>

      {positioning && <p className="text-muted-foreground text-lg">{positioning}</p>}
    </div>
  );
}

import { ClipboardCheck, Compass, FileCheck, HelpCircle, Lightbulb, Target } from 'lucide-react';
import { HeroSearchCustomDropdown, HeroSearchDropdownSection } from './hero-search-dropdown';

interface DesiredOutcomeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  positionBelow?: boolean;
}

export function DesiredOutcomeDropdown({
  value,
  onChange,
  placeholder = 'What do you need right now?',
  positionBelow = false,
}: DesiredOutcomeDropdownProps) {
  const sections: HeroSearchDropdownSection[] = [
    {
      title: 'Choose your goal',
      items: [
        {
          id: 'advice',
          label: 'Advice / second opinion',
          icon: Lightbulb,
        },
        {
          id: 'feasibility',
          label: 'Check feasibility',
          icon: ClipboardCheck,
        },
        {
          id: 'concept',
          label: 'Get concept designs',
          icon: Compass,
        },
        {
          id: 'planning',
          label: 'Get council / planning approval',
          icon: FileCheck,
        },
        {
          id: 'review',
          label: 'Review existing plans',
          icon: Target,
        },
        {
          id: 'not-sure',
          label: 'Not sure yet',
          icon: HelpCircle,
        },
      ],
    },
  ];

  return (
    <HeroSearchCustomDropdown
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      sections={sections}
      alignToSearchBar={true}
      positionBelow={positionBelow}
    />
  );
}

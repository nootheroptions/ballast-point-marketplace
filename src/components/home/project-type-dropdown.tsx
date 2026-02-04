import { Home, PaintBucket, Plus, RefreshCw, Wrench } from 'lucide-react';
import { HeroSearchCustomDropdown, HeroSearchDropdownSection } from './hero-search-dropdown';

interface ProjectTypeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  positionBelow?: boolean;
}

export function ProjectTypeDropdown({
  value,
  onChange,
  placeholder = 'Project type',
  positionBelow = false,
}: ProjectTypeDropdownProps) {
  const sections: HeroSearchDropdownSection[] = [
    {
      title: 'What are you planning?',
      items: [
        {
          id: 'new-build',
          label: 'New build',
          icon: Home,
        },
        {
          id: 'renovation',
          label: 'Renovation',
          icon: Wrench,
        },
        {
          id: 'extension',
          label: 'Extension',
          icon: Plus,
        },
        {
          id: 'interior-fitout',
          label: 'Interior fit-out',
          icon: PaintBucket,
        },
        {
          id: 'change-of-use',
          label: 'Change of use',
          icon: RefreshCw,
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

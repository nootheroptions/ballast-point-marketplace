import { Building, Building2, Home, Hotel } from 'lucide-react';
import { HeroSearchCustomDropdown, HeroSearchDropdownSection } from './hero-search-dropdown';

interface PropertyTypeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PropertyTypeDropdown({
  value,
  onChange,
  placeholder = 'Property type',
}: PropertyTypeDropdownProps) {
  const sections: HeroSearchDropdownSection[] = [
    {
      title: 'Residential',
      items: [
        { id: 'house', label: 'House', icon: Home },
        { id: 'townhouse', label: 'Townhouse', icon: Building2 },
        { id: 'duplex', label: 'Duplex', icon: Building2 },
        { id: 'secondary-dwelling', label: 'Granny flat / secondary dwelling', icon: Home },
      ],
    },
    {
      title: 'Commercial',
      items: [
        { id: 'office', label: 'Office', icon: Building },
        { id: 'retail', label: 'Retail', icon: Building },
        { id: 'hospitality', label: 'Hospitality (café / restaurant / bar)', icon: Hotel },
        { id: 'medical', label: 'Medical', icon: Building },
        { id: 'childcare', label: 'Childcare', icon: Building },
        { id: 'gym', label: 'Gym / fitness', icon: Building },
      ],
    },
    {
      title: 'Multi-residential',
      items: [
        { id: 'apartment', label: 'Apartment', icon: Building2 },
        { id: 'mixed-use', label: 'Mixed-use', icon: Building2 },
        { id: 'boarding', label: 'Boarding / student accommodation', icon: Building2 },
      ],
    },
    {
      title: 'Public / Institutional',
      items: [{ id: 'public-institutional', label: 'Public / Institutional', icon: Building }],
    },
  ];

  return (
    <HeroSearchCustomDropdown
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      sections={sections}
      alignToSearchBar={true}
    />
  );
}

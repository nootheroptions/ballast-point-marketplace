'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Home, User, Briefcase, type LucideIcon } from 'lucide-react';

export interface NavSubItem {
  label: string;
  href: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  subItems?: NavSubItem[];
}

export const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    subItems: [{ label: 'Basic Information', href: '/profile' }],
  },
  {
    id: 'services',
    label: 'Services',
    icon: Briefcase,
    href: '/services',
  },
];

export function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.href) {
    return pathname === item.href;
  }
  if (item.subItems) {
    return item.subItems.some((sub) => pathname === sub.href);
  }
  return false;
}

interface UseNavigationOptions {
  onNavigate?: () => void;
}

export function useNavigation(options: UseNavigationOptions = {}) {
  const pathname = usePathname();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const handleItemClick = (item: NavItem) => {
    if (item.subItems) {
      setExpandedId(expandedId === item.id ? null : item.id);
    } else {
      setExpandedId(null);
      options.onNavigate?.();
    }
  };

  const checkIsActive = (item: NavItem) => isItemActive(item, pathname);

  return {
    pathname,
    expandedId,
    setExpandedId,
    handleItemClick,
    checkIsActive,
  };
}

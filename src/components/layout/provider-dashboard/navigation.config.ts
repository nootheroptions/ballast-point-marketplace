'use client';

import { usePathname } from 'next/navigation';
import { Home, User, Briefcase, Calendar, type LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
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
    href: '/profile',
  },
  {
    id: 'services',
    label: 'Services',
    icon: Briefcase,
    href: '/services',
  },
  {
    id: 'availability',
    label: 'Availability',
    icon: Calendar,
    href: '/availability',
  },
];

export function isItemActive(item: NavItem, pathname: string): boolean {
  return pathname === item.href;
}

export function useNavigation() {
  const pathname = usePathname();

  const checkIsActive = (item: NavItem) => isItemActive(item, pathname);

  return {
    pathname,
    checkIsActive,
  };
}

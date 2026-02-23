'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Target, Home, Hammer, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserDropdown } from '@/components/home/user-dropdown';
import { LocationDropdown } from '@/components/home/location-dropdown';
import { DesiredOutcomeDropdown } from '@/components/home/desired-outcome-dropdown';
import { PropertyTypeDropdown } from '@/components/home/property-type-dropdown';
import { ProjectTypeDropdown } from '@/components/home/project-type-dropdown';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/shared/Logo';
import type { LocationData } from '@/lib/types/location';
import { env } from '@/lib/config/env';

interface MarketplaceHeaderProps {
  showSearchBar?: boolean;
  user?: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    email: string;
  } | null;
  hasProvider?: boolean;
  providerSlug?: string;
}

export function MarketplaceHeader({
  showSearchBar = true,
  user,
  hasProvider,
  providerSlug,
}: MarketplaceHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(() => {
    const lng = searchParams.get('lng');
    const lat = searchParams.get('lat');
    if (lng && lat) {
      return {
        coordinates: {
          lng: parseFloat(lng),
          lat: parseFloat(lat),
        },
        formattedAddress: 'Selected location',
      };
    }
    return null;
  });
  const [desiredOutcome, setDesiredOutcome] = useState<string>(searchParams.get('outcome') || '');
  const [propertyType, setPropertyType] = useState<string>(searchParams.get('propertyType') || '');
  const [projectType, setProjectType] = useState<string>(searchParams.get('projectType') || '');

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedLocation) {
      params.set('lng', selectedLocation.coordinates.lng.toString());
      params.set('lat', selectedLocation.coordinates.lat.toString());
    }
    if (desiredOutcome) {
      params.set('outcome', desiredOutcome);
    }
    if (propertyType) {
      params.set('propertyType', propertyType);
    }
    if (projectType) {
      params.set('projectType', projectType);
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden items-center justify-between gap-8 py-4 lg:flex">
          {/* Logo */}
          <Logo href="/" size="xl" className="flex-shrink-0" />

          {/* Search Bar (optional) */}
          {showSearchBar && (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex items-center rounded-full border border-gray-300 bg-white shadow-md transition-shadow hover:shadow-lg">
                {/* Location Section */}
                <div className="search-bar-container relative flex items-center gap-2 rounded-l-full px-6 py-3 transition-colors hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white">Where</div>
                    <div className="w-48">
                      <LocationDropdown
                        value={selectedLocation}
                        onChange={setSelectedLocation}
                        placeholder="Property location"
                        positionBelow={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-300" />

                {/* Desired Outcome Section */}
                <div className="search-bar-container relative flex items-center gap-2 px-6 py-3 transition-colors hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white">What</div>
                    <div className="w-48">
                      <DesiredOutcomeDropdown
                        value={desiredOutcome}
                        onChange={setDesiredOutcome}
                        placeholder="What do you need?"
                        positionBelow={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-300" />

                {/* Property Type Section */}
                <div className="search-bar-container relative flex items-center gap-2 px-6 py-3 transition-colors hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white">Property</div>
                    <div className="w-40">
                      <PropertyTypeDropdown
                        value={propertyType}
                        onChange={setPropertyType}
                        placeholder="Property type"
                        positionBelow={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-300" />

                {/* Project Type Section */}
                <div className="search-bar-container relative flex items-center gap-2 px-6 py-3 transition-colors hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white">Project</div>
                    <div className="w-40">
                      <ProjectTypeDropdown
                        value={projectType}
                        onChange={setProjectType}
                        placeholder="Project type"
                        positionBelow={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 m-2 h-12 w-12 rounded-full p-0"
                  size="icon"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            </div>
          )}

          {/* User Navigation */}
          <div className="flex flex-shrink-0 items-center">
            {user ? (
              <UserDropdown
                user={user}
                hasProvider={hasProvider ?? false}
                providerSlug={providerSlug}
              />
            ) : showSearchBar ? (
              // Menu dropdown for search/service pages when not logged in
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="w-full cursor-pointer">
                      Log in
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup" className="w-full cursor-pointer">
                      Sign up
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${env.NEXT_PUBLIC_SITE_URL}/signup?tab=provider`}
                      className="w-full cursor-pointer"
                    >
                      List your business
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Inline buttons for home page when not logged in
              <div className="flex items-center gap-6">
                <Link
                  href="/login"
                  className="text-sm font-medium text-white transition-colors hover:text-gray-300"
                >
                  Log in
                </Link>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-gray-600 bg-transparent text-white hover:border-gray-500 hover:bg-gray-800 hover:text-white"
                >
                  <Link href="/signup">Sign up</Link>
                </Button>
                <Button asChild variant="default" className="rounded-full">
                  <Link href={`${env.NEXT_PUBLIC_SITE_URL}/signup?tab=provider`}>
                    List your business
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Logo and User */}
          <div className="flex items-center justify-between border-b py-4">
            <Logo href="/" size="lg" />
            {user ? (
              <UserDropdown
                user={user}
                hasProvider={hasProvider ?? false}
                providerSlug={providerSlug}
              />
            ) : showSearchBar ? (
              // Menu dropdown for search/service pages when not logged in
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="w-full cursor-pointer">
                      Log in
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup" className="w-full cursor-pointer">
                      Sign up
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${env.NEXT_PUBLIC_SITE_URL}/signup?tab=provider`}
                      className="w-full cursor-pointer"
                    >
                      List your business
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Inline buttons for home page when not logged in
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-white transition-colors hover:text-gray-300"
                >
                  Log in
                </Link>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full border-gray-600 bg-transparent text-white hover:border-gray-500 hover:bg-gray-800 hover:text-white"
                >
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Search (optional) */}
          {showSearchBar && (
            <div className="py-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  {/* Location */}
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <LocationDropdown
                      value={selectedLocation}
                      onChange={setSelectedLocation}
                      placeholder="Property location"
                      positionBelow={true}
                    />
                  </div>

                  {/* Desired Outcome */}
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                    <Target className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <DesiredOutcomeDropdown
                      value={desiredOutcome}
                      onChange={setDesiredOutcome}
                      placeholder="What do you need?"
                      positionBelow={true}
                    />
                  </div>

                  {/* Property Type */}
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                    <Home className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <PropertyTypeDropdown
                      value={propertyType}
                      onChange={setPropertyType}
                      placeholder="Property type"
                      positionBelow={true}
                    />
                  </div>

                  {/* Project Type */}
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                    <Hammer className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <ProjectTypeDropdown
                      value={projectType}
                      onChange={setProjectType}
                      placeholder="Project type"
                      positionBelow={true}
                    />
                  </div>

                  {/* Search Button */}
                  <Button
                    onClick={handleSearch}
                    className="bg-primary hover:bg-primary/90 mt-2 rounded-full py-5"
                    size="lg"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function MarketplaceHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden items-center justify-between gap-8 py-4 lg:flex">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-14 flex-1 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between py-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
}

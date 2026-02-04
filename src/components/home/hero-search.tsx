'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Target, Home, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationDropdown } from './location-dropdown';
import { DesiredOutcomeDropdown } from './desired-outcome-dropdown';
import { PropertyTypeDropdown } from './property-type-dropdown';
import { ProjectTypeDropdown } from './project-type-dropdown';
import type { LocationData } from '@/lib/types/location';

export function HeroSearch() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [desiredOutcome, setDesiredOutcome] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [projectType, setProjectType] = useState<string>('');
  const showFollowUp = Boolean(selectedLocation && desiredOutcome);

  const handleSearch = () => {
    // Build search URL
    const params = new URLSearchParams({
      ...(selectedLocation?.coordinates.lng && {
        lng: selectedLocation.coordinates.lng.toString(),
      }),
      ...(selectedLocation?.coordinates.lat && {
        lat: selectedLocation.coordinates.lat.toString(),
      }),
      ...(desiredOutcome && { outcome: desiredOutcome }),
      ...(propertyType && { propertyType: propertyType }),
      ...(projectType && { projectType: projectType }),
    });

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Desktop View - Progressive Search Form */}
      <div className="hidden md:block">
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
          {/* Initial Fields: Location + Desired Outcome */}
          <div className="flex gap-4">
            <div className="search-bar-container flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
              <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <LocationDropdown
                value={selectedLocation}
                onChange={setSelectedLocation}
                placeholder="Property location"
              />
            </div>

            <div className="search-bar-container flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
              <Target className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <DesiredOutcomeDropdown
                value={desiredOutcome}
                onChange={setDesiredOutcome}
                placeholder="What do you need right now?"
              />
            </div>
          </div>

          {/* Follow-up Fields: Property Type + Project Type */}
          {showFollowUp && (
            <div className="animate-in slide-in-from-top-2 flex gap-4 duration-300">
              <div className="search-bar-container flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                <Home className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <PropertyTypeDropdown
                  value={propertyType}
                  onChange={setPropertyType}
                  placeholder="Property type"
                />
              </div>

              <div className="search-bar-container flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                <Hammer className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <ProjectTypeDropdown
                  value={projectType}
                  onChange={setProjectType}
                  placeholder="Project type"
                />
              </div>
            </div>
          )}

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="w-full rounded-full bg-black py-6 text-base font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            size="lg"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Mobile View - Stacked Progressive Form */}
      <div className="rounded-3xl border-2 border-purple-300/50 bg-white/50 p-4 backdrop-blur-sm md:hidden">
        <div className="flex flex-col gap-4">
          {/* Location Box */}
          <div className="search-bar-container flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <MapPin className="h-5 w-5 flex-shrink-0 text-gray-900" />
            <LocationDropdown
              value={selectedLocation}
              onChange={setSelectedLocation}
              placeholder="Property location"
            />
          </div>

          {/* Desired Outcome Box */}
          <div className="search-bar-container flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <Target className="h-5 w-5 flex-shrink-0 text-gray-900" />
            <DesiredOutcomeDropdown
              value={desiredOutcome}
              onChange={setDesiredOutcome}
              placeholder="What do you need right now?"
            />
          </div>

          {/* Follow-up Fields */}
          {showFollowUp && (
            <>
              <div className="search-bar-container animate-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 duration-300">
                <Home className="h-5 w-5 flex-shrink-0 text-gray-900" />
                <PropertyTypeDropdown
                  value={propertyType}
                  onChange={setPropertyType}
                  placeholder="Property type"
                />
              </div>

              <div className="search-bar-container animate-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 duration-300">
                <Hammer className="h-5 w-5 flex-shrink-0 text-gray-900" />
                <ProjectTypeDropdown
                  value={projectType}
                  onChange={setProjectType}
                  placeholder="Project type"
                />
              </div>
            </>
          )}

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="mt-2 rounded-full bg-black py-6 text-base font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            size="lg"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}

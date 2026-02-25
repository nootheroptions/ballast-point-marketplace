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
        <div className="bg-background space-y-4 rounded-3xl p-6 shadow-lg">
          {/* Initial Fields: Location + Desired Outcome */}
          <div className="flex gap-4">
            <div className="search-bar-container border-border flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3">
              <MapPin className="text-muted-foreground h-5 w-5 flex-shrink-0" />
              <LocationDropdown
                value={selectedLocation}
                onChange={setSelectedLocation}
                placeholder="Property location"
              />
            </div>

            <div className="search-bar-container border-border flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3">
              <Target className="text-muted-foreground h-5 w-5 flex-shrink-0" />
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
              <div className="search-bar-container border-border flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3">
                <Home className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                <PropertyTypeDropdown
                  value={propertyType}
                  onChange={setPropertyType}
                  placeholder="Property type"
                />
              </div>

              <div className="search-bar-container border-border flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3">
                <Hammer className="text-muted-foreground h-5 w-5 flex-shrink-0" />
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-full py-6 text-base font-medium disabled:cursor-not-allowed disabled:opacity-50"
            size="lg"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Mobile View - Stacked Progressive Form */}
      <div className="border-primary/30 bg-background/50 rounded-3xl border-2 p-4 backdrop-blur-sm md:hidden">
        <div className="flex flex-col gap-4">
          {/* Location Box */}
          <div className="search-bar-container border-border bg-background flex items-center gap-3 rounded-2xl border px-4 py-4">
            <MapPin className="text-foreground h-5 w-5 flex-shrink-0" />
            <LocationDropdown
              value={selectedLocation}
              onChange={setSelectedLocation}
              placeholder="Property location"
            />
          </div>

          {/* Desired Outcome Box */}
          <div className="search-bar-container border-border bg-background flex items-center gap-3 rounded-2xl border px-4 py-4">
            <Target className="text-foreground h-5 w-5 flex-shrink-0" />
            <DesiredOutcomeDropdown
              value={desiredOutcome}
              onChange={setDesiredOutcome}
              placeholder="What do you need right now?"
            />
          </div>

          {/* Follow-up Fields */}
          {showFollowUp && (
            <>
              <div className="search-bar-container animate-in slide-in-from-top-2 border-border bg-background flex items-center gap-3 rounded-2xl border px-4 py-4 duration-300">
                <Home className="text-foreground h-5 w-5 flex-shrink-0" />
                <PropertyTypeDropdown
                  value={propertyType}
                  onChange={setPropertyType}
                  placeholder="Property type"
                />
              </div>

              <div className="search-bar-container animate-in slide-in-from-top-2 border-border bg-background flex items-center gap-3 rounded-2xl border px-4 py-4 duration-300">
                <Hammer className="text-foreground h-5 w-5 flex-shrink-0" />
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 rounded-full py-6 text-base font-medium disabled:cursor-not-allowed disabled:opacity-50"
            size="lg"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}

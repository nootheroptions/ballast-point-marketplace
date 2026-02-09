'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { LocationData, MapboxFeature } from '@/lib/types/location';
import { env } from '@/lib/config/env';

interface LocationDropdownProps {
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
  placeholder?: string;
  positionBelow?: boolean;
}

export function LocationDropdown({
  value,
  onChange,
  placeholder = 'Current location',
  positionBelow = false,
}: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const displayText = value?.formattedAddress || placeholder;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInTrigger = dropdownRef.current?.contains(target);
      const isInPanel = dropdownPanelRef.current?.contains(target);

      if (!isInTrigger && !isInPanel) {
        setIsOpen(false);
        setSearchInput('');
        setSuggestions([]);
        setError(null);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const updateDropdownPosition = useCallback(() => {
    const anchorEl = buttonRef.current?.closest('.search-bar-container') ?? buttonRef.current;
    const rect = anchorEl?.getBoundingClientRect();

    if (!rect) return;

    setDropdownPosition({
      left: rect.left,
      top: positionBelow ? rect.bottom + 8 : rect.top - 8,
      width: rect.width,
    });
  }, [positionBelow]);

  useEffect(() => {
    if (!isOpen) return;

    function handleReposition() {
      updateDropdownPosition();
    }

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  // Debounced autocomplete search
  useEffect(() => {
    if (!searchInput.trim() || !isOpen) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=address,place&limit=5`;

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        const data = await response.json();

        if (data.features) {
          setSuggestions(data.features);
        } else {
          setSuggestions([]);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        console.error('Autocomplete error:', err);
        setError('Failed to load suggestions');
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchInput, isOpen]);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback(
    (feature: MapboxFeature) => {
      const locationData: LocationData = {
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1],
        },
        formattedAddress: feature.place_name,
        placeId: feature.id,
        placeName: feature.text,
      };

      onChange(locationData);
      setIsOpen(false);
      setSearchInput('');
      setSuggestions([]);
    },
    [onChange]
  );

  return (
    <div ref={dropdownRef} className="relative flex-1">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!isOpen) updateDropdownPosition();
          setIsOpen(!isOpen);
        }}
        className="flex w-full items-center justify-between text-left"
      >
        <span className={`text-base ${value ? 'text-gray-900' : 'text-primary font-medium'}`}>
          {displayText}
        </span>
      </button>

      {isOpen && dropdownPosition && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
              <div
                ref={dropdownPanelRef}
                style={{
                  position: 'absolute',
                  ...dropdownPosition,
                  pointerEvents: 'auto',
                }}
                className={`max-h-[500px] overflow-y-auto rounded-2xl border border-gray-100 bg-white py-3 shadow-2xl ${positionBelow ? '' : '-translate-y-full'}`}
              >
                {/* Search Input */}
                <div className="px-4 pb-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search for a location..."
                    className="focus:ring-primary w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mx-4 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Loading Suggestions */}
                {isLoadingSuggestions && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="text-base text-gray-500">Loading suggestions...</span>
                  </div>
                )}

                {/* Autocomplete Suggestions */}
                {!isLoadingSuggestions &&
                  suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="flex w-full items-center gap-3 px-4 py-2 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200">
                        <MapPin className="text-primary h-5 w-5" />
                      </div>
                      <span className="text-left text-base text-gray-900">
                        {suggestion.place_name}
                      </span>
                    </button>
                  ))}

                {/* No Results */}
                {!isLoadingSuggestions && searchInput && suggestions.length === 0 && !error && (
                  <div className="px-4 py-3 text-base text-gray-500">No locations found</div>
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

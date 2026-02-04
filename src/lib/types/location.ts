export interface LocationCoordinates {
  lng: number; // Note: Mapbox uses [lng, lat] order
  lat: number;
}

export interface LocationData {
  coordinates: LocationCoordinates;
  formattedAddress: string;
  placeId?: string; // Mapbox uses feature ID
  placeName?: string;
}

export interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: Record<string, unknown>;
  text: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
  }>;
}

export type LocationSource = 'current' | 'autocomplete' | 'manual';

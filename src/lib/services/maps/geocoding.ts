import { env } from '@/lib/config/env';
import type { LocationData, MapboxFeature } from '@/lib/types/location';

const MAPBOX_GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

/**
 * Reverse geocode coordinates to get formatted address
 */
export async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const url = `${MAPBOX_GEOCODING_API}/${lng},${lat}.json?access_token=${env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }

    throw new Error('No address found for these coordinates');
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error('Failed to reverse geocode location');
  }
}

/**
 * Get current location with formatted address
 */
export async function getCurrentLocation(): Promise<LocationData> {
  const { getCurrentPosition } = await import('./geolocation');
  const position = await getCurrentPosition();
  const { longitude, latitude } = position.coords;

  const formattedAddress = await reverseGeocode(longitude, latitude);

  return {
    coordinates: {
      lng: longitude,
      lat: latitude,
    },
    formattedAddress,
    placeName: formattedAddress,
  };
}

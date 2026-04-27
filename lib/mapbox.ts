import type { MapboxLocationSuggestion } from "@/lib/types";

const MAPBOX_GEOCODING_URL = "https://api.mapbox.com/search/geocode/v6/forward";

interface MapboxContextEntry {
  name?: string;
}

interface MapboxFeatureProperties {
  full_address?: string;
  place_formatted?: string;
  context?: {
    region?: MapboxContextEntry;
    district?: MapboxContextEntry;
    locality?: MapboxContextEntry;
    place?: MapboxContextEntry;
    neighborhood?: MapboxContextEntry;
  };
}

interface MapboxFeature {
  id?: string;
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: MapboxFeatureProperties;
}

interface MapboxGeocodingResponse {
  features?: MapboxFeature[];
}

function resolveCounty(properties?: MapboxFeatureProperties): string {
  return (
    properties?.context?.region?.name ??
    properties?.context?.district?.name ??
    ""
  );
}

function resolveTown(properties?: MapboxFeatureProperties): string {
  return (
    properties?.context?.place?.name ??
    properties?.context?.locality?.name ??
    properties?.context?.neighborhood?.name ??
    ""
  );
}

export async function searchKenyanLocations(
  query: string,
): Promise<MapboxLocationSuggestion[]> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const trimmedQuery = query.trim();

  if (!accessToken || trimmedQuery.length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    access_token: accessToken,
    autocomplete: "true",
    country: "KE",
    limit: "5",
    q: trimmedQuery,
    types: "address,street,neighborhood,locality,place",
  });
  const response = await fetch(`${MAPBOX_GEOCODING_URL}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as MapboxGeocodingResponse;

  return (payload.features ?? [])
    .map((feature) => {
      const coordinates = feature.geometry?.coordinates;
      const label =
        feature.properties?.full_address ??
        feature.properties?.place_formatted ??
        "";

      if (!feature.id || !coordinates || !label) {
        return null;
      }

      return {
        id: feature.id,
        label,
        county: resolveCounty(feature.properties),
        town: resolveTown(feature.properties),
        latitude: coordinates[1],
        longitude: coordinates[0],
      } satisfies MapboxLocationSuggestion;
    })
    .filter((feature): feature is MapboxLocationSuggestion => Boolean(feature));
}

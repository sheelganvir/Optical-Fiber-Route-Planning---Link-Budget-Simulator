export interface GeoCoordinate {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates geographic distance between two lat/lng coordinates using Haversine formula.
 */
export function haversineDistance(
  coord1: GeoCoordinate | [number, number],
  coord2: GeoCoordinate | [number, number]
): number {
  const lat1 = Array.isArray(coord1) ? coord1[0] : coord1.lat;
  const lon1 = Array.isArray(coord1) ? coord1[1] : coord1.lng;
  const lat2 = Array.isArray(coord2) ? coord2[0] : coord2.lat;
  const lon2 = Array.isArray(coord2) ? coord2[1] : coord2.lng;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;
  return Number(distance.toFixed(3));
}

/**
 * Calculates total route distance along a sequence of waypoints (P1 -> P2 -> P3 -> Pn).
 */
export function calculateRouteDistance(
  points: Array<GeoCoordinate | [number, number]>
): number {
  if (!points || points.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += haversineDistance(points[i], points[i + 1]);
  }

  return Number(totalDistance.toFixed(2));
}

/**
 * Returns segment-by-segment distance breakdown.
 */
export function calculateSegmentDistances(
  points: Array<GeoCoordinate | [number, number]>
): Array<{ fromIndex: number; toIndex: number; distanceKm: number }> {
  if (!points || points.length < 2) return [];

  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dist = haversineDistance(points[i], points[i + 1]);
    segments.push({
      fromIndex: i,
      toIndex: i + 1,
      distanceKm: Number(dist.toFixed(2)),
    });
  }

  return segments;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

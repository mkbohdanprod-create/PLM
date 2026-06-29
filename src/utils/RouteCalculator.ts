import type { Order, RouteInfo } from '../types';

/**
 * Decodes OSRM polyline geometry
 */
function decodePolyline(str: string, precision: number = 5): [number, number][] {
  let index = 0,
      lat = 0,
      lng = 0,
      coordinates: [number, number][] = [],
      shift = 0,
      result = 0,
      byte = null,
      latitude_change,
      longitude_change,
      factor = Math.pow(10, precision);

  while (index < str.length) {
    byte = null;
    shift = 0;
    result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    shift = result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += latitude_change;
    lng += longitude_change;
    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
}

export async function calculateRoute(orders: Order[]): Promise<RouteInfo | null> {
  if (orders.length < 2) return null;

  // Format: lon,lat;lon,lat
  const coordinates = orders.map(o => `${o.lng},${o.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=polyline`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn('OSRM returned no routes');
      return null;
    }

    const route = data.routes[0];
    return {
      distance: route.distance,
      duration: route.duration,
      geometry: decodePolyline(route.geometry),
      legs: route.legs // Array of { distance, duration, steps, summary, weight }
    };
  } catch (error) {
    console.error('Error fetching route from OSRM:', error);
    return null;
  }
}

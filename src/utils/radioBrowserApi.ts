/**
 * Radio Browser API Integration
 *
 * Free database of 45,000+ radio stations worldwide
 * API Documentation: https://api.radio-browser.info/
 *
 * Usage examples:
 * - Get stations by country: getStationsByCountry('Mexico')
 * - Get stations by city: searchStations('Tulum')
 * - Get stations by genre: getStationsByTag('electronic')
 */

const API_BASE = 'https://de1.api.radio-browser.info/json';

export interface RadioBrowserStation {
  changeuuid: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
  clickcount: number;
  clicktrend: number;
}

/**
 * Get radio stations by country
 * @param country - Country name (e.g., 'Mexico', 'United States', 'Spain')
 * @param limit - Maximum number of results (default: 50)
 */
export async function getStationsByCountry(
  country: string,
  limit: number = 50
): Promise<RadioBrowserStation[]> {
  const encodedCountry = encodeURIComponent(country);
  const url = `${API_BASE}/stations/bycountryexact/${encodedCountry}?limit=${limit}&order=votes&reverse=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stations by country:', error);
    return [];
  }
}

/**
 * Search for radio stations by name
 * @param query - Search term (e.g., 'Tulum', 'Ibiza', 'Miami')
 * @param limit - Maximum number of results (default: 20)
 */
export async function searchStations(
  query: string,
  limit: number = 20
): Promise<RadioBrowserStation[]> {
  const url = `${API_BASE}/stations/search?name=${encodeURIComponent(query)}&limit=${limit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to search stations:', error);
    return [];
  }
}

/**
 * Get radio stations by tag/genre
 * @param tag - Tag/genre name (e.g., 'electronic', 'jazz', 'house')
 * @param limit - Maximum number of results (default: 50)
 */
export async function getStationsByTag(
  tag: string,
  limit: number = 50
): Promise<RadioBrowserStation[]> {
  const url = `${API_BASE}/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}&order=votes&reverse=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stations by tag:', error);
    return [];
  }
}

/**
 * Get top-rated stations globally
 * @param limit - Maximum number of results (default: 100)
 */
export async function getTopStations(
  limit: number = 100
): Promise<RadioBrowserStation[]> {
  const url = `${API_BASE}/stations?order=votes&reverse=true&limit=${limit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch top stations:', error);
    return [];
  }
}

/**
 * Get high-quality stations (bitrate > 128kbps)
 * @param limit - Maximum number of results (default: 100)
 */
export async function getHighQualityStations(
  limit: number = 100
): Promise<RadioBrowserStation[]> {
  const url = `${API_BASE}/stations?order=bitrate&reverse=true&limit=${limit}&has_extended_info=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const stations = await response.json();
    // Filter for bitrate > 128kbps
    return stations.filter((s: RadioBrowserStation) => s.bitrate >= 128);
  } catch (error) {
    console.error('Failed to fetch high-quality stations:', error);
    return [];
  }
}

/**
 * Convert Radio Browser station to our app's RadioStation format
 */
export function convertToAppStation(browserStation: RadioBrowserStation, genreId: string) {
  return {
    id: `rb-${browserStation.stationuuid}`,
    name: browserStation.name,
    genre: genreId,
    country: browserStation.country,
    countryCode: browserStation.countrycode.toUpperCase(),
    description: `${browserStation.tags || 'Radio station'} - ${browserStation.language}`,
    streamUrl: browserStation.url_resolved || browserStation.url,
    website: browserStation.homepage || '',
    artwork: browserStation.favicon || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop',
    accentColor: '#3B82F6',
    isLive: true,
    tags: browserStation.tags ? browserStation.tags.split(',').map(t => t.trim()) : [],
  };
}

/**
 * Example usage for specific locations:
 *
 * // Get Tulum stations
 * const tulamStations = await searchStations('Tulum');
 *
 * // Get Mexico stations
 * const mexicoStations = await getStationsByCountry('Mexico');
 *
 * // Get Ibiza stations
 * const ibizaStations = await searchStations('Ibiza');
 *
 * // Get Dubai stations
 * const dubaiStations = await getStationsByCountry('United Arab Emirates');
 *
 * // Get electronic music stations
 * const electronicStations = await getStationsByTag('electronic');
 */

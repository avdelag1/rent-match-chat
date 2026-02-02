import { RadioStation, CityTheme, CityLocation } from '@/types/radio';

/**
 * City themes with color schemes
 */
export const cityThemes: Record<CityLocation, CityTheme> = {
  'new-york': {
    id: 'new-york',
    name: 'New York',
    primaryColor: '#1a1a1a',
    secondaryColor: '#ffd700',
    accentColor: '#ff4500',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
    description: 'The city that never sleeps'
  },
  'miami': {
    id: 'miami',
    name: 'Miami',
    primaryColor: '#ff006e',
    secondaryColor: '#fb5607',
    accentColor: '#ffbe0b',
    gradient: 'linear-gradient(135deg, #ff006e 0%, #fb5607 50%, #ffbe0b 100%)',
    description: 'Neon nights and tropical vibes'
  },
  'ibiza': {
    id: 'ibiza',
    name: 'Ibiza',
    primaryColor: '#5e17eb',
    secondaryColor: '#3a0ca3',
    accentColor: '#4cc9f0',
    gradient: 'linear-gradient(135deg, #5e17eb 0%, #3a0ca3 50%, #4cc9f0 100%)',
    description: 'Electronic paradise'
  },
  'tulum': {
    id: 'tulum',
    name: 'Tulum/Playa',
    primaryColor: '#2d6a4f',
    secondaryColor: '#52b788',
    accentColor: '#f4a261',
    gradient: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 50%, #f4a261 100%)',
    description: 'Earthy jungle meets beach sunset'
  },
  'california': {
    id: 'california',
    name: 'California',
    primaryColor: '#ff6b35',
    secondaryColor: '#f7931e',
    accentColor: '#fdc500',
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #fdc500 100%)',
    description: 'West coast sunshine'
  },
  'texas': {
    id: 'texas',
    name: 'Texas',
    primaryColor: '#8b0000',
    secondaryColor: '#cd853f',
    accentColor: '#daa520',
    gradient: 'linear-gradient(135deg, #8b0000 0%, #cd853f 50%, #daa520 100%)',
    description: 'Lone star vibes'
  },
  'french': {
    id: 'french',
    name: 'French',
    primaryColor: '#001f3f',
    secondaryColor: '#ffffff',
    accentColor: '#ff4136',
    gradient: 'linear-gradient(135deg, #001f3f 0%, #ffffff 50%, #ff4136 100%)',
    description: 'Parisian elegance'
  },
  'podcasts': {
    id: 'podcasts',
    name: 'Podcasts',
    primaryColor: '#6a0572',
    secondaryColor: '#ab83a1',
    accentColor: '#ffc300',
    gradient: 'linear-gradient(135deg, #6a0572 0%, #ab83a1 50%, #ffc300 100%)',
    description: 'Talk shows and storytelling'
  }
};

/**
 * All radio stations organized by city
 */
export const radioStations: RadioStation[] = [
  // New York
  {
    id: 'ny-z100',
    name: 'Z100',
    frequency: '100.3 FM',
    streamUrl: 'https://stream.z100.iheart.com/z100.mp3',
    city: 'new-york',
    genre: 'Top 40',
    description: 'New York\'s #1 Hit Music Station'
  },
  {
    id: 'ny-q1043',
    name: 'Q104.3',
    frequency: '104.3 FM',
    streamUrl: 'https://stream.q1043.iheart.com/q1043.mp3',
    city: 'new-york',
    genre: 'Classic Rock',
    description: 'New York\'s Classic Rock'
  },
  {
    id: 'ny-power1051',
    name: 'Power 105.1',
    frequency: '105.1 FM',
    streamUrl: 'https://stream.power1051.iheart.com/power1051.mp3',
    city: 'new-york',
    genre: 'Hip Hop',
    description: 'The People\'s Station'
  },
  {
    id: 'ny-ktu',
    name: '103.5 KTU',
    frequency: '103.5 FM',
    streamUrl: 'https://stream.ktu.iheart.com/ktu.mp3',
    city: 'new-york',
    genre: 'Dance',
    description: 'Beat of New York'
  },
  {
    id: 'ny-wfan',
    name: 'WFAN',
    frequency: '101.9 FM',
    streamUrl: 'https://stream.wfan.radio.com/wfan.mp3',
    city: 'new-york',
    genre: 'Sports',
    description: 'Sports Radio'
  },

  // Miami
  {
    id: 'miami-y100',
    name: 'Y100',
    frequency: '100.7 FM',
    streamUrl: 'https://stream.y100.iheart.com/y100.mp3',
    city: 'miami',
    genre: 'Top 40',
    description: 'Miami\'s Hit Music Channel'
  },
  {
    id: 'miami-tu949',
    name: 'Tu 94.9',
    frequency: '94.9 FM',
    streamUrl: 'https://stream.tu949.iheart.com/tu949.mp3',
    city: 'miami',
    genre: 'Latin',
    description: 'Latin Hits'
  },
  {
    id: 'miami-power96',
    name: 'Power 96',
    frequency: '96.5 FM',
    streamUrl: 'https://stream.power96.radio.com/power96.mp3',
    city: 'miami',
    genre: 'Dance/EDM',
    description: 'Miami\'s Dance Music'
  },
  {
    id: 'miami-hits973',
    name: 'Hits 97.3',
    frequency: '97.3 FM',
    streamUrl: 'https://stream.hits973.iheart.com/hits973.mp3',
    city: 'miami',
    genre: 'Top 40',
    description: 'Miami\'s Hit Music'
  },
  {
    id: 'miami-big1059',
    name: 'BIG 105.9',
    frequency: '105.9 FM',
    streamUrl: 'https://stream.big1059.iheart.com/big1059.mp3',
    city: 'miami',
    genre: 'Classic Hits',
    description: 'Greatest Hits'
  },

  // Ibiza
  {
    id: 'ibiza-global',
    name: 'Ibiza Global Radio',
    frequency: '97.6 FM',
    streamUrl: 'https://ibizaglobalradio.streaming-pro.com:8024/;',
    city: 'ibiza',
    genre: 'Electronic',
    description: 'The Sound of Ibiza'
  },
  {
    id: 'ibiza-live',
    name: 'Ibiza Live Radio',
    frequency: '95.2 FM',
    streamUrl: 'https://stream.ibizaliveradio.com/live',
    city: 'ibiza',
    genre: 'Dance',
    description: 'Live from Ibiza'
  },
  {
    id: 'ibiza-sonica',
    name: 'Ibiza Sonica',
    frequency: '95.2 FM',
    streamUrl: 'https://stream.ibizasonica.com:7018/live',
    city: 'ibiza',
    genre: 'Electronic',
    description: 'Electronic Music Radio'
  },
  {
    id: 'ibiza-cafe',
    name: 'Café del Mar',
    frequency: '96.8 FM',
    streamUrl: 'https://streams.radio.co/se1ef470c3/listen',
    city: 'ibiza',
    genre: 'Chillout',
    description: 'Chillout Lounge Music'
  },
  {
    id: 'ibiza-chillout',
    name: 'Absolute Chillout',
    frequency: '98.5 FM',
    streamUrl: 'https://streams.absoluteradio.co.uk/chillout',
    city: 'ibiza',
    genre: 'Chillout',
    description: 'Pure Chillout'
  },

  // Tulum/Playa del Carmen
  {
    id: 'tulum-organica',
    name: 'Ibiza Organica',
    frequency: '100.1 FM',
    streamUrl: 'https://stream.ibizaorganica.com/live',
    city: 'tulum',
    genre: 'Organic House',
    description: 'Organic House & Downtempo'
  },
  {
    id: 'tulum-cadena',
    name: 'Cadena Dance',
    frequency: '102.5 FM',
    streamUrl: 'https://streamingcadenadonotuse.com:7007/stream',
    city: 'tulum',
    genre: 'Dance',
    description: 'Electronic Dance Music'
  },
  {
    id: 'tulum-turquesa',
    name: 'Turquesa FM',
    frequency: '94.1 FM',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/XHPEPFM.mp3',
    city: 'tulum',
    genre: 'Regional Mexican',
    description: 'Regional Mexican Music'
  },
  {
    id: 'tulum-romantica',
    name: 'Muy Romantica',
    frequency: '101.5 FM',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/ROMANTICA.mp3',
    city: 'tulum',
    genre: 'Romantic',
    description: 'Romantic Hits'
  },
  {
    id: 'tulum-sonidero',
    name: 'Son Sonidero',
    frequency: '99.3 FM',
    streamUrl: 'https://stream.sonsonidero.com/live',
    city: 'tulum',
    genre: 'Cumbia',
    description: 'Sonidero & Cumbia'
  },

  // California
  {
    id: 'ca-kroq',
    name: 'KROQ',
    frequency: '106.7 FM',
    streamUrl: 'https://stream.kroq.radio.com/kroq.mp3',
    city: 'california',
    genre: 'Alternative Rock',
    description: 'World Famous KROQ'
  },
  {
    id: 'ca-kiis',
    name: 'KIIS-FM',
    frequency: '102.7 FM',
    streamUrl: 'https://stream.kiisfm.iheart.com/kiisfm.mp3',
    city: 'california',
    genre: 'Top 40',
    description: 'LA\'s #1 Hit Music'
  },
  {
    id: 'ca-kusc',
    name: 'KUSC',
    frequency: '91.5 FM',
    streamUrl: 'https://stream.kusc.org/kusc-mp3',
    city: 'california',
    genre: 'Classical',
    description: 'Classical Music'
  },
  {
    id: 'ca-kcrw',
    name: 'KCRW',
    frequency: '89.9 FM',
    streamUrl: 'https://kcrw.streamguys1.com/kcrw_192k_mp3_on_air',
    city: 'california',
    genre: 'Eclectic',
    description: 'Music Discovery'
  },
  {
    id: 'ca-kpcc',
    name: 'KPCC',
    frequency: '89.3 FM',
    streamUrl: 'https://stream.scpr.org/kpcc',
    city: 'california',
    genre: 'News/Talk',
    description: 'Southern California Public Radio'
  },

  // Texas
  {
    id: 'tx-kxt',
    name: 'KXT',
    frequency: '91.7 FM',
    streamUrl: 'https://kxt.streamguys1.com/live-mp3',
    city: 'texas',
    genre: 'Adult Alternative',
    description: 'Where The Music Matters'
  },
  {
    id: 'tx-kiss',
    name: 'KISS Country',
    frequency: '96.7 FM',
    streamUrl: 'https://stream.kisscountry.radio.com/kisscountry.mp3',
    city: 'texas',
    genre: 'Country',
    description: 'Country Hits'
  },
  {
    id: 'tx-ticket',
    name: 'The Ticket',
    frequency: '96.7 FM',
    streamUrl: 'https://stream.theticket.radio.com/theticket.mp3',
    city: 'texas',
    genre: 'Sports',
    description: 'Sports Talk'
  },
  {
    id: 'tx-kut',
    name: 'KUT',
    frequency: '90.5 FM',
    streamUrl: 'https://kut.streamguys1.com/kut',
    city: 'texas',
    genre: 'Public Radio',
    description: 'Austin\'s NPR Station'
  },
  {
    id: 'tx-freetexas',
    name: 'Radio Free Texas',
    frequency: '98.9 FM',
    streamUrl: 'https://stream.radiofreetexas.com/rft',
    city: 'texas',
    genre: 'Texas Music',
    description: 'Independent Texas Music'
  },

  // French
  {
    id: 'fr-inter',
    name: 'France Inter',
    frequency: '87.8 FM',
    streamUrl: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3',
    city: 'french',
    genre: 'Talk/Culture',
    description: 'Culture & Information'
  },
  {
    id: 'fr-nrj',
    name: 'NRJ',
    frequency: '100.3 FM',
    streamUrl: 'https://scdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3',
    city: 'french',
    genre: 'Top 40',
    description: 'Hit Music Only'
  },
  {
    id: 'fr-rtl',
    name: 'RTL',
    frequency: '104.3 FM',
    streamUrl: 'https://streaming.radio.rtl.fr/rtl-1-44-128',
    city: 'french',
    genre: 'News/Talk',
    description: 'French News Radio'
  },
  {
    id: 'fr-fip',
    name: 'FIP',
    frequency: '105.1 FM',
    streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
    city: 'french',
    genre: 'Eclectic',
    description: 'Eclectic Music Selection'
  },
  {
    id: 'fr-skyrock',
    name: 'Skyrock',
    frequency: '96.0 FM',
    streamUrl: 'https://icecast.skyrock.net/s/natio_mp3_128k',
    city: 'french',
    genre: 'Hip Hop/R&B',
    description: 'Urban Music'
  },

  // Podcasts
  {
    id: 'pod-rogan',
    name: 'Joe Rogan Experience',
    frequency: 'Podcast',
    streamUrl: 'https://feeds.megaphone.fm/PSY2094002909', // RSS feed
    city: 'podcasts',
    genre: 'Talk/Comedy',
    description: 'Long-form conversations'
  },
  {
    id: 'pod-callherdaddy',
    name: 'Call Her Daddy',
    frequency: 'Podcast',
    streamUrl: 'https://feeds.megaphone.fm/ESP3218285991',
    city: 'podcasts',
    genre: 'Comedy/Lifestyle',
    description: 'Unfiltered conversations'
  },
  {
    id: 'pod-daily',
    name: 'The Daily',
    frequency: 'Podcast',
    streamUrl: 'https://feeds.simplecast.com/54nAGcIl',
    city: 'podcasts',
    genre: 'News',
    description: 'NYT daily news'
  },
  {
    id: 'pod-crimejunkie',
    name: 'Crime Junkie',
    frequency: 'Podcast',
    streamUrl: 'https://feeds.simplecast.com/qm_9xx0g',
    city: 'podcasts',
    genre: 'True Crime',
    description: 'True crime stories'
  },
  {
    id: 'pod-smartless',
    name: 'SmartLess',
    frequency: 'Podcast',
    streamUrl: 'https://feeds.megaphone.fm/WWO8086624632',
    city: 'podcasts',
    genre: 'Comedy/Interview',
    description: 'Celebrity interviews'
  }
];

/**
 * Get stations for a specific city
 */
export function getStationsByCity(city: CityLocation): RadioStation[] {
  return radioStations.filter(station => station.city === city);
}

/**
 * Get station by ID
 */
export function getStationById(id: string): RadioStation | undefined {
  return radioStations.find(station => station.id === id);
}

/**
 * Get all cities
 */
export function getAllCities(): CityLocation[] {
  return Object.keys(cityThemes) as CityLocation[];
}

/**
 * Get random station from any city (for shuffle mode)
 */
export function getRandomStation(): RadioStation {
  return radioStations[Math.floor(Math.random() * radioStations.length)];
}

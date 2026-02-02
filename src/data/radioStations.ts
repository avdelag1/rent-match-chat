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
  // New York - SomaFM channels
  {
    id: 'ny-groovesalad',
    name: 'Groove Salad',
    frequency: '100.3 FM',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    city: 'new-york',
    genre: 'Chillout',
    description: 'A nicely chilled plate of ambient/downtempo beats'
  },
  {
    id: 'ny-defcon',
    name: 'DEF CON Radio',
    frequency: '104.3 FM',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    city: 'new-york',
    genre: 'Electronic',
    description: 'Music for Hacking'
  },
  {
    id: 'ny-indiepop',
    name: 'Indie Pop Rocks',
    frequency: '105.1 FM',
    streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
    city: 'new-york',
    genre: 'Indie Pop',
    description: 'New and classic indie pop'
  },
  {
    id: 'ny-u80s',
    name: 'Underground 80s',
    frequency: '103.5 FM',
    streamUrl: 'https://ice1.somafm.com/u80s-128-mp3',
    city: 'new-york',
    genre: 'Alternative',
    description: 'Early 80s UK Synthpop and a bit of New Wave'
  },
  {
    id: 'ny-secretagent',
    name: 'Secret Agent',
    frequency: '101.9 FM',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    city: 'new-york',
    genre: 'Lounge',
    description: 'The soundtrack for your stylish, mysterious life'
  },

  // Miami - Dance/Electronic vibes
  {
    id: 'miami-beatblender',
    name: 'Beat Blender',
    frequency: '100.7 FM',
    streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
    city: 'miami',
    genre: 'Electronic',
    description: 'A late night blend of deep-house and downtempo chill'
  },
  {
    id: 'miami-deepspace',
    name: 'Deep Space One',
    frequency: '94.9 FM',
    streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    city: 'miami',
    genre: 'Ambient',
    description: 'Deep ambient electronic, experimental and space music'
  },
  {
    id: 'miami-dronezone',
    name: 'Drone Zone',
    frequency: '96.5 FM',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    city: 'miami',
    genre: 'Ambient',
    description: 'Served best chilled, safe with most medications'
  },
  {
    id: 'miami-spacestationsoma',
    name: 'Space Station Soma',
    frequency: '97.3 FM',
    streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
    city: 'miami',
    genre: 'Ambient',
    description: 'Tune in, turn on, space out'
  },
  {
    id: 'miami-lush',
    name: 'Lush',
    frequency: '105.9 FM',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    city: 'miami',
    genre: 'Chillout',
    description: 'Sensuous and mellow vocals, mostly female'
  },

  // Ibiza - Electronic/Dance
  {
    id: 'ibiza-dubstep',
    name: 'Dub Step Beyond',
    frequency: '97.6 FM',
    streamUrl: 'https://ice1.somafm.com/dubstep-128-mp3',
    city: 'ibiza',
    genre: 'Dubstep',
    description: 'Dubstep, Dub and Deep Bass'
  },
  {
    id: 'ibiza-seveni',
    name: 'Seven Inch Soul',
    frequency: '95.2 FM',
    streamUrl: 'https://ice1.somafm.com/7soul-128-mp3',
    city: 'ibiza',
    genre: 'Soul',
    description: 'Vintage soul tracks from the original 45 RPM vinyl'
  },
  {
    id: 'ibiza-mission',
    name: 'Mission Control',
    frequency: '95.2 FM',
    streamUrl: 'https://ice1.somafm.com/missioncontrol-128-mp3',
    city: 'ibiza',
    genre: 'Electronic',
    description: 'Celebrating NASA and Space Explorers'
  },
  {
    id: 'ibiza-digitalis',
    name: 'Digitalis',
    frequency: '96.8 FM',
    streamUrl: 'https://ice1.somafm.com/digitalis-128-mp3',
    city: 'ibiza',
    genre: 'IDM',
    description: 'Digitally affected analog rock to calm the agitated heart'
  },
  {
    id: 'ibiza-bootliquor',
    name: 'Boot Liquor',
    frequency: '98.5 FM',
    streamUrl: 'https://ice1.somafm.com/bootliquor-128-mp3',
    city: 'ibiza',
    genre: 'Americana',
    description: 'Americana Roots music for Cowhands, Cowpokes and Cowpunks'
  },

  // Tulum/Playa del Carmen - Relaxing/World Music
  {
    id: 'tulum-paradise-main',
    name: 'Radio Paradise',
    frequency: '100.1 FM',
    streamUrl: 'http://stream.radioparadise.com/mp3-128',
    city: 'tulum',
    genre: 'Eclectic',
    description: 'Eclectic mix of rock, indie, electronica, world music'
  },
  {
    id: 'tulum-paradise-mellow',
    name: 'RP Mellow Mix',
    frequency: '102.5 FM',
    streamUrl: 'http://stream.radioparadise.com/mellow-128',
    city: 'tulum',
    genre: 'Mellow',
    description: 'A mellower version of Radio Paradise'
  },
  {
    id: 'tulum-paradise-rock',
    name: 'RP Rock Mix',
    frequency: '94.1 FM',
    streamUrl: 'http://stream.radioparadise.com/rock-128',
    city: 'tulum',
    genre: 'Rock',
    description: 'Rocks a little harder than the Main Mix'
  },
  {
    id: 'tulum-paradise-global',
    name: 'RP Global Mix',
    frequency: '101.5 FM',
    streamUrl: 'http://stream.radioparadise.com/world-etc-128',
    city: 'tulum',
    genre: 'World',
    description: 'Global and world music from Radio Paradise'
  },
  {
    id: 'tulum-suburbs',
    name: 'Suburbs of Goa',
    frequency: '99.3 FM',
    streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    city: 'tulum',
    genre: 'Psybient',
    description: 'Downtempo psybient music for stargazing'
  },

  // California - Indie/Alternative/Rock
  {
    id: 'ca-leftcoast',
    name: 'Left Coast 70s',
    frequency: '106.7 FM',
    streamUrl: 'https://ice1.somafm.com/seventies-128-mp3',
    city: 'california',
    genre: 'Classic Rock',
    description: 'Mellow album rock from the 70s'
  },
  {
    id: 'ca-bagel',
    name: 'BAGeL Radio',
    frequency: '102.7 FM',
    streamUrl: 'https://ice1.somafm.com/bagel-128-mp3',
    city: 'california',
    genre: 'Alternative',
    description: 'What alternative rock sounded like in 2005'
  },
  {
    id: 'ca-covers',
    name: 'Covers',
    frequency: '91.5 FM',
    streamUrl: 'https://ice1.somafm.com/covers-128-mp3',
    city: 'california',
    genre: 'Cover Songs',
    description: 'Just covers. Songs you know by artists you don\'t.'
  },
  {
    id: 'ca-folkfwd',
    name: 'Folk Forward',
    frequency: '89.9 FM',
    streamUrl: 'https://ice1.somafm.com/folkfwd-128-mp3',
    city: 'california',
    genre: 'Folk',
    description: 'Indie Folk, Alt-folk and the occasional folk classics'
  },
  {
    id: 'ca-sonicuniverse',
    name: 'Sonic Universe',
    frequency: '89.3 FM',
    streamUrl: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    city: 'california',
    genre: 'Jazz',
    description: 'Transcending the world of jazz with eclectic, avant-garde takes'
  },

  // Texas - Country/Americana/Rock
  {
    id: 'tx-bootliquor',
    name: 'Boot Liquor',
    frequency: '91.7 FM',
    streamUrl: 'https://ice1.somafm.com/bootliquor-128-mp3',
    city: 'texas',
    genre: 'Americana',
    description: 'Americana Roots music for Cowhands, Cowpokes and Cowpunks'
  },
  {
    id: 'tx-poptron',
    name: 'PopTron',
    frequency: '96.7 FM',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    city: 'texas',
    genre: 'Electropop',
    description: 'Electropop and indie dance rock'
  },
  {
    id: 'tx-metal',
    name: 'Metal Detector',
    frequency: '96.7 FM',
    streamUrl: 'https://ice1.somafm.com/metal-128-mp3',
    city: 'texas',
    genre: 'Metal',
    description: 'From black to doom, prog to sludge, thrash to post, stoner to crossover'
  },
  {
    id: 'tx-thistle',
    name: 'Thistle Radio',
    frequency: '90.5 FM',
    streamUrl: 'https://ice1.somafm.com/thistle-128-mp3',
    city: 'texas',
    genre: 'Celtic',
    description: 'Exploring music from the Celtic lands'
  },
  {
    id: 'tx-illstreet',
    name: 'Illinois Street Lounge',
    frequency: '98.9 FM',
    streamUrl: 'https://ice1.somafm.com/illstreet-128-mp3',
    city: 'texas',
    genre: 'Lounge',
    description: 'Classic bachelor pad, playful exotica and vintage music'
  },

  // French - Keeping original French stations (these URLs should work)
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
    id: 'fr-inter',
    name: 'France Inter',
    frequency: '87.8 FM',
    streamUrl: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3',
    city: 'french',
    genre: 'Talk/Culture',
    description: 'Culture & Information'
  },
  {
    id: 'fr-musique',
    name: 'France Musique',
    frequency: '91.7 FM',
    streamUrl: 'https://icecast.radiofrance.fr/francemusique-midfi.mp3',
    city: 'french',
    genre: 'Classical',
    description: 'Classical and Jazz Music'
  },
  {
    id: 'fr-cultura',
    name: 'France Culture',
    frequency: '93.5 FM',
    streamUrl: 'https://icecast.radiofrance.fr/franceculture-midfi.mp3',
    city: 'french',
    genre: 'Talk/Culture',
    description: 'Ideas, Arts, and Knowledge'
  },
  {
    id: 'fr-nova',
    name: 'Radio Nova',
    frequency: '101.5 FM',
    streamUrl: 'https://novazz.ice.infomaniak.ch/novazz-128.mp3',
    city: 'french',
    genre: 'Eclectic',
    description: 'New Music and World Sounds'
  },

  // Podcasts - Specialty/Eclectic Channels
  {
    id: 'pod-cliqhop',
    name: 'cliqhop idm',
    frequency: 'Stream 1',
    streamUrl: 'https://ice1.somafm.com/cliqhop-128-mp3',
    city: 'podcasts',
    genre: 'IDM',
    description: 'Blips and bleeps from the smart bomb of electronica'
  },
  {
    id: 'pod-earwaves',
    name: 'Earwaves',
    frequency: 'Stream 2',
    streamUrl: 'https://ice1.somafm.com/earwaves-128-mp3',
    city: 'podcasts',
    genre: 'Experimental',
    description: 'Spanning the history of electronic and experimental music'
  },
  {
    id: 'pod-live',
    name: 'SomaFM Live',
    frequency: 'Stream 3',
    streamUrl: 'https://ice1.somafm.com/live-128-mp3',
    city: 'podcasts',
    genre: 'Live Sets',
    description: 'Special broadcasts and DJ mixes'
  },
  {
    id: 'pod-specials',
    name: 'SomaFM Specials',
    frequency: 'Stream 4',
    streamUrl: 'https://ice1.somafm.com/specials-128-mp3',
    city: 'podcasts',
    genre: 'Specials',
    description: 'Special music programming'
  },
  {
    id: 'pod-christmas',
    name: 'Christmas Lounge',
    frequency: 'Stream 5',
    streamUrl: 'https://ice1.somafm.com/christmas-128-mp3',
    city: 'podcasts',
    genre: 'Holiday',
    description: 'Chilled holiday grooves and classic winter lounge tracks'
  },
  {
    id: 'pod-jollyol',
    name: 'Jolly Ol Soul',
    frequency: 'Stream 6',
    streamUrl: 'https://ice1.somafm.com/jollysoul-128-mp3',
    city: 'podcasts',
    genre: 'Holiday Soul',
    description: 'Where all the soul, funk, and jazz that has been traditionally played is preserved for your dancing and celebration'
  },
  {
    id: 'pod-xmasrocks',
    name: 'Christmas Rocks',
    frequency: 'Stream 7',
    streamUrl: 'https://ice1.somafm.com/xmasrocks-128-mp3',
    city: 'podcasts',
    genre: 'Holiday Rock',
    description: 'Have your self an indie/alternative holiday season'
  },
  {
    id: 'pod-xmasinfrisko',
    name: 'Xmas in Frisko',
    frequency: 'Stream 8',
    streamUrl: 'https://ice1.somafm.com/xmasinfrisko-128-mp3',
    city: 'podcasts',
    genre: 'Holiday Jazz',
    description: 'SomaFM\'s year-round Cabinet of Musical Curiosities'
  },
  {
    id: 'pod-fluid',
    name: 'Fluid',
    frequency: 'Stream 9',
    streamUrl: 'https://ice1.somafm.com/fluid-128-mp3',
    city: 'podcasts',
    genre: 'Downtempo',
    description: 'Drown in the electronic sound of instrumental hip-hop, future soul and liquid trap'
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

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
  {
    id: 'ny-fluid',
    name: 'Fluid Hip-Hop',
    frequency: '92.3 FM',
    streamUrl: 'https://ice1.somafm.com/fluid-128-mp3',
    city: 'new-york',
    genre: 'Hip-Hop',
    description: 'Instrumental hip-hop, future soul and liquid trap'
  },
  {
    id: 'ny-sonicuniverse',
    name: 'Sonic Universe',
    frequency: '88.7 FM',
    streamUrl: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    city: 'new-york',
    genre: 'Jazz Fusion',
    description: 'Transcending jazz with eclectic, avant-garde takes'
  },
  {
    id: 'ny-7soul',
    name: 'Seven Inch Soul',
    frequency: '95.5 FM',
    streamUrl: 'https://ice1.somafm.com/7soul-128-mp3',
    city: 'new-york',
    genre: 'Soul/R&B',
    description: 'Vintage soul tracks from the original 45 RPM vinyl'
  },
  {
    id: 'ny-covers',
    name: 'Covers',
    frequency: '99.1 FM',
    streamUrl: 'https://ice1.somafm.com/covers-128-mp3',
    city: 'new-york',
    genre: 'Covers',
    description: 'Songs you know by artists you don\'t - unique covers'
  },
  {
    id: 'ny-folkfwd',
    name: 'Folk Forward',
    frequency: '90.3 FM',
    streamUrl: 'https://ice1.somafm.com/folkfwd-128-mp3',
    city: 'new-york',
    genre: 'Folk/Americana',
    description: 'Indie folk, alt-folk and the occasional classic'
  },
  {
    id: 'ny-deepspace',
    name: 'Deep Space One',
    frequency: '91.1 FM',
    streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    city: 'new-york',
    genre: 'Ambient Space',
    description: 'Deep ambient electronic and space music'
  },
  {
    id: 'ny-dronezone',
    name: 'Drone Zone',
    frequency: '96.9 FM',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    city: 'new-york',
    genre: 'Ambient',
    description: 'Atmospheric ambient for meditation and focus'
  },
  {
    id: 'ny-bootliquor',
    name: 'Boot Liquor',
    frequency: '97.7 FM',
    streamUrl: 'https://ice1.somafm.com/bootliquor-128-mp3',
    city: 'new-york',
    genre: 'Americana',
    description: 'Americana roots music for the urban cowboy'
  },
  {
    id: 'ny-lush',
    name: 'Lush',
    frequency: '102.7 FM',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    city: 'new-york',
    genre: 'Chillout',
    description: 'Sensuous and mellow vocals, mostly female'
  },
  {
    id: 'ny-spacestation',
    name: 'Space Station Soma',
    frequency: '106.1 FM',
    streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
    city: 'new-york',
    genre: 'Ambient Electronic',
    description: 'Tune in, turn on, space out'
  },

  // Miami - Tropical & Dance Vibes
  {
    id: 'miami-global',
    name: 'Miami Global Radio',
    frequency: '93.1 FM',
    streamUrl: 'https://miamiglobalradio.stream.publicradio.pro/miamiglobalradio',
    city: 'miami',
    genre: 'House/Deep House',
    description: 'The sound of Miami Beach'
  },
  {
    id: 'miami-beach',
    name: 'Miami Beach Radio',
    frequency: '98.7 FM',
    streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
    city: 'miami',
    genre: 'Electronic',
    description: 'A late night blend of deep-house and downtempo chill'
  },
  {
    id: 'miami-latin',
    name: 'Miami Latin Hits',
    frequency: '107.5 FM',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    city: 'miami',
    genre: 'Chillout',
    description: 'Sensuous and mellow vocals with tropical vibes'
  },
  {
    id: 'miami-cliqhop',
    name: 'cliqhop idm',
    frequency: '98.1 FM',
    streamUrl: 'https://ice1.somafm.com/cliqhop-128-mp3',
    city: 'miami',
    genre: 'IDM/Electronic',
    description: 'Blips\'n\'bleeps backed with beats - Alarm clock for robots'
  },
  {
    id: 'miami-thetrip',
    name: 'The Trip',
    frequency: '103.3 FM',
    streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3',
    city: 'miami',
    genre: 'Progressive House',
    description: 'Progressive house and trance - beats to move your feet'
  },
  {
    id: 'miami-poptron',
    name: 'PopTron',
    frequency: '107.5 FM',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    city: 'miami',
    genre: 'Electropop',
    description: 'Electropop and indie dance rock with a synth touch'
  },
  {
    id: 'miami-tikibar',
    name: 'Tiki Bar',
    frequency: '101.1 FM',
    streamUrl: 'https://ice1.somafm.com/tikibar-128-mp3',
    city: 'miami',
    genre: 'Tropical/Exotica',
    description: 'Exotic party sounds from the tropics - tiki vibes'
  },
  {
    id: 'miami-suburbs',
    name: 'Suburbs of Goa',
    frequency: '93.7 FM',
    streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    city: 'miami',
    genre: 'Psytrance',
    description: 'Psybient and downtempo with a Miami sunset vibe'
  },
  {
    id: 'miami-fluid',
    name: 'Fluid',
    frequency: '95.3 FM',
    streamUrl: 'https://ice1.somafm.com/fluid-128-mp3',
    city: 'miami',
    genre: 'Instrumental Hip Hop',
    description: 'Instrumental hip-hop, future soul and liquid trap'
  },
  {
    id: 'miami-defcon',
    name: 'DEF CON Radio',
    frequency: '99.5 FM',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    city: 'miami',
    genre: 'Electronic',
    description: 'Music for hacking at the beach'
  },
  {
    id: 'miami-metal',
    name: 'Metal Detector',
    frequency: '100.9 FM',
    streamUrl: 'https://ice1.somafm.com/metal-128-mp3',
    city: 'miami',
    genre: 'Metal',
    description: 'Heavy metal from the 80s, 90s and today'
  },
  {
    id: 'miami-groovesalad',
    name: 'Groove Salad',
    frequency: '104.7 FM',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    city: 'miami',
    genre: 'Chillout',
    description: 'A nicely chilled plate of ambient beats'
  },
  {
    id: 'miami-spacestation',
    name: 'Space Station Soma',
    frequency: '106.3 FM',
    streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
    city: 'miami',
    genre: 'Ambient Electronic',
    description: 'Cosmic electronic for beach sunsets'
  },

  // Ibiza - Electronic Paradise
  {
    id: 'ibiza-global',
    name: 'Ibiza Global Radio',
    frequency: '97.6 FM',
    streamUrl: 'https://ibizaglobalradio.streaming-pro.com/ibizaglobalradio.mp3',
    city: 'ibiza',
    genre: 'Electronic',
    description: 'The worlds most iconic electronic music station'
  },
  {
    id: 'ibiza-sonica',
    name: 'Ibiza Sonica',
    frequency: '95.2 FM',
    streamUrl: 'https://s3.radio.co/s69777f731/listen',
    city: 'ibiza',
    genre: 'Deep House',
    description: 'Pure Ibiza underground sounds'
  },
  {
    id: 'ibiza-live',
    name: 'Ibiza Live Radio',
    frequency: '103.2 FM',
    streamUrl: 'https://cloudup.net/8240/stream',
    city: 'ibiza',
    genre: 'House',
    description: 'Live from the white isle'
  },
  {
    id: 'ibiza-thetrip',
    name: 'The Trip',
    frequency: '99.9 FM',
    streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3',
    city: 'ibiza',
    genre: 'Progressive House',
    description: 'Progressive house and trance for the dancefloor'
  },
  {
    id: 'ibiza-beatblender',
    name: 'Beat Blender',
    frequency: '101.3 FM',
    streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
    city: 'ibiza',
    genre: 'Deep House',
    description: 'Late night blend of deep-house and downtempo chill'
  },
  {
    id: 'ibiza-cliqhop',
    name: 'cliqhop idm',
    frequency: '102.1 FM',
    streamUrl: 'https://ice1.somafm.com/cliqhop-128-mp3',
    city: 'ibiza',
    genre: 'IDM',
    description: 'Intelligent dance music - electronic exploration'
  },
  {
    id: 'ibiza-poptron',
    name: 'PopTron',
    frequency: '104.5 FM',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    city: 'ibiza',
    genre: 'Electropop',
    description: 'Electropop and synth-driven dance anthems'
  },
  {
    id: 'ibiza-groovesalad',
    name: 'Groove Salad Classic',
    frequency: '106.7 FM',
    streamUrl: 'https://ice1.somafm.com/gsclassic-128-mp3',
    city: 'ibiza',
    genre: 'Downtempo',
    description: 'The classic chill vibes from the early 2000s'
  },
  {
    id: 'ibiza-defcon',
    name: 'DEF CON Radio',
    frequency: '108.1 FM',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    city: 'ibiza',
    genre: 'Electronic',
    description: 'Music for hacking the white isle'
  },
  {
    id: 'ibiza-u80s',
    name: 'Underground 80s',
    frequency: '89.3 FM',
    streamUrl: 'https://ice1.somafm.com/u80s-128-mp3',
    city: 'ibiza',
    genre: 'Synthpop',
    description: 'Early 80s UK Synthpop and New Wave'
  },
  {
    id: 'ibiza-lush',
    name: 'Lush',
    frequency: '91.7 FM',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    city: 'ibiza',
    genre: 'Chillout',
    description: 'Sensuous vocals for Ibiza sunsets'
  },
  {
    id: 'ibiza-metal',
    name: 'Metal Detector',
    frequency: '94.9 FM',
    streamUrl: 'https://ice1.somafm.com/metal-128-mp3',
    city: 'ibiza',
    genre: 'Metal',
    description: 'Heavy metal for the underground scene'
  },
  {
    id: 'ibiza-fluid',
    name: 'Fluid',
    frequency: '107.9 FM',
    streamUrl: 'https://ice1.somafm.com/fluid-128-mp3',
    city: 'ibiza',
    genre: 'Instrumental Hip Hop',
    description: 'Instrumental hip-hop and liquid beats'
  },

  // Tulum/Playa del Carmen - Meditation, Chill, Ambient
  {
    id: 'tulum-dronezone',
    name: 'Drone Zone',
    frequency: '100.1 FM',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    city: 'tulum',
    genre: 'Ambient Meditation',
    description: 'Atmospheric ambient for meditation and contemplation'
  },
  {
    id: 'tulum-deepspace',
    name: 'Deep Space One',
    frequency: '102.5 FM',
    streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    city: 'tulum',
    genre: 'Ambient Space',
    description: 'Deep ambient electronic and space music for exploration'
  },
  {
    id: 'tulum-paradise-mellow',
    name: 'RP Mellow Mix',
    frequency: '94.1 FM',
    streamUrl: 'https://stream.radioparadise.com/mellow-128',
    city: 'tulum',
    genre: 'Mellow Eclectic',
    description: 'Eclectic mix of calming music for relaxation'
  },
  {
    id: 'tulum-suburbs',
    name: 'Suburbs of Goa',
    frequency: '101.5 FM',
    streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    city: 'tulum',
    genre: 'Psybient',
    description: 'Downtempo psybient music for stargazing and relaxation'
  },
  {
    id: 'tulum-lush',
    name: 'Lush',
    frequency: '99.3 FM',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    city: 'tulum',
    genre: 'Chillout Vocals',
    description: 'Sensuous and mellow vocals, mostly female, with chillout beats'
  },
  {
    id: 'tulum-gsclassic',
    name: 'Groove Salad Classic',
    frequency: '103.1 FM',
    streamUrl: 'https://ice1.somafm.com/gsclassic-128-mp3',
    city: 'tulum',
    genre: 'Classic Chill',
    description: 'The original chillout vibes from the early days'
  },
  {
    id: 'tulum-vaporwave',
    name: 'Vaporwaves',
    frequency: '105.7 FM',
    streamUrl: 'https://ice1.somafm.com/vaporwaves-128-mp3',
    city: 'tulum',
    genre: 'Vaporwave',
    description: 'A nostalgic, surreal soundscape experience'
  },
  {
    id: 'tulum-bagel',
    name: 'BAGeL Radio',
    frequency: '97.9 FM',
    streamUrl: 'https://ice1.somafm.com/bagel-128-mp3',
    city: 'tulum',
    genre: 'Eclectic',
    description: 'Eclectic mix of world, folk, and acoustic music'
  },
  {
    id: 'tulum-reggae',
    name: 'Reggae Radio',
    frequency: '107.3 FM',
    streamUrl: 'https://ice1.somafm.com/reggae-128-mp3',
    city: 'tulum',
    genre: 'Reggae',
    description: 'Roots reggae, dub, and Caribbean vibes'
  },
  {
    id: 'tulum-sleepbot',
    name: 'SleepBot Environmental',
    frequency: '88.5 FM',
    streamUrl: 'https://ice1.somafm.com/sleepbot-128-mp3',
    city: 'tulum',
    genre: 'Environmental',
    description: 'Ambient soundscapes for relaxation and sleep'
  },
  {
    id: 'tulum-mission',
    name: 'Mission Control',
    frequency: '92.7 FM',
    streamUrl: 'https://ice1.somafm.com/missioncontrol-128-mp3',
    city: 'tulum',
    genre: 'Ambient Space',
    description: 'Celebrating NASA and space exploration'
  },
  {
    id: 'tulum-thistle',
    name: 'ThistleRadio',
    frequency: '96.5 FM',
    streamUrl: 'https://ice1.somafm.com/thistle-128-mp3',
    city: 'tulum',
    genre: 'Celtic/World',
    description: 'Exploring Celtic and world music traditions'
  },
  {
    id: 'tulum-secretagent',
    name: 'Secret Agent',
    frequency: '98.7 FM',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    city: 'tulum',
    genre: 'Lounge',
    description: 'Stylish spy music for jungle adventures'
  },
  {
    id: 'tulum-indiepop',
    name: 'Indie Pop Rocks',
    frequency: '104.9 FM',
    streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
    city: 'tulum',
    genre: 'Indie Pop',
    description: 'Uplifting indie pop for beach days'
  },
  {
    id: 'tulum-folkfwd',
    name: 'Folk Forward',
    frequency: '108.7 FM',
    streamUrl: 'https://ice1.somafm.com/folkfwd-128-mp3',
    city: 'tulum',
    genre: 'Folk',
    description: 'Indie folk and acoustic vibes'
  },

  // California - Electronic, Pop, Chill
  {
    id: 'ca-groovesalad',
    name: 'Groove Salad',
    frequency: '106.7 FM',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    city: 'california',
    genre: 'Chillout',
    description: 'A nicely chilled plate of ambient/downtempo beats'
  },
  {
    id: 'ca-poptron',
    name: 'PopTron',
    frequency: '102.7 FM',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    city: 'california',
    genre: 'Electropop',
    description: 'Electropop and indie dance rock'
  },
  {
    id: 'ca-indiepop',
    name: 'Indie Pop Rocks',
    frequency: '91.5 FM',
    streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
    city: 'california',
    genre: 'Indie Pop',
    description: 'New and classic indie pop from around the world'
  },
  {
    id: 'ca-beatblender',
    name: 'Beat Blender',
    frequency: '89.9 FM',
    streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
    city: 'california',
    genre: 'Electronic',
    description: 'A late night blend of deep-house and downtempo chill'
  },
  {
    id: 'ca-seventies',
    name: 'Left Coast 70s',
    frequency: '89.3 FM',
    streamUrl: 'https://ice1.somafm.com/seventies-128-mp3',
    city: 'california',
    genre: 'Classic Rock',
    description: 'Mellow album rock from the 70s - one rock station'
  },
  {
    id: 'ca-u80s',
    name: 'Underground 80s',
    frequency: '94.7 FM',
    streamUrl: 'https://ice1.somafm.com/u80s-128-mp3',
    city: 'california',
    genre: 'Synthpop/New Wave',
    description: 'Early 80s UK Synthpop and a bit of New Wave'
  },
  {
    id: 'ca-paradise',
    name: 'Radio Paradise',
    frequency: '98.1 FM',
    streamUrl: 'https://stream.radioparadise.com/mp3-128',
    city: 'california',
    genre: 'Eclectic Mix',
    description: 'DJ-curated eclectic mix of rock, world, and indie'
  },
  {
    id: 'ca-lush',
    name: 'Lush',
    frequency: '100.5 FM',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    city: 'california',
    genre: 'Chillout',
    description: 'Sensuous and mellow female vocals'
  },
  {
    id: 'ca-suburbs',
    name: 'Suburbs of Goa',
    frequency: '95.9 FM',
    streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    city: 'california',
    genre: 'Psybient',
    description: 'Downtempo psybient for the California sunset'
  },
  {
    id: 'ca-thetrip',
    name: 'The Trip',
    frequency: '93.5 FM',
    streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3',
    city: 'california',
    genre: 'House',
    description: 'Progressive house and trance beats'
  },
  {
    id: 'ca-defcon',
    name: 'DEF CON Radio',
    frequency: '97.3 FM',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    city: 'california',
    genre: 'Electronic',
    description: 'Music for hacking in Silicon Valley'
  },
  {
    id: 'ca-metal',
    name: 'Metal Detector',
    frequency: '99.7 FM',
    streamUrl: 'https://ice1.somafm.com/metal-128-mp3',
    city: 'california',
    genre: 'Metal',
    description: 'Heavy metal from the Bay Area and beyond'
  },
  {
    id: 'ca-dronezone',
    name: 'Drone Zone',
    frequency: '101.9 FM',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    city: 'california',
    genre: 'Ambient',
    description: 'Atmospheric ambient for California dreaming'
  },
  {
    id: 'ca-deepspace',
    name: 'Deep Space One',
    frequency: '103.7 FM',
    streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    city: 'california',
    genre: 'Ambient Space',
    description: 'Deep space ambient for cosmic journeys'
  },
  {
    id: 'ca-covers',
    name: 'Covers',
    frequency: '107.5 FM',
    streamUrl: 'https://ice1.somafm.com/covers-128-mp3',
    city: 'california',
    genre: 'Covers',
    description: 'Unique cover versions of familiar songs'
  },

  // Texas - Electronic, Lounge, Americana
  {
    id: 'tx-bootliquor',
    name: 'Boot Liquor',
    frequency: '91.7 FM',
    streamUrl: 'https://ice1.somafm.com/bootliquor-128-mp3',
    city: 'texas',
    genre: 'Americana',
    description: 'Americana Roots music - the one rock/country station'
  },
  {
    id: 'tx-spacesta',
    name: 'Space Station Soma',
    frequency: '96.7 FM',
    streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
    city: 'texas',
    genre: 'Ambient Electronic',
    description: 'Tune in, turn on, space out - electronic ambient'
  },
  {
    id: 'tx-fluid',
    name: 'Fluid',
    frequency: '96.7 FM',
    streamUrl: 'https://ice1.somafm.com/fluid-128-mp3',
    city: 'texas',
    genre: 'Instrumental Hip Hop',
    description: 'Drown in instrumental hip-hop, future soul and liquid trap'
  },
  {
    id: 'tx-illstreet',
    name: 'Illinois Street Lounge',
    frequency: '90.5 FM',
    streamUrl: 'https://ice1.somafm.com/illstreet-128-mp3',
    city: 'texas',
    genre: 'Lounge',
    description: 'Classic bachelor pad, playful exotica and vintage music'
  },
  {
    id: 'tx-secretagent',
    name: 'Secret Agent',
    frequency: '98.9 FM',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    city: 'texas',
    genre: 'Lounge Spy',
    description: 'The soundtrack for your stylish, mysterious life'
  },
  {
    id: 'tx-7soul',
    name: 'Seven Inch Soul',
    frequency: '94.3 FM',
    streamUrl: 'https://ice1.somafm.com/7soul-128-mp3',
    city: 'texas',
    genre: 'Soul',
    description: 'Vintage soul tracks from the original 45 RPM vinyl'
  },
  {
    id: 'tx-folkfwd',
    name: 'Folk Forward',
    frequency: '99.7 FM',
    streamUrl: 'https://ice1.somafm.com/folkfwd-128-mp3',
    city: 'texas',
    genre: 'Folk/Country',
    description: 'Indie folk, alt-folk and Americana classics'
  },
  {
    id: 'tx-country',
    name: 'ThistleRadio',
    frequency: '101.3 FM',
    streamUrl: 'https://ice1.somafm.com/thistle-128-mp3',
    city: 'texas',
    genre: 'Celtic',
    description: 'Celtic and world music from around the globe'
  },
  {
    id: 'tx-metal',
    name: 'Metal Detector',
    frequency: '105.5 FM',
    streamUrl: 'https://ice1.somafm.com/metal-128-mp3',
    city: 'texas',
    genre: 'Metal',
    description: 'Heavy metal from the 80s, 90s and today'
  },
  {
    id: 'tx-thetrip',
    name: 'The Trip',
    frequency: '107.1 FM',
    streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3',
    city: 'texas',
    genre: 'Electronic',
    description: 'Progressive house and trance for late night drives'
  },
  {
    id: 'tx-groovesalad',
    name: 'Groove Salad',
    frequency: '88.9 FM',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    city: 'texas',
    genre: 'Chillout',
    description: 'Ambient and downtempo for Texas nights'
  },
  {
    id: 'tx-poptron',
    name: 'PopTron',
    frequency: '92.1 FM',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    city: 'texas',
    genre: 'Electropop',
    description: 'Electropop and indie dance from Austin'
  },
  {
    id: 'tx-u80s',
    name: 'Underground 80s',
    frequency: '93.9 FM',
    streamUrl: 'https://ice1.somafm.com/u80s-128-mp3',
    city: 'texas',
    genre: 'Synthpop',
    description: 'Early 80s synthpop for the Lone Star State'
  },
  {
    id: 'tx-dronezone',
    name: 'Drone Zone',
    frequency: '97.5 FM',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    city: 'texas',
    genre: 'Ambient',
    description: 'Atmospheric ambient for Texas wide open spaces'
  },
  {
    id: 'tx-covers',
    name: 'Covers',
    frequency: '102.7 FM',
    streamUrl: 'https://ice1.somafm.com/covers-128-mp3',
    city: 'texas',
    genre: 'Covers',
    description: 'Unique cover versions with a Texas twist'
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
  {
    id: 'fr-fiprock',
    name: 'FIP Rock',
    frequency: '99.5 FM',
    streamUrl: 'https://icecast.radiofrance.fr/fiprock-midfi.mp3',
    city: 'french',
    genre: 'Rock',
    description: 'Rock music selection from FIP'
  },
  {
    id: 'fr-fipjazz',
    name: 'FIP Jazz',
    frequency: '97.3 FM',
    streamUrl: 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3',
    city: 'french',
    genre: 'Jazz',
    description: 'Jazz music selection from FIP'
  },
  {
    id: 'fr-fipworld',
    name: 'FIP World',
    frequency: '103.9 FM',
    streamUrl: 'https://icecast.radiofrance.fr/fipworld-midfi.mp3',
    city: 'french',
    genre: 'World Music',
    description: 'World music selection from FIP'
  },
  {
    id: 'fr-fipelectro',
    name: 'FIP Electro',
    frequency: '96.1 FM',
    streamUrl: 'https://icecast.radiofrance.fr/fipelectro-midfi.mp3',
    city: 'french',
    genre: 'Electronic',
    description: 'Electronic music selection from FIP'
  },
  {
    id: 'fr-fipreggae',
    name: 'FIP Reggae',
    frequency: '95.7 FM',
    streamUrl: 'https://icecast.radiofrance.fr/fipreggae-midfi.mp3',
    city: 'french',
    genre: 'Reggae',
    description: 'Reggae music selection from FIP'
  },
  {
    id: 'fr-fipgroove',
    name: 'FIP Groove',
    frequency: '88.9 FM',
    streamUrl: 'https://icecast.radiofrance.fr/fipgroove-midfi.mp3',
    city: 'french',
    genre: 'Groove/Soul',
    description: 'Soul, funk, and groove music from FIP'
  },
  {
    id: 'fr-fipmetal',
    name: 'FIP Metal',
    frequency: '92.5 FM',
    streamUrl: 'https://icecast.radiofrance.fr/fipmetal-midfi.mp3',
    city: 'french',
    genre: 'Metal',
    description: 'Metal music selection from FIP'
  },
  {
    id: 'fr-mouv',
    name: 'Mouv',
    frequency: '94.1 FM',
    streamUrl: 'https://icecast.radiofrance.fr/mouv-midfi.mp3',
    city: 'french',
    genre: 'Hip-Hop/Urban',
    description: 'French urban music and hip-hop'
  },
  {
    id: 'fr-fippop',
    name: 'FIP Pop',
    frequency: '98.3 FM',
    streamUrl: 'https://icecast.radiofrance.fr/fippop-midfi.mp3',
    city: 'french',
    genre: 'Pop',
    description: 'Pop music selection from FIP'
  },
  {
    id: 'fr-fipnouveautes',
    name: 'FIP Nouveautés',
    frequency: '100.7 FM',
    streamUrl: 'https://icecast.radiofrance.fr/fipnouveautes-midfi.mp3',
    city: 'french',
    genre: 'New Releases',
    description: 'Latest new music from FIP'
  },

  // Talk Radio & Informational - News, Culture, Variety
  {
    id: 'talk-bbc-world',
    name: 'BBC World Service',
    frequency: 'Talk 1',
    streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    city: 'podcasts',
    genre: 'World News',
    description: 'Global news, analysis and features from the BBC'
  },
  {
    id: 'talk-fip',
    name: 'FIP',
    frequency: 'Talk 2',
    streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
    city: 'podcasts',
    genre: 'Eclectic Radio',
    description: 'French eclectic radio with diverse music and minimal talk'
  },
  {
    id: 'talk-paradise-main',
    name: 'Radio Paradise',
    frequency: 'Talk 3',
    streamUrl: 'https://stream.radioparadise.com/mp3-128',
    city: 'podcasts',
    genre: 'Eclectic Mix',
    description: 'Eclectic mix of rock, indie, electronica, world - DJ curated'
  },
  {
    id: 'talk-francecult',
    name: 'France Culture',
    frequency: 'Talk 4',
    streamUrl: 'https://icecast.radiofrance.fr/franceculture-midfi.mp3',
    city: 'podcasts',
    genre: 'Culture & Ideas',
    description: 'French cultural radio with debates, documentaries, and analysis'
  },
  {
    id: 'talk-inter',
    name: 'France Inter',
    frequency: 'Talk 5',
    streamUrl: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3',
    city: 'podcasts',
    genre: 'News & Culture',
    description: 'French talk radio with news, interviews, and entertainment'
  },
  {
    id: 'talk-sonicuniverse',
    name: 'Sonic Universe',
    frequency: 'Talk 6',
    streamUrl: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    city: 'podcasts',
    genre: 'Jazz Variety',
    description: 'Transcending jazz with eclectic, avant-garde takes and world fusion'
  },
  {
    id: 'talk-indie',
    name: 'Indie Pop Rocks',
    frequency: 'Talk 7',
    streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
    city: 'podcasts',
    genre: 'Indie Pop',
    description: 'New and classic indie pop from around the world'
  },
  {
    id: 'talk-folkfwd',
    name: 'Folk Forward',
    frequency: 'Talk 8',
    streamUrl: 'https://ice1.somafm.com/folkfwd-128-mp3',
    city: 'podcasts',
    genre: 'Folk & Americana',
    description: 'Indie folk, alt-folk and occasional classics'
  },
  {
    id: 'talk-covers',
    name: 'Covers',
    frequency: 'Talk 9',
    streamUrl: 'https://ice1.somafm.com/covers-128-mp3',
    city: 'podcasts',
    genre: 'Cover Songs',
    description: 'Songs you know by artists you don\'t - unique cover versions'
  },
  {
    id: 'talk-paradise-mellow',
    name: 'Radio Paradise Mellow',
    frequency: 'Talk 10',
    streamUrl: 'https://stream.radioparadise.com/mellow-128',
    city: 'podcasts',
    genre: 'Mellow Mix',
    description: 'A mellower blend from Radio Paradise'
  },
  {
    id: 'talk-paradise-rock',
    name: 'Radio Paradise Rock Mix',
    frequency: 'Talk 11',
    streamUrl: 'https://stream.radioparadise.com/rock-128',
    city: 'podcasts',
    genre: 'Rock Mix',
    description: 'Rock-focused mix from Radio Paradise'
  },
  {
    id: 'talk-bootliquor',
    name: 'Boot Liquor',
    frequency: 'Talk 12',
    streamUrl: 'https://ice1.somafm.com/bootliquor-128-mp3',
    city: 'podcasts',
    genre: 'Americana',
    description: 'Americana roots music and storytelling'
  },
  {
    id: 'talk-7soul',
    name: 'Seven Inch Soul',
    frequency: 'Talk 13',
    streamUrl: 'https://ice1.somafm.com/7soul-128-mp3',
    city: 'podcasts',
    genre: 'Soul',
    description: 'Vintage soul from original vinyl'
  },
  {
    id: 'talk-bagel',
    name: 'BAGeL Radio',
    frequency: 'Talk 14',
    streamUrl: 'https://ice1.somafm.com/bagel-128-mp3',
    city: 'podcasts',
    genre: 'Eclectic',
    description: 'Eclectic world and folk music'
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

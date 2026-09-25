import { 
  BallEvolution, 
  CosmeticTrail, 
  EnergyConfig, 
  WorldConfig, 
  Achievement,
  WorldId,
  BallEvolutionId,
  CosmeticTrailId,
  LevelInfo
} from '../types/game';

export const ENERGY_CONFIGS: Record<string, EnergyConfig> = {
  BLUE: {
    type: 'BLUE',
    name: 'Water Energy',
    element: 'Water',
    color: 'from-blue-400 to-cyan-500',
    hexColor: 0x00d2ff,
    glowColor: '#00d2ff',
    description: 'Calming currents that restore surplus core energy and smooth your trajectory.',
    influence: 'Increases crystal water bridges, calming paths, and ice clarity.'
  },
  RED: {
    type: 'RED',
    name: 'Fire Energy',
    element: 'Fire',
    color: 'from-rose-500 to-amber-500',
    hexColor: 0xff3b30,
    glowColor: '#ff453a',
    description: 'Blazing thermal heat that charges destructive speed and lava resistance.',
    influence: 'Induces volcanic bridges, magma fissures, and thermal speed rifts.'
  },
  GREEN: {
    type: 'GREEN',
    name: 'Nature Energy',
    element: 'Nature',
    color: 'from-emerald-400 to-green-600',
    hexColor: 0x30d158,
    glowColor: '#30d158',
    description: 'Vital bio-resonance that builds resilient wide pathways and organic boosters.',
    influence: 'Sprouts ancient canopy arches, floral speed carpets, and living routes.'
  },
  PURPLE: {
    type: 'PURPLE',
    name: 'Cosmic Energy',
    element: 'Cosmic',
    color: 'from-purple-500 to-indigo-600',
    hexColor: 0xbf5af2,
    glowColor: '#bf5af2',
    description: 'Spacetime anomaly essence that bends reality and uncovers hidden portals.',
    influence: 'Generates dimensional rifts, starry phase bridges, and warp gates.'
  },
  YELLOW: {
    type: 'YELLOW',
    name: 'Electric Energy',
    element: 'Electric',
    color: 'from-amber-300 to-yellow-500',
    hexColor: 0xffd60a,
    glowColor: '#ffd60a',
    description: 'High-voltage surge that charges instant propulsion bursts and magnetizes gates.',
    influence: 'Constructs electric conductor rails, lightning gates, and surge currents.'
  }
};

export const BALL_EVOLUTIONS: BallEvolution[] = [
  {
    id: 'NORMAL_CORE',
    name: '8-Ball (Billiard)',
    subtitle: 'Classic Pool Ball',
    description: 'The legendary black #8 billiard ball with gleaming lacquer finish. Responsive and perfectly balanced.',
    abilityName: 'Kinetic Push',
    abilityDescription: 'Temporary stability stabilizer with gentle steering dampening.',
    abilityCooldown: 10,
    color: 'from-slate-900 to-slate-700',
    hexColor: 0x18181b,
    coreGlow: '#f8fafc',
    costFragments: 0,
    costEnergy: 0,
    energyBonus: 0,
    specialMechanic: 'Standard maneuverability across all terrain.'
  },
  {
    id: 'ENERGY_CORE',
    name: 'Soccer Ball',
    subtitle: 'Classic FIFA Football',
    description: 'Black and white pentagonal leather stitched ball. Great bounce and aerodynamics.',
    abilityName: 'Energy Surge',
    abilityDescription: 'Restores +15 instant Energy and creates an aura that absorbs minor impacts.',
    abilityCooldown: 12,
    color: 'from-slate-100 to-emerald-500',
    hexColor: 0xf8fafc,
    coreGlow: '#10b981',
    costFragments: 15,
    costEnergy: 80,
    energyBonus: 25,
    specialMechanic: 'High energy retention, granting extra survivability.'
  },
  {
    id: 'MAGNETIC_CORE',
    name: 'Basketball',
    subtitle: 'Court Slammer',
    description: 'High-grip pebbled orange rubber sphere with deep black seam channels.',
    abilityName: 'Vortex Magnet',
    abilityDescription: 'Supercharges gravitational field to pull all nearby crystals, coins, and fragments for 6 seconds.',
    abilityCooldown: 15,
    color: 'from-amber-600 to-orange-700',
    hexColor: 0xea580c,
    coreGlow: '#c2410c',
    costFragments: 35,
    costEnergy: 150,
    energyBonus: 30,
    specialMechanic: 'Passive 2.5x magnetic attraction range for all collectibles.'
  },
  {
    id: 'BEACH_BALL',
    name: 'Beach Ball',
    subtitle: 'Carnival Stripes',
    description: 'Vibrant party stripes of red, yellow, blue, and green. Light, agile, and springy!',
    abilityName: 'Super Bounce',
    abilityDescription: 'Gains high vertical bounce and floaty air control for 5 seconds.',
    abilityCooldown: 11,
    color: 'from-rose-500 via-amber-400 to-cyan-400',
    hexColor: 0x06b6d4,
    coreGlow: '#f43f5e',
    costFragments: 45,
    costEnergy: 180,
    energyBonus: 30,
    specialMechanic: 'Higher jump arcs and smooth landings.'
  },
  {
    id: 'BOWLING_BALL',
    name: 'Bowling Ball',
    subtitle: 'Heavy Strike',
    description: 'High-mass glossy midnight ball with 3 finger drill holes. Smashes obstacles effortlessly.',
    abilityName: 'Heavy Roll',
    abilityDescription: 'Becomes an unstoppable heavy cannonball that smashes through obstacles.',
    abilityCooldown: 13,
    color: 'from-indigo-900 to-blue-900',
    hexColor: 0x1e1b4b,
    coreGlow: '#3b82f6',
    costFragments: 55,
    costEnergy: 220,
    energyBonus: 35,
    specialMechanic: 'Smashes wooden crates and barriers without losing momentum.'
  },
  {
    id: 'FIRE_CORE',
    name: 'Magma Sphere',
    subtitle: 'Molten Meteor',
    description: 'Cloaked in glowing lava fissures and radiant magma cracks. Immune to fire hazards.',
    abilityName: 'Blazing Rush',
    abilityDescription: 'Ignite into a meteorite fireball: smash through physical obstacles without taking damage for 4 seconds.',
    abilityCooldown: 14,
    color: 'from-orange-500 to-rose-600',
    hexColor: 0xf97316,
    coreGlow: '#e11d48',
    costFragments: 65,
    costEnergy: 260,
    energyBonus: 35,
    specialMechanic: 'Passive immunity to molten roads and vaporizes barriers.'
  },
  {
    id: 'ELECTRIC_CORE',
    name: 'Cyber Tron',
    subtitle: 'Neon Circuit',
    description: 'Dark titanium sphere radiating pulsing neon blue and yellow circuit traces.',
    abilityName: 'Overdrive Spark',
    abilityDescription: 'Instant warp dash forward, dispelling all electric hazard gates in the sector.',
    abilityCooldown: 13,
    color: 'from-cyan-400 to-yellow-400',
    hexColor: 0x06b6d4,
    coreGlow: '#eab308',
    costFragments: 90,
    costEnergy: 350,
    energyBonus: 40,
    specialMechanic: 'Charges up passive road acceleration and converts electric gates into speed boosters.'
  },
  {
    id: 'GOLDEN_BALL',
    name: 'Golden Trophy Ball',
    subtitle: 'Champion 24K',
    description: 'Pure polished 24K mirror gold with engraved stars. Earns double coins and fragments!',
    abilityName: 'Midas Touch',
    abilityDescription: 'Turns all obstacles ahead into golden coins for 5 seconds.',
    abilityCooldown: 15,
    color: 'from-amber-300 via-yellow-400 to-amber-600',
    hexColor: 0xf59e0b,
    coreGlow: '#fbbf24',
    costFragments: 120,
    costEnergy: 400,
    energyBonus: 45,
    specialMechanic: '2x multiplier on all collected coins and fragments.'
  },
  {
    id: 'COSMIC_CORE',
    name: 'Galaxy Marble',
    subtitle: 'Nebula Singularity',
    description: 'Forged within a starlight nebula. Transcends the physical boundaries of the road.',
    abilityName: 'Dimensional Phase',
    abilityDescription: 'Shift into ethereal realm: phase safely through all obstacles and reveal hidden cosmic bridges for 5 seconds.',
    abilityCooldown: 16,
    color: 'from-purple-500 to-pink-500',
    hexColor: 0xc084fc,
    coreGlow: '#9333ea',
    costFragments: 140,
    costEnergy: 500,
    energyBonus: 50,
    specialMechanic: 'Can enter secret void routes and bypass fatal pits by levitating momentarily.'
  }
];

export const COSMETIC_TRAILS: CosmeticTrail[] = [
  {
    id: 'DEFAULT_TRAIL',
    name: 'Starlight Vapor',
    color: 'from-slate-200 to-blue-300',
    hexColor: 0x93c5fd,
    unlocked: true,
    costFragments: 0
  },
  {
    id: 'ENERGY_TRAIL',
    name: 'Cyan Stream',
    color: 'from-cyan-400 to-blue-500',
    hexColor: 0x22d3ee,
    unlocked: false,
    costFragments: 10
  },
  {
    id: 'FIRE_TRAIL',
    name: 'Solar Embers',
    color: 'from-amber-400 to-rose-600',
    hexColor: 0xf43f5e,
    unlocked: false,
    costFragments: 20
  },
  {
    id: 'ELECTRIC_TRAIL',
    name: 'Lightning Arc',
    color: 'from-yellow-300 to-amber-500',
    hexColor: 0xfacc15,
    unlocked: false,
    costFragments: 25
  },
  {
    id: 'COSMIC_TRAIL',
    name: 'Nebula Stardust',
    color: 'from-purple-400 to-pink-500',
    hexColor: 0xd946ef,
    unlocked: false,
    costFragments: 35
  },
  {
    id: 'GOLDEN_TRAIL',
    name: 'Celestial Gold',
    color: 'from-amber-200 to-yellow-400',
    hexColor: 0xfbbf24,
    unlocked: false,
    costFragments: 50
  }
];

export const WORLDS: Record<WorldId, WorldConfig> = {
  GREEN_VALLEY: {
    id: 'GREEN_VALLEY',
    name: 'Green Valley',
    title: 'Cradle of Beginnings',
    description: 'A serene valley under a bright, sunny daytime sky with lush emerald fields and fluffy white clouds.',
    ambientColor: 0xfffae6, // Warm, bright morning sunlight
    skyColorTop: '#0284c7', // Deep, clear sky blue
    skyColorBottom: '#bae6fd', // Clear bright horizon cyan
    roadColor: 0x22c55e, // Saturated, vivid emerald green road
    roadEdgeColor: 0x0284c7, // Crisp sunny sky blue safety rails
    fogColor: 0x7dd3fc, // Bright open sky blue fog (pure blue)
    fogNear: 90,
    fogFar: 280,
    primaryEnergy: 'GREEN',
    unlockDistance: 0,
    particleType: 'leaf',
    bgMusicPreset: 'valley'
  },
  LOST_DESERT: {
    id: 'LOST_DESERT',
    name: 'Lost Desert',
    title: 'Sands of the Ancient Road',
    description: 'A blazing hot desert dune under a glorious clear blue sky.',
    ambientColor: 0xfff8db, // Warm golden sunlight
    skyColorTop: '#0284c7', // Clear blue sky
    skyColorBottom: '#bae6fd', // Warm sunny horizon
    roadColor: 0xf59e0b, // Saturated bright golden road
    roadEdgeColor: 0x0284c7, // Sky blue edges for high sunny contrast
    fogColor: 0x7dd3fc, // Clear sunny blue fog
    fogNear: 90,
    fogFar: 280,
    primaryEnergy: 'YELLOW',
    unlockDistance: 1000,
    particleType: 'dust',
    bgMusicPreset: 'desert'
  },
  VOLCANO_LAND: {
    id: 'VOLCANO_LAND',
    name: 'Volcano Land',
    title: 'The Molten Spine',
    description: 'High-contrast dark obsidian highway under a clear open azure sky.',
    ambientColor: 0xfff5ea,
    skyColorTop: '#0284c7',
    skyColorBottom: '#bae6fd',
    roadColor: 0x1e293b, // Dark obsidian road (no pink)
    roadEdgeColor: 0xf97316, // Glowing amber orange rails
    fogColor: 0x7dd3fc,
    fogNear: 90,
    fogFar: 280,
    primaryEnergy: 'RED',
    unlockDistance: 2500,
    particleType: 'ember',
    bgMusicPreset: 'volcano'
  },
  FROZEN_REALM: {
    id: 'FROZEN_REALM',
    name: 'Frozen Realm',
    title: 'Glacial Aurora',
    description: 'A sparkling ice highway reflecting a brilliant polar sun and open blue sky.',
    ambientColor: 0xf0f9ff,
    skyColorTop: '#0284c7',
    skyColorBottom: '#e0f2fe',
    roadColor: 0x0284c7,
    roadEdgeColor: 0x38bdf8, // Pure cyan blue rails (no pink)
    fogColor: 0x7dd3fc,
    fogNear: 90,
    fogFar: 280,
    primaryEnergy: 'BLUE',
    unlockDistance: 4500,
    particleType: 'snow',
    bgMusicPreset: 'frozen'
  },
  NEON_CITY: {
    id: 'NEON_CITY',
    name: 'Neon City',
    title: 'Cyber Pulse Highway',
    description: 'A high-speed cyber highway under a crisp blue daytime sky.',
    ambientColor: 0xf8fafc,
    skyColorTop: '#0284c7',
    skyColorBottom: '#bae6fd',
    roadColor: 0x0f172a, // Deep midnight cyber road (no purple/pink)
    roadEdgeColor: 0x06b6d4, // Electric cyan neon rails
    fogColor: 0x7dd3fc,
    fogNear: 90,
    fogFar: 280,
    primaryEnergy: 'YELLOW',
    unlockDistance: 7000,
    particleType: 'neon',
    bgMusicPreset: 'neon'
  },
  COSMIC_VOID: {
    id: 'COSMIC_VOID',
    name: 'Cosmic Void',
    title: 'The Edge of Infinity',
    description: 'Weightless celestial ribbons in a clear glowing azure sky.',
    ambientColor: 0xf0f9ff,
    skyColorTop: '#0284c7',
    skyColorBottom: '#bae6fd',
    roadColor: 0x1e1b4b, // Deep space blue road
    roadEdgeColor: 0x38bdf8, // Glowing starlight cyan rails
    fogColor: 0x7dd3fc,
    fogNear: 90,
    fogFar: 280,
    primaryEnergy: 'PURPLE',
    unlockDistance: 10000,
    particleType: 'star',
    bgMusicPreset: 'cosmic'
  }
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'FIRST_ROLL',
    title: 'First Roll',
    description: 'Travel at least 500 meters along the road.',
    category: 'distance',
    requirement: 500,
    current: 0,
    rewardFragments: 5,
    unlocked: false,
    claimed: false
  },
  {
    id: 'LONG_JOURNEY',
    title: 'Long Journey',
    description: 'Travel 5,000 meters in total distance.',
    category: 'distance',
    requirement: 5000,
    current: 0,
    rewardFragments: 20,
    unlocked: false,
    claimed: false
  },
  {
    id: 'ROAD_MAKER',
    title: 'Road Maker',
    description: 'Collect 100 Road Fragments across all runs.',
    category: 'fragments',
    requirement: 100,
    current: 0,
    rewardFragments: 30,
    unlocked: false,
    claimed: false
  },
  {
    id: 'RISK_TAKER',
    title: 'Risk Taker',
    description: 'Choose and conquer 10 high-risk route branches.',
    category: 'skills',
    requirement: 10,
    current: 0,
    rewardFragments: 25,
    unlocked: false,
    claimed: false
  },
  {
    id: 'NO_FEAR',
    title: 'No Fear',
    description: 'Complete 3 consecutive risky routes without taking any collision damage.',
    category: 'skills',
    requirement: 3,
    current: 0,
    rewardFragments: 20,
    unlocked: false,
    claimed: false
  },
  {
    id: 'EXPLORER',
    title: 'Explorer',
    description: 'Discover 5 mystery events or dimensional portals.',
    category: 'exploration',
    requirement: 5,
    current: 0,
    rewardFragments: 25,
    unlocked: false,
    claimed: false
  },
  {
    id: 'ENERGY_HARVEST',
    title: 'Energy Connoisseur',
    description: 'Collect 250 energy orbs of all elemental types.',
    category: 'energy',
    requirement: 250,
    current: 0,
    rewardFragments: 15,
    unlocked: false,
    claimed: false
  },
  {
    id: 'COSMIC_TRAVELER',
    title: 'Cosmic Traveler',
    description: 'Unlock and equip the legendary Cosmic Core.',
    category: 'skills',
    requirement: 1,
    current: 0,
    rewardFragments: 50,
    unlocked: false,
    claimed: false
  }
];

export const MYSTERY_EVENTS_LIST = [
  {
    id: 'MYSTERIOUS_DOOR',
    name: 'Mysterious Door',
    icon: '🚪',
    description: 'A towering floating archway resonating with unknown vibrations.',
    prompt: 'A floating threshold shimmers before the road. Do you dare step through?',
    acceptLabel: 'Enter Void Path',
    declineLabel: 'Continue Forward',
    rewardSummary: 'Teleports to a hidden bonus road laden with Road Fragments!'
  },
  {
    id: 'TREASURE_ISLAND',
    name: 'Treasure Sanctuary',
    icon: '🏝️',
    description: 'A celestial floating island overflowing with glowing elemental crystals.',
    prompt: 'Gravitational currents pull towards a floating treasure sanctuary!',
    acceptLabel: 'Ascend to Sanctuary',
    declineLabel: 'Stay on Highway',
    rewardSummary: 'Yields abundant energy and rare fragments with no obstacles.'
  },
  {
    id: 'UFO_ENCOUNTER',
    name: 'UFO Phenomenon',
    icon: '🛸',
    description: 'A bizarre extraterrestrial craft casts a tractor beam of anti-gravity light.',
    prompt: 'An unidentified flying saucer projects a shimmering light field across the track!',
    acceptLabel: 'Catch the Beam',
    declineLabel: 'Evade Craft',
    rewardSummary: 'Supercharges speed and transforms obstacles into energy orbs!'
  },
  {
    id: 'GIANT_TREE',
    name: 'World Tree Roots',
    icon: '🌳',
    description: 'Enormous ancient bioluminescent roots intertwine to pave an ethereal green boulevard.',
    prompt: 'The sacred World Tree lowers luminous branches to fortify your path.',
    acceptLabel: 'Merge with Roots',
    declineLabel: 'Bypass Tree',
    rewardSummary: 'Fully restores energy and grants 10 seconds of invulnerability.'
  },
  {
    id: 'PORTAL_WARP',
    name: 'Dimensional Portal',
    icon: '🌀',
    description: 'A swirling singularity that warps through space to a new uncharted world.',
    prompt: 'A dimensional vortex is tearing through the spacetime of the road!',
    acceptLabel: 'Warp Reality',
    declineLabel: 'Hold Course',
    rewardSummary: 'Instant warp into the next environmental world with a bonus milestone.'
  }
];

export { GAME_LEVELS } from './levelsData';

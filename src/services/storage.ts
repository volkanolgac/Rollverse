import { 
  PlayerStats, 
  GameSettings, 
  DailyChallenge, 
  EnergyType,
  Achievement
} from '../types/game';
import { INITIAL_ACHIEVEMENTS } from '../game/constants';

const STORAGE_KEY = 'rollverse_save_data_v1';

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function generateDailyChallenge(dateStr: string): DailyChallenge {
  // Simple deterministic pseudo-random from date string
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  const challenges = [
    {
      title: 'Voyager of the Endless Road',
      description: 'Travel at least 2,500 meters in a single run today.',
      goalType: 'distance' as const,
      target: 2500,
      rewardFragments: 15,
      rewardEnergy: 50
    },
    {
      title: 'Aquatic Resonance',
      description: 'Collect 30 Blue Water Energy orbs today.',
      goalType: 'energy_blue' as const,
      target: 30,
      rewardFragments: 12,
      rewardEnergy: 40
    },
    {
      title: 'Daredevil Route Runner',
      description: 'Successfully conquer 4 High-Risk route branches.',
      goalType: 'risky_routes' as const,
      target: 4,
      rewardFragments: 18,
      rewardEnergy: 60
    },
    {
      title: 'Volcanic Ascension',
      description: 'Reach or explore Volcano Land (2,500+ meters) today.',
      goalType: 'world_reach' as const,
      target: 2500,
      rewardFragments: 20,
      rewardEnergy: 75
    },
    {
      title: 'Road Architect Collector',
      description: 'Gather 10 luminous Road Fragments today.',
      goalType: 'fragments' as const,
      target: 10,
      rewardFragments: 25,
      rewardEnergy: 80
    }
  ];

  const picked = challenges[posHash % challenges.length];
  return {
    dateString: dateStr,
    title: picked.title,
    description: picked.description,
    goalType: picked.goalType,
    target: picked.target,
    current: 0,
    rewardFragments: picked.rewardFragments,
    rewardEnergy: picked.rewardEnergy,
    completed: false
  };
}

export const DEFAULT_SETTINGS: GameSettings = {
  language: 'tr',
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  graphicsQuality: 'high',
  sensitivity: 1.0
};

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  bestDistance: 0,
  totalDistance: 0,
  totalEnergyCollected: 0,
  totalFragmentsCollected: 0,
  runsCompleted: 0,
  highestLevelUnlocked: 1,
  currentSelectedLevel: 1,
  completedLevels: [],
  unlockedEvolutions: ['NORMAL_CORE'],
  selectedEvolution: 'NORMAL_CORE',
  unlockedTrails: ['DEFAULT_TRAIL'],
  selectedTrail: 'DEFAULT_TRAIL',
  unlockedWorlds: ['GREEN_VALLEY'],
  discoveredMysteryEvents: [],
  worldBestDistances: {
    GREEN_VALLEY: 0,
    LOST_DESERT: 0,
    VOLCANO_LAND: 0,
    FROZEN_REALM: 0,
    NEON_CITY: 0,
    COSMIC_VOID: 0
  },
  roadMemory: {
    leftTurns: 0,
    rightTurns: 0,
    riskyRoutesChosen: 0,
    safeRoutesChosen: 0,
    energyCollected: {
      BLUE: 0,
      RED: 0,
      GREEN: 0,
      PURPLE: 0,
      YELLOW: 0
    },
    obstaclesAvoided: 0,
    collisionsCount: 0,
    portalsEntered: 0,
    secretAreasFound: 0,
    activeAffinity: 'GREEN',
    riskTolerance: 0.5,
    curvePreference: 'neutral'
  },
  achievements: INITIAL_ACHIEVEMENTS,
  dailyChallenge: generateDailyChallenge(getTodayDateString()),
  settings: DEFAULT_SETTINGS
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PLAYER_STATS };
    const parsed = JSON.parse(raw);
    
    // Ensure daily challenge is up to date
    const todayStr = getTodayDateString();
    let challenge = parsed.dailyChallenge;
    if (!challenge || challenge.dateString !== todayStr) {
      challenge = generateDailyChallenge(todayStr);
    }

    // Merge with defaults to ensure future-proofing
    return {
      ...DEFAULT_PLAYER_STATS,
      ...parsed,
      roadMemory: {
        ...DEFAULT_PLAYER_STATS.roadMemory,
        ...(parsed.roadMemory || {})
      },
      achievements: INITIAL_ACHIEVEMENTS.map(initialAch => {
        const saved = (parsed.achievements || []).find((a: Achievement) => a.id === initialAch.id);
        return saved ? { ...initialAch, ...saved } : initialAch;
      }),
      dailyChallenge: challenge,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {})
      }
    };
  } catch (e) {
    console.warn('Could not load save data from localStorage, using defaults.', e);
    return { ...DEFAULT_PLAYER_STATS };
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Could not save data to localStorage.', e);
  }
}

export function resetPlayerStats(): PlayerStats {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not reset localStorage.', e);
  }
  return { ...DEFAULT_PLAYER_STATS };
}

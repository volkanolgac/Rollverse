/**
 * ROLLVERSE - Game Types & Interfaces
 */

export type EnergyType = 'BLUE' | 'RED' | 'GREEN' | 'PURPLE' | 'YELLOW';

export interface EnergyConfig {
  type: EnergyType;
  name: string;
  element: string;
  color: string;
  hexColor: number;
  glowColor: string;
  description: string;
  influence: string;
}

export type BallEvolutionId = 
  | 'NORMAL_CORE'
  | 'ENERGY_CORE'
  | 'MAGNETIC_CORE'
  | 'FIRE_CORE'
  | 'ELECTRIC_CORE'
  | 'COSMIC_CORE'
  | 'BEACH_BALL'
  | 'BOWLING_BALL'
  | 'GOLDEN_BALL';

export interface BallEvolution {
  id: BallEvolutionId;
  name: string;
  subtitle: string;
  description: string;
  abilityName: string;
  abilityDescription: string;
  abilityCooldown: number; // in seconds
  color: string;
  hexColor: number;
  coreGlow: string;
  costFragments: number;
  costEnergy: number;
  energyBonus: number; // max energy bonus
  specialMechanic: string;
}

export type CosmeticTrailId = 
  | 'DEFAULT_TRAIL'
  | 'ENERGY_TRAIL'
  | 'FIRE_TRAIL'
  | 'ELECTRIC_TRAIL'
  | 'COSMIC_TRAIL'
  | 'GOLDEN_TRAIL';

export interface CosmeticTrail {
  id: CosmeticTrailId;
  name: string;
  color: string;
  hexColor: number;
  unlocked: boolean;
  costFragments: number;
}

export type WorldId = 
  | 'GREEN_VALLEY'
  | 'LOST_DESERT'
  | 'VOLCANO_LAND'
  | 'FROZEN_REALM'
  | 'NEON_CITY'
  | 'COSMIC_VOID';

export interface WorldConfig {
  id: WorldId;
  name: string;
  title: string;
  description: string;
  ambientColor: number;
  skyColorTop: string;
  skyColorBottom: string;
  roadColor: number;
  roadEdgeColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  primaryEnergy: EnergyType;
  unlockDistance: number;
  particleType: 'leaf' | 'dust' | 'ember' | 'snow' | 'neon' | 'star';
  bgMusicPreset: 'valley' | 'desert' | 'volcano' | 'frozen' | 'neon' | 'cosmic';
}

export interface RoadMemoryState {
  // Movement tendencies
  leftTurns: number;
  rightTurns: number;
  // Route selection
  riskyRoutesChosen: number;
  safeRoutesChosen: number;
  // Energy affinity
  energyCollected: Record<EnergyType, number>;
  // Playstyle
  obstaclesAvoided: number;
  collisionsCount: number;
  portalsEntered: number;
  secretAreasFound: number;
  // Dynamic generation weights computed from behavior
  activeAffinity: EnergyType;
  riskTolerance: number; // 0 (cautious) to 1 (daredevil)
  curvePreference: 'neutral' | 'left' | 'right';
  lastTransformationMessage?: string;
}

export type SegmentType = 
  | 'straight'
  | 'curved_left'
  | 'curved_right'
  | 'narrow_bridge'
  | 'narrow_rail'
  | 'speed_boost_track'
  | 'jump_pad_track'
  | 'crate_challenge'
  | 'wide_highway'
  | 'split_path'
  | 'moving_platform'
  | 'ramp_jump'
  | 'disappearing'
  | 'electric_hazard'
  | 'lava_pool'
  | 'checkpoint'
  | 'portal'
  | 'mystery_door'
  | 'final_gate';

export type ObstacleType = 
  | 'rock'
  | 'barrier'
  | 'rotating_beam'
  | 'moving_wall'
  | 'ice_block'
  | 'lava_geyser'
  | 'electric_gate'
  | 'falling_pillar'
  | 'pendulum_hammer'
  | 'wooden_crate'
  | 'rotating_bar'
  | 'sliding_pusher'
  | 'road_pit';

export interface CollectibleItem {
  id: string;
  type: 'ENERGY' | 'ROAD_FRAGMENT' | 'CHECKPOINT' | 'PORTAL' | 'FINAL_GATE' | 'COIN' | 'KEY' | 'SPEED_PAD' | 'JUMP_SPRING' | 'CHARACTER_GATE';
  energyType?: EnergyType;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  value?: number;
  gateValue?: number;
  gateType?: 'add' | 'sub' | 'mult';
}

export interface ObstacleItem {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  damage: number;
  rotationSpeed?: number;
  moveRange?: number;
  moveSpeed?: number;
  active: boolean;
  hit: boolean;
}

export interface RoadSegment {
  id: string;
  type: SegmentType;
  worldId: WorldId;
  zPosition: number;
  length: number;
  width: number;
  curveX: number; // horizontal displacement
  elevationY: number; // vertical slope
  isRisky?: boolean;
  collectibles: CollectibleItem[];
  obstacles: ObstacleItem[];
  portalTargetWorld?: WorldId;
  customThemeColor?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'distance' | 'energy' | 'fragments' | 'skills' | 'exploration';
  requirement: number;
  current: number;
  rewardFragments: number;
  unlocked: boolean;
  claimed: boolean;
}

export interface DailyChallenge {
  dateString: string;
  title: string;
  description: string;
  goalType: 'distance' | 'energy_blue' | 'risky_routes' | 'world_reach' | 'fragments';
  target: number;
  current: number;
  rewardFragments: number;
  rewardEnergy: number;
  completed: boolean;
}

export type Language = 'tr' | 'en';

export interface LevelInfo {
  level: number;
  name: string;
  nameEn?: string;
  worldId: WorldId;
  targetDistance: number;
  description: string;
  descriptionEn?: string;
  bonusFragments: number;
  bonusEnergy: number;
  rewardFragments: number;
  roadColor: number;
  roadEdgeColor: number;
  fogColor: number;
  ambientColor: number;
  skyColorTop: string;
  skyColorBottom: string;
  themeTitle?: string;
}

export interface LevelWonEvent {
  level: number;
  distance: number;
  energy: number;
  fragments: number;
  isLastLevel: boolean;
}

export interface PlayerStats {
  bestDistance: number;
  totalDistance: number;
  totalEnergyCollected: number;
  totalFragmentsCollected: number;
  runsCompleted: number;
  highestLevelUnlocked: number;
  currentSelectedLevel: number;
  completedLevels: number[];
  unlockedEvolutions: BallEvolutionId[];
  selectedEvolution: BallEvolutionId;
  unlockedTrails: CosmeticTrailId[];
  selectedTrail: CosmeticTrailId;
  unlockedWorlds: WorldId[];
  discoveredMysteryEvents: string[];
  worldBestDistances: Record<WorldId, number>;
  roadMemory: RoadMemoryState;
  achievements: Achievement[];
  dailyChallenge: DailyChallenge;
  settings: GameSettings;
}

export interface GameSettings {
  language: Language;
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  sensitivity: number; // 0.5 to 2.0
}

export interface ActiveRunState {
  distance: number;
  energy: number;
  maxEnergy: number;
  fragmentsThisRun: number;
  energyThisRun: number;
  coinsThisRun: number;
  lives: number;
  maxLives: number;
  speedKmh: number;
  hasShield: boolean;
  shieldTimeLeft: number;
  currentWorld: WorldId;
  currentLevel: number;
  levelTargetDistance: number;
  isLevelWon: boolean;
  checkpointDistance: number;
  checkpointWorld: WorldId;
  checkpointAvailable: boolean;
  abilityActive: boolean;
  abilityTimeLeft: number;
  abilityCooldownLeft: number;
  consecutiveRiskyCompleted: number;
  newDiscoveries: string[];
}

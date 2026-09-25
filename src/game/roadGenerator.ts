import { 
  RoadSegment, 
  SegmentType, 
  WorldId, 
  EnergyType, 
  ObstacleItem, 
  CollectibleItem 
} from '../types/game';
import { GenerationModifiers } from './roadMemory';
import { WORLDS } from './constants';

export class RoadGenerator {
  private currentZ = 0;
  private segmentIndex = 0;
  private currentWorld: WorldId = 'GREEN_VALLEY';
  private targetDistance = 500;
  private finalGateGenerated = false;
  private isEndless = false;
  private lastCheckpointZ = 0;
  private lastPortalZ = 0;
  private lastSplitZ = 0;
  private lastPitZ = -120;

  constructor() {
    this.reset();
  }

  public reset(startWorld: WorldId = 'GREEN_VALLEY', targetDistance = 500, isEndless = false) {
    this.currentZ = 0;
    this.segmentIndex = 0;
    this.currentWorld = startWorld;
    this.targetDistance = targetDistance;
    this.finalGateGenerated = false;
    this.isEndless = isEndless;
    this.lastCheckpointZ = 0;
    this.lastPortalZ = 0;
    this.lastSplitZ = 0;
    this.lastPitZ = -120;
  }

  public setWorld(world: WorldId) {
    this.currentWorld = world;
  }

  public setTargetDistance(dist: number, isEndless = false) {
    this.targetDistance = dist;
    this.isEndless = isEndless;
    this.finalGateGenerated = false;
  }

  public generateInitialSegments(count: number = 8): RoadSegment[] {
    const segments: RoadSegment[] = [];
    // Start with a few safe straight segments to let the player orient themselves
    for (let i = 0; i < count; i++) {
      const seg = this.generateSegment(
        {
          preferredCurve: 'neutral',
          riskBranchProbability: 0,
          energyDistribution: { BLUE: 1, RED: 1, GREEN: 2, PURPLE: 1, YELLOW: 1 },
          roadWidthFactor: 1.2,
          obstacleFrequency: i < 3 ? 0 : 0.2,
          portalChance: 0,
          mysteryEventChance: 0
        },
        i < 3 // pure safe start
      );
      segments.push(seg);
    }
    return segments;
  }

  public generateSegment(modifiers: GenerationModifiers, forceSafe = false): RoadSegment {
    const segLength = 40;
    const baseWidth = 9.0 * modifiers.roadWidthFactor;
    const z = this.currentZ;
    const dist = z;

    // Check world progression based on distance
    this.updateWorldProgression(dist);

    let type: SegmentType = 'straight';
    let curveX = 0;
    let elevationY = 0;
    let isRisky = false;

    // Check if we reached the final gate of the level
    if (!this.isEndless && !this.finalGateGenerated && dist >= this.targetDistance - segLength) {
      type = 'final_gate';
      this.finalGateGenerated = true;
      forceSafe = true;
    } else if (this.finalGateGenerated) {
      type = 'straight';
      forceSafe = true;
    } else if (dist >= this.targetDistance - 80 && !this.isEndless) {
      // Approach to final gate is safe and clear
      type = 'straight';
      forceSafe = true;
    } else if (forceSafe) {
      type = 'straight';
    } else if (dist - this.lastCheckpointZ >= 750) {
      // Periodic exciting checkpoints
      type = 'checkpoint';
      this.lastCheckpointZ = dist;
    } else if (this.isEndless && dist - this.lastPortalZ >= 1800 && Math.random() < modifiers.portalChance) {
      // Portal to another world in endless mode
      type = 'portal';
      this.lastPortalZ = dist;
    } else if (dist - this.lastSplitZ >= 300 && Math.random() < modifiers.riskBranchProbability) {
      // Split Path Fork
      type = 'split_path';
      this.lastSplitZ = dist;
    } else {
      const rand = Math.random();
      if (rand < 0.18) {
        // Curve track: guides player left or right
        if (modifiers.preferredCurve === 'left' || (modifiers.preferredCurve === 'neutral' && Math.random() < 0.5)) {
          type = 'curved_left';
          curveX = 0;
        } else {
          type = 'curved_right';
          curveX = 0;
        }
      } else if (rand < 0.28) {
        type = 'speed_boost_track';
      } else if (rand < 0.38) {
        type = 'jump_pad_track';
        elevationY = 2.0;
      } else if (rand < 0.48) {
        type = 'crate_challenge';
      } else if (rand < 0.58) {
        type = 'narrow_rail';
      } else if (rand < 0.68) {
        type = 'narrow_bridge';
      } else if (rand < 0.76) {
        type = 'moving_platform';
      } else if (rand < 0.84) {
        type = 'ramp_jump';
        elevationY = 2.5;
      } else if (rand < 0.90 && this.currentWorld === 'VOLCANO_LAND') {
        type = 'lava_pool';
      } else if (rand < 0.95 && (this.currentWorld === 'NEON_CITY' || modifiers.energyDistribution.YELLOW > 2)) {
        type = 'electric_hazard';
      } else {
        type = 'straight';
      }
    }

    // Determine width and risk
    let width = baseWidth;
    if (type === 'narrow_rail') {
      width = baseWidth * 0.42; // Very narrow balance beam with no safety rails!
      isRisky = true;
    } else if (type === 'narrow_bridge') {
      width = baseWidth * 0.55;
    } else if (type === 'split_path') {
      width = baseWidth * 1.6;
    } else if (type === 'moving_platform') {
      width = baseWidth * 0.75;
    }

    // Generate Collectibles
    const collectibles = this.generateCollectiblesForSegment(z, segLength, width, type, modifiers);

    // Generate Obstacles - Skip obstacles if character gates are present to avoid cluttering
    const hasGates = collectibles.some(c => c.type === 'CHARACTER_GATE');
    const obstacles = this.generateObstaclesForSegment(z, segLength, width, type, modifiers, forceSafe || hasGates);

    // Determine target portal world if portal segment
    let portalTargetWorld: WorldId | undefined;
    if (type === 'portal') {
      const worldKeys = Object.keys(WORLDS) as WorldId[];
      const available = worldKeys.filter(w => w !== this.currentWorld);
      portalTargetWorld = available[Math.floor(Math.random() * available.length)];
    }

    const segment: RoadSegment = {
      id: `seg_${this.segmentIndex++}`,
      type,
      worldId: this.currentWorld,
      zPosition: z,
      length: segLength,
      width,
      curveX,
      elevationY,
      isRisky,
      collectibles,
      obstacles,
      portalTargetWorld
    };

    this.currentZ += segLength;
    return segment;
  }

  private updateWorldProgression(distance: number) {
    if (!this.isEndless) return;
    if (distance > 10000 && this.currentWorld !== 'COSMIC_VOID') {
      this.currentWorld = 'COSMIC_VOID';
    } else if (distance > 7000 && distance <= 10000 && this.currentWorld !== 'NEON_CITY') {
      this.currentWorld = 'NEON_CITY';
    } else if (distance > 4500 && distance <= 7000 && this.currentWorld !== 'FROZEN_REALM') {
      this.currentWorld = 'FROZEN_REALM';
    } else if (distance > 2500 && distance <= 4500 && this.currentWorld !== 'VOLCANO_LAND') {
      this.currentWorld = 'VOLCANO_LAND';
    } else if (distance > 1000 && distance <= 2500 && this.currentWorld !== 'LOST_DESERT') {
      this.currentWorld = 'LOST_DESERT';
    }
  }

  private pickWeightedEnergyType(distribution: Record<EnergyType, number>): EnergyType {
    const entries = Object.entries(distribution) as [EnergyType, number][];
    const totalWeight = entries.reduce((acc, [, w]) => acc + w, 0);
    let random = Math.random() * totalWeight;
    for (const [type, weight] of entries) {
      if (random < weight) return type;
      random -= weight;
    }
    return 'GREEN';
  }

  private generateCollectiblesForSegment(
    z: number,
    length: number,
    width: number,
    type: SegmentType,
    modifiers: GenerationModifiers
  ): CollectibleItem[] {
    const items: CollectibleItem[] = [];
    const usableHalfWidth = (width / 2) - 1.2;

    if (type === 'final_gate') {
      // Golden celebratory runway energy orbs leading straight into the gate
      for (let i = 0; i < 5; i++) {
        items.push({
          id: `victory_orb_${z}_${i}`,
          type: 'ENERGY',
          energyType: 'YELLOW',
          x: 0,
          y: 0.8,
          z: z + 4 + i * 5,
          collected: false
        });
      }

      // The Final Warp Gate collectible at center
      items.push({
        id: `final_gate_${z}`,
        type: 'FINAL_GATE',
        x: 0,
        y: 2.5,
        z: z + 32,
        collected: false
      });
      return items;
    }

    if (type === 'checkpoint') {
      items.push({
        id: `cp_${z}`,
        type: 'CHECKPOINT',
        x: 0,
        y: 1.2,
        z: z + length * 0.5,
        collected: false
      });
      return items;
    }

    if (type === 'portal') {
      items.push({
        id: `portal_${z}`,
        type: 'PORTAL',
        x: 0,
        y: 1.6,
        z: z + length * 0.5,
        collected: false
      });
      return items;
    }

    if (type === 'speed_boost_track') {
      items.push({
        id: `boost_${z}`,
        type: 'SPEED_PAD',
        x: 0,
        y: 0.05,
        z: z + length * 0.4,
        collected: false
      });
    }

    if (type === 'jump_pad_track') {
      items.push({
        id: `spring_${z}`,
        type: 'JUMP_SPRING',
        x: 0,
        y: 0.1,
        z: z + length * 0.35,
        collected: false
      });
    }

    // Spawning Character Gates (+ and - barriers) periodically on standard lanes
    const isStandardSegment = type === 'straight' || type === 'speed_boost_track' || type === 'crate_challenge' || type === 'wide_highway';
    if (isStandardSegment && Math.random() < 0.6) {
      const leftIsPositive = Math.random() < 0.5;
      const posValues = [3, 5, 8, 10, 15];
      const negValues = [-2, -4, -6, -8, -10];
      const posVal = posValues[Math.floor(Math.random() * posValues.length)];
      const negVal = negValues[Math.floor(Math.random() * negValues.length)];

      const leftVal = leftIsPositive ? posVal : negVal;
      const rightVal = leftIsPositive ? negVal : posVal;

      // Add Left Gate
      items.push({
        id: `gate_left_${z}`,
        type: 'CHARACTER_GATE',
        x: -2.2,
        y: 0.1,
        z: z + length * 0.5,
        collected: false,
        gateValue: leftVal,
        gateType: leftVal > 0 ? 'add' : 'sub'
      });

      // Add Right Gate
      items.push({
        id: `gate_right_${z}`,
        type: 'CHARACTER_GATE',
        x: 2.2,
        y: 0.1,
        z: z + length * 0.5,
        collected: false,
        gateValue: rightVal,
        gateType: rightVal > 0 ? 'add' : 'sub'
      });
    }

    // Classic Rolling Balls 3D Gold Coins (floating in lines or gentle arcs)
    const coinCount = Math.floor(3 + Math.random() * 4); // 3 to 6 shiny coins per segment
    const coinSide = Math.random() > 0.5 ? 1 : -1;
    for (let c = 0; c < coinCount; c++) {
      const prog = (c + 1) / (coinCount + 1);
      const coinZ = z + prog * length;
      const coinX = (Math.sin(prog * Math.PI) * coinSide) * usableHalfWidth * 0.45;
      items.push({
        id: `coin_${coinZ.toFixed(1)}_${c}`,
        type: 'COIN',
        x: coinX,
        y: 0.9,
        z: coinZ,
        collected: false,
        value: 1
      });
    }

    // Normal energy distribution (Cute fruits & stars)
    const numOrbs = type === 'split_path' ? 6 : (Math.random() < 0.85 ? Math.floor(3 + Math.random() * 3) : 2);
    
    // Choose pattern (line, arc, sine wave, split)
    const pattern = Math.floor(Math.random() * 3);
    const primaryEnergy = this.pickWeightedEnergyType(modifiers.energyDistribution);
    const ENERGY_TYPES: EnergyType[] = ['RED', 'GREEN', 'YELLOW', 'BLUE', 'PURPLE'];

    for (let i = 0; i < numOrbs; i++) {
      const progress = (i + 1) / (numOrbs + 1);
      const orbZ = z + progress * length;
      let orbX = 0;

      if (type === 'split_path') {
        // Safe route on left (+X), Risky route on right (-X, high reward)
        const isRightReward = i >= numOrbs / 2;
        orbX = isRightReward ? -usableHalfWidth * 0.7 : usableHalfWidth * 0.7;
      } else if (type === 'curved_left') {
        // Arc curving smoothly towards screen left (+X)
        orbX = Math.sin(progress * Math.PI * 0.9) * usableHalfWidth * 0.75;
      } else if (type === 'curved_right') {
        // Arc curving smoothly towards screen right (-X)
        orbX = -Math.sin(progress * Math.PI * 0.9) * usableHalfWidth * 0.75;
      } else if (pattern === 0) {
        // Straight line offset
        orbX = (Math.random() * 2 - 1) * usableHalfWidth * 0.6;
      } else if (pattern === 1) {
        // Diagonal line across track
        orbX = (-1 + progress * 2) * usableHalfWidth * 0.7;
      } else {
        // Sine wave curve
        orbX = Math.sin(progress * Math.PI * 2) * usableHalfWidth * 0.7;
      }

      // Pick varied energy types so there is always a colorful variety of cute fruits and stars on the road!
      const currentEnergy = Math.random() < 0.4 ? primaryEnergy : ENERGY_TYPES[Math.floor(Math.random() * ENERGY_TYPES.length)];

      items.push({
        id: `orb_${orbZ.toFixed(1)}_${i}`,
        type: 'ENERGY',
        energyType: currentEnergy,
        x: orbX,
        y: 0.9,
        z: orbZ,
        collected: false
      });
    }

    // Rare Road Fragment spawn (10% base chance, or guaranteed on split high-risk or mystery)
    const fragmentChance = type === 'split_path' ? 0.65 : 0.15;
    if (Math.random() < fragmentChance) {
      const fragX = type === 'split_path' ? usableHalfWidth * 0.75 : (Math.random() * 2 - 1) * usableHalfWidth * 0.5;
      items.push({
        id: `frag_${z}`,
        type: 'ROAD_FRAGMENT',
        x: fragX,
        y: 1.0,
        z: z + length * 0.8,
        collected: false
      });
    }

    return items;
  }

  private generateObstaclesForSegment(
    z: number,
    length: number,
    width: number,
    type: SegmentType,
    modifiers: GenerationModifiers,
    forceSafe: boolean
  ): ObstacleItem[] {
    if (forceSafe || type === 'checkpoint' || type === 'portal' || type === 'final_gate') return [];

    const obstacles: ObstacleItem[] = [];
    const usableHalfWidth = (width / 2) - 1.2;

    // Split Path: Place hazardous rotating beam or blocks ONLY on the risky right side (-X)!
    if (type === 'split_path') {
      obstacles.push({
        id: `obs_split_${z}`,
        type: 'rotating_beam',
        x: -usableHalfWidth * 0.75,
        y: 1.0,
        z: z + length * 0.5,
        width: 3.2,
        height: 1.0,
        depth: 1.0,
        damage: 20,
        rotationSpeed: 2.2,
        active: true,
        hit: false
      });
      return obstacles;
    }

    if (type === 'lava_pool') {
      obstacles.push({
        id: `lava_${z}`,
        type: 'lava_geyser',
        x: 0,
        y: 0.2,
        z: z + length * 0.5,
        width: width * 0.7,
        height: 0.4,
        depth: length * 0.4,
        damage: 25,
        active: true,
        hit: false
      });
      return obstacles;
    }

    if (type === 'crate_challenge') {
      // Stack of 2-3 smashable wooden crates across the center/lane
      const crateCount = Math.floor(2 + Math.random() * 2);
      for (let i = 0; i < crateCount; i++) {
        const crateX = (i - (crateCount - 1) / 2) * 1.5;
        obstacles.push({
          id: `crate_${z}_${i}`,
          type: 'wooden_crate',
          x: crateX,
          y: 0.7,
          z: z + length * 0.5,
          width: 1.3,
          height: 1.3,
          depth: 1.3,
          damage: 10,
          active: true,
          hit: false
        });
      }
      return obstacles;
    }

    if (type === 'narrow_rail' && Math.random() < 0.6) {
      // High-tension swinging pendulum hammer over the narrow rail!
      obstacles.push({
        id: `pendulum_${z}`,
        type: 'pendulum_hammer',
        x: 0,
        y: 2.2,
        z: z + length * 0.5,
        width: 1.8,
        height: 2.4,
        depth: 1.2,
        damage: 25,
        rotationSpeed: 2.4,
        active: true,
        hit: false
      });
      return obstacles;
    }

    if (type === 'electric_hazard') {
      obstacles.push({
        id: `elec_${z}`,
        type: 'electric_gate',
        x: (Math.random() - 0.5) * usableHalfWidth,
        y: 1.2,
        z: z + length * 0.5,
        width: 2.8,
        height: 2.2,
        depth: 0.8,
        damage: 20,
        active: true,
        hit: false
      });
      return obstacles;
    }

    // Occasional Road Pit / Hole ("bazı yerlerde delik (çukur) olsun ... ama çok fazla delik ekleme")
    // Balanced spawn: only once every 80+ meters, ~22% chance on suitable tracks, never on checkpoints/portals/rails
    const isSuitableForPit = type === 'straight' || type === 'wide_highway' || type === 'curved_left' || type === 'curved_right';
    if (isSuitableForPit && (z - this.lastPitZ > 80) && Math.random() < 0.22) {
      this.lastPitZ = z;
      // Position either center, slightly left, or slightly right, leaving plenty of road to pass around or jump over!
      const pitChoices = [0, -usableHalfWidth * 0.45, usableHalfWidth * 0.45];
      const pitX = pitChoices[Math.floor(Math.random() * pitChoices.length)];
      const pitZ = z + length * 0.5;

      obstacles.push({
        id: `pit_${z}`,
        type: 'road_pit',
        x: pitX,
        y: 0.05,
        z: pitZ,
        width: 2.2, // 2.2m diameter pit
        height: 1.0,
        depth: 2.2,
        damage: 100,
        active: true,
        hit: false
      });
      return obstacles;
    }

    // General Obstacle Spawning based on obstacleFrequency
    if (Math.random() < modifiers.obstacleFrequency) {
      const obstacleChoices: ObstacleItem['type'][] = ['rock', 'barrier', 'rotating_beam', 'moving_wall', 'wooden_crate', 'pendulum_hammer'];
      const chosenType = obstacleChoices[Math.floor(Math.random() * obstacleChoices.length)];

      const obsZ = z + length * (0.3 + Math.random() * 0.4);
      let obsX = (Math.random() * 2 - 1) * usableHalfWidth * 0.65;

      let obsWidth = 1.6;
      let obsHeight = 1.4;
      let obsDepth = 1.4;
      let moveSpeed: number | undefined;
      let moveRange: number | undefined;
      let rotSpeed: number | undefined;

      if (chosenType === 'rotating_beam') {
        obsWidth = 3.6;
        obsHeight = 0.8;
        obsDepth = 0.8;
        rotSpeed = 1.8;
      } else if (chosenType === 'pendulum_hammer') {
        obsWidth = 1.8;
        obsHeight = 2.4;
        obsDepth = 1.2;
        rotSpeed = 2.2;
      } else if (chosenType === 'wooden_crate') {
        obsWidth = 1.3;
        obsHeight = 1.3;
        obsDepth = 1.3;
      } else if (chosenType === 'moving_wall') {
        obsWidth = 2.0;
        obsHeight = 1.8;
        obsDepth = 1.2;
        moveSpeed = 1.6;
        moveRange = usableHalfWidth * 0.7;
      } else if (chosenType === 'ice_block') {
        obsWidth = 1.8;
        obsHeight = 1.5;
        obsDepth = 1.5;
      }

      obstacles.push({
        id: `obs_${obsZ.toFixed(1)}`,
        type: chosenType,
        x: obsX,
        y: obsHeight / 2,
        z: obsZ,
        width: obsWidth,
        height: obsHeight,
        depth: obsDepth,
        damage: chosenType === 'rotating_beam' ? 20 : 15,
        moveSpeed,
        moveRange,
        rotationSpeed: rotSpeed,
        active: true,
        hit: false
      });
    }

    return obstacles;
  }
}

import { EnergyType, RoadMemoryState } from '../types/game';

export interface GenerationModifiers {
  preferredCurve: 'neutral' | 'left' | 'right';
  riskBranchProbability: number; // 0.1 to 0.5
  energyDistribution: Record<EnergyType, number>; // weights
  roadWidthFactor: number; // wider for safe players, tighter for risky players
  obstacleFrequency: number;
  portalChance: number;
  mysteryEventChance: number;
  transformationAlert?: string;
}

export class RoadMemorySystem {
  private state: RoadMemoryState;
  private lastAlertDistance = -500;

  constructor(initialState: RoadMemoryState) {
    this.state = { ...initialState };
  }

  public getState(): RoadMemoryState {
    return this.state;
  }

  public recordMovement(direction: 'left' | 'right') {
    if (direction === 'left') {
      this.state.leftTurns += 1;
    } else {
      this.state.rightTurns += 1;
    }
  }

  public recordRouteChoice(isRisky: boolean) {
    if (isRisky) {
      this.state.riskyRoutesChosen += 1;
      this.state.riskTolerance = Math.min(1, this.state.riskTolerance + 0.08);
    } else {
      this.state.safeRoutesChosen += 1;
      this.state.riskTolerance = Math.max(0.1, this.state.riskTolerance - 0.05);
    }
  }

  public recordEnergyCollected(type: EnergyType): string | undefined {
    this.state.energyCollected[type] = (this.state.energyCollected[type] || 0) + 1;

    // Recalculate highest affinity
    let highestType: EnergyType = 'GREEN';
    let highestCount = -1;
    const entries = Object.entries(this.state.energyCollected) as [EnergyType, number][];
    for (const [eType, count] of entries) {
      if (count > highestCount) {
        highestCount = count;
        highestType = eType;
      }
    }

    if (highestType !== this.state.activeAffinity && highestCount >= 5) {
      this.state.activeAffinity = highestType;
      const affinityNames: Record<EnergyType, string> = {
        BLUE: 'WATER Flow: Crystalline paths & ice channels form',
        RED: 'FIRE Wrath: Magma bridges & thermal boosts appear',
        GREEN: 'NATURE Vitality: Verdant highways & bio-springs surge',
        PURPLE: 'COSMIC Singularity: Dimensional portals & phase tracks materialize',
        YELLOW: 'ELECTRIC Surge: Lightning gates & hyper accelerators activate'
      };
      const alertMsg = `Road Memory: ${affinityNames[highestType]}`;
      this.state.lastTransformationMessage = alertMsg;
      return alertMsg;
    }
    return undefined;
  }

  public recordAvoidance() {
    this.state.obstaclesAvoided += 1;
  }

  public recordCollision() {
    this.state.collisionsCount += 1;
    // Lower risk tolerance slightly if colliding repeatedly
    this.state.riskTolerance = Math.max(0.15, this.state.riskTolerance - 0.03);
  }

  public recordPortal() {
    this.state.portalsEntered += 1;
  }

  public recordSecretArea() {
    this.state.secretAreasFound += 1;
  }

  public computeModifiers(currentDistance: number): GenerationModifiers {
    // Left / Right curve bias
    let preferredCurve: 'neutral' | 'left' | 'right' = 'neutral';
    const totalTurns = this.state.leftTurns + this.state.rightTurns;
    if (totalTurns > 20) {
      const leftRatio = this.state.leftTurns / totalTurns;
      if (leftRatio > 0.6) preferredCurve = 'left';
      else if (leftRatio < 0.4) preferredCurve = 'right';
    }

    // Risky branch probability (scales with player's risk tolerance)
    const riskBranchProb = 0.15 + this.state.riskTolerance * 0.35; // 0.15 to 0.50

    // Energy weights based on Road Memory
    const weights: Record<EnergyType, number> = {
      BLUE: 1.0,
      RED: 1.0,
      GREEN: 1.0,
      PURPLE: 1.0,
      YELLOW: 1.0
    };

    // Boost favored energy and related world generation
    const affinity = this.state.activeAffinity;
    weights[affinity] += 2.5;

    // Road width: Daredevils get slightly sleeker challenging paths, safe players get wider roadways
    const widthFactor = 1.15 - this.state.riskTolerance * 0.25; // 1.15 to 0.90

    // Obstacle frequency: Scales smoothly with distance and risk tolerance
    const baseDifficulty = Math.min(1.0, currentDistance / 6000);
    const obstacleFreq = 0.3 + baseDifficulty * 0.45 + (this.state.riskTolerance - 0.5) * 0.15;

    // Portal chance increases if player loves cosmic or has reached milestones
    const portalChance = (affinity === 'PURPLE' ? 0.25 : 0.12) + (this.state.portalsEntered * 0.01);
    const mysteryEventChance = 0.08 + (this.state.secretAreasFound * 0.02);

    let transformationAlert: string | undefined;
    if (currentDistance - this.lastAlertDistance >= 600) {
      if (this.state.riskTolerance > 0.75) {
        transformationAlert = "Road Memory: High-Risk trails actively generating!";
        this.lastAlertDistance = currentDistance;
      } else if (this.state.lastTransformationMessage) {
        transformationAlert = this.state.lastTransformationMessage;
        this.state.lastTransformationMessage = undefined;
        this.lastAlertDistance = currentDistance;
      }
    }

    return {
      preferredCurve,
      riskBranchProbability: riskBranchProb,
      energyDistribution: weights,
      roadWidthFactor: Math.max(0.8, Math.min(1.3, widthFactor)),
      obstacleFrequency: Math.max(0.2, Math.min(0.85, obstacleFreq)),
      portalChance,
      mysteryEventChance,
      transformationAlert
    };
  }
}

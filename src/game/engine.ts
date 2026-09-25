import * as THREE from 'three';
import { 
  BallEvolution, 
  CosmeticTrail, 
  WorldConfig, 
  RoadSegment, 
  EnergyType, 
  ObstacleItem, 
  CollectibleItem,
  ActiveRunState,
  LevelWonEvent
} from '../types/game';
import { WORLDS, ENERGY_CONFIGS, COSMETIC_TRAILS, BALL_EVOLUTIONS, GAME_LEVELS } from './constants';
import { audioService } from '../services/audio';
import { RoadMemorySystem } from './roadMemory';
import { RoadGenerator } from './roadGenerator';
import { createBallTexture } from './ballTextures';
import { t } from '../services/i18n';
import { LevelInfo } from '../types/game';

export interface GameEngineCallbacks {
  onUpdateRunState: (state: Partial<ActiveRunState>) => void;
  onRoadMemoryAlert: (msg: string) => void;
  onCheckpointReached: (distance: number) => void;
  onMysteryEvent: (type: string) => void;
  onGameOver: () => void;
  onLevelWon: (event: LevelWonEvent) => void;
  onGatePass?: (type: 'green' | 'red') => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private callbacks: GameEngineCallbacks;

  // Game Systems
  private roadGenerator: RoadGenerator;
  private roadMemory: RoadMemorySystem;

  // Active Game State
  private runState: ActiveRunState;
  private activeEvolution: BallEvolution;
  private activeTrail: CosmeticTrail;
  private currentWorldConfig: WorldConfig;
  private isRunning = false;
  private isPaused = false;
  private animationFrameId: number | null = null;
  private lastTime = 0;

  // Ball & Player Physics
  private ballMesh: THREE.Group;
  private ballSphere: THREE.Mesh;
  private ballInnerCore: THREE.Mesh;
  private shieldMesh: THREE.Mesh;
  private ballLight: THREE.PointLight;
  private ballPos = new THREE.Vector3(0, 0.8, 0);
  private ballVelX = 0;
  private verticalVelocity = 0;
  private isOnGround = true;
  private forwardSpeed = 24.0; // base speed m/s
  private baseSpeed = 24.0;
  private maxSpeed = 46.0;
  private isFalling = false;
  private fallVelocity = 0;
  private shieldTimer = 0;

  // Camera settings
  private cameraOffset = new THREE.Vector3(0, 4.2, -8.5);
  private cameraLookTarget = new THREE.Vector3(0, 1.2, 8);
  private cameraShake = 0;
  private cameraRoll = 0;

  // Road & Objects in Scene
  private activeSegments: RoadSegment[] = [];
  private segmentMeshes: Map<string, THREE.Group> = new Map();
  private collectibleMeshes: Map<string, THREE.Group> = new Map();
  private obstacleMeshes: Map<string, THREE.Group> = new Map();
  private ballGeom: THREE.SphereGeometry;
  private ballMat: THREE.MeshStandardMaterial;
  private ballSquadGroup: THREE.Group;
  private mainBallShadow: THREE.Mesh;
  private shadowTexture: THREE.CanvasTexture;
  private activeCloneBalls: { mesh: THREE.Mesh; shadow: THREE.Mesh; offsetX: number; offsetZ: number }[] = [];
  private fallingBalls: Array<{
    mesh: THREE.Object3D;
    shadow: THREE.Mesh;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    rotVel: THREE.Vector3;
    life: number;
  }> = [];
  private isGameOverSequence = false;
  private gameOverTimer = 0;
  private currentLevelConfig: LevelInfo | null = null;
  private finalGateMesh: THREE.Group | null = null;
  private finalVortexHole: THREE.Group | null = null;

  // Environment & Lighting
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private fog: THREE.Fog;
  private envParticles: THREE.Points | null = null;
  private skyDome: THREE.Mesh | null = null;
  private sunGroup: THREE.Group | null = null;
  private cloudList: { group: THREE.Group; initialX: number; speed: number }[] = [];

  // Particle Pools
  private particlePool: THREE.Mesh[] = [];

  // Input State
  private keyLeft = false;
  private keyRight = false;
  private keyForward = false;
  private keyBackward = false;
  private virtualLeft = false;
  private virtualRight = false;
  private virtualForward = false;
  private virtualBackward = false;
  private pointerSteer: 'none' | 'left' | 'right' = 'none';
  private isPointerActive = false;
  private pointerLastX = 0;
  private pointerStartY = 0;
  private pointerDragY = 0;
  private sensitivity = 1.0;

  // Level & Victory State
  private currentLevel = 1;
  private levelTargetDistance = 500;
  private isLevelWon = false;
  private victoryTimer = 0;
  private finalGateZ: number | null = null;
  private isEndlessMode = false;

  constructor(
    container: HTMLElement,
    evolution: BallEvolution,
    trail: CosmeticTrail,
    roadMemory: RoadMemorySystem,
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.roadMemory = roadMemory;
    this.activeEvolution = evolution;
    this.activeTrail = trail;
    this.currentWorldConfig = WORLDS.GREEN_VALLEY;
    this.roadGenerator = new RoadGenerator();

    const maxEnergy = 100 + evolution.energyBonus;
    this.runState = {
      distance: 0,
      energy: maxEnergy,
      maxEnergy,
      fragmentsThisRun: 0,
      energyThisRun: 0,
      coinsThisRun: 0,
      lives: 3,
      maxLives: 3,
      speedKmh: 86,
      hasShield: false,
      shieldTimeLeft: 0,
      currentWorld: 'GREEN_VALLEY',
      currentLevel: 1,
      levelTargetDistance: 500,
      isLevelWon: false,
      checkpointDistance: 0,
      checkpointWorld: 'GREEN_VALLEY',
      checkpointAvailable: false,
      abilityActive: false,
      abilityTimeLeft: 0,
      abilityCooldownLeft: 0,
      consecutiveRiskyCompleted: 0,
      newDiscoveries: []
    };

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 300);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // 3. Lighting & Fog - Pure Open Daytime Sky Blue (No Pink)
    this.fog = new THREE.Fog(0x7dd3fc, 80, 280);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color(0x7dd3fc);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, this.currentWorldConfig.ambientColor, 0.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.dirLight.position.set(20, 35, -20);
    this.scene.add(this.dirLight);

    // 4. Contact Shadow Texture Creation
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d')!;
    const sgrad = sctx.createRadialGradient(64, 64, 10, 64, 64, 62);
    sgrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    sgrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    sgrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = sgrad;
    sctx.fillRect(0, 0, 128, 128);
    this.shadowTexture = new THREE.CanvasTexture(shadowCanvas);

    // 5. Ball Creation with Clean High-Contrast Vivid Material & Giydirme
    this.ballMesh = new THREE.Group();
    this.ballGeom = new THREE.SphereGeometry(0.8, 48, 48);
    const texture = createBallTexture(evolution.id);
    this.ballMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.18,
      metalness: 0.03,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0
    });
    this.ballSphere = new THREE.Mesh(this.ballGeom, this.ballMat);
    this.ballSphere.visible = true;
    this.ballMesh.add(this.ballSphere);

    // Realistic Contact Shadow beneath main ball
    const shadowGeom = new THREE.PlaneGeometry(1.65, 1.65);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.shadowTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    this.mainBallShadow = new THREE.Mesh(shadowGeom, shadowMat);
    this.mainBallShadow.rotation.x = -Math.PI / 2;
    this.mainBallShadow.position.set(0, 0.02, 0);
    this.scene.add(this.mainBallShadow);

    // Invulnerability / Shield Bubble
    const shieldGeom = new THREE.SphereGeometry(1.05, 32, 32);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
    this.shieldMesh.visible = false;
    this.ballMesh.add(this.shieldMesh);

    // Inner glowing core (hidden to prevent any milky overlay)
    const coreGeom = new THREE.SphereGeometry(0.2, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0
    });
    this.ballInnerCore = new THREE.Mesh(coreGeom, coreMat);
    this.ballInnerCore.visible = false;
    this.ballMesh.add(this.ballInnerCore);

    // Dynamic Ball Light (subtle ambient accent, not washing out the surface)
    this.ballLight = new THREE.PointLight(evolution.hexColor, 0.3, 8);
    this.ballLight.position.set(0, 0, 0);
    this.ballMesh.add(this.ballLight);

    this.ballMesh.position.copy(this.ballPos);
    this.scene.add(this.ballMesh);

    // Initialize Clone Ball Squad group
    this.ballSquadGroup = new THREE.Group();
    this.scene.add(this.ballSquadGroup);

    // 6. Daylight Sky & Clouds System (Sağda Solda Bulutlar & Açık Mavi Gökyüzü)
    this.initDaylightSkyAndClouds();

    // 7. Environmental floating particles
    this.initAtmosphericParticles();

    // 6. Setup Event Listeners
    this.bindEvents();
  }

  public setSensitivity(val: number) {
    this.sensitivity = val;
  }

  public setEvolution(evolution: BallEvolution) {
    this.activeEvolution = evolution;
    const maxEnergy = 100 + evolution.energyBonus;
    this.runState.maxEnergy = maxEnergy;
    this.runState.energy = Math.min(this.runState.energy, maxEnergy);
    
    // Update ball texture & ensure clean, punchy, unwashed presentation
    const texture = createBallTexture(evolution.id);
    this.ballMat.map = texture;
    this.ballMat.emissive.set(0x000000);
    this.ballMat.emissiveIntensity = 0;
    this.ballMat.needsUpdate = true;
    this.ballLight.color.setHex(evolution.hexColor);
  }

  public setTrail(trail: CosmeticTrail) {
    this.activeTrail = trail;
  }

  public startRun(fromCheckpoint = false, targetWorld?: WorldConfig['id'], targetDist?: number, isEndless?: boolean) {
    this.isRunning = true;
    this.isPaused = false;
    this.isFalling = false;
    this.fallVelocity = 0;
    this.verticalVelocity = 0;
    this.isOnGround = true;
    this.shieldTimer = 0;
    this.isLevelWon = false;
    this.victoryTimer = 0;
    this.finalGateZ = null;
    this.ballMesh.visible = true;
    this.ballMesh.scale.set(1, 1, 1);

    if (isEndless !== undefined) this.isEndlessMode = isEndless;
    if (targetDist !== undefined) this.levelTargetDistance = targetDist;

    let startZ = 0;
    let startWorld = targetWorld || (GAME_LEVELS.find(l => l.level === this.currentLevel)?.worldId || 'GREEN_VALLEY');
    if (fromCheckpoint && this.runState.checkpointAvailable) {
      startZ = this.runState.checkpointDistance;
      startWorld = this.runState.checkpointWorld;
      this.runState.distance = startZ;
      this.runState.energy = Math.floor(this.runState.maxEnergy * 0.7);
    } else {
      this.runState.distance = 0;
      this.runState.energy = this.runState.maxEnergy;
      this.runState.fragmentsThisRun = 0;
      this.runState.energyThisRun = 0;
      this.runState.coinsThisRun = 0;
      this.runState.newDiscoveries = [];
    }

    // Reset clone balls squad & falling balls
    this.isGameOverSequence = false;
    this.gameOverTimer = 0;
    while (this.activeCloneBalls.length > 0) {
      const b = this.activeCloneBalls.pop();
      if (b) {
        this.ballSquadGroup.remove(b.mesh);
        this.ballSquadGroup.remove(b.shadow);
      }
    }
    while (this.fallingBalls.length > 0) {
      const fb = this.fallingBalls.pop();
      if (fb) {
        if (fb.mesh.parent) fb.mesh.parent.remove(fb.mesh);
        if (fb.shadow.parent) fb.shadow.parent.remove(fb.shadow);
      }
    }
    this.runState.lives = 5; // Start with 5 rolling balls
    this.syncBallSquad();

    this.runState.hasShield = false;
    this.runState.currentLevel = this.currentLevel;
    this.runState.levelTargetDistance = this.levelTargetDistance;
    this.runState.isLevelWon = false;

    this.ballPos.set(0, 0.8, startZ);
    this.ballVelX = 0;
    this.ballMesh.position.copy(this.ballPos);
    this.ballMesh.rotation.set(0, 0, 0);

    this.keyLeft = false;
    this.keyRight = false;
    this.keyForward = false;
    this.keyBackward = false;
    this.virtualLeft = false;
    this.virtualRight = false;
    this.virtualForward = false;
    this.virtualBackward = false;
    this.pointerSteer = 'none';
    this.isPointerActive = false;
    this.pointerDragY = 0;
    this.cameraRoll = 0;
    this.cameraShake = 0;

    // Direct camera alignment: steady and rock-solid
    this.camera.position.set(0, 4.2, startZ + this.cameraOffset.z);
    this.cameraLookTarget.set(0, 1.2, startZ + 16);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.cameraLookTarget);

    this.forwardSpeed = this.baseSpeed + Math.min(18, (startZ / 1000) * 2);
    this.runState.speedKmh = Math.round(this.forwardSpeed * 3.6);

    // Clear all existing segments
    this.clearAllSegments();

    // Reset road generator
    this.roadGenerator.reset(startWorld as any, this.levelTargetDistance, this.isEndlessMode);
    this.switchWorld(startWorld as any, false);

    // If we have a specific level config, apply its distinct vibrant atmosphere and colors
    if (this.currentLevelConfig) {
      const fogColor = new THREE.Color(this.currentLevelConfig.fogColor);
      this.fog.color.copy(fogColor);
      this.scene.background = fogColor;
      this.hemiLight.color.setHex(this.currentLevelConfig.ambientColor);
    }

    // Generate initial track
    const initialSegments = this.roadGenerator.generateInitialSegments(10);
    initialSegments.forEach(seg => this.spawnSegmentMesh(seg));
    this.activeSegments = initialSegments;

    this.callbacks.onUpdateRunState(this.runState);

    // Start loop
    this.lastTime = performance.now();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animate(this.lastTime);
  }

  public startLevel(levelNumber = 1, isEndless = false) {
    this.currentLevel = levelNumber;
    this.isEndlessMode = isEndless;
    const config = GAME_LEVELS.find(l => l.level === levelNumber) || GAME_LEVELS[0];
    this.currentLevelConfig = config;
    this.levelTargetDistance = config.targetDistance;
    this.startRun(false, config.worldId, config.targetDistance, isEndless);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      this.animate(this.lastTime);
    }
  }

  public stop() {
    this.isRunning = false;
    this.isGameOverSequence = false;
    this.gameOverTimer = 0;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    audioService.updateRollingSpeed(0);
  }

  // Real 3D Ball Jump
  public triggerJump() {
    if (!this.isRunning || this.isPaused || this.isFalling) return;
    if (this.isOnGround) {
      this.verticalVelocity = 14.5;
      this.isOnGround = false;
      audioService.playJump();
      this.spawnExplosionParticles(this.ballPos, 0xffffff, 8);
    } else {
      // Mid-air ability activation
      this.triggerAbility();
    }
  }

  public triggerBrake(active: boolean) {
    this.virtualBackward = active;
  }

  public triggerAccelerate(active: boolean) {
    this.virtualForward = active;
  }

  // Active Ability Activation (Triggered by Space in mid-air or Ability Button)
  public triggerAbility() {
    if (!this.isRunning || this.isPaused || this.runState.abilityCooldownLeft > 0 || this.runState.abilityActive) {
      return;
    }

    audioService.playAbility();
    this.runState.abilityActive = true;
    this.runState.abilityTimeLeft = 5.0; // 5 sec duration
    this.runState.abilityCooldownLeft = this.activeEvolution.abilityCooldown;

    // Trigger ability effects
    if (this.activeEvolution.id === 'ENERGY_CORE') {
      this.runState.energy = Math.min(this.runState.maxEnergy, this.runState.energy + 20);
      this.spawnExplosionParticles(this.ballPos, 0x38bdf8, 30);
    } else if (this.activeEvolution.id === 'ELECTRIC_CORE') {
      this.forwardSpeed += 16;
      this.spawnExplosionParticles(this.ballPos, 0xfacc15, 40);
    } else if (this.activeEvolution.id === 'FIRE_CORE') {
      this.spawnExplosionParticles(this.ballPos, 0xf97316, 40);
    } else if (this.activeEvolution.id === 'COSMIC_CORE') {
      this.spawnExplosionParticles(this.ballPos, 0xc084fc, 50);
    }

    this.callbacks.onUpdateRunState(this.runState);
  }

  // --- Input Binding ---
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.keyLeft = true;
      this.roadMemory.recordMovement('left');
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.keyRight = true;
      this.roadMemory.recordMovement('right');
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.keyForward = true;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.keyBackward = true;
    } else if (e.code === 'Space') {
      e.preventDefault();
      this.triggerJump();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.keyLeft = false;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.keyRight = false;
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.keyForward = false;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.keyBackward = false;
    }
  };

  private onWindowBlur = () => {
    this.keyLeft = false;
    this.keyRight = false;
    this.keyForward = false;
    this.keyBackward = false;
    this.virtualLeft = false;
    this.virtualRight = false;
    this.virtualForward = false;
    this.virtualBackward = false;
    this.pointerSteer = 'none';
    this.isPointerActive = false;
    this.pointerDragY = 0;
  };

  private onPointerDown = (e: PointerEvent) => {
    this.isPointerActive = true;
    this.pointerLastX = e.clientX;
    this.pointerStartY = e.clientY;
    this.pointerDragY = 0;
    const dom = this.renderer.domElement;
    const rect = dom.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    if (e.clientX < midX) {
      this.pointerSteer = 'left';
      this.roadMemory.recordMovement('left');
    } else {
      this.pointerSteer = 'right';
      this.roadMemory.recordMovement('right');
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerActive) return;
    const diffX = e.clientX - this.pointerLastX;
    this.pointerLastX = e.clientX;
    this.pointerDragY = this.pointerStartY - e.clientY;

    if (Math.abs(diffX) > 1.0) {
      this.pointerSteer = diffX < 0 ? 'left' : 'right';
      const dom = this.renderer.domElement;
      const rect = dom.getBoundingClientRect();
      const lateralDelta = (diffX / (rect.width || window.innerWidth)) * 24.0 * this.sensitivity;
      this.ballPos.x -= lateralDelta;
    }
  };

  private onPointerUp = () => {
    this.isPointerActive = false;
    this.pointerSteer = 'none';
    this.pointerDragY = 0;
  };

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);

    window.addEventListener('resize', this.onResize);
  }

  public setVirtualInput(dir: 'left' | 'right' | 'forward' | 'backward' | 'none') {
    if (dir === 'left') {
      this.virtualLeft = true;
      this.virtualRight = false;
      this.virtualForward = false;
      this.virtualBackward = false;
      this.roadMemory.recordMovement('left');
    } else if (dir === 'right') {
      this.virtualLeft = false;
      this.virtualRight = true;
      this.virtualForward = false;
      this.virtualBackward = false;
      this.roadMemory.recordMovement('right');
    } else if (dir === 'forward') {
      this.virtualForward = true;
      this.virtualBackward = false;
    } else if (dir === 'backward') {
      this.virtualForward = false;
      this.virtualBackward = true;
    } else {
      this.virtualLeft = false;
      this.virtualRight = false;
      this.virtualForward = false;
      this.virtualBackward = false;
    }
  }

  private onResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  // --- World Switching ---
  private switchWorld(worldId: WorldConfig['id'], playEffect = true) {
    if (this.currentWorldConfig.id === worldId && playEffect) return;

    this.currentWorldConfig = WORLDS[worldId];
    this.runState.currentWorld = worldId;
    audioService.setWorld(worldId);

    // Smooth background & fog shift
    const targetFog = new THREE.Color(this.currentWorldConfig.fogColor);
    this.fog.color.copy(targetFog);
    this.fog.near = this.currentWorldConfig.fogNear;
    this.fog.far = this.currentWorldConfig.fogFar;
    this.scene.background = targetFog;
    this.hemiLight.color.setHex(this.currentWorldConfig.ambientColor);

    if (playEffect) {
      audioService.playPortalWarp();
      this.spawnExplosionParticles(this.ballPos, this.currentWorldConfig.roadEdgeColor, 60);
      this.callbacks.onRoadMemoryAlert(`Discovered World: ${this.currentWorldConfig.name}`);
      if (!this.runState.newDiscoveries.includes(this.currentWorldConfig.name)) {
        this.runState.newDiscoveries.push(this.currentWorldConfig.name);
      }
    }
  }

  // --- Main Game Loop ---
  private animate = (currentTime: number) => {
    if (!this.isRunning || this.isPaused) return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    // Stably clamped dt avoids spike jitter
    const dt = Math.min(0.05, Math.max(0.001, (currentTime - this.lastTime) / 1000));
    this.lastTime = currentTime;

    // If level is won, run the cinematic vortex entry sequence
    if (this.isLevelWon) {
      this.updateVictorySequence(dt);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // Delayed Game Over Sequence (Watch all balls disappear / fall for ~2 seconds before modal pops up!)
    if (this.isGameOverSequence) {
      this.gameOverTimer += dt;
      // Gently decelerate forward speed and audio
      this.forwardSpeed = THREE.MathUtils.damp(this.forwardSpeed, 0, 3.5, dt);
      audioService.updateRollingSpeed(this.forwardSpeed / this.maxSpeed);

      // Lead ball tumbles down with gravity if game over
      this.fallVelocity += 35 * dt;
      this.ballPos.y -= this.fallVelocity * dt;
      this.ballPos.z += this.forwardSpeed * dt;
      this.ballMesh.position.copy(this.ballPos);
      this.ballMesh.rotation.x += 14 * dt;
      this.ballMesh.rotation.z += 8 * dt;

      // Update falling balls physics
      for (let i = this.fallingBalls.length - 1; i >= 0; i--) {
        const fb = this.fallingBalls[i];
        fb.vel.y -= 36.0 * dt;
        fb.pos.addScaledVector(fb.vel, dt);
        fb.mesh.position.copy(fb.pos);
        fb.mesh.rotation.x += fb.rotVel.x * dt;
        fb.mesh.rotation.y += fb.rotVel.y * dt;
        fb.mesh.rotation.z += fb.rotVel.z * dt;
        fb.life -= dt;
        if (fb.life <= 0 || fb.pos.y < -35) {
          if (fb.mesh.parent) fb.mesh.parent.remove(fb.mesh);
          if (fb.shadow.parent) fb.shadow.parent.remove(fb.shadow);
          this.fallingBalls.splice(i, 1);
        }
      }

      this.updateCamera(dt);
      this.updateParticles(dt);
      this.renderer.render(this.scene, this.camera);

      // Once 2.0 seconds have elapsed and the player has seen all balls fall / get lost:
      if (this.gameOverTimer >= 2.0) {
        this.isRunning = false;
        this.isGameOverSequence = false;
        this.callbacks.onGameOver();
      }
      return;
    }

    this.updatePhysics(dt);
    this.updateRoadAndCollectibles(dt);
    this.updateCamera(dt);
    this.updateParticles(dt);

    this.renderer.render(this.scene, this.camera);
  };

  private updatePhysics(dt: number) {
    // 0. Shield bubble timer & visual rotation
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) {
        this.runState.hasShield = false;
      }
    }
    this.shieldMesh.visible = !!this.runState.hasShield;
    if (this.shieldMesh.visible) {
      this.shieldMesh.rotation.y += 2.0 * dt;
    }

    if (this.isFalling) {
      this.fallVelocity += 35 * dt;
      this.ballPos.y -= this.fallVelocity * dt;
      this.ballPos.z += this.forwardSpeed * 0.4 * dt;
      this.ballMesh.position.copy(this.ballPos);
      this.ballMesh.rotation.x += 12 * dt;

      // Convert all remaining clone balls to falling balls too
      while (this.activeCloneBalls.length > 0) {
        const b = this.activeCloneBalls.pop();
        if (b) {
          this.fallingBalls.push({
            mesh: b.mesh,
            shadow: b.shadow,
            pos: new THREE.Vector3(this.ballPos.x + b.offsetX, this.ballPos.y, this.ballPos.z + b.offsetZ),
            vel: new THREE.Vector3(b.offsetX * 2.0, -this.fallVelocity * 0.7, this.forwardSpeed * 0.35),
            rotVel: new THREE.Vector3(12, 0, 0),
            life: 2.5
          });
        }
      }

      // Update falling balls physics while leader falls
      for (let i = this.fallingBalls.length - 1; i >= 0; i--) {
        const fb = this.fallingBalls[i];
        fb.vel.y -= 36.0 * dt;
        fb.pos.addScaledVector(fb.vel, dt);
        fb.mesh.position.copy(fb.pos);
        fb.mesh.rotation.x += fb.rotVel.x * dt;
        fb.life -= dt;
        if (fb.life <= 0 || fb.pos.y < -35) {
          if (fb.mesh.parent) fb.mesh.parent.remove(fb.mesh);
          if (fb.shadow.parent) fb.shadow.parent.remove(fb.shadow);
          this.fallingBalls.splice(i, 1);
        }
      }

      if (this.ballPos.y < -12) {
        // Void drop: check lives remaining
        if (this.runState.lives && this.runState.lives > 1) {
          this.runState.lives--;
          this.respawnAtCheckpoint();
        } else {
          this.runState.lives = 0;
          this.handleExhaustion();
        }
      }
      return;
    }

    // Check if player reached the Final Gate
    if (this.finalGateZ !== null && !this.isLevelWon && this.ballPos.z >= this.finalGateZ - 2.0) {
      this.startLevelVictorySequence(this.finalGateZ);
      return;
    }

    // 1. Ability timer & Cooldown countdown
    if (this.runState.abilityActive) {
      this.runState.abilityTimeLeft -= dt;
      if (this.runState.abilityTimeLeft <= 0) {
        this.runState.abilityActive = false;
      }
    }
    if (this.runState.abilityCooldownLeft > 0) {
      this.runState.abilityCooldownLeft = Math.max(0, this.runState.abilityCooldownLeft - dt);
    }

    // 2. Responsive Horizontal Steering (Immediate traction + clean braking)
    const steerSpeed = 24.0 * this.sensitivity;
    const isSteeringLeft = this.keyLeft || this.virtualLeft || this.pointerSteer === 'left';
    const isSteeringRight = this.keyRight || this.virtualRight || this.pointerSteer === 'right';

    let targetVelX = 0;
    if (isSteeringRight && !isSteeringLeft) {
      targetVelX = -steerSpeed; // Decreases world X -> moves ball to screen RIGHT!
    } else if (isSteeringLeft && !isSteeringRight) {
      targetVelX = steerSpeed; // Increases world X -> moves ball to screen LEFT!
    }

    if (targetVelX !== 0) {
      // Rapid acceleration into turn for snappy arcade feel
      this.ballVelX = THREE.MathUtils.damp(this.ballVelX, targetVelX, 22, dt);
    } else {
      // Prompt deceleration when input released - no ice skating drift
      this.ballVelX = THREE.MathUtils.damp(this.ballVelX, 0, 28, dt);
      if (Math.abs(this.ballVelX) < 0.05) this.ballVelX = 0;
    }

    this.ballPos.x += this.ballVelX * dt;

    // 3. Dynamic Forward Speed & Braking / Accelerating (Rolling Balls 3D mechanics)
    const isAcc = this.keyForward || this.virtualForward || (this.isPointerActive && this.pointerDragY > 20);
    const isBrake = this.keyBackward || this.virtualBackward || (this.isPointerActive && this.pointerDragY < -20);

    let baseTargetSpeed = this.baseSpeed + (this.runState.distance / 1200) * 2.8;
    if (isBrake) {
      baseTargetSpeed = 10.0; // Crawl speed for precision navigation on narrow rails & obstacles
    } else if (isAcc) {
      baseTargetSpeed = Math.min(46.0, baseTargetSpeed + 12.0); // Boost forward!
    }

    const speedMultiplier = this.runState.abilityActive && this.activeEvolution.id === 'ELECTRIC_CORE' ? 1.4 : 1.0;
    this.forwardSpeed = THREE.MathUtils.lerp(this.forwardSpeed, baseTargetSpeed * speedMultiplier, dt * 3.0);
    this.runState.speedKmh = Math.round(this.forwardSpeed * 3.6);

    const forwardDelta = this.forwardSpeed * dt;
    this.ballPos.z += forwardDelta;
    this.runState.distance = Math.floor(this.ballPos.z);

    // Continuous Rolling Sound Update
    audioService.updateRollingSpeed(this.forwardSpeed / this.maxSpeed);

    // 4. Ball Visual Rotation (Real 3D Rolling) & Contact Shadow
    const ballRadius = 0.8;
    this.ballSphere.rotation.x += forwardDelta / ballRadius;
    this.ballSphere.rotation.z += (this.ballVelX * dt) / ballRadius;
    this.ballSphere.rotation.y = -this.ballVelX * 0.04; // Realistic banking tilt in curves

    // Contact shadow follows main ball directly on the road
    this.mainBallShadow.position.set(
      this.ballPos.x,
      Math.max(0.02, this.ballPos.y - 0.78),
      this.ballPos.z
    );

    // Update clone balls in the squad - tightly glued with zero gap, edge fall-off enabled
    this.syncBallSquad();
    for (let i = this.activeCloneBalls.length - 1; i >= 0; i--) {
      const b = this.activeCloneBalls[i];
      const cloneZ = this.ballPos.z + b.offsetZ;
      const cloneX = this.ballPos.x + b.offsetX;
      const segAtClone = this.findSegmentAtZ(cloneZ);

      let isOffEdge = false;
      if (segAtClone) {
        const segHalfWidth = segAtClone.width / 2;
        const edgeThreshold = segAtClone.type === 'narrow_rail' ? segHalfWidth + 0.1 : segHalfWidth + 0.35;
        if (Math.abs(cloneX) > edgeThreshold) {
          isOffEdge = true;
        }
      }

      if (isOffEdge && !this.runState.hasShield) {
        // Clone ball falls off the road edge!
        this.activeCloneBalls.splice(i, 1);
        this.runState.lives = Math.max(0, this.runState.lives - 1);
        audioService.playBallFall();
        this.callbacks.onRoadMemoryAlert(t('alert_ball_lost_edge'));

        this.fallingBalls.push({
          mesh: b.mesh,
          shadow: b.shadow,
          pos: new THREE.Vector3(cloneX, this.ballPos.y, cloneZ),
          vel: new THREE.Vector3(
            (cloneX > 0 ? 1 : -1) * (2.5 + Math.random() * 2),
            -1.5,
            this.forwardSpeed * 0.8
          ),
          rotVel: new THREE.Vector3(
            15 + Math.random() * 8,
            (Math.random() - 0.5) * 8,
            (cloneX > 0 ? -1 : 1) * (10 + Math.random() * 6)
          ),
          life: 2.5
        });

        if (this.runState.lives <= 0) {
          this.handleExhaustion();
        }
        continue;
      }

      // Check if clone ball rolls over a road pit / hole (delik / çukur)
      let fellInPit = false;
      let pitTargetX = 0;
      let pitTargetZ = 0;
      if (segAtClone && this.isOnGround) {
        for (const obs of segAtClone.obstacles) {
          if (obs.type === 'road_pit') {
            const pitRadius = obs.width / 2;
            const dist = Math.hypot(cloneX - obs.x, cloneZ - obs.z);
            if (dist < pitRadius * 0.85) {
              fellInPit = true;
              pitTargetX = obs.x;
              pitTargetZ = obs.z;
              break;
            }
          }
        }
      }

      if (fellInPit && !this.runState.hasShield) {
        // Clone ball falls down into the hole!
        this.activeCloneBalls.splice(i, 1);
        this.runState.lives = Math.max(0, this.runState.lives - 1);
        audioService.playBallFall();
        this.callbacks.onRoadMemoryAlert(t('alert_ball_lost_pit'));

        this.fallingBalls.push({
          mesh: b.mesh,
          shadow: b.shadow,
          pos: new THREE.Vector3(cloneX, this.ballPos.y, cloneZ),
          vel: new THREE.Vector3(
            (pitTargetX - cloneX) * 3.0,
            -13.0, // pulls straight down into the chasm
            this.forwardSpeed * 0.35
          ),
          rotVel: new THREE.Vector3(
            18 + Math.random() * 8,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12
          ),
          life: 2.5
        });

        if (this.runState.lives <= 0) {
          this.handleExhaustion();
        }
        continue;
      }

      b.mesh.rotation.x += forwardDelta / ballRadius;
      b.mesh.rotation.z += (this.ballVelX * dt) / ballRadius;
      b.mesh.rotation.y = -this.ballVelX * 0.04;

      b.mesh.position.x = cloneX;
      b.mesh.position.y = this.ballPos.y;
      b.mesh.position.z = cloneZ;

      b.shadow.position.set(
        cloneX,
        Math.max(0.02, this.ballPos.y - 0.78),
        cloneZ
      );
    }

    // Update active falling balls physics
    for (let i = this.fallingBalls.length - 1; i >= 0; i--) {
      const fb = this.fallingBalls[i];
      fb.vel.y -= 36.0 * dt;
      fb.pos.addScaledVector(fb.vel, dt);
      fb.mesh.position.copy(fb.pos);
      fb.mesh.rotation.x += fb.rotVel.x * dt;
      fb.mesh.rotation.y += fb.rotVel.y * dt;
      fb.mesh.rotation.z += fb.rotVel.z * dt;

      if (fb.shadow.parent) {
        fb.shadow.position.set(fb.pos.x, 0.02, fb.pos.z);
        const sMat = fb.shadow.material as THREE.MeshBasicMaterial;
        sMat.opacity = Math.max(0, sMat.opacity - 4 * dt);
        if (sMat.opacity <= 0) {
          this.ballSquadGroup.remove(fb.shadow);
        }
      }

      fb.life -= dt;
      if (fb.life <= 0 || fb.pos.y < -35) {
        if (fb.mesh.parent) fb.mesh.parent.remove(fb.mesh);
        if (fb.shadow.parent) fb.shadow.parent.remove(fb.shadow);
        this.fallingBalls.splice(i, 1);
      }
    }

    // 5. Road Boundaries & Elevation & Real 3D Jump Physics
    const currentSegment = this.findSegmentAtZ(this.ballPos.z);
    if (currentSegment) {
      const halfWidth = currentSegment.width / 2;
      const roadCenter = 0;
      const distFromCenter = Math.abs(this.ballPos.x - roadCenter);

      // Elevation target on track (ramps, bridges)
      let targetElevation = 0.8;
      if (currentSegment.elevationY > 0) {
        const segProgress = Math.max(0, Math.min(1, (this.ballPos.z - currentSegment.zPosition) / currentSegment.length));
        targetElevation = 0.8 + Math.sin(segProgress * Math.PI) * currentSegment.elevationY;
      }

      // Vertical gravity and jump dynamics
      if (!this.isOnGround) {
        this.verticalVelocity -= 34.0 * dt;
        this.ballPos.y += this.verticalVelocity * dt;
        if (this.ballPos.y <= targetElevation) {
          this.ballPos.y = targetElevation;
          if (this.verticalVelocity < -3.0) {
            audioService.playBounce();
          }
          this.verticalVelocity = 0;
          this.isOnGround = true;
        }
      } else {
        this.ballPos.y = THREE.MathUtils.damp(this.ballPos.y, targetElevation, 16, dt);
      }

      // Narrow rail balance test (no side rails on narrow_rail!)
      const isNarrow = currentSegment.type === 'narrow_rail';
      if (isNarrow) {
        if (distFromCenter > halfWidth + 0.1) {
          if (!this.runState.abilityActive || this.activeEvolution.id !== 'COSMIC_CORE') {
            this.leadBallFall('edge');
            return;
          }
        }
      } else {
        // Standard track with glowing bumper rails
        if (distFromCenter > halfWidth - 0.25 && distFromCenter <= halfWidth + 0.6) {
          // Soft bounce inward off glowing rail
          if (this.ballPos.x > 0) {
            this.ballPos.x = halfWidth - 0.26;
            this.ballVelX = -Math.abs(this.ballVelX) * 0.4 - 3.0;
          } else {
            this.ballPos.x = -halfWidth + 0.26;
            this.ballVelX = Math.abs(this.ballVelX) * 0.4 + 3.0;
          }
          audioService.playCollision(false);
        } else if (distFromCenter > halfWidth + 0.6) {
          if (!this.runState.abilityActive || this.activeEvolution.id !== 'COSMIC_CORE') {
            this.leadBallFall('edge');
            return;
          }
        }
      }
    }

    this.ballMesh.position.copy(this.ballPos);

    // Spawn Trail Particles
    this.spawnTrailParticle();

    // 6. Magnetic Core passive & active attraction
    const isMagnetic = this.activeEvolution.id === 'MAGNETIC_CORE' || this.runState.abilityActive;
    if (isMagnetic) {
      this.attractNearbyCollectibles(isMagnetic ? 14 : 7);
    }

    // 7. Energy Drain over time (gentle survival burn: 0.6 per second, encourages collecting energy/coins!)
    this.runState.energy = Math.max(0, this.runState.energy - 0.6 * dt);
    if (this.runState.energy <= 0) {
      if (this.runState.lives && this.runState.lives > 1) {
        this.runState.lives--;
        this.respawnAtCheckpoint();
      } else {
        this.handleExhaustion();
      }
    }

    // Notify state updates every frame
    this.callbacks.onUpdateRunState(this.runState);
  }

  private attractNearbyCollectibles(radius: number) {
    for (const seg of this.activeSegments) {
      for (const item of seg.collectibles) {
        if (item.collected) continue;
        // CRITICAL: Gates (+ and - barriers, portals, checkpoints) MUST ALWAYS remain fixed on the road and NEVER be attracted!
        if (item.type !== 'COIN' && item.type !== 'ENERGY' && item.type !== 'ROAD_FRAGMENT') {
          continue;
        }

        const dx = this.ballPos.x - item.x;
        const dy = this.ballPos.y - item.y;
        const dz = this.ballPos.z - item.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < radius * radius) {
          // Pull loose items towards ball
          item.x += dx * 0.12;
          item.y += dy * 0.12;
          item.z += dz * 0.12;
          const mesh = this.collectibleMeshes.get(item.id);
          if (mesh) {
            mesh.position.set(item.x, item.y, item.z);
          }
        }
      }
    }
  }

  private updateRoadAndCollectibles(dt: number) {
    // 1. Check if we need to generate new segments ahead
    const lastSeg = this.activeSegments[this.activeSegments.length - 1];
    if (lastSeg && lastSeg.zPosition - this.ballPos.z < 260) {
      const modifiers = this.roadMemory.computeModifiers(this.ballPos.z);
      if (modifiers.transformationAlert) {
        this.callbacks.onRoadMemoryAlert(modifiers.transformationAlert);
      }
      const newSeg = this.roadGenerator.generateSegment(modifiers);
      this.spawnSegmentMesh(newSeg);
      this.activeSegments.push(newSeg);
    }

    // 2. Despawn old segments far behind the player
    while (this.activeSegments.length > 0 && this.activeSegments[0].zPosition < this.ballPos.z - 80) {
      const removed = this.activeSegments.shift()!;
      this.removeSegmentMesh(removed);
    }

    // 3. Check Collisions with Collectibles & Obstacles
    const playerRadius = 0.8;

    // Check Character Gate Crossing (+ and - barriers)
    // CRITICAL Rules:
    // 1. If lead ball is on the left side (x <= -0.9): Left Gate triggers (+ or -)!
    // 2. If lead ball is on the right side (x >= 0.9): Right Gate triggers (+ or -)!
    // 3. If lead ball rolls through the middle gap (-0.9 < x < 0.9): NEITHER gate triggers (both ineffective)!
    // 4. In ALL cases, BOTH gates in the pair are INSTANTLY ERASED & DESTROYED at crossing line!
    for (const seg of this.activeSegments) {
      const uncollectedGates = seg.collectibles.filter(c => c.type === 'CHARACTER_GATE' && !c.collected);
      if (uncollectedGates.length > 0) {
        const sampleGate = uncollectedGates[0];
        const dz = this.ballPos.z - sampleGate.z;
        if (dz >= -0.4) {
          const leftGate = uncollectedGates.find(g => g.x < 0);
          const rightGate = uncollectedGates.find(g => g.x > 0);

          let chosenGate: CollectibleItem | null = null;
          if (this.ballPos.x <= -0.9 && leftGate) {
            chosenGate = leftGate;
          } else if (this.ballPos.x >= 0.9 && rightGate) {
            chosenGate = rightGate;
          }

          if (chosenGate) {
            this.collectItem(chosenGate, seg);
          } else {
            // Passed through middle gap or neutral lane - silently purge both gates immediately
            this.purgeGatePair(sampleGate.z);
          }
        }
      }
    }

    for (const seg of this.activeSegments) {
      // Check Regular Collectibles (Coins, Energy, Fragments, Boosters, Springs, etc.)
      for (const item of seg.collectibles) {
        if (!item.collected && item.type !== 'CHARACTER_GATE') {
          const mesh = this.collectibleMeshes.get(item.id);
          if (mesh && (item.type === 'COIN' || item.type === 'ENERGY' || item.type === 'ROAD_FRAGMENT')) {
            mesh.rotation.y += 3.2 * dt;
            mesh.position.y = item.y + Math.sin(this.ballPos.z * 0.14 + item.x * 2.0) * 0.12;
          }

          const dx = this.ballPos.x - item.x;
          const dy = this.ballPos.y - item.y;
          const dz = this.ballPos.z - item.z;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < (playerRadius + 0.8) * (playerRadius + 0.8)) {
            this.collectItem(item, seg);
          }
        }
      }

      // Check Obstacles
      for (const obs of seg.obstacles) {
        if (!obs.active || obs.hit) continue;

        // Update animated side swinging hammers (Tokmak)
        // CRITICAL: Tokmak strikes from side and only hits follower squad balls to swipe them off the road. Lead ball is immune!
        if (obs.type === 'pendulum_hammer') {
          const obsMesh = this.obstacleMeshes.get(obs.id);
          if (obsMesh) {
            const pivot = obsMesh.getObjectByName('hammerPivot');
            if (pivot) {
              const side = (obs.x >= 0 ? 1 : -1);
              const sweepAngle = Math.sin(this.ballPos.z * 0.08 + obs.z * 0.05) * 1.05;
              pivot.rotation.y = side * sweepAngle;

              // Calculate world coordinates of swinging hammer head tip
              const armLength = 3.6;
              const localX = -side * armLength;
              const hammerWorldX = (side * 3.4) + localX * Math.cos(pivot.rotation.y);
              const hammerWorldZ = obs.z + localX * Math.sin(pivot.rotation.y);

              // Check collision with follower squad balls
              for (let i = this.activeCloneBalls.length - 1; i >= 0; i--) {
                const b = this.activeCloneBalls[i];
                const cloneX = this.ballPos.x + b.offsetX;
                const cloneZ = this.ballPos.z + b.offsetZ;

                if (Math.hypot(cloneX - hammerWorldX, cloneZ - hammerWorldZ) < 1.4) {
                  // Follower ball struck by the side swinging tokmak!
                  this.activeCloneBalls.splice(i, 1);
                  this.runState.lives = Math.max(0, this.runState.lives - 1);
                  audioService.playHammerWhack();
                  audioService.playBallFall();
                  this.callbacks.onRoadMemoryAlert('🔨 Yan Tokmak Topu Düşürdü! (-1 Top)');

                  const swipeDir = cloneX > hammerWorldX ? 1 : -1;
                  this.fallingBalls.push({
                    mesh: b.mesh,
                    shadow: b.shadow,
                    pos: new THREE.Vector3(cloneX, this.ballPos.y, cloneZ),
                    vel: new THREE.Vector3(swipeDir * 14.0, 5.0, this.forwardSpeed * 0.4),
                    rotVel: new THREE.Vector3(18, 0, -swipeDir * 20),
                    life: 2.5
                  });
                  this.spawnExplosionParticles(new THREE.Vector3(cloneX, this.ballPos.y, cloneZ), 0xef4444, 20);

                  if (this.runState.lives <= 0) {
                    this.handleExhaustion();
                  }
                }
              }
            }
          }
          continue; // Lead ball passes unharmed
        }

        // Update animated obstacles
        if (obs.rotationSpeed) {
          const obsMesh = this.obstacleMeshes.get(obs.id);
          if (obsMesh) {
            obsMesh.rotation.y += obs.rotationSpeed * dt;
          }
        }
        if (obs.moveSpeed && obs.moveRange) {
          obs.x = Math.sin(this.ballPos.z * 0.05) * obs.moveRange;
          const obsMesh = this.obstacleMeshes.get(obs.id);
          if (obsMesh) {
            obsMesh.position.x = obs.x;
          }
        }

        // Check Pit / Hole in the road (delik / çukur)
        if (obs.type === 'road_pit') {
          const pitRadius = obs.width / 2;
          const distToPit = Math.hypot(this.ballPos.x - obs.x, this.ballPos.z - obs.z);
          // Only falls in if ball is rolling on the road (airborne/jumping balls fly over safely!)
          if (distToPit < pitRadius * 0.82 && this.isOnGround && this.ballPos.y < 1.1) {
            this.leadBallFall('pit', obs);
          }
          continue;
        }

        // Bounding box collision test
        const inZ = Math.abs(this.ballPos.z - obs.z) < (obs.depth / 2 + playerRadius * 0.7);
        const inX = Math.abs(this.ballPos.x - obs.x) < (obs.width / 2 + playerRadius * 0.7);
        const inY = Math.abs(this.ballPos.y - obs.y) < (obs.height / 2 + playerRadius * 0.7);

        if (inZ && inX && inY) {
          this.hitObstacle(obs);
        }
      }
    }
  }

  private leadBallFall(reason: 'pit' | 'edge', pitObs?: ObstacleItem) {
    if (this.isFalling || this.isGameOverSequence) return;

    // Cosmic Core phase ability allows levitating over holes safely!
    if (this.runState.abilityActive && this.activeEvolution.id === 'COSMIC_CORE') {
      return;
    }

    // Shield protection against pit fall
    if (this.runState.hasShield) {
      this.runState.hasShield = false;
      this.shieldTimer = 0;
      audioService.playShieldDeflect();
      this.spawnExplosionParticles(this.ballPos, 0x38bdf8, 30);
      this.callbacks.onRoadMemoryAlert(t('alert_shield_protected'));
      return;
    }

    // IF WE HAVE MORE THAN 1 BALL IN THE SQUAD:
    // The fallen lead ball drops into the hole/chasm, and one follower ball seamlessly
    // steps up as the new lead ball at the front to continue the run!
    if (this.runState.lives > 1) {
      this.runState.lives--;
      audioService.playBallFall();
      this.callbacks.onRoadMemoryAlert(reason === 'pit' ? t('alert_ball_lost_pit') : t('alert_ball_lost_edge'));

      const leadPos = this.ballPos.clone();
      const fellMesh = this.ballMesh.clone();
      this.scene.add(fellMesh);

      if (reason === 'pit' && pitObs) {
        this.fallingBalls.push({
          mesh: fellMesh,
          shadow: new THREE.Mesh(),
          pos: leadPos,
          vel: new THREE.Vector3((pitObs.x - leadPos.x) * 3.5, -14.0, this.forwardSpeed * 0.35),
          rotVel: new THREE.Vector3(20, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10),
          life: 2.5
        });
        this.spawnExplosionParticles(new THREE.Vector3(pitObs.x, 0.2, pitObs.z), 0xef4444, 25);
      } else {
        this.fallingBalls.push({
          mesh: fellMesh,
          shadow: new THREE.Mesh(),
          pos: leadPos,
          vel: new THREE.Vector3(
            (leadPos.x > 0 ? 1 : -1) * (3.5 + Math.random() * 2),
            -2.0,
            this.forwardSpeed * 0.8
          ),
          rotVel: new THREE.Vector3(18, 0, (leadPos.x > 0 ? -1 : 1) * 12),
          life: 2.5
        });
        this.spawnExplosionParticles(leadPos, 0xef4444, 25);
      }

      // Promote follower ball to the front position on safe track
      if (this.activeCloneBalls.length > 0) {
        const follower = this.activeCloneBalls.shift()!;
        this.ballSquadGroup.remove(follower.mesh);
        this.ballSquadGroup.remove(follower.shadow);

        // Position new leader safely on the road
        if (reason === 'pit' && pitObs) {
          const avoidDir = this.ballPos.x > pitObs.x ? 1.4 : -1.4;
          this.ballPos.x = THREE.MathUtils.clamp(pitObs.x + avoidDir, -2.5, 2.5);
        } else {
          this.ballPos.x = 0;
        }
        this.ballPos.y = 0.8;
        this.verticalVelocity = 0;
        this.isOnGround = true;
        this.ballVelX = 0;
      }

      this.syncBallSquad();
      return;
    }

    // If last ball in squad fell:
    this.isFalling = true;
    if (reason === 'pit' && pitObs) {
      this.fallVelocity = 12.0; // Rapid downward tumble through the hole
      this.ballVelX = (pitObs.x - this.ballPos.x) * 3.5; // pulled into pit center
      audioService.playCollision(true);
      this.spawnExplosionParticles(new THREE.Vector3(pitObs.x, 0.2, pitObs.z), 0xef4444, 25);
      this.callbacks.onRoadMemoryAlert(t('alert_fell_in_pit'));
    } else {
      audioService.playCollision(true);
      this.callbacks.onRoadMemoryAlert(t('alert_all_balls_lost'));
    }
  }

  private purgeGatePair(gateZ: number) {
    this.activeSegments.forEach(s => {
      s.collectibles.forEach(col => {
        if (col.type === 'CHARACTER_GATE' && Math.abs(col.z - gateZ) < 8.0) {
          col.collected = true;
          const m = this.collectibleMeshes.get(col.id);
          if (m) {
            m.visible = false;
            m.position.set(0, -9999, 0);
            this.scene.remove(m);
            this.collectibleMeshes.delete(col.id);
          }
        }
      });
    });
  }

  private collectItem(item: CollectibleItem, segment: RoadSegment) {
    item.collected = true;
    const mesh = this.collectibleMeshes.get(item.id);
    if (mesh) {
      mesh.visible = false;
    }

    if (item.type === 'CHARACTER_GATE') {
      const isPositive = (item.gateValue || 0) > 0;
      if (isPositive) {
        audioService.playPositiveGate(); // Distinct celebratory gain chime
        this.runState.lives += item.gateValue || 0;
        this.syncBallSquad();
        this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y + 1, item.z), 0x22c55e, 25);
        this.callbacks.onRoadMemoryAlert(`+${item.gateValue} Top Eklendi!`);
        this.callbacks.onGatePass?.('green');
      } else {
        audioService.playNegativeGate(); // Distinct heavy loss tone
        const lost = Math.min(this.runState.lives, Math.abs(item.gateValue || 0));
        this.runState.lives = Math.max(0, this.runState.lives - lost);
        this.syncBallSquad();
        this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y + 1, item.z), 0xef4444, 25);
        this.callbacks.onRoadMemoryAlert(`${item.gateValue} Top Kaybedildi!`);
        this.callbacks.onGatePass?.('red');
        
        if (this.runState.lives <= 0) {
          this.handleExhaustion();
          return;
        }
      }

      // INSTANTLY erase and delete BOTH gates in this pair!
      this.purgeGatePair(item.z);
    } else if (item.type === 'COIN') {
      audioService.playCoin();
      this.runState.coinsThisRun = (this.runState.coinsThisRun || 0) + 1;
      this.runState.energy = Math.min(this.runState.maxEnergy, this.runState.energy + 3);
      this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), 0xfacc15, 14);
    } else if (item.type === 'SPEED_PAD') {
      audioService.playSpeedBoost();
      this.forwardSpeed = Math.min(52.0, this.forwardSpeed + 14.0);
      this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), 0x06b6d4, 25);
      this.callbacks.onRoadMemoryAlert('⚡ HIZ ARTIŞI (SPEED BOOST)!');
    } else if (item.type === 'JUMP_SPRING') {
      audioService.playSpring();
      this.verticalVelocity = 22.0; // High bounce launcher
      this.isOnGround = false;
      this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), 0x22c55e, 28);
      this.callbacks.onRoadMemoryAlert('🚀 ZIPLAMA RAMPASI (SPRING JUMP)!');
    } else if (item.type === 'ENERGY' && item.energyType) {
      audioService.playEnergyCollect(item.energyType);
      const conf = ENERGY_CONFIGS[item.energyType];

      // Cheerful custom alerts & particles for cute fruits
      if (item.energyType === 'RED') {
        this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), 0xef4444, 24);
        this.callbacks.onRoadMemoryAlert('🍓 NEFİS ÇİLEK TOPLANDI!');
      } else if (item.energyType === 'GREEN') {
        this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), 0x22c55e, 22);
        this.callbacks.onRoadMemoryAlert('🍏 TAZE YEŞİL ELMA TOPLANDI!');
      } else if (item.energyType === 'YELLOW') {
        this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), 0xfacc15, 22);
        this.callbacks.onRoadMemoryAlert('⭐ PARLAK ALTIN YILDIZ!');
      } else if (item.energyType === 'BLUE') {
        this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), 0x38bdf8, 22);
        this.callbacks.onRoadMemoryAlert('🫐 TATLI YABAN MERSİNİ!');
      } else if (item.energyType === 'PURPLE') {
        this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), 0xa855f7, 22);
        this.callbacks.onRoadMemoryAlert('🍇 NEFİS MOR ÜZÜM SALKIMI!');
      } else {
        this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), conf.hexColor, 18);
      }

      // Add energy
      const amount = item.energyType === 'BLUE' ? 18 : 10;
      this.runState.energy = Math.min(this.runState.maxEnergy, this.runState.energy + amount);
      this.runState.energyThisRun += 1;

      // Road Memory reaction
      const alertMsg = this.roadMemory.recordEnergyCollected(item.energyType);
      if (alertMsg) {
        this.callbacks.onRoadMemoryAlert(alertMsg);
      }
    } else if (item.type === 'ROAD_FRAGMENT') {
      audioService.playFragmentCollect();
      this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), 0xfbbf24, 28);
      this.runState.fragmentsThisRun += 1;
      this.callbacks.onRoadMemoryAlert('+1 YOL PARÇASI BULUNDU!');
      if (!this.runState.newDiscoveries.includes('Road Fragment')) {
        this.runState.newDiscoveries.push('Road Fragment');
      }
    } else if (item.type === 'CHECKPOINT') {
      audioService.playCheckpoint();
      this.runState.checkpointDistance = Math.floor(item.z);
      this.runState.checkpointWorld = segment.worldId;
      this.runState.checkpointAvailable = true;
      this.runState.energy = this.runState.maxEnergy; // Fully restore!
      this.spawnExplosionParticles(new THREE.Vector3(item.x, item.y, item.z), 0x34d399, 45);
      this.callbacks.onCheckpointReached(Math.floor(item.z));
      this.callbacks.onRoadMemoryAlert(`CHECKPOINT'E ULAŞILDI – Enerji Yenilendi!`);
    } else if (item.type === 'PORTAL' && segment.portalTargetWorld) {
      this.switchWorld(segment.portalTargetWorld, true);
      this.roadMemory.recordPortal();
    } else if (item.type === 'FINAL_GATE') {
      this.startLevelVictorySequence(item.z);
    }
  }

  private hitObstacle(obs: ObstacleItem) {
    obs.hit = true;

    // Wooden crate smashable mechanic
    if (obs.type === 'wooden_crate') {
      audioService.playWoodSmash();
      this.spawnExplosionParticles(new THREE.Vector3(obs.x, obs.y, obs.z), 0xfacc15, 30);
      this.spawnExplosionParticles(new THREE.Vector3(obs.x, obs.y, obs.z), 0xd97706, 20);
      const obsMesh = this.obstacleMeshes.get(obs.id);
      if (obsMesh) obsMesh.visible = false;
      this.runState.coinsThisRun = (this.runState.coinsThisRun || 0) + 2;
      audioService.playCoin();
      this.callbacks.onRoadMemoryAlert('📦 SANDIK PARÇALANDI! +2 Altın Kazandın!');
      this.forwardSpeed = Math.max(14.0, this.forwardSpeed - 2.5);
      return;
    }

    // Shield protection
    if (this.runState.hasShield) {
      this.runState.hasShield = false;
      this.shieldTimer = 0;
      audioService.playShieldDeflect();
      this.spawnExplosionParticles(this.ballPos, 0x38bdf8, 30);
      this.callbacks.onRoadMemoryAlert('🛡️ KALKAN KORUDU!');
      return;
    }

    // Fire Core Blazing Rush destroys obstacles without damage!
    if (this.runState.abilityActive && this.activeEvolution.id === 'FIRE_CORE') {
      audioService.playCollision(false);
      this.spawnExplosionParticles(new THREE.Vector3(obs.x, obs.y, obs.z), 0xf97316, 25);
      const obsMesh = this.obstacleMeshes.get(obs.id);
      if (obsMesh) obsMesh.visible = false;
      return;
    }

    // Cosmic Core phases right through!
    if (this.runState.abilityActive && this.activeEvolution.id === 'COSMIC_CORE') {
      return;
    }

    // Electric Core passes through electric gates automatically
    if (obs.type === 'electric_gate' && this.activeEvolution.id === 'ELECTRIC_CORE') {
      audioService.playAbility();
      this.spawnExplosionParticles(new THREE.Vector3(obs.x, obs.y, obs.z), 0xfacc15, 20);
      return;
    }

    // Lava immunity for Fire Core
    if (obs.type === 'lava_geyser' && this.activeEvolution.id === 'FIRE_CORE') {
      return;
    }

    // Standard Collision: take damage, sound, particle blast
    this.cameraShake = 0;
    audioService.playCollision(false);
    this.spawnExplosionParticles(this.ballPos, 0xff3b30, 20);
    this.roadMemory.recordCollision();

    // CRITICAL: Exactly 1 ball is lost when hitting a stone/obstacle!
    this.runState.lives = Math.max(0, this.runState.lives - 1);
    this.callbacks.onRoadMemoryAlert(obs.type === 'rock' ? '💥 Dikenli Topa Çarpıldı! -1 Top Kaybedildi' : '-1 Top Çarpışmada Kaybedildi!');

    this.syncBallSquad();

    if (this.runState.lives <= 0) {
      audioService.playCollision(true);
      this.handleExhaustion();
      return;
    }
  }

  private takeDamage(amount: number) {
    this.runState.energy = Math.max(0, this.runState.energy - amount);
    if (this.runState.energy <= 0) {
      if (this.runState.lives && this.runState.lives > 1) {
        this.runState.lives--;
        this.respawnAtCheckpoint();
      } else {
        this.handleExhaustion();
      }
    }
  }

  private respawnAtCheckpoint() {
    this.isFalling = false;
    this.fallVelocity = 0;
    this.verticalVelocity = 0;
    this.isOnGround = true;

    const respawnZ = this.runState.checkpointAvailable ? this.runState.checkpointDistance : Math.max(0, this.ballPos.z - 40);
    this.ballPos.set(0, 0.8, respawnZ);
    this.ballVelX = 0;
    this.ballMesh.position.copy(this.ballPos);

    // Give 3.5 seconds of shield invulnerability after respawn
    this.runState.hasShield = true;
    this.shieldTimer = 3.5;
    this.runState.energy = Math.max(this.runState.energy, Math.floor(this.runState.maxEnergy * 0.5));

    audioService.playCheckpoint();
    this.spawnExplosionParticles(this.ballPos, 0x38bdf8, 40);
    this.callbacks.onRoadMemoryAlert(`⚡ KALDIĞIN YERDEN DEVAM! (${this.runState.lives} Can Kaldı)`);
  }

  private handleExhaustion() {
    if (this.isGameOverSequence) return;
    this.isGameOverSequence = true;
    this.gameOverTimer = 0;
    audioService.playCollision(true);
    this.spawnExplosionParticles(this.ballPos, this.activeEvolution.hexColor || 0xffd700, 45);
    this.spawnExplosionParticles(this.ballPos, 0xef4444, 25);
    this.callbacks.onRoadMemoryAlert(t('alert_all_balls_lost'));

    // Convert any remaining clone balls to falling balls so the player visually watches them tumble / scatter!
    while (this.activeCloneBalls.length > 0) {
      const b = this.activeCloneBalls.pop();
      if (b) {
        this.fallingBalls.push({
          mesh: b.mesh,
          shadow: b.shadow,
          pos: new THREE.Vector3(this.ballPos.x + b.offsetX, this.ballPos.y, this.ballPos.z + b.offsetZ),
          vel: new THREE.Vector3(
            (b.offsetX !== 0 ? b.offsetX : (Math.random() - 0.5)) * 3.5,
            Math.random() * 2 - 1,
            this.forwardSpeed * 0.4
          ),
          rotVel: new THREE.Vector3(14, (Math.random() - 0.5) * 8, 8),
          life: 2.5
        });
      }
    }
  }

  private updateCamera(_dt: number) {
    // Completely rock-solid camera: stays strictly fixed centered on the track (x = 0, y = 4.2)
    // Synchronized forward smoothly along Z with the ball.
    // Zero swaying, zero tilting/roll, zero horizontal jitter. The road and horizon stay stable!
    this.camera.position.x = 0;
    this.camera.position.y = 4.2;
    this.camera.position.z = this.ballPos.z + this.cameraOffset.z;

    this.cameraLookTarget.set(0, 1.2, this.ballPos.z + 16);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.cameraLookTarget);

    // Sync Sky Dome, Sun & Clouds with forward progression
    if (this.skyDome) {
      this.skyDome.position.z = this.ballPos.z;
    }
    if (this.sunGroup) {
      this.sunGroup.position.z = this.ballPos.z + 180;
    }
    for (const cloud of this.cloudList) {
      cloud.group.position.x += cloud.speed * _dt;
      // Recycle cloud ahead if it falls behind the camera
      if (cloud.group.position.z < this.ballPos.z - 60) {
        cloud.group.position.z += 340;
        cloud.group.position.y = 14 + Math.random() * 20;
        const isLeft = Math.random() < 0.5;
        cloud.group.position.x = isLeft ? -(22 + Math.random() * 26) : (22 + Math.random() * 26);
      }
    }
  }

  private findSegmentAtZ(z: number): RoadSegment | undefined {
    for (const s of this.activeSegments) {
      if (z >= s.zPosition - 1.0 && z <= s.zPosition + s.length + 1.0) {
        return s;
      }
    }
    return this.activeSegments[0];
  }

  // --- 3D Mesh Spawning Helpers ---

  private spawnSegmentMesh(segment: RoadSegment) {
    const group = new THREE.Group();
    group.position.set(0, 0, segment.zPosition);

    const worldConfig = WORLDS[segment.worldId] || WORLDS.GREEN_VALLEY;
    const activeRoadColor = this.currentLevelConfig ? this.currentLevelConfig.roadColor : worldConfig.roadColor;
    const activeEdgeColor = this.currentLevelConfig ? this.currentLevelConfig.roadEdgeColor : worldConfig.roadEdgeColor;

    // Road Surface Ribbon (Vibrant vivid colors with 0.02 metalness so they never darken or dull)
    const halfWidth = segment.width / 2;
    const geom = new THREE.PlaneGeometry(segment.width, segment.length, 1, 1);
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, 0, segment.length / 2);

    const roadMat = new THREE.MeshStandardMaterial({
      color: segment.type === 'lava_pool' ? 0x27070a : activeRoadColor,
      roughness: 0.35,
      metalness: 0.02,
    });
    const roadMesh = new THREE.Mesh(geom, roadMat);
    group.add(roadMesh);

    // Glowing Edge Rails (Omitted on narrow balance rails so player can fall off if not careful!)
    if (segment.type !== 'narrow_rail') {
      const railGeom = new THREE.BoxGeometry(0.35, 0.45, segment.length);
      railGeom.translate(0, 0.22, segment.length / 2);
      const railMat = new THREE.MeshBasicMaterial({ color: activeEdgeColor });

      const leftRail = new THREE.Mesh(railGeom, railMat);
      leftRail.position.x = -halfWidth;
      group.add(leftRail);

      const rightRail = new THREE.Mesh(railGeom, railMat);
      rightRail.position.x = halfWidth;
      group.add(rightRail);
    }

    // Speed Boost Track Chevrons
    if (segment.type === 'speed_boost_track') {
      for (let zOff = 4; zOff < segment.length - 4; zOff += 8) {
        const chevron = new THREE.Mesh(
          new THREE.ConeGeometry(0.9, 1.8, 3),
          new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
        );
        chevron.rotateX(-Math.PI / 2);
        chevron.position.set(0, 0.05, zOff);
        group.add(chevron);
      }
    }

    // Center divider dash line
    const dashGeom = new THREE.PlaneGeometry(0.25, segment.length * 0.7);
    dashGeom.rotateX(-Math.PI / 2);
    dashGeom.translate(0, 0.01, segment.length / 2);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
    const dashMesh = new THREE.Mesh(dashGeom, dashMat);
    group.add(dashMesh);

    // Split Path Signage
    if (segment.type === 'split_path') {
      const divider = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.2, segment.length * 0.8),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
      );
      divider.position.set(0, 0.6, segment.length / 2);
      group.add(divider);

      // Warning markers
      const safeSign = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.6, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      safeSign.position.set(-halfWidth * 0.5, 1.6, segment.length * 0.2);
      group.add(safeSign);

      const riskSign = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.6, 0.2),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      riskSign.position.set(halfWidth * 0.5, 1.6, segment.length * 0.2);
      group.add(riskSign);
    }

    // Checkpoint Arch Mesh
    if (segment.type === 'checkpoint') {
      const arch = this.createCheckpointArch(worldConfig.roadEdgeColor);
      arch.position.set(0, 0, segment.length / 2);
      group.add(arch);
    }

    // Portal Vortex Mesh
    if (segment.type === 'portal') {
      const portal = this.createPortalVortex();
      portal.position.set(0, 2.5, segment.length / 2);
      group.add(portal);
    }

    // Final Gate Monument
    if (segment.type === 'final_gate') {
      const finalGate = this.createFinalGateMesh(worldConfig.roadEdgeColor);
      finalGate.position.set(0, 0, 32);
      group.add(finalGate);
      this.finalGateZ = segment.zPosition + 32;
    }

    this.scene.add(group);
    this.segmentMeshes.set(segment.id, group);

    // Spawn Collectibles in Scene
    for (const item of segment.collectibles) {
      this.spawnCollectibleMesh(item);
    }

    // Spawn Obstacles in Scene
    for (const obs of segment.obstacles) {
      this.spawnObstacleMesh(obs);
    }
  }

  private createCheckpointArch(color: number): THREE.Group {
    const arch = new THREE.Group();
    const pillarGeom = new THREE.CylinderGeometry(0.4, 0.6, 6, 12);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });

    const leftPillar = new THREE.Mesh(pillarGeom, pillarMat);
    leftPillar.position.set(-4.5, 3, 0);
    arch.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeom, pillarMat);
    rightPillar.position.set(4.5, 3, 0);
    arch.add(rightPillar);

    const crossbeamGeom = new THREE.BoxGeometry(10, 0.8, 0.8);
    const crossbeamMat = new THREE.MeshBasicMaterial({ color });
    const crossbeam = new THREE.Mesh(crossbeamGeom, crossbeamMat);
    crossbeam.position.set(0, 5.8, 0);
    arch.add(crossbeam);

    return arch;
  }

  private createPortalVortex(): THREE.Group {
    const portal = new THREE.Group();
    const ringGeom = new THREE.TorusGeometry(3.2, 0.35, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    portal.add(ring);

    const innerDisc = new THREE.Mesh(
      new THREE.CircleGeometry(2.9, 32),
      new THREE.MeshBasicMaterial({ color: 0x3b0764, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    portal.add(innerDisc);

    return portal;
  }

  private createFinalGateMesh(color: number): THREE.Group {
    const gate = new THREE.Group();

    // Twin Monumental Monolith Pillars
    const pillarGeom = new THREE.BoxGeometry(1.2, 9.0, 1.2);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      metalness: 0.85,
      roughness: 0.15
    });

    const leftPillar = new THREE.Mesh(pillarGeom, pillarMat);
    leftPillar.position.set(-5.5, 4.5, 0);
    gate.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeom, pillarMat);
    rightPillar.position.set(5.5, 4.5, 0);
    gate.add(rightPillar);

    // Glowing Golden Inlays on the pillars
    const glowBandGeom = new THREE.BoxGeometry(0.3, 8.5, 1.25);
    const glowBandMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const leftGlow = new THREE.Mesh(glowBandGeom, glowBandMat);
    leftGlow.position.set(-5.5, 4.5, 0);
    gate.add(leftGlow);

    const rightGlow = new THREE.Mesh(glowBandGeom, glowBandMat);
    rightGlow.position.set(5.5, 4.5, 0);
    gate.add(rightGlow);

    // Grand Top Arch Beam
    const archGeom = new THREE.BoxGeometry(12.5, 1.4, 1.6);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x312e81,
      metalness: 0.8,
      roughness: 0.2
    });
    const arch = new THREE.Mesh(archGeom, archMat);
    arch.position.set(0, 8.8, 0);
    gate.add(arch);

    // Top Glowing Crown Sign
    const crownGeom = new THREE.BoxGeometry(6.0, 0.5, 0.4);
    const crownMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const crown = new THREE.Mesh(crownGeom, crownMat);
    crown.position.set(0, 9.8, 0);
    gate.add(crown);

    // Glowing Golden/Yellow Outer Ring (Sarı Halka - standing upright at center y = 4.0)
    const yellowRingGeom = new THREE.TorusGeometry(3.6, 0.38, 16, 48);
    const yellowRingMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.8
    });
    const yellowRing = new THREE.Mesh(yellowRingGeom, yellowRingMat);
    yellowRing.position.set(0, 4.0, 0);
    gate.add(yellowRing);

    // Vertical Upright Vacuum Portal Hole (Inside the Yellow Ring)
    const vortexHole = new THREE.Group();
    vortexHole.position.set(0, 4.0, 0);

    // Inner bright cyan energy border ring
    const holeBorderRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.15, 16, 40),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    vortexHole.add(holeBorderRing);

    // Swirling dark cosmic vortex disc (Facing forward towards incoming balls)
    const spiralDisc = new THREE.Mesh(
      new THREE.CircleGeometry(3.1, 32),
      new THREE.MeshBasicMaterial({
        color: 0x1e0836,
        side: THREE.DoubleSide
      })
    );
    spiralDisc.position.z = -0.05;
    vortexHole.add(spiralDisc);

    // Glowing central singularity core inside the yellow ring
    const singularityCore = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      })
    );
    singularityCore.position.z = 0.02;
    vortexHole.add(singularityCore);

    // Glowing warm golden/cyan light radiating from inside the ring
    const holeLight = new THREE.PointLight(0xfacc15, 4.0, 25);
    holeLight.position.set(0, 0, 0.6);
    vortexHole.add(holeLight);

    gate.add(vortexHole);
    this.finalVortexHole = vortexHole;
    this.finalGateMesh = gate;

    return gate;
  }

  private startLevelVictorySequence(gateZ?: number) {
    if (this.isLevelWon) return;
    this.isLevelWon = true;
    this.runState.isLevelWon = true;
    this.victoryTimer = 0;
    if (gateZ) this.finalGateZ = gateZ;

    // Cut input
    this.keyLeft = false;
    this.keyRight = false;
    this.virtualLeft = false;
    this.virtualRight = false;
    this.pointerSteer = 'none';
    this.isPointerActive = false;

    // Victory sound & vacuum vortex suction audio
    audioService.playVacuumSuction();
    this.callbacks.onRoadMemoryAlert('★ BÖLÜM TAMAMLANDI! TÜM TOPLAR SARI HALKADAKİ DELİĞE VAKUMLANIYOR... ★');
  }

  private updateVictorySequence(dt: number) {
    this.victoryTimer += dt;
    const gateZ = this.finalGateZ ?? (this.ballPos.z + 5);

    // Spin the vortex disc inside the yellow ring
    if (this.finalVortexHole) {
      this.finalVortexHole.rotation.z += 12.0 * dt;
    }

    // Phase 1: Vacuum Suction Phase (0.0s to 1.8s) - Balls fly FORWARD into the upright yellow ring hole
    if (this.victoryTimer < 1.8) {
      const suctionProgress = this.victoryTimer / 1.7;

      // 1. Vacuum Lead Ball FORWARD into the upright yellow ring at (0, 4.0, gateZ)
      this.ballPos.z = THREE.MathUtils.damp(this.ballPos.z, gateZ + 1.2, 7, dt);
      this.ballPos.x = THREE.MathUtils.damp(this.ballPos.x, 0, 10, dt);
      this.ballPos.y = THREE.MathUtils.damp(this.ballPos.y, 4.0, 6, dt);
      this.ballMesh.position.copy(this.ballPos);

      this.ballSphere.rotation.z += 28 * dt;
      this.ballSphere.rotation.y += 34 * dt;
      this.ballSphere.rotation.x += 20 * dt;

      const leadScale = Math.max(0.001, 1.0 - suctionProgress);
      this.ballMesh.scale.set(leadScale, leadScale, leadScale);
      if (this.mainBallShadow) {
        (this.mainBallShadow.material as THREE.MeshBasicMaterial).opacity = leadScale * 0.6;
      }

      // 2. Vacuum ALL Follower Clone Balls FORWARD into the upright yellow ring hole
      for (let i = 0; i < this.activeCloneBalls.length; i++) {
        const b = this.activeCloneBalls[i];
        const cloneProgress = Math.min(1.0, (this.victoryTimer + i * 0.05) / 1.7);
        const cloneScale = Math.max(0.001, 1.0 - cloneProgress);
        b.mesh.scale.set(cloneScale, cloneScale, cloneScale);
        b.mesh.position.x = THREE.MathUtils.damp(b.mesh.position.x, 0, 9, dt);
        b.mesh.position.z = THREE.MathUtils.damp(b.mesh.position.z, gateZ + 1.2, 7, dt);
        b.mesh.position.y = THREE.MathUtils.damp(b.mesh.position.y, 4.0, 6, dt);
        b.mesh.rotation.x += 24 * dt;
        b.mesh.rotation.y += 30 * dt;
        (b.shadow.material as THREE.MeshBasicMaterial).opacity = cloneScale * 0.5;
      }

      // Swirling suction stardust particles flying forward into the yellow ring
      if (Math.random() < 0.9) {
        this.spawnExplosionParticles(new THREE.Vector3(
          (Math.random() - 0.5) * 2.0,
          4.0 + (Math.random() - 0.5) * 2.0,
          gateZ - 1.0 + Math.random() * 2.0
        ), 0xfacc15, 3);
        this.spawnExplosionParticles(new THREE.Vector3(
          (Math.random() - 0.5) * 2.0,
          4.0 + (Math.random() - 0.5) * 2.0,
          gateZ - 1.0 + Math.random() * 2.0
        ), 0x38bdf8, 2);
      }
    } else if (this.victoryTimer < 1.9) {
      // All balls completely vanished through the yellow ring!
      this.ballMesh.visible = false;
      this.activeCloneBalls.forEach(b => {
        b.mesh.visible = false;
        b.shadow.visible = false;
      });
      if (this.victoryTimer - dt < 1.8) {
        audioService.playLevelWon();
        this.spawnExplosionParticles(new THREE.Vector3(0, 4.0, gateZ), 0xfacc15, 50);
        this.spawnExplosionParticles(new THREE.Vector3(0, 4.0, gateZ), 0x38bdf8, 40);
      }
    }

    // Keep black hole wide open and swirling inside the yellow ring (never closes or reveals road behind)
    if (this.finalVortexHole) {
      this.finalVortexHole.visible = true;
      this.finalVortexHole.scale.set(1.0, 1.0, 1.0);
    }

    // Keep camera stable, looking forward at the glowing yellow ring portal
    this.camera.position.set(0, 4.2, gateZ - 8.5);
    this.cameraLookTarget.set(0, 4.0, gateZ + 2.0);
    this.camera.lookAt(this.cameraLookTarget);

    // Update particles in the background
    this.updateParticles(dt);

    // Phase 2: At 2.0s, vacuum is done and portal is open -> Level Victory screen pops up!
    if (this.victoryTimer >= 2.0) {
      this.isRunning = false;
      const isLastLevel = this.currentLevel >= GAME_LEVELS.length;
      this.callbacks.onLevelWon({
        level: this.currentLevel,
        distance: Math.floor(this.ballPos.z),
        energy: Math.floor(this.runState.energy),
        fragments: this.runState.fragmentsThisRun,
        isLastLevel
      });
    }
  }

  private spawnCollectibleMesh(item: CollectibleItem) {
    const group = new THREE.Group();
    group.position.set(item.x, item.y, item.z);

    if (item.type === 'COIN') {
      const coin = this.createCoinMesh();
      group.add(coin);
    } else if (item.type === 'SPEED_PAD') {
      // Cyan Speed Boost Chevron Pad
      const padGeom = new THREE.BoxGeometry(2.4, 0.08, 3.2);
      const padMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const pad = new THREE.Mesh(padGeom, padMat);
      group.add(pad);

      const arrow = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 1.6, 3),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      arrow.rotateX(-Math.PI / 2);
      arrow.position.set(0, 0.06, 0);
      group.add(arrow);
    } else if (item.type === 'JUMP_SPRING') {
      // Green Trampoline Bounce Pad
      const baseGeom = new THREE.CylinderGeometry(1.1, 1.2, 0.15, 20);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const base = new THREE.Mesh(baseGeom, baseMat);
      group.add(base);

      const springDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.1, 20),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      springDisc.position.y = 0.12;
      group.add(springDisc);
    } else if (item.type === 'ENERGY' && item.energyType) {
      // Cute 3D Colorful Fruit & Star Models
      if (item.energyType === 'RED') {
        const strawberry = this.createStrawberryMesh();
        group.add(strawberry);
      } else if (item.energyType === 'GREEN') {
        const apple = this.createGreenAppleMesh();
        group.add(apple);
      } else if (item.energyType === 'YELLOW') {
        const star = this.createGoldenStarMesh();
        group.add(star);
      } else if (item.energyType === 'BLUE') {
        const berry = this.createBlueberryMesh();
        group.add(berry);
      } else if (item.energyType === 'PURPLE') {
        const grapes = this.createGrapeMesh();
        group.add(grapes);
      }
    } else if (item.type === 'ROAD_FRAGMENT') {
      const fragment = this.createRoadFragmentMesh();
      group.add(fragment);
    } else if (item.type === 'CHARACTER_GATE') {
      const isPositive = (item.gateValue || 0) > 0;
      const text = isPositive ? `+${item.gateValue}` : `${item.gateValue}`;
      
      // Vertical metallic side pillars
      const pillarGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.0, 12);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.2
      });
      
      const leftPillar = new THREE.Mesh(pillarGeom, pillarMat);
      leftPillar.position.set(-1.1, 1.0, 0);
      group.add(leftPillar);
      
      const rightPillar = new THREE.Mesh(pillarGeom, pillarMat);
      rightPillar.position.set(1.1, 1.0, 0);
      group.add(rightPillar);

      // Top arch beam
      const topBeam = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.12, 0.14),
        pillarMat
      );
      topBeam.position.set(0, 2.0, 0);
      group.add(topBeam);
      
      // Clean Double-Sided Neon Gate Banner
      const texture = this.createGateTexture(text, isPositive);
      const boardGeom = new THREE.PlaneGeometry(2.1, 1.25);
      const boardMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      const board = new THREE.Mesh(boardGeom, boardMat);
      board.position.set(0, 1.15, 0);
      group.add(board);
      
      // Colored Glow Point Light
      const gateLight = new THREE.PointLight(isPositive ? 0x22c55e : 0xef4444, 2.5, 7);
      gateLight.position.set(0, 1.15, 0);
      group.add(gateLight);
    }

    this.scene.add(group);
    this.collectibleMeshes.set(item.id, group);
  }

  private spawnObstacleMesh(obs: ObstacleItem) {
    const group = new THREE.Group();
    group.position.set(obs.x, obs.y, obs.z);

    let geom: THREE.BufferGeometry;
    let mat: THREE.Material;

    if (obs.type === 'wooden_crate') {
      // High-resolution polished cedar crate with golden brackets (no muddy brown)
      geom = new THREE.BoxGeometry(obs.width, obs.height, obs.depth);
      mat = new THREE.MeshStandardMaterial({
        color: 0xd97706, // Warm vibrant amber wood
        roughness: 0.4,
        metalness: 0.15
      });
      const crateMesh = new THREE.Mesh(geom, mat);
      group.add(crateMesh);

      // Gold corner bands & hazard rivets
      const trimGeom = new THREE.BoxGeometry(obs.width * 1.04, obs.height * 0.16, obs.depth * 1.04);
      const trimMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.9,
        roughness: 0.2
      });
      const topTrim = new THREE.Mesh(trimGeom, trimMat);
      topTrim.position.y = obs.height * 0.38;
      group.add(topTrim);

      const botTrim = new THREE.Mesh(trimGeom, trimMat);
      botTrim.position.y = -obs.height * 0.38;
      group.add(botTrim);

      // Stylized hazard cross
      const crossGeom = new THREE.BoxGeometry(obs.width * 0.82, 0.14, obs.depth * 1.05);
      const crossMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 });
      const cross1 = new THREE.Mesh(crossGeom, crossMat);
      cross1.rotation.z = Math.PI / 4;
      group.add(cross1);
      const cross2 = new THREE.Mesh(crossGeom, crossMat);
      cross2.rotation.z = -Math.PI / 4;
      group.add(cross2);
    } else if (obs.type === 'pendulum_hammer') {
      // Single Side Hammer (Sağdan veya soldan vuran, üstünde demir çubukları olmayan tek tokmak)
      const side = (obs.x >= 0 ? 1 : -1); // +1 = Right side of road, -1 = Left side of road
      
      // Heavy Side Base Pedestal on track border (y = 1.0)
      const baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.7, 2.0, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 })
      );
      baseMesh.position.set(side * 3.4, 1.0, 0);
      group.add(baseMesh);

      // Warning ring around base pedestal
      const ringMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.68, 0.08, 12, 24),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.2 })
      );
      ringMesh.rotateX(Math.PI / 2);
      ringMesh.position.set(side * 3.4, 0.1, 0);
      group.add(ringMesh);

      // Side Pivot Group at pedestal top (y = 1.2)
      const pivotGroup = new THREE.Group();
      pivotGroup.name = 'hammerPivot';
      pivotGroup.position.set(side * 3.4, 1.2, 0);

      // Horizontal swinging arm rod extending inward across road
      const armLength = 3.6;
      const armRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, armLength, 12),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.95, roughness: 0.15 })
      );
      armRod.rotateZ(-side * (Math.PI / 2));
      armRod.position.x = -side * (armLength / 2);
      pivotGroup.add(armRod);

      // Heavy Red Tokmak Mallet Head at arm tip
      const hammerHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 2.0, 18),
        new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          metalness: 0.75,
          roughness: 0.2,
          emissive: 0x991b1b,
          emissiveIntensity: 0.35
        })
      );
      hammerHead.rotateX(Math.PI / 2);
      hammerHead.position.x = -side * armLength;
      pivotGroup.add(hammerHead);

      // Steel Striker Face Plates on front/back of the tokmak head
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 });
      const plateGeom = new THREE.CylinderGeometry(0.9, 0.9, 0.15, 18);
      plateGeom.rotateX(Math.PI / 2);

      const frontPlate = new THREE.Mesh(plateGeom, plateMat);
      frontPlate.position.set(-side * armLength, 0, 0.95);
      pivotGroup.add(frontPlate);

      const backPlate = new THREE.Mesh(plateGeom, plateMat);
      backPlate.position.set(-side * armLength, 0, -0.95);
      pivotGroup.add(backPlate);

      // Red warning glow light on hammer head
      const hammerLight = new THREE.PointLight(0xef4444, 2.0, 5);
      hammerLight.position.set(-side * armLength, 0, 0);
      pivotGroup.add(hammerLight);

      group.add(pivotGroup);
    } else if (obs.type === 'rotating_beam') {
      geom = new THREE.BoxGeometry(obs.width, obs.height, obs.depth);
      mat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.7 });
      group.add(new THREE.Mesh(geom, mat));
    } else if (obs.type === 'ice_block') {
      geom = new THREE.BoxGeometry(obs.width, obs.height, obs.depth);
      mat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.75, roughness: 0.1 });
      group.add(new THREE.Mesh(geom, mat));
    } else if (obs.type === 'electric_gate') {
      geom = new THREE.BoxGeometry(obs.width, obs.height, obs.depth);
      mat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true });
      group.add(new THREE.Mesh(geom, mat));
    } else if (obs.type === 'lava_geyser') {
      geom = new THREE.CylinderGeometry(obs.width / 2, obs.width / 2, obs.height, 16);
      mat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      group.add(new THREE.Mesh(geom, mat));
    } else if (obs.type === 'road_pit') {
      // 3D Road Hole / Pit (Delik / Çukur)
      const pitRadius = obs.width / 2;

      // 1. Dark bottomless void cylinder shaft extending downwards through the road
      const shaftGeom = new THREE.CylinderGeometry(pitRadius * 0.94, pitRadius * 0.94, 6.0, 32, 1, true);
      const shaftMat = new THREE.MeshBasicMaterial({
        color: 0x030712,
        side: THREE.BackSide,
        depthWrite: true
      });
      const shaft = new THREE.Mesh(shaftGeom, shaftMat);
      shaft.position.y = -3.0;
      group.add(shaft);

      // 2. Pure Black Void Opening Disc at road surface level (sharp contrast against road)
      const voidDiscGeom = new THREE.CircleGeometry(pitRadius * 0.92, 32);
      voidDiscGeom.rotateX(-Math.PI / 2);
      const voidDiscMat = new THREE.MeshBasicMaterial({ color: 0x000000, depthWrite: true });
      const voidDisc = new THREE.Mesh(voidDiscGeom, voidDiscMat);
      voidDisc.position.y = 0.03;
      group.add(voidDisc);

      // 3. Thick Warning Hazard Border Ring around the pit mouth
      const rimGeom = new THREE.TorusGeometry(pitRadius * 0.94, 0.16, 14, 32);
      rimGeom.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xf97316, // Vibrant safety amber-orange
        roughness: 0.25,
        metalness: 0.0,
        emissive: 0xd97706,
        emissiveIntensity: 0.4
      });
      const rim = new THREE.Mesh(rimGeom, rimMat);
      rim.position.y = 0.04;
      group.add(rim);

      // 4. Hazard Studs / Warning Clamps around the rim (4 danger brackets)
      for (let s = 0; s < 4; s++) {
        const angle = (s * Math.PI) / 2;
        const studGeom = new THREE.BoxGeometry(0.24, 0.12, 0.44);
        const studMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.2 });
        const stud = new THREE.Mesh(studGeom, studMat);
        stud.position.set(Math.cos(angle) * (pitRadius * 0.94), 0.06, Math.sin(angle) * (pitRadius * 0.94));
        stud.rotation.y = -angle;
        group.add(stud);
      }

      // 5. Danger Glow Beacon Light slightly inside the hole
      const pitLight = new THREE.PointLight(0xef4444, 2.0, 6.0);
      pitLight.position.set(0, -0.4, 0);
      group.add(pitLight);
    } else {
      // Spiked Ball Obstacle (Dikenli Top Engeli)
      const radius = Math.max(0.7, obs.width / 2);
      const spikedBall = this.createSpikedBallMesh(radius);
      spikedBall.position.y = radius * 0.85; // Sit cleanly on the road surface
      group.add(spikedBall);
    }

    this.scene.add(group);
    this.obstacleMeshes.set(obs.id, group);
  }

  private removeSegmentMesh(segment: RoadSegment) {
    const meshGroup = this.segmentMeshes.get(segment.id);
    if (meshGroup) {
      this.scene.remove(meshGroup);
      this.segmentMeshes.delete(segment.id);
    }
    for (const item of segment.collectibles) {
      const cMesh = this.collectibleMeshes.get(item.id);
      if (cMesh) {
        this.scene.remove(cMesh);
        this.collectibleMeshes.delete(item.id);
      }
    }
    for (const obs of segment.obstacles) {
      const oMesh = this.obstacleMeshes.get(obs.id);
      if (oMesh) {
        this.scene.remove(oMesh);
        this.obstacleMeshes.delete(obs.id);
      }
    }
  }

  private clearAllSegments() {
    this.segmentMeshes.forEach(mesh => this.scene.remove(mesh));
    this.segmentMeshes.clear();
    this.collectibleMeshes.forEach(mesh => this.scene.remove(mesh));
    this.collectibleMeshes.clear();
    this.obstacleMeshes.forEach(mesh => this.scene.remove(mesh));
    this.obstacleMeshes.clear();
    this.activeSegments = [];
  }

  // --- Particle Systems ---

  private initAtmosphericParticles() {
    const particleCount = 200;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = Math.random() * 25;
      positions[i + 2] = (Math.random() - 0.5) * 150;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      transparent: true,
      opacity: 0.6
    });

    this.envParticles = new THREE.Points(geom, mat);
    this.scene.add(this.envParticles);
  }

  private spawnTrailParticle() {
    // Limit active particles to 40 for performance
    if (this.particlePool.length > 40) {
      const old = this.particlePool.shift()!;
      this.scene.remove(old);
    }

    const pGeom = new THREE.SphereGeometry(0.18, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({
      color: this.activeTrail.hexColor,
      transparent: true,
      opacity: 0.8
    });
    const p = new THREE.Mesh(pGeom, pMat);
    p.position.copy(this.ballPos);
    p.position.y -= 0.3;
    p.position.z -= 0.5;

    this.scene.add(p);
    this.particlePool.push(p);
  }

  private spawnExplosionParticles(pos: THREE.Vector3, color: number, count: number) {
    for (let i = 0; i < count; i++) {
      if (this.particlePool.length > 70) {
        const old = this.particlePool.shift()!;
        this.scene.remove(old);
      }
      const geom = new THREE.SphereGeometry(0.2, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const p = new THREE.Mesh(geom, mat);
      p.position.copy(pos);
      p.userData = {
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          Math.random() * 12 + 2,
          (Math.random() - 0.5) * 14
        ),
        life: 1.0
      };
      this.scene.add(p);
      this.particlePool.push(p);
    }
  }

  private updateParticles(dt: number) {
    // Environmental floating particles follow camera
    if (this.envParticles) {
      this.envParticles.position.z = this.ballPos.z;
    }

    // Dynamic Trail and Burst Particles
    for (let i = this.particlePool.length - 1; i >= 0; i--) {
      const p = this.particlePool[i];
      const mat = p.material as THREE.MeshBasicMaterial;

      if (p.userData.vel) {
        p.position.addScaledVector(p.userData.vel, dt);
        p.userData.vel.y -= 25 * dt; // gravity
        p.userData.life -= dt * 2.2;
        mat.opacity = Math.max(0, p.userData.life);

        if (p.userData.life <= 0) {
          this.scene.remove(p);
          this.particlePool.splice(i, 1);
        }
      } else {
        // Trail particle fade
        mat.opacity -= dt * 3.5;
        p.scale.multiplyScalar(0.96);
        if (mat.opacity <= 0.05) {
          this.scene.remove(p);
          this.particlePool.splice(i, 1);
        }
      }
    }
  }

  private createGateTexture(text: string, isPositive: boolean): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Flip canvas horizontally to compensate for Three.js PlaneGeometry back-face UV mapping
    ctx.save();
    ctx.translate(512, 0);
    ctx.scale(-1, 1);

    // Pure solid rounded background with clean arcade gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    if (isPositive) {
      grad.addColorStop(0, '#22c55e'); // Vibrant emerald green top
      grad.addColorStop(1, '#15803d'); // Deep green bottom
    } else {
      grad.addColorStop(0, '#ef4444'); // Vibrant red top
      grad.addColorStop(1, '#b91c1c'); // Deep red bottom
    }
    ctx.fillStyle = grad;
    
    ctx.beginPath();
    ctx.roundRect(12, 12, 488, 232, 28);
    ctx.fill();

    // Clean neon border
    ctx.lineWidth = 10;
    ctx.strokeStyle = isPositive ? '#86efac' : '#fca5a5';
    ctx.stroke();

    // High contrast white text with sharp outline
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 124px sans-serif';

    // Dark soft shadow
    ctx.lineWidth = 14;
    ctx.strokeStyle = isPositive ? '#14532d' : '#450a0a';
    ctx.strokeText(text, 256, 128);

    // Pure white text fill
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 256, 128);

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private createSpikedBallMesh(radius: number): THREE.Group {
    const spikedGroup = new THREE.Group();

    // 1. Core Heavy Iron Sphere (Gri Demir Top Gövdesi)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.25
    });
    const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.8, 24, 24), coreMat);
    spikedGroup.add(coreMesh);

    // 2. Sharp Steel Spikes (Keskin Metal Dikenler)
    const spikeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15
    });
    const spikeGeom = new THREE.ConeGeometry(radius * 0.22, radius * 0.75, 8);
    // Point cone outwards (cone default points along +Y, rotate to point along +Z)
    spikeGeom.rotateX(Math.PI / 2);

    // Distribute 18 sharp spikes evenly using Fibonacci sphere mapping
    const spikeCount = 18;
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    for (let i = 0; i < spikeCount; i++) {
      const z = 1 - (i / (spikeCount - 1)) * 2;
      const rAtZ = Math.sqrt(Math.max(0, 1 - z * z));
      const theta = (2 * Math.PI * i) / phi;

      const x = rAtZ * Math.cos(theta);
      const y = rAtZ * Math.sin(theta);

      const dir = new THREE.Vector3(x, y, z).normalize();
      const spikeMesh = new THREE.Mesh(spikeGeom, spikeMat);

      // Position spike base on core surface and tip pointing outward
      spikeMesh.position.copy(dir.clone().multiplyScalar(radius * 0.75));
      spikeMesh.lookAt(dir.clone().multiplyScalar(radius * 2.0));
      spikedGroup.add(spikeMesh);
    }

    // 3. Red warning core glow
    const warningLight = new THREE.PointLight(0xef4444, 1.2, 4.0);
    warningLight.position.set(0, 0, 0);
    spikedGroup.add(warningLight);

    return spikedGroup;
  }

  private getDenseSquadOffset(index: number): { x: number; z: number } {
    // Ball radius is 0.8 -> diameter 1.6
    // Exact equilateral honeycomb packing: balls touch at perimeter with distance 1.61 (dx=0.805, dz=1.394)
    const TIGHT_OFFSETS = [
      // Row 1 (2 balls): tucked right behind lead ball, touching it and each other
      { x: -0.805, z: -1.394 },
      { x: 0.805, z: -1.394 },
      // Row 2 (3 balls): nestled in the pockets of Row 1
      { x: 0.0, z: -2.788 },
      { x: -1.61, z: -2.788 },
      { x: 1.61, z: -2.788 },
      // Row 3 (4 balls): nestled in the pockets of Row 2
      { x: -0.805, z: -4.182 },
      { x: 0.805, z: -4.182 },
      { x: -2.415, z: -4.182 },
      { x: 2.415, z: -4.182 },
      // Row 4 (3 balls): nestled in Row 3
      { x: 0.0, z: -5.576 },
      { x: -1.61, z: -5.576 },
      { x: 1.61, z: -5.576 },
      // Row 5 (4 balls): nestled in Row 4
      { x: -0.805, z: -6.970 },
      { x: 0.805, z: -6.970 },
      { x: -2.415, z: -6.970 },
      { x: 2.415, z: -6.970 },
      // Row 6 (3 balls)
      { x: 0.0, z: -8.364 },
      { x: -1.61, z: -8.364 },
      { x: 1.61, z: -8.364 },
      // Row 7 (4 balls)
      { x: -0.805, z: -9.758 },
      { x: 0.805, z: -9.758 },
      { x: -2.415, z: -9.758 },
      { x: 2.415, z: -9.758 },
      // Row 8 (3 balls)
      { x: 0.0, z: -11.152 },
      { x: -1.61, z: -11.152 },
      { x: 1.61, z: -11.152 },
      // Row 9 (4 balls)
      { x: -0.805, z: -12.546 },
      { x: 0.805, z: -12.546 },
      { x: -2.415, z: -12.546 },
      { x: 2.415, z: -12.546 }
    ];

    if (index < TIGHT_OFFSETS.length) {
      return TIGHT_OFFSETS[index];
    }
    const extraRow = Math.floor((index - TIGHT_OFFSETS.length) / 3) + 10;
    const col = (index - TIGHT_OFFSETS.length) % 3;
    const xs = [-1.61, 0.0, 1.61];
    return { x: xs[col], z: -(extraRow * 1.394) };
  }

  private syncBallSquad() {
    const totalBalls = Math.max(0, this.runState.lives);
    const targetClones = Math.max(0, totalBalls - 1);
    const currentClones = this.activeCloneBalls.length;

    if (currentClones < targetClones) {
      const needed = targetClones - currentClones;
      for (let i = 0; i < needed; i++) {
        const cloneMesh = new THREE.Mesh(this.ballGeom, this.ballMat);
        const shadowGeom = new THREE.PlaneGeometry(1.65, 1.65);
        const shadowMat = new THREE.MeshBasicMaterial({
          map: this.shadowTexture,
          transparent: true,
          opacity: 0.8,
          depthWrite: false
        });
        const shadow = new THREE.Mesh(shadowGeom, shadowMat);
        shadow.rotation.x = -Math.PI / 2;

        const index = currentClones + i;
        const offset = this.getDenseSquadOffset(index);

        cloneMesh.position.set(this.ballPos.x + offset.x, this.ballPos.y, this.ballPos.z + offset.z);
        shadow.position.set(cloneMesh.position.x, 0.02, cloneMesh.position.z);

        this.ballSquadGroup.add(cloneMesh);
        this.ballSquadGroup.add(shadow);

        this.activeCloneBalls.push({
          mesh: cloneMesh,
          shadow,
          offsetX: offset.x,
          offsetZ: offset.z
        });
      }
    } else if (currentClones > targetClones) {
      const extra = currentClones - targetClones;
      for (let i = 0; i < extra; i++) {
        const item = this.activeCloneBalls.pop();
        if (item) {
          this.ballSquadGroup.remove(item.mesh);
          this.ballSquadGroup.remove(item.shadow);
          this.spawnExplosionParticles(item.mesh.position, this.activeEvolution.hexColor || 0xef4444, 12);
        }
      }
    }

    // Re-verify offsets for all active clones so there are never holes or gaps in the formation
    this.activeCloneBalls.forEach((b, idx) => {
      const offset = this.getDenseSquadOffset(idx);
      b.offsetX = offset.x;
      b.offsetZ = offset.z;
    });
  }

  // --- 3D Daylight Sky & Clouds System ---

  private initDaylightSkyAndClouds() {
    // 1. Sky Dome with smooth canvas gradient (Clear, pure blue daytime sky - no pink)
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 128;
    skyCanvas.height = 512;
    const sctx = skyCanvas.getContext('2d')!;
    const grad = sctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0284c7');    // Deep vibrant sky blue at zenith
    grad.addColorStop(0.35, '#0ea5e9'); // Sunny azure blue
    grad.addColorStop(0.65, '#38bdf8'); // Clear sky cyan
    grad.addColorStop(0.85, '#7dd3fc'); // Crisp horizon blue
    grad.addColorStop(1.0, '#bae6fd');  // Bright horizon cyan-blue
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 512);

    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.wrapS = THREE.RepeatWrapping;
    skyTexture.wrapT = THREE.ClampToEdgeWrapping;

    const skyGeom = new THREE.SphereGeometry(240, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      fog: false,
      toneMapped: false // Prevents tone mapper from shifting blue hues toward pink
    });
    this.skyDome = new THREE.Mesh(skyGeom, skyMat);
    this.skyDome.position.y = -8;
    this.scene.add(this.skyDome);

    // 2. Bright Glorious 3D Sun in the sky
    this.sunGroup = new THREE.Group();
    // Sun core
    const sunGeom = new THREE.SphereGeometry(15, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb, fog: false });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    this.sunGroup.add(sunMesh);

    // Sun corona flare ring
    const flareGeom = new THREE.RingGeometry(16, 32, 32);
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      fog: false
    });
    const flareMesh = new THREE.Mesh(flareGeom, flareMat);
    flareMesh.rotation.y = Math.PI / 4;
    this.sunGroup.add(flareMesh);

    // Position sun high up in the forward right sky
    this.sunGroup.position.set(65, 80, 180);
    this.scene.add(this.sunGroup);

    // 3. 3D Fluffy White Clouds on Left and Right (Sağda Solda Pofuduk Bulutlar)
    this.initFluffyClouds();
  }

  private createFluffyCloudMesh(): THREE.Group {
    const cloud = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
      metalness: 0.0,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
      fog: true
    });

    // Merge 7-8 overlapping white spheres of varied sizes to form a cute puffy cloud
    const puffs = [
      { x: 0, y: 0, z: 0, r: 3.4 },
      { x: -3.0, y: -0.4, z: 0.4, r: 2.6 },
      { x: 3.0, y: -0.3, z: -0.3, r: 2.7 },
      { x: -1.4, y: 1.5, z: 0.2, r: 2.8 },
      { x: 1.5, y: 1.4, z: -0.2, r: 2.5 },
      { x: 0, y: -0.5, z: 1.4, r: 2.2 },
      { x: 0, y: -0.5, z: -1.4, r: 2.2 },
      { x: 2.0, y: -0.2, z: 1.0, r: 2.0 }
    ];

    for (const p of puffs) {
      const geom = new THREE.SphereGeometry(p.r, 12, 10);
      const mesh = new THREE.Mesh(geom, cloudMat);
      mesh.position.set(p.x, p.y, p.z);
      cloud.add(mesh);
    }

    cloud.scale.set(1.4, 0.85, 1.1);
    return cloud;
  }

  private initFluffyClouds() {
    this.cloudList = [];
    const count = 34;

    for (let i = 0; i < count; i++) {
      const cloudGroup = this.createFluffyCloudMesh();
      const isLeft = i % 2 === 0;
      const x = isLeft ? -(24 + Math.random() * 30) : (24 + Math.random() * 30);
      const y = 14 + Math.random() * 24;
      const z = -40 + i * 14 + (Math.random() - 0.5) * 8;

      cloudGroup.position.set(x, y, z);
      const randomScale = 0.9 + Math.random() * 0.7;
      cloudGroup.scale.multiplyScalar(randomScale);

      this.scene.add(cloudGroup);
      this.cloudList.push({
        group: cloudGroup,
        initialX: x,
        speed: (Math.random() - 0.5) * 1.5 // gentle breeze
      });
    }
  }

  // --- 3D High-Res Collectibles Generation ---

  private createCoinMesh(): THREE.Group {
    const coinGroup = new THREE.Group();

    // 1. Radiant 3D Golden Coin disc (Vibrant shining yellow gold, 0.0 metalness = NO dark/brown tint)
    const coinGeom = new THREE.CylinderGeometry(0.62, 0.62, 0.14, 32);
    coinGeom.rotateX(Math.PI / 2);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffea00, // Vibrant bright arcade yellow-gold
      metalness: 0.0,  // Zero metalness prevents dark reflection, keeping color 100% bright and vivid
      roughness: 0.15,
      emissive: 0xffb700, // Warm self-illuminated gold glow
      emissiveIntensity: 0.55
    });
    const body = new THREE.Mesh(coinGeom, coinMat);
    coinGroup.add(body);

    // 2. Raised outer coin rim border ring
    const ringGeom = new THREE.TorusGeometry(0.60, 0.05, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfff000,
      metalness: 0.0,
      roughness: 0.1,
      emissive: 0xffd700,
      emissiveIntensity: 0.6
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    coinGroup.add(ring);

    // 3. True 5-Pointed Star Relief on BOTH front and back (NOT an octahedron diamond)
    const starCoreGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16);
    starCoreGeom.rotateX(Math.PI / 2);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.1,
      emissive: 0xffea00,
      emissiveIntensity: 0.7
    });

    for (const zOffset of [0.075, -0.075]) {
      const starHub = new THREE.Mesh(starCoreGeom, starMat);
      starHub.position.z = zOffset;
      coinGroup.add(starHub);

      // 5 star points around the hub
      for (let p = 0; p < 5; p++) {
        const angle = (p * Math.PI * 2) / 5 - Math.PI / 2;
        const pointGeom = new THREE.ConeGeometry(0.11, 0.30, 6);
        pointGeom.translate(0, 0.15, 0);
        const point = new THREE.Mesh(pointGeom, starMat);
        point.rotation.z = angle - Math.PI / 2;
        point.position.set(Math.cos(angle) * 0.15, Math.sin(angle) * 0.15, zOffset);
        coinGroup.add(point);
      }
    }

    // 4. Brilliant Radiant Golden Halo / Aura ring
    const haloGeom = new THREE.RingGeometry(0.66, 0.82, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    coinGroup.add(halo);

    // 5. Four Sparkling Star Diamond Glints around the coin rim
    for (let s = 0; s < 4; s++) {
      const angle = (s * Math.PI) / 2 + Math.PI / 4;
      const glintGeom = new THREE.OctahedronGeometry(0.08, 0);
      glintGeom.scale(1.8, 0.4, 0.4);
      const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const glint1 = new THREE.Mesh(glintGeom, glintMat);
      glint1.position.set(Math.cos(angle) * 0.65, Math.sin(angle) * 0.65, 0.06);
      coinGroup.add(glint1);

      const glint2 = new THREE.Mesh(glintGeom, glintMat);
      glint2.position.set(Math.cos(angle) * 0.65, Math.sin(angle) * 0.65, 0.06);
      glint2.rotation.z = Math.PI / 2;
      coinGroup.add(glint2);
    }

    return coinGroup;
  }

  private createStrawberryMesh(): THREE.Group {
    const strawberry = new THREE.Group();

    // 1. Plump ruby-red tapered strawberry body
    const berryGeom = new THREE.ConeGeometry(0.48, 0.85, 24, 16);
    berryGeom.rotateX(Math.PI);
    berryGeom.translate(0, -0.08, 0);

    const berryMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0x991b1b,
      emissiveIntensity: 0.15
    });
    const berryMesh = new THREE.Mesh(berryGeom, berryMat);
    strawberry.add(berryMesh);

    // Rounded top cap so the crown isn't flat
    const capGeom = new THREE.SphereGeometry(0.46, 20, 12);
    capGeom.scale(1.0, 0.45, 1.0);
    const capMesh = new THREE.Mesh(capGeom, berryMat);
    capMesh.position.y = 0.32;
    strawberry.add(capMesh);

    // 2. Yellow/Gold Seeds speckled across the strawberry
    const seedGeom = new THREE.SphereGeometry(0.024, 6, 6);
    const seedMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0xfacc15,
      emissiveIntensity: 0.3
    });

    const seedPositions = [
      { x: 0.38, y: 0.18, z: 0.15 },
      { x: -0.38, y: 0.18, z: 0.15 },
      { x: 0.15, y: 0.18, z: 0.38 },
      { x: -0.15, y: 0.18, z: 0.38 },
      { x: 0.38, y: 0.18, z: -0.15 },
      { x: -0.38, y: 0.18, z: -0.15 },
      { x: 0.15, y: 0.18, z: -0.38 },
      { x: -0.15, y: 0.18, z: -0.38 },
      { x: 0.28, y: -0.05, z: 0.2 },
      { x: -0.28, y: -0.05, z: 0.2 },
      { x: 0.2, y: -0.05, z: -0.28 },
      { x: -0.2, y: -0.05, z: -0.28 },
      { x: 0.32, y: -0.05, z: 0 },
      { x: -0.32, y: -0.05, z: 0 },
      { x: 0, y: -0.05, z: 0.32 },
      { x: 0, y: -0.05, z: -0.32 },
      { x: 0.16, y: -0.26, z: 0.1 },
      { x: -0.16, y: -0.26, z: 0.1 },
      { x: 0.1, y: -0.26, z: -0.16 },
      { x: -0.1, y: -0.26, z: -0.16 }
    ];

    for (const sp of seedPositions) {
      const seed = new THREE.Mesh(seedGeom, seedMat);
      seed.position.set(sp.x, sp.y, sp.z);
      seed.scale.set(1.0, 1.4, 0.8);
      strawberry.add(seed);
    }

    // 3. Cute 5-leaf Green Star Calyx
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.35,
      metalness: 0.05
    });

    const leafCount = 5;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i * Math.PI * 2) / leafCount;
      const leafGeom = new THREE.ConeGeometry(0.14, 0.42, 6);
      leafGeom.rotateX(Math.PI / 2);
      leafGeom.translate(0, 0, 0.2);
      const leaf = new THREE.Mesh(leafGeom, leafMat);
      leaf.position.set(0, 0.44, 0);
      leaf.rotation.y = angle;
      leaf.rotation.x = 0.25;
      strawberry.add(leaf);
    }

    // 4. Curved Green Stem
    const stemGeom = new THREE.CylinderGeometry(0.045, 0.055, 0.32, 8);
    stemGeom.translate(0, 0.16, 0);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.set(0, 0.44, 0);
    stem.rotation.z = -0.25;
    strawberry.add(stem);

    strawberry.scale.set(1.35, 1.35, 1.35);
    return strawberry;
  }

  private createGreenAppleMesh(): THREE.Group {
    const apple = new THREE.Group();

    // Apple body
    const bodyGeom = new THREE.SphereGeometry(0.48, 20, 16);
    bodyGeom.scale(1.08, 0.96, 1.08);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.2,
      metalness: 0.05,
      emissive: 0x15803d,
      emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    apple.add(body);

    // Brown stem
    const stemGeom = new THREE.CylinderGeometry(0.035, 0.045, 0.32, 8);
    stemGeom.translate(0, 0.16, 0);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.set(0, 0.42, 0);
    stem.rotation.z = 0.2;
    apple.add(stem);

    // Fresh green leaf
    const leafGeom = new THREE.ConeGeometry(0.12, 0.28, 6);
    leafGeom.rotateZ(Math.PI / 3);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.3 });
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(0.14, 0.54, 0);
    apple.add(leaf);

    apple.scale.set(1.25, 1.25, 1.25);
    return apple;
  }

  private createGoldenStarMesh(): THREE.Group {
    const starGroup = new THREE.Group();

    // Central core
    const coreGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.15,
      metalness: 0.7,
      emissive: 0xeab308,
      emissiveIntensity: 0.35
    });
    const core = new THREE.Mesh(coreGeom, starMat);
    starGroup.add(core);

    // 5 Star Points
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const pointGeom = new THREE.ConeGeometry(0.24, 0.52, 8);
      pointGeom.translate(0, 0.26, 0);
      const point = new THREE.Mesh(pointGeom, starMat);
      point.rotation.z = angle - Math.PI / 2;
      point.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0);
      starGroup.add(point);
    }

    // Cute sparkling eyes on front
    const eyeGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12);
    eyeGeom.rotateX(Math.PI / 2);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.1, 0.05, 0.31);
    starGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.1, 0.05, 0.31);
    starGroup.add(rightEye);

    starGroup.scale.set(1.2, 1.2, 0.8);
    return starGroup;
  }

  private createBlueberryMesh(): THREE.Group {
    const berryGroup = new THREE.Group();

    // Plump royal blue berry sphere
    const berryGeom = new THREE.SphereGeometry(0.48, 20, 16);
    berryGeom.scale(1.08, 0.94, 1.08);
    const berryMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3
    });
    const berry = new THREE.Mesh(berryGeom, berryMat);
    berryGroup.add(berry);

    // Crown rim at top
    const crownGeom = new THREE.TorusGeometry(0.14, 0.035, 8, 16);
    crownGeom.rotateX(Math.PI / 2);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x075985, roughness: 0.4 });
    const crown = new THREE.Mesh(crownGeom, crownMat);
    crown.position.y = 0.43;
    berryGroup.add(crown);

    // Cute fresh green leaf
    const leafGeom = new THREE.ConeGeometry(0.12, 0.3, 6);
    leafGeom.rotateZ(-Math.PI / 3);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.35 });
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(-0.14, 0.46, 0);
    berryGroup.add(leaf);

    berryGroup.scale.set(1.25, 1.25, 1.25);
    return berryGroup;
  }

  private createGrapeMesh(): THREE.Group {
    const grapes = new THREE.Group();

    const grapeGeom = new THREE.SphereGeometry(0.17, 12, 10);
    const grapeMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      roughness: 0.2,
      metalness: 0.15,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.25
    });

    const positions = [
      { x: -0.16, y: 0.22, z: 0.1 },
      { x: 0.16, y: 0.22, z: 0.1 },
      { x: 0, y: 0.24, z: -0.16 },
      { x: -0.2, y: 0.02, z: -0.05 },
      { x: 0.2, y: 0.02, z: -0.05 },
      { x: 0, y: 0.04, z: 0.2 },
      { x: 0, y: 0.0, z: -0.18 },
      { x: -0.1, y: -0.18, z: 0.08 },
      { x: 0.1, y: -0.18, z: 0.08 },
      { x: 0, y: -0.16, z: -0.1 },
      { x: 0, y: -0.34, z: 0 }
    ];

    for (const pos of positions) {
      const g = new THREE.Mesh(grapeGeom, grapeMat);
      g.position.set(pos.x, pos.y, pos.z);
      grapes.add(g);
    }

    // Vine stem
    const stemGeom = new THREE.CylinderGeometry(0.035, 0.045, 0.28, 8);
    stemGeom.translate(0, 0.14, 0);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.set(0, 0.26, 0);
    stem.rotation.z = -0.2;
    grapes.add(stem);

    // Green grape leaf
    const leafGeom = new THREE.ConeGeometry(0.12, 0.26, 6);
    leafGeom.rotateZ(Math.PI / 2.5);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.35 });
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(0.12, 0.36, 0);
    grapes.add(leaf);

    grapes.scale.set(1.3, 1.3, 1.3);
    return grapes;
  }

  private createRoadFragmentMesh(): THREE.Group {
    const group = new THREE.Group();

    // Dazzling glowing prism crystal (metalness 0.0 prevents any dark or brown reflection)
    const gemGeom = new THREE.OctahedronGeometry(0.55, 0);
    gemGeom.scale(1.0, 1.4, 1.0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.0,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.65
    });
    const gem = new THREE.Mesh(gemGeom, gemMat);
    group.add(gem);

    // Glowing golden cage frame
    const cageGeom = new THREE.OctahedronGeometry(0.58, 0);
    cageGeom.scale(1.0, 1.4, 1.0);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      wireframe: true
    });
    const cage = new THREE.Mesh(cageGeom, cageMat);
    group.add(cage);

    // Radiant golden starlight ring
    const ringGeom = new THREE.TorusGeometry(0.72, 0.04, 12, 32);
    ringGeom.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    group.add(ring);

    return group;
  }

  public destroy() {
    if (this.skyDome) this.scene.remove(this.skyDome);
    if (this.sunGroup) this.scene.remove(this.sunGroup);
    this.cloudList.forEach(c => this.scene.remove(c.group));
    this.scene.remove(this.ballSquadGroup);
    this.scene.remove(this.mainBallShadow);
    this.stop();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);

    window.removeEventListener('resize', this.onResize);
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

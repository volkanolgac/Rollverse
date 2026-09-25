import { EnergyType, WorldId } from '../types/game';

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private soundEnabled = true;
  private musicEnabled = true;

  // Music sequencer state
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private rollingGain: GainNode | null = null;
  private rollingSource: AudioBufferSourceNode | null = null;
  private musicInterval: number | null = null;
  private currentWorld: WorldId = 'GREEN_VALLEY';
  private musicStep = 0;

  constructor() {
    // AudioContext will be lazily created upon first user interaction
  }

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.ctx = new AudioCtxClass();

      // Master Gains
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicEnabled ? 0.35 : 0;
      this.musicGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.soundEnabled ? 0.6 : 0;
      this.sfxGain.connect(this.ctx.destination);

      this.isInitialized = true;
      this.startAmbientMusic();
      this.initRollingSound();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public resumeContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(enabled ? 0.6 : 0, this.ctx.currentTime, 0.05);
    }
    if (this.rollingGain && this.ctx) {
      this.rollingGain.gain.setTargetAtTime(enabled ? 0.15 : 0, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(enabled ? 0.35 : 0, this.ctx.currentTime, 0.1);
    }
  }

  public setWorld(worldId: WorldId) {
    this.currentWorld = worldId;
  }

  // --- Ambient Music Synthesizer ---
  private startAmbientMusic() {
    if (this.musicInterval) clearInterval(this.musicInterval);

    // Scales for each world
    const scales: Record<WorldId, number[]> = {
      GREEN_VALLEY: [261.63, 293.66, 329.63, 392.00, 440.00], // C Pentatonic Major
      LOST_DESERT: [220.00, 246.94, 277.18, 329.63, 369.99], // Harmonic/Exotic A
      VOLCANO_LAND: [196.00, 207.65, 246.94, 261.63, 311.13], // Phrygian G
      FROZEN_REALM: [329.63, 369.99, 415.30, 493.88, 554.37], // C# minor / E crystalline
      NEON_CITY: [174.61, 207.65, 233.08, 261.63, 311.13, 349.23], // Synthwave F Dorian
      COSMIC_VOID: [146.83, 220.00, 261.63, 329.63, 440.00, 523.25] // Ethereal D Suspended
    };

    const bassNotes: Record<WorldId, number> = {
      GREEN_VALLEY: 130.81, // C3
      LOST_DESERT: 110.00,  // A2
      VOLCANO_LAND: 98.00,  // G2
      FROZEN_REALM: 164.81, // E3
      NEON_CITY: 87.31,     // F2
      COSMIC_VOID: 73.42    // D2
    };

    // 120 bpm = 500ms per beat, sixteenth notes ~ 125ms
    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicEnabled || this.ctx.state !== 'running') return;

      const scale = scales[this.currentWorld] || scales.GREEN_VALLEY;
      const now = this.ctx.currentTime;

      // Play soft bass drone on measure starts
      if (this.musicStep % 8 === 0) {
        this.playSoftSynthNote(bassNotes[this.currentWorld] || 130.81, 1.8, 'triangle', 0.15);
      }

      // Play arpeggio melody note
      if (this.musicStep % 2 === 0) {
        const noteIndex = (this.musicStep / 2) % scale.length;
        const freq = scale[noteIndex];
        this.playSoftSynthNote(freq, 0.4, 'sine', 0.08);
      }

      // Occasional shimmer
      if (this.musicStep % 16 === 12) {
        const shimmerFreq = scale[(this.musicStep) % scale.length] * 2;
        this.playSoftSynthNote(shimmerFreq, 0.8, 'sine', 0.05);
      }

      this.musicStep = (this.musicStep + 1) % 32;
    }, 240);
  }

  private playSoftSynthNote(freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.1) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(gainVal, this.ctx.currentTime + 0.06);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio synthesis hiccups
    }
  }

  // --- Continuous Rolling Friction Sound ---
  private initRollingSound() {
    if (!this.ctx || !this.sfxGain) return;
    try {
      // 1 sec pink noise buffer
      const bufferSize = this.ctx.sampleRate * 1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.12;
      }

      this.rollingSource = this.ctx.createBufferSource();
      this.rollingSource.buffer = buffer;
      this.rollingSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 280;

      this.rollingGain = this.ctx.createGain();
      this.rollingGain.gain.value = 0;

      this.rollingSource.connect(filter);
      filter.connect(this.rollingGain);
      this.rollingGain.connect(this.sfxGain);

      this.rollingSource.start();
    } catch (e) {
      console.warn('Could not start rolling sound', e);
    }
  }

  public updateRollingSpeed(speedNormalized: number) {
    if (!this.rollingGain || !this.ctx || !this.soundEnabled) return;
    const targetGain = Math.min(0.2, speedNormalized * 0.18);
    this.rollingGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
  }

  // --- Sound Effects ---

  // Energy Orb Collected
  public playEnergyCollect(type: EnergyType) {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const freqs: Record<EnergyType, number[]> = {
        BLUE: [523.25, 659.25], // C5, E5
        RED: [440.00, 554.37],  // A4, C#5
        GREEN: [392.00, 493.88],// G4, B4
        PURPLE: [659.25, 880.00],// E5, A5
        YELLOW: [587.33, 739.99] // D5, F#5
      };
      const [f1, f2] = freqs[type] || [523.25, 659.25];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f1, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(f2, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // Audio fallback
    }
  }

  // Road Fragment Collected (Glorious sparkle chime)
  public playFragmentCollect() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const pitches = [523.25, 659.25, 783.99, 1046.50]; // C E G C
      pitches.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } catch {}
  }

  // Cute "Piiiuu..." Whistle Falling Sound Effect (Sevimli piiiuu düşme sesi)
  public playBallFall() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Cartoonish cute descending whistle slide: 1400Hz -> 160Hz
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.65);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.68);
    } catch {}
  }

  // Obstacle Collision (Heavy punchy thud)
  public playCollision(major = false) {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(major ? 180 : 120, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

      gain.gain.setValueAtTime(major ? 0.35 : 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Checkpoint Arch
  public playCheckpoint() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554, 659, 880]; // A major fanfare
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.2, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.4);
      });
    } catch {}
  }

  // Portal Warp
  public playPortalWarp() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.8);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch {}
  }

  // Majestic Level Clear Fanfare
  public playLevelWon() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx >= 4 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.01, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.7);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.7);
      });
    } catch {}
  }

  // Ball Evolution Unlocked
  public playEvolution() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25];
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch {}
  }

  // Ability Activated
  public playAbility() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Achievement Unlocked
  public playAchievement() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.2, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.4);
      });
    } catch {}
  }

  // Clean UI Button Click
  public playButtonClick() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // --- Rolling Balls 3D Signature Sounds ---

  // Jump (Ascending springy whoosh)
  public playJump() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.18);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  // Ball Bounce landing
  public playBounce() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // Turbo Booster Pad Surge
  public playBooster() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.35);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  // Trampoline Spring Jump Pad
  public playSpringJump() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.28);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Wooden Crate Shatter
  public playCrateSmash() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.16);

      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Gold Coin Chime
  public playCoinCollect() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  public playCoin() {
    this.playCoinCollect();
  }

  public playSpeedBoost() {
    this.playBooster();
  }

  public playSpring() {
    this.playSpringJump();
  }

  public playWoodSmash() {
    this.playCrateSmash();
  }

  // Shield Deflection Ricochet
  public playShieldDeflect() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Positive Multiply / Add Gate (+ Kapısı Başarı / Kazanç Ses Tonu)
  public playPositiveGate() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      // Radiant ascending major chord arpeggio: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + idx * 0.05 + 0.22);

        gain.gain.setValueAtTime(0.22, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.25);
      });
    } catch {}
  }

  // Negative Subtract / Divide Gate (- Kapısı Kayıp / Ceza Ses Tonu)
  public playNegativeGate() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      // Heavy descending dissonance buzz: Eb4 -> C4 -> Gb3
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(311.13, now); // Eb4
      osc1.frequency.exponentialRampToValueAtTime(140.00, now + 0.32);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(293.66, now); // D4 (dissonant detune)
      osc2.frequency.exponentialRampToValueAtTime(110.00, now + 0.32);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {}
  }

  // Vacuum Vortex suction sound (delikten vakumla çekilme sesi)
  public playVacuumSuction() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      // Deep resonant swirling filter sweep + ascending harmonic vortex
      const osc = this.ctx.createOscillator();
      const noiseGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 1.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(2800, now + 1.4);
      filter.frequency.exponentialRampToValueAtTime(100, now + 1.8);

      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.28, now + 0.5);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.85);

      osc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 1.85);
    } catch {}
  }

  // Hole Closure snap / implosion sound (delik kapanma animasyonu sesi)
  public playHoleClose() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  // Tokmak / Hammer impact sound
  public playHammerWhack() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.22);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Checkpoint Respawn sound
  public playRespawn() {
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const chord = [329.63, 392.00, 523.25]; // E minor / G
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 0.8, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.35);
      });
    } catch {}
  }
}

export const audioService = new SoundSystem();

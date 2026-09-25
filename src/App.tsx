/**
 * ROLLVERSE – The Road You Create
 * Main Application Orchestrator
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { RoadMemorySystem } from './game/roadMemory';
import { 
  PlayerStats, 
  ActiveRunState, 
  BallEvolution, 
  CosmeticTrail, 
  GameSettings,
  WorldId,
  LevelWonEvent
} from './types/game';
import { 
  BALL_EVOLUTIONS, 
  COSMETIC_TRAILS, 
  WORLDS,
  GAME_LEVELS
} from './game/constants';
import { 
  loadPlayerStats, 
  savePlayerStats, 
  resetPlayerStats, 
  DEFAULT_PLAYER_STATS 
} from './services/storage';
import { audioService } from './services/audio';

// Components
import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { PauseMenu } from './components/PauseMenu';
import { GameOverModal } from './components/GameOverModal';
import { BallScreen } from './components/BallScreen';
import { WorldsScreen } from './components/WorldsScreen';
import { CollectionScreen } from './components/CollectionScreen';
import { AchievementsScreen } from './components/AchievementsScreen';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { SettingsModal } from './components/SettingsModal';
import { LevelWonModal } from './components/LevelWonModal';
import { LevelsScreen } from './components/LevelsScreen';

type AppView = 
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'LEVEL_WON'
  | 'LEVELS'
  | 'BALL'
  | 'WORLDS'
  | 'COLLECTION'
  | 'ACHIEVEMENTS'
  | 'DAILY'
  | 'SETTINGS';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const roadMemoryRef = useRef<RoadMemorySystem | null>(null);

  // Persistent Player Stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => loadPlayerStats());

  // App Navigation View
  const [currentView, setCurrentView] = useState<AppView>('MENU');

  // Active Run State (Synced with GameEngine)
  const [runState, setRunState] = useState<ActiveRunState>({
    distance: 0,
    energy: 100,
    maxEnergy: 100,
    fragmentsThisRun: 0,
    energyThisRun: 0,
    currentWorld: 'GREEN_VALLEY',
    checkpointDistance: 0,
    checkpointWorld: 'GREEN_VALLEY',
    checkpointAvailable: false,
    abilityActive: false,
    abilityTimeLeft: 0,
    abilityCooldownLeft: 0,
    consecutiveRiskyCompleted: 0,
    newDiscoveries: []
  });

  // Road Memory Alert Banner
  const [roadMemoryAlert, setRoadMemoryAlert] = useState<string | null>(null);
  const alertTimeoutRef = useRef<number | null>(null);

  // Full Screen Gate Passage Soft Flash Effect
  const [gateFlash, setGateFlash] = useState<{ id: number; color: 'green' | 'red' } | null>(null);

  const triggerGateFlash = useCallback((color: 'green' | 'red') => {
    setGateFlash({ id: Date.now(), color });
    setTimeout(() => {
      setGateFlash(null);
    }, 750);
  }, []);

  // Level Won & Campaign State
  const [levelWonEvent, setLevelWonEvent] = useState<LevelWonEvent | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(() => playerStats.highestLevelUnlocked || 1);

  // First Run Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);

  // Current equipped Evolution & Trail
  const currentEvolution: BallEvolution = 
    BALL_EVOLUTIONS.find(e => e.id === playerStats.selectedEvolution) || BALL_EVOLUTIONS[0];

  const currentTrail: CosmeticTrail = 
    COSMETIC_TRAILS.find(t => t.id === playerStats.selectedTrail) || COSMETIC_TRAILS[0];

  // Listen for language change events
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const handleLangChange = (e: CustomEvent) => {
      setPlayerStats(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          language: e.detail
        }
      }));
      setLangTick(t => t + 1);
    };
    window.addEventListener('rollverse_language_changed' as any, handleLangChange as any);
    return () => window.removeEventListener('rollverse_language_changed' as any, handleLangChange as any);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    savePlayerStats(playerStats);
  }, [playerStats]);

  // Audio system settings update
  useEffect(() => {
    audioService.setSoundEnabled(playerStats.settings.soundEnabled);
    audioService.setMusicEnabled(playerStats.settings.musicEnabled);
  }, [playerStats.settings.soundEnabled, playerStats.settings.musicEnabled]);

  // Initialize Three.js Game Engine once mounted
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    roadMemoryRef.current = new RoadMemorySystem(playerStats.roadMemory);

    const engine = new GameEngine(
      canvasContainerRef.current,
      currentEvolution,
      currentTrail,
      roadMemoryRef.current,
      {
        onUpdateRunState: (updated) => {
          setRunState(prev => ({ ...prev, ...updated }));
        },
        onRoadMemoryAlert: (msg) => {
          triggerRoadMemoryBanner(msg);
        },
        onCheckpointReached: (dist) => {
          // Checkpoint milestone
          triggerRoadMemoryBanner(`Checkpoint at ${dist} m Secured!`);
        },
        onMysteryEvent: (type) => {
          triggerRoadMemoryBanner(`Mystery Anomaly: ${type}`);
        },
        onGameOver: () => {
          handleRunEnded();
        },
        onLevelWon: (event) => {
          handleLevelWon(event);
        },
        onGatePass: (type) => {
          triggerGateFlash(type);
        }
      }
    );

    engine.setSensitivity(playerStats.settings.sensitivity);
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync evolution and trail when player equips them
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setEvolution(currentEvolution);
      engineRef.current.setTrail(currentTrail);
      engineRef.current.setSensitivity(playerStats.settings.sensitivity);
    }
  }, [currentEvolution, currentTrail, playerStats.settings.sensitivity]);

  const triggerRoadMemoryBanner = (msg: string) => {
    setRoadMemoryAlert(msg);
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = window.setTimeout(() => {
      setRoadMemoryAlert(null);
    }, 4500);
  };

  // Start Play Session
  const handleStartPlay = (fromCheckpoint = false) => {
    audioService.resumeContext();
    audioService.playButtonClick();

    if (playerStats.runsCompleted === 0 && !fromCheckpoint) {
      setShowTutorial(true);
    }

    const targetLvl = playerStats.highestLevelUnlocked || 1;
    setSelectedLevel(targetLvl);

    if (engineRef.current) {
      if (fromCheckpoint) {
        engineRef.current.startRun(true);
      } else {
        engineRef.current.startLevel(targetLvl, false);
      }
    }
    setCurrentView('PLAYING');
  };

  // Level Won handler (Reached the Final Gate!)
  const handleLevelWon = (event: LevelWonEvent) => {
    setLevelWonEvent(event);
    setCurrentView('LEVEL_WON');

    setPlayerStats(prev => {
      const currentLevelConfig = GAME_LEVELS.find(l => l.level === event.level) || GAME_LEVELS[0];
      const rewardBonus = currentLevelConfig.rewardFragments;
      const nextLevel = event.level + 1;
      const newHighest = Math.max(prev.highestLevelUnlocked || 1, nextLevel);
      const newTotalFragments = prev.totalFragmentsCollected + event.fragments + rewardBonus;
      const newTotalDistance = prev.totalDistance + event.distance;
      const newTotalEnergy = prev.totalEnergyCollected + event.energy;
      const isNewBest = event.distance > prev.bestDistance;

      return {
        ...prev,
        highestLevelUnlocked: newHighest,
        currentLevel: nextLevel <= GAME_LEVELS.length ? nextLevel : event.level,
        roadFragments: prev.roadFragments + rewardBonus,
        totalFragmentsCollected: newTotalFragments,
        totalDistance: newTotalDistance,
        totalEnergyCollected: newTotalEnergy,
        bestDistance: isNewBest ? event.distance : prev.bestDistance,
        runsCompleted: prev.runsCompleted + 1
      };
    });
  };

  const handleStartLevel = (levelNumber: number) => {
    audioService.resumeContext();
    audioService.playButtonClick();
    setSelectedLevel(levelNumber);
    if (engineRef.current) {
      engineRef.current.startLevel(levelNumber, false);
    }
    setCurrentView('PLAYING');
  };

  const handleStartEndless = () => {
    audioService.resumeContext();
    audioService.playButtonClick();
    if (engineRef.current) {
      engineRef.current.startLevel(1, true);
    }
    setCurrentView('PLAYING');
  };

  // End of Run handler (Core Exhausted)
  const handleRunEnded = () => {
    setCurrentView('GAME_OVER');

    // Update Player Stats
    setPlayerStats(prev => {
      const isNewBest = runState.distance > prev.bestDistance;
      const newTotalDistance = prev.totalDistance + runState.distance;
      const newTotalEnergy = prev.totalEnergyCollected + runState.energyThisRun;
      const newTotalFragments = prev.totalFragmentsCollected + runState.fragmentsThisRun;

      // Update world unlocked & distances
      const updatedUnlockedWorlds = [...prev.unlockedWorlds];
      const worldKeys = Object.keys(WORLDS) as WorldId[];
      for (const wKey of worldKeys) {
        if (!updatedUnlockedWorlds.includes(wKey) && runState.distance >= WORLDS[wKey].unlockDistance) {
          updatedUnlockedWorlds.push(wKey);
        }
      }

      const updatedWorldBests = { ...prev.worldBestDistances };
      if ((updatedWorldBests[runState.currentWorld] || 0) < runState.distance) {
        updatedWorldBests[runState.currentWorld] = runState.distance;
      }

      // Sync Daily Challenge
      const challenge = { ...prev.dailyChallenge };
      if (!challenge.completed) {
        if (challenge.goalType === 'distance') {
          challenge.current = Math.max(challenge.current, runState.distance);
        } else if (challenge.goalType === 'fragments') {
          challenge.current += runState.fragmentsThisRun;
        } else if (challenge.goalType === 'world_reach') {
          challenge.current = Math.max(challenge.current, runState.distance);
        }
      }

      // Sync Achievements
      const updatedAchievements = prev.achievements.map(ach => {
        if (ach.unlocked) return ach;
        let prog = ach.current;
        if (ach.id === 'FIRST_ROLL') prog = Math.max(prog, isNewBest ? runState.distance : prev.bestDistance);
        if (ach.id === 'LONG_JOURNEY') prog = newTotalDistance;
        if (ach.id === 'ROAD_MAKER') prog = newTotalFragments;
        if (ach.id === 'RISK_TAKER') prog = prev.roadMemory.riskyRoutesChosen;
        if (ach.id === 'ENERGY_HARVEST') prog = newTotalEnergy;

        const isComplete = prog >= ach.requirement;
        return {
          ...ach,
          current: prog,
          unlocked: isComplete
        };
      });

      return {
        ...prev,
        bestDistance: isNewBest ? runState.distance : prev.bestDistance,
        totalDistance: newTotalDistance,
        totalEnergyCollected: newTotalEnergy,
        totalFragmentsCollected: newTotalFragments,
        runsCompleted: prev.runsCompleted + 1,
        unlockedWorlds: updatedUnlockedWorlds,
        worldBestDistances: updatedWorldBests,
        roadMemory: roadMemoryRef.current ? roadMemoryRef.current.getState() : prev.roadMemory,
        dailyChallenge: challenge,
        achievements: updatedAchievements
      };
    });
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
    setCurrentView('PAUSED');
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resume();
    }
    setCurrentView('PLAYING');
  };

  const handleRestartRun = () => {
    handleStartPlay(false);
  };

  const handleQuitToMenu = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setCurrentView('MENU');
  };

  // Evolution Unlocks & Selection
  const handleSelectEvolution = (id: BallEvolution['id']) => {
    setPlayerStats(prev => ({
      ...prev,
      selectedEvolution: id
    }));
  };

  const handleUnlockEvolution = (id: BallEvolution['id'], costFragments: number) => {
    setPlayerStats(prev => ({
      ...prev,
      totalFragmentsCollected: prev.totalFragmentsCollected - costFragments,
      unlockedEvolutions: [...prev.unlockedEvolutions, id],
      selectedEvolution: id
    }));
  };

  // Trail Unlocks & Selection
  const handleSelectTrail = (id: CosmeticTrail['id']) => {
    setPlayerStats(prev => ({
      ...prev,
      selectedTrail: id
    }));
  };

  const handleUnlockTrail = (id: CosmeticTrail['id'], costFragments: number) => {
    setPlayerStats(prev => ({
      ...prev,
      totalFragmentsCollected: prev.totalFragmentsCollected - costFragments,
      unlockedTrails: [...prev.unlockedTrails, id],
      selectedTrail: id
    }));
  };

  // Claim Achievement
  const handleClaimAchievement = (id: string, reward: number) => {
    setPlayerStats(prev => ({
      ...prev,
      totalFragmentsCollected: prev.totalFragmentsCollected + reward,
      achievements: prev.achievements.map(a => a.id === id ? { ...a, claimed: true } : a)
    }));
  };

  // Claim Daily
  const handleClaimDaily = () => {
    const ch = playerStats.dailyChallenge;
    setPlayerStats(prev => ({
      ...prev,
      totalFragmentsCollected: prev.totalFragmentsCollected + ch.rewardFragments,
      dailyChallenge: { ...prev.dailyChallenge, completed: true }
    }));
  };

  // Settings
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setPlayerStats(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const handleResetProgress = () => {
    const fresh = resetPlayerStats();
    setPlayerStats(fresh);
    if (engineRef.current) {
      engineRef.current.setEvolution(BALL_EVOLUTIONS[0]);
      engineRef.current.setTrail(COSMETIC_TRAILS[0]);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div 
        ref={canvasContainerRef} 
        id="game-canvas-container" 
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* View: Main Menu */}
      {currentView === 'MENU' && (
        <MainMenu
          playerStats={playerStats}
          currentEvolution={currentEvolution}
          onPlay={() => handleStartPlay(false)}
          onOpenLevels={() => setCurrentView('LEVELS')}
          onOpenBall={() => setCurrentView('BALL')}
          onOpenWorlds={() => setCurrentView('WORLDS')}
          onOpenCollection={() => setCurrentView('COLLECTION')}
          onOpenAchievements={() => setCurrentView('ACHIEVEMENTS')}
          onOpenDaily={() => setCurrentView('DAILY')}
          onOpenSettings={() => setCurrentView('SETTINGS')}
        />
      )}

      {/* View: Active Game HUD */}
      {currentView === 'PLAYING' && (
        <>
          {/* Full-Screen Gate Passage Soft Translucent Flash Effect */}
          {gateFlash && (
            <div
              key={gateFlash.id}
              className={`fixed inset-0 pointer-events-none z-40 transition-all duration-300 ${
                gateFlash.color === 'green'
                  ? 'bg-emerald-500/20 shadow-[inset_0_0_160px_rgba(34,197,94,0.45)] animate-gate-flash-green'
                  : 'bg-rose-500/20 shadow-[inset_0_0_160px_rgba(239,68,68,0.45)] animate-gate-flash-red'
              }`}
            />
          )}
          <HUD
            runState={runState}
            evolution={currentEvolution}
            roadMemoryAlert={roadMemoryAlert}
            onPause={handlePause}
            onTriggerAbility={() => engineRef.current?.triggerAbility()}
            onSteerLeft={() => engineRef.current?.setVirtualInput('left')}
            onSteerRight={() => engineRef.current?.setVirtualInput('right')}
            onSteerRelease={() => engineRef.current?.setVirtualInput('none')}
            onJump={() => engineRef.current?.triggerJump()}
            onBrakeStart={() => engineRef.current?.triggerBrake(true)}
            onBrakeEnd={() => engineRef.current?.triggerBrake(false)}
            showTutorial={showTutorial}
            onDismissTutorial={() => setShowTutorial(false)}
          />
        </>
      )}

      {/* View: Level Won Modal (Victory at Final Gate) */}
      {currentView === 'LEVEL_WON' && levelWonEvent && (
        <LevelWonModal
          levelEvent={levelWonEvent}
          playerStats={playerStats}
          onNextLevel={() => handleStartLevel(levelWonEvent.level + 1)}
          onReplayLevel={() => handleStartLevel(levelWonEvent.level)}
          onStartEndless={handleStartEndless}
          onHome={() => setCurrentView('LEVELS')}
        />
      )}

      {/* View: Levels Selection Screen */}
      {currentView === 'LEVELS' && (
        <LevelsScreen
          playerStats={playerStats}
          onSelectLevel={handleStartLevel}
          onStartEndless={handleStartEndless}
          onClose={() => setCurrentView('MENU')}
        />
      )}

      {/* View: Pause Menu */}
      {currentView === 'PAUSED' && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestartRun}
          onOpenSettings={() => setCurrentView('SETTINGS')}
          onQuitToMenu={handleQuitToMenu}
        />
      )}

      {/* View: Game Over Run Summary */}
      {currentView === 'GAME_OVER' && (
        <GameOverModal
          runState={runState}
          playerStats={playerStats}
          onContinueFromCheckpoint={() => handleStartPlay(true)}
          onStartNewRun={() => handleStartPlay(false)}
          onOpenBallScreen={() => setCurrentView('BALL')}
          onHome={() => setCurrentView('MENU')}
        />
      )}

      {/* View: Ball Screen */}
      {currentView === 'BALL' && (
        <BallScreen
          playerStats={playerStats}
          onSelectEvolution={handleSelectEvolution}
          onUnlockEvolution={handleUnlockEvolution}
          onSelectTrail={handleSelectTrail}
          onUnlockTrail={handleUnlockTrail}
          onBack={() => setCurrentView(runState.energy <= 0 ? 'GAME_OVER' : 'MENU')}
        />
      )}

      {/* View: Worlds Screen */}
      {currentView === 'WORLDS' && (
        <WorldsScreen
          playerStats={playerStats}
          onBack={() => setCurrentView('MENU')}
        />
      )}

      {/* View: Collection Screen */}
      {currentView === 'COLLECTION' && (
        <CollectionScreen
          playerStats={playerStats}
          onBack={() => setCurrentView('MENU')}
        />
      )}

      {/* View: Achievements Screen */}
      {currentView === 'ACHIEVEMENTS' && (
        <AchievementsScreen
          playerStats={playerStats}
          onClaimAchievement={handleClaimAchievement}
          onBack={() => setCurrentView('MENU')}
        />
      )}

      {/* View: Daily Challenge Modal */}
      {currentView === 'DAILY' && (
        <DailyChallengeModal
          playerStats={playerStats}
          onClaimDaily={handleClaimDaily}
          onBack={() => setCurrentView('MENU')}
        />
      )}

      {/* View: Settings Modal */}
      {currentView === 'SETTINGS' && (
        <SettingsModal
          settings={playerStats.settings}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onBack={() => setCurrentView(currentView === 'PAUSED' ? 'PAUSED' : 'MENU')}
        />
      )}
    </div>
  );
}

import React from 'react';
import { ActiveRunState, BallEvolution } from '../types/game';
import { Pause, Zap, Sparkles, Navigation, AlertTriangle, ArrowUp, Shield, Disc } from 'lucide-react';
import { t, getLanguage } from '../services/i18n';

interface HUDProps {
  runState: ActiveRunState;
  evolution: BallEvolution;
  roadMemoryAlert: string | null;
  onPause: () => void;
  onTriggerAbility: () => void;
  onSteerLeft: () => void;
  onSteerRight: () => void;
  onSteerRelease: () => void;
  onJump?: () => void;
  onBrakeStart?: () => void;
  onBrakeEnd?: () => void;
  showTutorial: boolean;
  onDismissTutorial: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  runState,
  evolution,
  roadMemoryAlert,
  onPause,
  onTriggerAbility,
  onSteerLeft,
  onSteerRight,
  onSteerRelease,
  onJump,
  onBrakeStart,
  onBrakeEnd,
  showTutorial,
  onDismissTutorial
}) => {
  const lang = getLanguage();
  const energyPercent = Math.max(0, Math.min(100, (runState.energy / runState.maxEnergy) * 100));
  const isLowEnergy = energyPercent < 25;
  const canUseAbility = runState.abilityCooldownLeft <= 0 && !runState.abilityActive;

  return (
    <div id="game-hud-overlay" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 md:p-6 select-none z-10">
      {/* Top Header: Stats & Pause */}
      <div className="flex items-center justify-between w-full gap-2">
        {/* Left: Distance, Coins, Lives & World */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Score Card */}
          <div className="bg-slate-950/90 backdrop-blur-md border border-emerald-500/50 rounded-2xl px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 shadow-lg">
            <span className="text-xl sm:text-2xl">🏆</span>
            <div>
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {lang === 'tr' ? 'Puan' : 'Score'}
              </div>
              <div className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white font-mono leading-tight">
                {(runState.distance + (runState.coinsThisRun || 0) * 100 + (runState.energyThisRun || 0) * 50 + (runState.fragmentsThisRun || 0) * 250).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Top Sayısı (Ball Squad Count) Badge */}
          <div className="bg-slate-950/90 backdrop-blur-md border border-indigo-500/50 rounded-2xl px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 shadow-lg">
            <span className="text-xl sm:text-2xl">🎱</span>
            <div>
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {t('stats_lives')}
              </div>
              <div className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white font-mono leading-tight">
                {runState.lives}
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 shadow-lg">
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 animate-pulse" />
            <div>
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">{t('stats_distance')}</div>
              <div className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white font-mono">
                {runState.distance.toLocaleString()} <span className="text-[10px] sm:text-xs font-normal text-indigo-300">m</span>
              </div>
            </div>
          </div>

          {/* Rolling Balls 3D Gold Coins Counter */}
          <div className="bg-slate-950/80 backdrop-blur-md border border-amber-400/50 rounded-2xl px-3 py-1.5 sm:py-2 flex items-center gap-2 shadow-lg">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xs shadow-inner">
              🪙
            </div>
            <div>
              <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">{t('stats_coins')}</div>
              <div className="font-black text-amber-300 font-mono text-sm sm:text-base md:text-lg leading-tight">
                {runState.coinsThisRun || 0}
              </div>
            </div>
          </div>

          {/* Speed KM/H Indicator & Shield */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 rounded-2xl px-3 py-2 shadow-lg">
            <Disc className="w-4 h-4 text-cyan-400 animate-spin" />
            <div>
              <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">{t('stats_speed')}</div>
              <div className="font-black text-cyan-300 font-mono text-sm sm:text-base">
                {runState.speedKmh ?? 32} <span className="text-[10px] text-cyan-200">km/h</span>
              </div>
            </div>
            {runState.hasShield && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/60 px-2 py-0.5 rounded-full ml-1 animate-pulse">
                <Shield className="w-3 h-3 text-cyan-400" /> {lang === 'tr' ? 'Kalkan' : 'Shield'}
              </span>
            )}
          </div>

          {/* Road Fragment Counter */}
          <div className="hidden md:flex bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 rounded-2xl px-3 py-2 items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <div className="font-bold text-cyan-300 font-mono text-sm md:text-base">
              {runState.fragmentsThisRun}
            </div>
          </div>

          {/* Level & Gate Progress Indicator */}
          {runState.currentLevel && runState.levelTargetDistance ? (
            <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-sky-500/40 rounded-2xl px-3 py-2 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <div>
                <div className="text-[9px] font-bold text-sky-300 uppercase tracking-wider">
                  {lang === 'tr' ? `Bölüm ${runState.currentLevel} Kapısı` : `Level ${runState.currentLevel} Portal`}
                </div>
                <div className="text-xs font-black text-amber-300 font-mono">
                  {Math.max(0, runState.levelTargetDistance - runState.distance)}m {lang === 'tr' ? 'kaldı' : 'left'}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Center: Road Memory Notification Banner */}
        {roadMemoryAlert && (
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-sky-950/90 via-blue-950/90 to-sky-950/90 border border-sky-400/60 backdrop-blur-md px-4 py-1.5 rounded-full shadow-xl animate-bounce">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span className="text-xs md:text-sm font-semibold text-sky-200 tracking-wide">
              {roadMemoryAlert}
            </span>
          </div>
        )}

        {/* Right: Pause Button */}
        <div className="pointer-events-auto">
          <button
            id="pause-game-btn"
            onClick={onPause}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center transition-transform active:scale-95 shadow-lg cursor-pointer"
            title={t('pause')}
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Road Memory Banner (shown if alert exists) */}
      {roadMemoryAlert && (
        <div className="md:hidden flex items-center justify-center mt-2">
          <div className="bg-sky-950/90 border border-sky-400/60 px-3 py-1 rounded-full text-xs font-medium text-sky-200 text-center shadow-lg">
            {roadMemoryAlert}
          </div>
        </div>
      )}

      {/* First-Run Interactive Tutorial Banner */}
      {showTutorial && (
        <div className="pointer-events-auto max-w-md mx-auto my-auto bg-slate-950/95 backdrop-blur-lg border border-indigo-500/40 rounded-3xl p-5 shadow-2xl text-center flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">{t('how_to_play_title')}</h3>
          <p className="text-xs text-slate-300 leading-relaxed text-left space-y-1">
            • <strong className="text-indigo-300">A / D</strong> {t('how_to_play_steer')}<br />
            • <strong className="text-emerald-300">SPACE</strong> {t('how_to_play_jump')}<br />
            • <strong className="text-amber-300">W / S</strong> {t('how_to_play_speed')}<br />
            • {t('how_to_play_coins')}
          </p>
          <button
            id="dismiss-tutorial-btn"
            onClick={onDismissTutorial}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            {t('got_it')}
          </button>
        </div>
      )}

      {/* Bottom Controls & Energy Gauge */}
      <div className="w-full flex flex-col gap-3">
        {/* Energy Meter Bar */}
        <div className="w-full max-w-lg mx-auto bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Zap className="w-3.5 h-3.5 fill-current text-cyan-400" /> {t('stats_energy')}
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              {Math.round(runState.energy)} / {runState.maxEnergy}
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-900 rounded-xl overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-lg transition-all duration-150 ${
                isLowEnergy
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
              }`}
              style={{ width: `${energyPercent}%` }}
            />
          </div>
          {isLowEnergy && (
            <div className="text-[10px] text-red-400 font-semibold flex items-center justify-center gap-1 mt-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> {lang === 'tr' ? 'Düşük Enerji Uyarısı! Enerji kürelerini ve altınları toplayın!' : 'Low Energy Warning! Gather energy orbs and gold!'}
            </div>
          )}
        </div>

        {/* Bottom Bar: Touch Controls & Jump & Ability Button */}
        <div className="flex items-center justify-between pointer-events-auto gap-2">
          {/* Mobile Left & Brake */}
          <div className="md:hidden flex items-center gap-2">
            <button
              id="mobile-steer-left-btn"
              onTouchStart={onSteerLeft}
              onTouchEnd={onSteerRelease}
              onMouseDown={onSteerLeft}
              onMouseUp={onSteerRelease}
              className="w-14 h-14 rounded-2xl bg-slate-900/85 border border-slate-700/80 active:bg-indigo-600/60 active:border-indigo-400 text-white font-black text-xl flex items-center justify-center select-none shadow-xl touch-manipulation cursor-pointer"
            >
              ←
            </button>
            {onBrakeStart && (
              <button
                id="mobile-brake-btn"
                onTouchStart={onBrakeStart}
                onTouchEnd={onBrakeEnd}
                onMouseDown={onBrakeStart}
                onMouseUp={onBrakeEnd}
                className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-700/80 active:bg-rose-600 text-rose-300 font-bold text-xs flex items-center justify-center select-none shadow-xl touch-manipulation cursor-pointer"
                title={lang === 'tr' ? 'Fren' : 'Brake'}
              >
                {lang === 'tr' ? 'FREN' : 'BRAKE'}
              </button>
            )}
          </div>

          {/* Center: Jump and Ability Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 mx-auto">
            {/* Mobile Jump Button */}
            {onJump && (
              <button
                id="mobile-jump-btn"
                onClick={onJump}
                className="md:hidden px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 active:from-emerald-500 active:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 cursor-pointer select-none"
              >
                <ArrowUp className="w-4 h-4" /> {lang === 'tr' ? 'Zıpla' : 'Jump'}
              </button>
            )}

            {/* Core Ability Trigger Button */}
            <button
              id="trigger-ability-btn"
              onClick={onTriggerAbility}
              disabled={!canUseAbility}
              className={`relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl flex items-center gap-2 sm:gap-2.5 font-bold transition-all shadow-xl cursor-pointer select-none ${
                runState.abilityActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-105'
                  : canUseAbility
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${runState.abilityActive ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  {evolution.abilityName}
                </div>
                <div className="text-[9px] sm:text-[10px] font-medium opacity-80">
                  {runState.abilityActive
                    ? `${lang === 'tr' ? 'Aktif' : 'Active'} (${runState.abilityTimeLeft.toFixed(1)}s)`
                    : runState.abilityCooldownLeft > 0
                    ? `${lang === 'tr' ? 'Bekleme' : 'Cooldown'} ${runState.abilityCooldownLeft.toFixed(1)}s`
                    : (lang === 'tr' ? 'Hazır' : 'Ready')}
                </div>
              </div>
            </button>
          </div>

          {/* Mobile Virtual Right Button */}
          <div className="md:hidden flex items-center">
            <button
              id="mobile-steer-right-btn"
              onTouchStart={onSteerRight}
              onTouchEnd={onSteerRelease}
              onMouseDown={onSteerRight}
              onMouseUp={onSteerRelease}
              className="w-14 h-14 rounded-2xl bg-slate-900/85 border border-slate-700/80 active:bg-indigo-600/60 active:border-indigo-400 text-white font-black text-xl flex items-center justify-center select-none shadow-xl touch-manipulation cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

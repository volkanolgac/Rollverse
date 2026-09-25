import React from 'react';
import { ActiveRunState, PlayerStats } from '../types/game';
import { WORLDS } from '../game/constants';
import { RotateCcw, Play, Zap, Sparkles, Navigation, Award, Compass, Home } from 'lucide-react';
import { t, getLanguage } from '../services/i18n';

interface GameOverModalProps {
  runState: ActiveRunState;
  playerStats: PlayerStats;
  onContinueFromCheckpoint: () => void;
  onStartNewRun: () => void;
  onOpenBallScreen: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  runState,
  playerStats,
  onContinueFromCheckpoint,
  onStartNewRun,
  onOpenBallScreen,
  onHome
}) => {
  const lang = getLanguage();
  const world = WORLDS[runState.currentWorld] || WORLDS.GREEN_VALLEY;
  const isNewRecord = runState.distance > playerStats.bestDistance;

  return (
    <div id="game-over-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center my-auto">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" /> {lang === 'tr' ? 'Top Durumu' : 'Core Status'}
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {t('game_over')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('game_over_subtitle')}
          </p>
        </div>

        {/* New Record Banner */}
        {isNewRecord && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border border-amber-500/50 rounded-2xl py-2 px-4 flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="text-xs md:text-sm font-bold text-amber-300">
              {lang === 'tr' ? 'YENİ KİŞİSEL REKOR MESAFE!' : 'NEW PERSONAL RECORD DISTANCE!'}
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-left">
          {/* Distance */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-indigo-400" /> {t('stats_distance')}
            </span>
            <span className="text-xl font-black text-white font-mono mt-0.5">
              {runState.distance.toLocaleString()} <span className="text-xs font-normal text-slate-400">m</span>
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              {lang === 'tr' ? 'En İyi' : 'Best'}: {Math.max(runState.distance, playerStats.bestDistance).toLocaleString()} m
            </span>
          </div>

          {/* Gold Coins */}
          <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-3 flex flex-col">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              🪙 {t('stats_coins')}
            </span>
            <span className="text-xl font-black text-amber-300 font-mono mt-0.5">
              +{runState.coinsThisRun || 0}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              {lang === 'tr' ? 'Bu Koşuda Toplanan' : 'Earned This Run'}
            </span>
          </div>

          {/* Energy Collected */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> {t('stats_energy')}
            </span>
            <span className="text-xl font-black text-cyan-300 font-mono mt-0.5">
              {runState.energyThisRun}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              {lang === 'tr' ? 'Toplam' : 'Total'}: {(playerStats.totalEnergyCollected + runState.energyThisRun).toLocaleString()}
            </span>
          </div>

          {/* Road Fragments */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t('stats_fragments')}
            </span>
            <span className="text-xl font-black text-amber-300 font-mono mt-0.5">
              +{runState.fragmentsThisRun}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              {lang === 'tr' ? 'Toplam' : 'Total'}: {playerStats.totalFragmentsCollected + runState.fragmentsThisRun}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full pt-1">
          {runState.checkpointAvailable && (
            <button
              id="continue-checkpoint-btn"
              onClick={onContinueFromCheckpoint}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              {lang === 'tr' ? `Kayıt Noktasından Devam (${runState.checkpointDistance} m)` : `Continue from Checkpoint (${runState.checkpointDistance} m)`}
            </button>
          )}

          <button
            id="start-new-run-btn"
            onClick={onStartNewRun}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            {t('try_again')}
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="gameover-evolve-btn"
              onClick={onOpenBallScreen}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-2xl border border-slate-700 flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer text-xs md:text-sm"
            >
              <Sparkles className="w-4 h-4" /> {t('balls_skins').split(' ')[0]}
            </button>

            <button
              id="gameover-home-btn"
              onClick={onHome}
              className="py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold rounded-2xl border border-slate-700 flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer text-xs md:text-sm"
            >
              <Home className="w-4 h-4 text-slate-400" />
              {t('main_menu')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

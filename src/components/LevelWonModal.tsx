import React from 'react';
import { LevelWonEvent, PlayerStats } from '../types/game';
import { GAME_LEVELS } from '../game/constants';
import { Trophy, ChevronRight, RotateCcw, Home, Sparkles, Zap, Compass, Star, Infinity } from 'lucide-react';
import { t, getLanguage } from '../services/i18n';

interface LevelWonModalProps {
  levelEvent: LevelWonEvent;
  playerStats: PlayerStats;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onStartEndless: () => void;
  onHome: () => void;
}

export const LevelWonModal: React.FC<LevelWonModalProps> = ({
  levelEvent,
  playerStats,
  onNextLevel,
  onReplayLevel,
  onStartEndless,
  onHome
}) => {
  const lang = getLanguage();
  const currentLevelConfig = GAME_LEVELS.find(l => l.level === levelEvent.level) || GAME_LEVELS[0];
  const nextLevelConfig = GAME_LEVELS.find(l => l.level === levelEvent.level + 1);

  const curName = lang === 'en' && currentLevelConfig.nameEn ? currentLevelConfig.nameEn : currentLevelConfig.name;
  const curDesc = lang === 'en' && currentLevelConfig.descriptionEn ? currentLevelConfig.descriptionEn : currentLevelConfig.description;
  const nextName = nextLevelConfig ? (lang === 'en' && nextLevelConfig.nameEn ? nextLevelConfig.nameEn : nextLevelConfig.name) : '';

  return (
    <div id="level-won-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center my-auto relative overflow-hidden">
        {/* Glowing celebratory background gradient */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-lg">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{lang === 'tr' ? `Bölüm ${levelEvent.level} Geçildi` : `Level ${levelEvent.level} Cleared`}</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {t('level_won')}
          </h2>
          <p className="text-xs text-amber-200/80 mt-1 font-medium">
            {t('level_won_desc')}
          </p>
        </div>

        {/* Current Level Cleared Card */}
        <div className="relative z-10 bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 text-left flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg flex-shrink-0 text-slate-950 font-black text-xl">
            {levelEvent.level}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> {curName}
            </div>
            <div className="text-sm font-bold text-white truncate mt-0.5">
              {lang === 'tr' ? `Hedef: ${currentLevelConfig.targetDistance} Metre Tamamlandı` : `Goal: ${currentLevelConfig.targetDistance} Meters Cleared`}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {curDesc}
            </div>
          </div>
        </div>

        {/* Stats & Rewards Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-2.5 text-left">
          {/* Energy Orbs */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> {lang === 'tr' ? 'Kalan Enerji' : 'Energy Left'}
            </span>
            <span className="text-xl font-black text-cyan-300 font-mono mt-0.5">
              {levelEvent.energy}%
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {lang === 'tr' ? 'Kapıya ulaşıldı' : 'Gate reached'}
            </span>
          </div>

          {/* Road Fragments Bonus */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {lang === 'tr' ? 'Bölüm Ödülü' : 'Level Bonus'}
            </span>
            <span className="text-xl font-black text-amber-300 font-mono mt-0.5">
              +{currentLevelConfig.rewardFragments}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {t('stats_fragments')}
            </span>
          </div>
        </div>

        {/* Next Level Preview or Final Victory Celebration */}
        {nextLevelConfig ? (
          <div className="relative z-10 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5 text-left flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                {lang === 'tr' ? `Sıradaki Bölüm: Seviye ${nextLevelConfig.level}` : `Next Stage: Level ${nextLevelConfig.level}`}
              </span>
              <h4 className="text-sm font-bold text-slate-200 mt-0.5">
                {nextName}
              </h4>
              <p className="text-[11px] text-slate-400">
                {t('stats_distance')}: {nextLevelConfig.targetDistance} m
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300">
              <Star className="w-5 h-5" />
            </div>
          </div>
        ) : (
          <div className="relative z-10 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/50 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-black text-sm">
              <Trophy className="w-5 h-5 text-amber-400" /> {lang === 'tr' ? '100 BÖLÜMÜN TÜMÜ TAMAMLANDI!' : 'ALL 100 LEVELS COMPLETED!'}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {lang === 'tr' ? "Rollverse'in bütün evrenlerini fethettiniz! Şimdi Sonsuz Mod'da rekor kırın." : "You have conquered all 100 levels! Now push records in Endless Mode."}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col gap-2.5 pt-1">
          {nextLevelConfig ? (
            <button
              id="next-level-button"
              onClick={onNextLevel}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
            >
              <span>{t('next_level')} ({lang === 'tr' ? `Bölüm ${nextLevelConfig.level}` : `Level ${nextLevelConfig.level}`})</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              id="start-endless-button"
              onClick={onStartEndless}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-base rounded-2xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
            >
              <Infinity className="w-5 h-5" />
              <span>{t('endless_mode')}</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="replay-level-button"
              onClick={onReplayLevel}
              className="py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>{t('restart')}</span>
            </button>

            <button
              id="home-level-button"
              onClick={onHome}
              className="py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>{t('levels')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

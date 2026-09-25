import React, { useState } from 'react';
import { PlayerStats } from '../types/game';
import { GAME_LEVELS } from '../game/constants';
import { Trophy, Lock, CheckCircle2, Play, Infinity, ArrowLeft, Star, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { t, getLanguage } from '../services/i18n';

interface LevelsScreenProps {
  playerStats: PlayerStats;
  onSelectLevel: (level: number) => void;
  onStartEndless: () => void;
  onClose: () => void;
}

const PAGE_SIZE = 20;

export const LevelsScreen: React.FC<LevelsScreenProps> = ({
  playerStats,
  onSelectLevel,
  onStartEndless,
  onClose
}) => {
  const highestUnlocked = playerStats.highestLevelUnlocked || 1;
  const initialPage = Math.min(4, Math.floor((highestUnlocked - 1) / PAGE_SIZE));
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const lang = getLanguage();
  const totalPages = Math.ceil(GAME_LEVELS.length / PAGE_SIZE);
  const startIdx = currentPage * PAGE_SIZE;
  const pageLevels = GAME_LEVELS.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <div id="levels-screen" className="fixed inset-0 z-40 bg-slate-950/92 backdrop-blur-xl flex flex-col p-3 md:p-6 select-none overflow-y-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto mb-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{t('back')}</span>
        </button>

        <div className="flex items-center gap-2 text-center">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg md:text-2xl font-black text-white tracking-tight uppercase">
            {t('level_selector_title')}
          </h2>
        </div>

        <div className="px-3.5 py-1.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold">
          {t('unlocked_levels')}: {highestUnlocked} / {GAME_LEVELS.length}
        </div>
      </div>

      {/* Page Tabs for 100 Levels (1-20, 21-40, 41-60, 61-80, 81-100) */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center gap-1.5 md:gap-2 mb-4 overflow-x-auto pb-1">
        {Array.from({ length: totalPages }).map((_, pIdx) => {
          const rangeStart = pIdx * PAGE_SIZE + 1;
          const rangeEnd = Math.min(GAME_LEVELS.length, (pIdx + 1) * PAGE_SIZE);
          const isPageActive = currentPage === pIdx;
          const isPageUnlocked = highestUnlocked >= rangeStart;

          return (
            <button
              key={pIdx}
              onClick={() => setCurrentPage(pIdx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                isPageActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                  : isPageUnlocked
                  ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  : 'bg-slate-950/60 text-slate-600 border border-slate-900'
              }`}
            >
              <span>{rangeStart}-{rangeEnd}</span>
            </button>
          );
        })}
      </div>

      {/* Levels Grid */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pb-6">
        {pageLevels.map((lvl) => {
          const isUnlocked = lvl.level <= highestUnlocked;
          const isCompleted = lvl.level < highestUnlocked;
          const isCurrent = lvl.level === highestUnlocked;
          const levelName = lang === 'en' && lvl.nameEn ? lvl.nameEn : lvl.name;
          const levelDesc = lang === 'en' && lvl.descriptionEn ? lvl.descriptionEn : lvl.description;
          const hexRoad = `#${lvl.roadColor.toString(16).padStart(6, '0')}`;

          return (
            <div
              key={lvl.level}
              className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? isCurrent
                    ? 'bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-amber-500/80 shadow-lg shadow-amber-500/10 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shadow-inner ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isUnlocked
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800/40 text-slate-500 border border-slate-800'
                  }`}
                  style={{
                    boxShadow: isUnlocked ? `0 0 12px ${hexRoad}40` : undefined
                  }}
                >
                  {lvl.level}
                </div>

                {isCompleted ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> {t('level_status_completed')}
                  </div>
                ) : isUnlocked ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 text-amber-400" /> {t('level_status_active')}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" /> {t('level_status_locked')}
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div className="mb-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                    style={{ backgroundColor: hexRoad }}
                  />
                  <h3 className="text-sm font-black text-white truncate">{levelName}</h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">{levelDesc}</p>
                
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-indigo-400 font-semibold">
                    <Compass className="w-3 h-3" />
                    <span>{lvl.targetDistance} m</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Trophy className="w-3 h-3" />
                    <span>+{lvl.rewardFragments}</span>
                  </div>
                </div>
              </div>

              {/* Play / Locked Button */}
              {isUnlocked ? (
                <button
                  id={`play-level-btn-${lvl.level}`}
                  onClick={() => onSelectLevel(lvl.level)}
                  className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isCurrent ? t('play_now') : t('play_level')}</span>
                </button>
              ) : (
                <div className="w-full py-2 px-3 rounded-xl font-medium text-[11px] flex items-center justify-center gap-1.5 bg-slate-900/60 text-slate-500 border border-slate-800">
                  <Lock className="w-3 h-3" />
                  <span>{t('level_requirement')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls Footer */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentPage === 0 ? 'opacity-40 cursor-not-allowed text-slate-600 bg-slate-950' : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('page_prev')}</span>
        </button>

        <span className="text-xs text-slate-400 font-semibold">
          {t('page_indicator')} {currentPage + 1} / {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage === totalPages - 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentPage === totalPages - 1 ? 'opacity-40 cursor-not-allowed text-slate-600 bg-slate-950' : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800'
          }`}
        >
          <span>{t('page_next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Endless Mode Banner Card */}
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-indigo-950/60 border border-purple-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 flex-shrink-0">
            <Infinity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              {t('endless_mode')}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('endless_desc')}
            </p>
          </div>
        </div>

        <button
          id="play-endless-mode-btn"
          onClick={onStartEndless}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{t('endless_mode')}</span>
        </button>
      </div>
    </div>
  );
};

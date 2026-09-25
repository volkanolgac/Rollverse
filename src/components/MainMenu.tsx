import React from 'react';
import { PlayerStats, BallEvolution } from '../types/game';
import { Play, Disc, Globe, BookOpen, Trophy, Settings as SettingsIcon, Calendar, Sparkles, Navigation, Globe2 } from 'lucide-react';
import { t, getLanguage, setLanguage } from '../services/i18n';

interface MainMenuProps {
  playerStats: PlayerStats;
  currentEvolution: BallEvolution;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenBall: () => void;
  onOpenWorlds: () => void;
  onOpenCollection: () => void;
  onOpenAchievements: () => void;
  onOpenDaily: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  playerStats,
  currentEvolution,
  onPlay,
  onOpenLevels,
  onOpenBall,
  onOpenWorlds,
  onOpenCollection,
  onOpenAchievements,
  onOpenDaily,
  onOpenSettings
}) => {
  const currentLang = getLanguage();

  const toggleLanguage = () => {
    const nextLang = currentLang === 'tr' ? 'en' : 'tr';
    setLanguage(nextLang);
  };

  return (
    <div id="main-menu-overlay" className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 md:p-10 select-none overflow-y-auto">
      {/* Top Bar: Player Stats Overview & Quick Language Switcher */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto gap-2">
        {/* Left: Best Distance */}
        <div className="flex items-center gap-2.5 bg-slate-950/70 backdrop-blur-md border border-slate-800/80 rounded-2xl px-3.5 py-2 shadow-lg">
          <Navigation className="w-4 h-4 text-indigo-400" />
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{t('stats_distance')}</div>
            <div className="text-base sm:text-lg font-black text-white font-mono">
              {playerStats.bestDistance.toLocaleString()} <span className="text-xs font-normal text-indigo-300">m</span>
            </div>
          </div>
        </div>

        {/* Right: Fragments, Ball Pill, and Quick Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Language Toggle Button */}
          <button
            id="main-language-toggle-btn"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/50 rounded-2xl text-xs font-black text-white shadow-lg transition-all active:scale-95 cursor-pointer"
            title="Dili Değiştir / Change Language"
          >
            <Globe2 className="w-4 h-4 text-indigo-400" />
            <span>{currentLang === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}</span>
          </button>

          {/* Fragments */}
          <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md border border-amber-500/40 rounded-2xl px-3.5 py-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{t('stats_fragments')}</div>
              <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
                {playerStats.totalFragmentsCollected}
              </div>
            </div>
          </div>

          {/* Current Ball Pill */}
          <div 
            onClick={onOpenBall}
            className="hidden md:flex items-center gap-2.5 bg-slate-950/70 backdrop-blur-md border border-slate-800 hover:border-slate-600 rounded-2xl px-3.5 py-2 shadow-lg cursor-pointer transition-colors"
          >
            <div 
              className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]"
              style={{ backgroundColor: currentEvolution.coreGlow }}
            />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{t('balls_skins')}</div>
              <div className="text-xs font-bold text-white truncate max-w-[100px]">
                {currentEvolution.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Title & Subtitle */}
      <div className="flex flex-col items-center justify-center text-center my-auto py-6">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-bold tracking-wider uppercase mb-3 backdrop-blur-md shadow-lg shadow-indigo-950/50">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 100 {t('levels')} • 3D ROLLING ADVENTURE
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tight drop-shadow-2xl">
          ROLLVERSE
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base font-extrabold text-indigo-300 tracking-widest uppercase mt-2 max-w-xl">
          {currentLang === 'tr' ? "YOLU TAKİP ETME. YOLU SEN YARAT." : "YOU DON'T FOLLOW THE ROAD. YOU CREATE IT."}
        </p>

        {/* Big PLAY Button & Level Selection */}
        <div className="mt-7 flex flex-col items-center gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              id="main-play-btn"
              onClick={onPlay}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-black text-lg md:text-xl rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_rgba(168,85,247,0.7)] transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-3 select-none"
            >
              <Play className="w-6 h-6 fill-current group-hover:translate-x-1 transition-transform" />
              <span>{t('play')} (LVL {playerStats.highestLevelUnlocked || 1})</span>
            </button>

            <button
              id="main-levels-btn"
              onClick={onOpenLevels}
              className="px-6 py-4 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-black text-sm md:text-base rounded-3xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2 select-none"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>{t('levels')}</span>
            </button>
          </div>
          <span className="text-xs text-slate-400 font-medium">{t('desktop_controls')}</span>
        </div>
      </div>

      {/* Bottom Navigation Buttons Grid */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {/* BALL */}
          <button
            id="nav-ball-btn"
            onClick={onOpenBall}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-md"
          >
            <Disc className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('balls_skins').split(' ')[0]}</span>
          </button>

          {/* WORLDS */}
          <button
            id="nav-worlds-btn"
            onClick={onOpenWorlds}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-md"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('worlds')}</span>
          </button>

          {/* COLLECTION */}
          <button
            id="nav-collection-btn"
            onClick={onOpenCollection}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-md"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('collection')}</span>
          </button>

          {/* ACHIEVEMENTS */}
          <button
            id="nav-achievements-btn"
            onClick={onOpenAchievements}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-yellow-500/60 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-md"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('achievements')}</span>
          </button>

          {/* DAILY CHALLENGE */}
          <button
            id="nav-daily-btn"
            onClick={onOpenDaily}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-md"
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('daily_challenge').split(' ')[0]}</span>
          </button>

          {/* SETTINGS */}
          <button
            id="nav-settings-btn"
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-md"
          >
            <SettingsIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('settings')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

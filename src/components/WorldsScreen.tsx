import React from 'react';
import { PlayerStats, WorldConfig } from '../types/game';
import { WORLDS } from '../game/constants';
import { ArrowLeft, Lock, Navigation, Sparkles, Compass } from 'lucide-react';
import { t, getLanguage, WORLDS_TR, ENERGY_CONFIGS_TR } from '../services/i18n';

interface WorldsScreenProps {
  playerStats: PlayerStats;
  onBack: () => void;
}

export const WorldsScreen: React.FC<WorldsScreenProps> = ({ playerStats, onBack }) => {
  const worldList: WorldConfig[] = Object.values(WORLDS);
  const lang = getLanguage();

  return (
    <div id="worlds-screen-overlay" className="fixed inset-0 z-30 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 md:p-8 overflow-y-auto animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto pb-4 border-b border-slate-800">
        <button
          id="worlds-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-2xl transition-transform active:scale-95 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">{t('back')}</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-900 border border-indigo-500/40 px-4 py-2 rounded-2xl shadow-md">
          <Compass className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('discovered_badge')}:</span>
          <span className="text-base font-black text-indigo-300 font-mono">
            {playerStats.unlockedWorlds.length} / {worldList.length}
          </span>
        </div>
      </div>

      <div className="text-center my-6">
        <h2 className="text-3xl md:text-4xl font-black text-white">{t('worlds_title')}</h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          {t('worlds_subtitle')}
        </p>
      </div>

      {/* World Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto w-full pb-10">
        {worldList.map(world => {
          const isUnlocked = playerStats.unlockedWorlds.includes(world.id) || playerStats.bestDistance >= world.unlockDistance;
          const bestDistance = playerStats.worldBestDistances[world.id] || 0;

          const trWorld = WORLDS_TR[world.id];
          const worldName = lang === 'tr' && trWorld ? trWorld.name : world.name;
          const worldTitle = lang === 'tr' && trWorld ? trWorld.title : world.title;
          const worldDesc = lang === 'tr' && trWorld ? trWorld.description : world.description;

          return (
            <div
              key={world.id}
              className={`rounded-3xl border overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-200 ${
                isUnlocked
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/80 border-slate-900 opacity-65'
              }`}
            >
              {/* Visual Banner */}
              <div
                className="h-32 relative flex items-end p-4"
                style={{
                  background: `linear-gradient(135deg, ${world.skyColorTop}, ${world.skyColorBottom})`
                }}
              >
                <div className="absolute top-3 right-3">
                  {isUnlocked ? (
                    <span className="px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                      {t('discovered_badge')}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {t('locked')}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-black text-white drop-shadow-md">
                    {worldName}
                  </h3>
                  <p className="text-xs text-white/80 font-medium drop-shadow-sm">
                    {worldTitle}
                  </p>
                </div>
              </div>

              {/* Description & Environment Details */}
              <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {worldDesc}
                </p>

                {/* Primary Elemental Energy */}
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 font-medium">{t('primary_resonance')}</span>
                  <span className="font-bold text-cyan-300 uppercase tracking-wider">
                    {lang === 'tr' && ENERGY_CONFIGS_TR[world.primaryEnergy]
                      ? ENERGY_CONFIGS_TR[world.primaryEnergy].name
                      : `${world.primaryEnergy} Energy`}
                  </span>
                </div>

                {/* Discovery Requirement & Best Distance */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">{t('req_distance')}</span>
                    <span className="text-slate-200 font-bold">{world.unlockDistance.toLocaleString()} m</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">{t('best_exploration')}</span>
                    <span className="text-indigo-400 font-bold">{bestDistance.toLocaleString()} m</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

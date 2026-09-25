import React, { useState } from 'react';
import { PlayerStats } from '../types/game';
import { ENERGY_CONFIGS, BALL_EVOLUTIONS, WORLDS, MYSTERY_EVENTS_LIST } from '../game/constants';
import { ArrowLeft, BookOpen, HelpCircle, CheckCircle2, Sparkles, Zap, Globe, Disc, Compass } from 'lucide-react';
import { t, getLanguage, BALL_EVOLUTIONS_TR, WORLDS_TR, MYSTERY_EVENTS_TR, ENERGY_CONFIGS_TR } from '../services/i18n';

interface CollectionScreenProps {
  playerStats: PlayerStats;
  onBack: () => void;
}

type CollectionCategory = 'energy' | 'fragments' | 'events' | 'worlds' | 'balls';

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ playerStats, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<CollectionCategory>('energy');
  const lang = getLanguage();

  const categories: { id: CollectionCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'energy', label: t('cat_energy'), icon: <Zap className="w-4 h-4 text-cyan-400" /> },
    { id: 'fragments', label: t('cat_fragments'), icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'events', label: t('cat_events'), icon: <Compass className="w-4 h-4 text-purple-400" /> },
    { id: 'worlds', label: t('cat_worlds'), icon: <Globe className="w-4 h-4 text-emerald-400" /> },
    { id: 'balls', label: t('cat_balls'), icon: <Disc className="w-4 h-4 text-pink-400" /> },
  ];

  return (
    <div id="collection-screen-overlay" className="fixed inset-0 z-30 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 md:p-8 overflow-y-auto animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto pb-4 border-b border-slate-800">
        <button
          id="collection-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-2xl transition-transform active:scale-95 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">{t('back')}</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/40 px-4 py-2 rounded-2xl shadow-md">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('compendium_title')}</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 my-6 max-w-4xl mx-auto">
        {categories.map(cat => (
          <button
            key={cat.id}
            id={`collection-cat-${cat.id}`}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Album Content Container */}
      <div className="w-full max-w-5xl mx-auto flex-1 pb-10">
        {/* Category: Energy */}
        {selectedCategory === 'energy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(ENERGY_CONFIGS).map(conf => {
              const count = playerStats.roadMemory.energyCollected[conf.type] || 0;
              const trConf = ENERGY_CONFIGS_TR[conf.type];
              const confName = lang === 'tr' && trConf ? trConf.name : conf.name;
              const confDesc = lang === 'tr' && trConf ? trConf.description : conf.description;
              const confInfl = lang === 'tr' && trConf ? trConf.influence : conf.influence;

              return (
                <div
                  key={conf.type}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded-full shadow-md"
                          style={{ backgroundColor: conf.glowColor }}
                        />
                        <h4 className="font-bold text-white text-base">{confName}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                        {count.toLocaleString()} {t('harvested')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {confDesc}
                    </p>

                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                        {t('road_memory_influence')}
                      </span>
                      <p className="text-xs text-slate-400">
                        {confInfl}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Category: Road Fragments */}
        {selectedCategory === 'fragments' && (
          <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Sparkles className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-white">{t('luminous_fragments_title')}</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
              {t('luminous_fragments_desc')}
            </p>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-around font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">{t('total_discovered')}</span>
                <span className="text-2xl font-black text-amber-300">
                  {playerStats.totalFragmentsCollected}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">{t('fragments_spent')}</span>
                <span className="text-2xl font-black text-slate-300">
                  {Math.max(0, playerStats.unlockedEvolutions.length * 20 - 20)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Category: Mystery Events */}
        {selectedCategory === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MYSTERY_EVENTS_LIST.map(event => {
              const isDiscovered = playerStats.discoveredMysteryEvents.includes(event.id) || playerStats.bestDistance > 2000;
              const trEvent = MYSTERY_EVENTS_TR[event.id];
              const eventName = lang === 'tr' && trEvent ? trEvent.name : event.name;
              const eventDesc = lang === 'tr' && trEvent ? trEvent.description : event.description;

              return (
                <div
                  key={event.id}
                  className={`bg-slate-900/80 border rounded-3xl p-5 flex flex-col justify-between shadow-xl ${
                    isDiscovered ? 'border-slate-800' : 'border-slate-800/60 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                      {isDiscovered ? event.icon : <HelpCircle className="w-6 h-6 text-slate-600" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {isDiscovered ? eventName : t('unknown_anomaly')}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">
                        {isDiscovered ? eventDesc : t('anomaly_desc_hidden')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Category: Worlds */}
        {selectedCategory === 'worlds' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(WORLDS).map(world => {
              const isDiscovered = playerStats.unlockedWorlds.includes(world.id) || playerStats.bestDistance >= world.unlockDistance;
              const trWorld = WORLDS_TR[world.id];
              const worldName = lang === 'tr' && trWorld ? trWorld.name : world.name;
              const worldTitle = lang === 'tr' && trWorld ? trWorld.title : world.title;

              return (
                <div
                  key={world.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white text-base">
                        {isDiscovered ? worldName : (lang === 'tr' ? 'Keşfedilmemiş Bölge' : 'Uncharted Sector')}
                      </h4>
                      {isDiscovered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isDiscovered ? worldTitle : (lang === 'tr' ? `Şart: ${world.unlockDistance.toLocaleString()} m Mesafeye Ulaş` : `Requirement: Reach ${world.unlockDistance.toLocaleString()} m`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Category: Ball Evolutions */}
        {selectedCategory === 'balls' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BALL_EVOLUTIONS.map(evo => {
              const trEvo = BALL_EVOLUTIONS_TR[evo.id];
              const ballName = lang === 'tr' && trEvo ? trEvo.name : evo.name;
              const abilityName = lang === 'tr' && trEvo ? trEvo.abilityName : evo.abilityName;
              const abilityDesc = lang === 'tr' && trEvo ? trEvo.abilityDescription : evo.abilityDescription;

              return (
                <div
                  key={evo.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full shadow-md flex-shrink-0"
                      style={{ backgroundColor: evo.coreGlow }}
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{ballName}</h4>
                      <span className="text-[11px] text-slate-400">{abilityName}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{abilityDesc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { BallEvolution, CosmeticTrail, PlayerStats } from '../types/game';
import { BALL_EVOLUTIONS, COSMETIC_TRAILS } from '../game/constants';
import { ArrowLeft, Check, Lock, Sparkles, Zap, Shield, Flame } from 'lucide-react';
import { audioService } from '../services/audio';
import { t, getLanguage, BALL_EVOLUTIONS_TR, COSMETIC_TRAILS_TR } from '../services/i18n';

interface BallScreenProps {
  playerStats: PlayerStats;
  onSelectEvolution: (id: BallEvolution['id']) => void;
  onUnlockEvolution: (id: BallEvolution['id'], costFragments: number) => void;
  onSelectTrail: (id: CosmeticTrail['id']) => void;
  onUnlockTrail: (id: CosmeticTrail['id'], costFragments: number) => void;
  onBack: () => void;
}

export const BallScreen: React.FC<BallScreenProps> = ({
  playerStats,
  onSelectEvolution,
  onUnlockEvolution,
  onSelectTrail,
  onUnlockTrail,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'evolutions' | 'trails'>('evolutions');
  const lang = getLanguage();

  return (
    <div id="ball-screen-overlay" className="fixed inset-0 z-30 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 md:p-8 overflow-y-auto animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto pb-4 border-b border-slate-800">
        <button
          id="ball-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-2xl transition-transform active:scale-95 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">{t('back')}</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/40 px-4 py-2 rounded-2xl shadow-md">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('stats_fragments')}:</span>
          <span className="text-base font-black text-amber-300 font-mono">
            {playerStats.totalFragmentsCollected}
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-center gap-3 my-6">
        <button
          id="tab-evolutions-btn"
          onClick={() => setActiveTab('evolutions')}
          className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'evolutions'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          {t('tab_evolutions')}
        </button>
        <button
          id="tab-trails-btn"
          onClick={() => setActiveTab('trails')}
          className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'trails'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          {t('tab_trails')}
        </button>
      </div>

      {/* Content Grid */}
      <div className="w-full max-w-5xl mx-auto flex-1">
        {activeTab === 'evolutions' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {BALL_EVOLUTIONS.map(evo => {
              const isUnlocked = playerStats.unlockedEvolutions.includes(evo.id);
              const isEquipped = playerStats.selectedEvolution === evo.id;
              const canAfford = playerStats.totalFragmentsCollected >= evo.costFragments;

              const trData = BALL_EVOLUTIONS_TR[evo.id];
              const evoName = lang === 'tr' && trData ? trData.name : evo.name;
              const evoSubtitle = lang === 'tr' && trData ? trData.subtitle : evo.subtitle;
              const evoDesc = lang === 'tr' && trData ? trData.description : evo.description;
              const abilityName = lang === 'tr' && trData ? trData.abilityName : evo.abilityName;
              const abilityDesc = lang === 'tr' && trData ? trData.abilityDescription : evo.abilityDescription;
              const specialMech = lang === 'tr' && trData ? trData.specialMechanic : evo.specialMechanic;

              return (
                <div
                  key={evo.id}
                  className={`bg-slate-900/80 border rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xl ${
                    isEquipped
                      ? 'border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                      : isUnlocked
                      ? 'border-slate-800 hover:border-slate-700'
                      : 'border-slate-800/60 opacity-80'
                  }`}
                >
                  {/* Sphere Visual Icon & Header */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* 3D-styled Sphere Icon */}
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, #ffffff, ${evo.coreGlow})`,
                            boxShadow: `0 0 16px ${evo.coreGlow}66`
                          }}
                        >
                          <div className="w-4 h-4 rounded-full bg-white/70 blur-[1px]" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-base leading-tight">
                            {evoName}
                          </h3>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {evoSubtitle}
                          </span>
                        </div>
                      </div>

                      {isEquipped ? (
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {t('equipped')}
                        </span>
                      ) : !isUnlocked ? (
                        <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {t('locked')}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {evoDesc}
                    </p>

                    {/* Active Ability Box */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 mb-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" /> {abilityName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {evo.abilityCooldown}{t('cooldown_short')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {abilityDesc}
                      </p>
                    </div>

                    {/* Passive Perk */}
                    <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mb-4">
                      <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{specialMech}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800/80">
                    {isEquipped ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-800 text-slate-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-default"
                      >
                        <Check className="w-4 h-4" /> {t('equipped')}
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          audioService.playButtonClick();
                          onSelectEvolution(evo.id);
                        }}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition-transform active:scale-95 cursor-pointer shadow-md shadow-indigo-600/30"
                      >
                        {t('equip_btn')}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            audioService.playEvolution();
                            onUnlockEvolution(evo.id, evo.costFragments);
                          }
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md cursor-pointer'
                            : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {canAfford ? `${evo.costFragments} ${t('unlock_btn')}` : `${evo.costFragments} ${t('need_fragments')}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Cosmetic Trails Tab */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-8">
            {COSMETIC_TRAILS.map(trail => {
              const isUnlocked = playerStats.unlockedTrails.includes(trail.id);
              const isEquipped = playerStats.selectedTrail === trail.id;
              const canAfford = playerStats.totalFragmentsCollected >= trail.costFragments;

              const trTrail = COSMETIC_TRAILS_TR[trail.id];
              const trailName = lang === 'tr' && trTrail ? trTrail.name : trail.name;

              return (
                <div
                  key={trail.id}
                  className={`bg-slate-900/80 border rounded-3xl p-5 flex flex-col justify-between transition-all shadow-xl ${
                    isEquipped
                      ? 'border-indigo-500 shadow-indigo-500/20'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full shadow-md flex items-center justify-center"
                          style={{ backgroundColor: `#${trail.hexColor.toString(16).padStart(6, '0')}` }}
                        >
                          <Flame className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-bold text-white text-sm">{trailName}</h4>
                      </div>
                      {isEquipped && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                          {t('equipped')}
                        </span>
                      )}
                    </div>

                    <div className="h-2 w-full rounded-full overflow-hidden bg-slate-950 mb-4">
                      <div
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(90deg, #${trail.hexColor.toString(16).padStart(6, '0')}, transparent)`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <button disabled className="w-full py-2 bg-slate-800 text-slate-400 font-bold rounded-2xl text-xs">
                        {t('equipped')}
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          audioService.playButtonClick();
                          onSelectTrail(trail.id);
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs cursor-pointer active:scale-95"
                      >
                        {t('equip_btn')}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            audioService.playFragmentCollect();
                            onUnlockTrail(trail.id, trail.costFragments);
                          }
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" /> {canAfford ? `${trail.costFragments} ${t('unlock_btn')}` : `${trail.costFragments} ${t('need_fragments')}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

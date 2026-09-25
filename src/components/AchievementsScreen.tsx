import React from 'react';
import { PlayerStats, Achievement } from '../types/game';
import { ArrowLeft, Trophy, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { audioService } from '../services/audio';
import { t, getLanguage, ACHIEVEMENTS_TR } from '../services/i18n';

interface AchievementsScreenProps {
  playerStats: PlayerStats;
  onClaimAchievement: (id: string, rewardFragments: number) => void;
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  playerStats,
  onClaimAchievement,
  onBack
}) => {
  const lang = getLanguage();

  return (
    <div id="achievements-screen-overlay" className="fixed inset-0 z-30 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 md:p-8 overflow-y-auto animate-fade-in select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto pb-4 border-b border-slate-800">
        <button
          id="achievements-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-2xl transition-transform active:scale-95 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">{t('back')}</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-900 border border-yellow-500/40 px-4 py-2 rounded-2xl shadow-md">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('achievements')}:</span>
          <span className="text-base font-black text-yellow-300 font-mono">
            {playerStats.achievements.filter(a => a.unlocked).length} / {playerStats.achievements.length}
          </span>
        </div>
      </div>

      <div className="text-center my-6">
        <h2 className="text-3xl font-black text-white">{t('achievements_title')}</h2>
        <p className="text-xs text-slate-400 mt-1">
          {t('achievements_subtitle')}
        </p>
      </div>

      {/* List */}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 pb-10">
        {playerStats.achievements.map((ach: Achievement) => {
          // Dynamic calculation of current progress if not updated
          let currentProgress = ach.current;
          if (ach.id === 'FIRST_ROLL') currentProgress = Math.max(currentProgress, playerStats.bestDistance);
          else if (ach.id === 'LONG_JOURNEY') currentProgress = Math.max(currentProgress, playerStats.totalDistance);
          else if (ach.id === 'ROAD_MAKER') currentProgress = Math.max(currentProgress, playerStats.totalFragmentsCollected);
          else if (ach.id === 'RISK_TAKER') currentProgress = Math.max(currentProgress, playerStats.roadMemory.riskyRoutesChosen);
          else if (ach.id === 'COSMIC_TRAVELER') currentProgress = playerStats.unlockedEvolutions.includes('COSMIC_CORE') ? 1 : 0;
          else if (ach.id === 'EXPLORER') currentProgress = Math.max(currentProgress, playerStats.discoveredMysteryEvents.length + playerStats.roadMemory.portalsEntered);

          const isUnlocked = ach.unlocked || currentProgress >= ach.requirement;
          const progressPercent = Math.min(100, Math.floor((currentProgress / ach.requirement) * 100));

          const trAch = ACHIEVEMENTS_TR[ach.id];
          const achTitle = lang === 'tr' && trAch ? trAch.title : ach.title;
          const achDesc = lang === 'tr' && trAch ? trAch.description : ach.description;

          return (
            <div
              key={ach.id}
              className={`bg-slate-900/80 border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all shadow-lg ${
                isUnlocked
                  ? 'border-yellow-500/30'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isUnlocked
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-md shadow-yellow-500/20'
                      : 'bg-slate-950 text-slate-600 border border-slate-800'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm truncate">{achTitle}</h4>
                    {isUnlocked && (
                      <span className="text-[10px] text-yellow-300 font-bold bg-yellow-950/60 px-2 py-0.5 rounded-full border border-yellow-500/30">
                        {t('ach_completed')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{achDesc}</p>

                  {/* Progress Bar */}
                  {!isUnlocked && (
                    <div className="w-full max-w-xs mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {currentProgress} / {ach.requirement}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reward / Claim */}
              <div className="flex-shrink-0">
                {ach.claimed ? (
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('ach_claimed')}
                  </span>
                ) : isUnlocked ? (
                  <button
                    onClick={() => {
                      audioService.playAchievement();
                      onClaimAchievement(ach.id, ach.rewardFragments);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {t('ach_claim')} +{ach.rewardFragments}
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    +{ach.rewardFragments}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { DailyChallenge, PlayerStats } from '../types/game';
import { ArrowLeft, Calendar, Sparkles, Zap, CheckCircle2, Award } from 'lucide-react';
import { audioService } from '../services/audio';
import { t, getLanguage } from '../services/i18n';

interface DailyChallengeModalProps {
  playerStats: PlayerStats;
  onClaimDaily: () => void;
  onBack: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  playerStats,
  onClaimDaily,
  onBack
}) => {
  const challenge = playerStats.dailyChallenge;
  const isCompleted = challenge.completed;
  const canClaim = !isCompleted && challenge.current >= challenge.target;
  const progressPercent = Math.min(100, Math.floor((challenge.current / challenge.target) * 100));
  const lang = getLanguage();

  // Localized title & description if in Turkish
  let challengeTitle = challenge.title;
  let challengeDesc = challenge.description;
  if (lang === 'tr') {
    if (challenge.goalType === 'distance') {
      challengeTitle = 'Sonsuz Yol Yolcusu';
      challengeDesc = `Bugün tek bir koşuda en az ${challenge.target.toLocaleString()} metre yol katet.`;
    } else if (challenge.goalType === 'energy_blue') {
      challengeTitle = 'Su Enerjisi Rezonansı';
      challengeDesc = `Bugün yoldan ${challenge.target} adet Mavi Su Enerjisi küresi topla.`;
    } else if (challenge.goalType === 'risky_routes') {
      challengeTitle = 'Cesur Yol Koşucusu';
      challengeDesc = `Bugün ${challenge.target} adet Yüksek Riskli yol ayrımını başarıyla geç.`;
    } else if (challenge.goalType === 'world_reach') {
      challengeTitle = 'Volkanik Tırmanış';
      challengeDesc = `Bugün Volkan Diyarı'na veya ${challenge.target.toLocaleString()} metre mesafeye ulaş.`;
    } else if (challenge.goalType === 'fragments') {
      challengeTitle = 'Kristal Koleksiyoncusu';
      challengeDesc = `Bugün yolda ${challenge.target} adet Işıltılı Yol Kristali topla.`;
    }
  }

  return (
    <div id="daily-challenge-modal" className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" /> {t('daily_title')}
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            {challenge.dateString}
          </span>
        </div>

        <div className="my-2">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/20">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white">{challengeTitle}</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xs mx-auto">
            {challengeDesc}
          </p>
        </div>

        {/* Progress Display */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">{t('daily_progress')}</span>
            <span className="text-white font-mono">{challenge.current} / {challenge.target}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Rewards Box */}
        <div className="flex items-center justify-around bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('daily_reward')}</span>
              <span className="text-sm font-black text-amber-300 font-mono">+{challenge.rewardFragments} {t('stats_fragments')}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('daily_bonus')}</span>
              <span className="text-sm font-black text-cyan-300 font-mono">+{challenge.rewardEnergy} {t('stats_energy')}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2 pt-2">
          {isCompleted ? (
            <div className="py-3 px-5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {t('daily_claimed')}
            </div>
          ) : canClaim ? (
            <button
              onClick={() => {
                audioService.playAchievement();
                onClaimDaily();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-2xl text-sm transition-transform active:scale-95 cursor-pointer shadow-lg shadow-amber-500/30"
            >
              {t('daily_claim_btn')}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3.5 bg-slate-850 bg-slate-800/50 text-slate-500 border border-slate-800 font-bold rounded-2xl text-xs cursor-not-allowed"
            >
              {t('daily_in_progress')}
            </button>
          )}

          <button
            onClick={onBack}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs transition-colors cursor-pointer"
          >
            {t('close_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};

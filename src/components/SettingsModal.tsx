import React, { useState } from 'react';
import { GameSettings, Language } from '../types/game';
import { Volume2, VolumeX, Music, Smartphone, Gauge, Sliders, Trash2, Globe, AlertTriangle } from 'lucide-react';
import { audioService } from '../services/audio';
import { t, setLanguage } from '../services/i18n';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onBack: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onBack
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    onUpdateSettings({ language: lang });
  };

  return (
    <div id="settings-modal-backdrop" className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xl font-black text-white">{t('settings')}</h3>
          <button
            id="settings-back-btn"
            onClick={onBack}
            className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 transition-colors cursor-pointer"
          >
            {t('done')}
          </button>
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-3">
          {/* Language Selection */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-white">
                <Globe className="w-4 h-4 text-indigo-400" /> {t('language')}
              </span>
              <span className="text-indigo-300 font-bold uppercase text-[10px]">
                {settings.language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleLanguageChange('tr')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  settings.language === 'tr'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span>🇹🇷</span>
                <span>Türkçe</span>
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  settings.language === 'en'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
              <div>
                <div className="text-xs font-bold text-white">{t('sound_fx')}</div>
                <div className="text-[10px] text-slate-400">{t('sound_desc')}</div>
              </div>
            </div>
            <button
              onClick={() => {
                audioService.setSoundEnabled(!settings.soundEnabled);
                onUpdateSettings({ soundEnabled: !settings.soundEnabled });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.soundEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Background Music */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <Music className={`w-5 h-5 ${settings.musicEnabled ? 'text-purple-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-bold text-white">{t('music')}</div>
                <div className="text-[10px] text-slate-400">{t('music_desc')}</div>
              </div>
            </div>
            <button
              onClick={() => {
                audioService.setMusicEnabled(!settings.musicEnabled);
                onUpdateSettings({ musicEnabled: !settings.musicEnabled });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.musicEnabled ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.musicEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Vibration / Haptics */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <Smartphone className={`w-5 h-5 ${settings.vibrationEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-bold text-white">{t('vibration')}</div>
                <div className="text-[10px] text-slate-400">{t('vibration_desc')}</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.vibrationEnabled ? 'bg-cyan-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.vibrationEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Graphics Quality */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-white">
                <Gauge className="w-4 h-4 text-emerald-400" /> {t('graphics')}
              </span>
              <span className="text-emerald-400 font-mono uppercase text-[10px]">
                {settings.graphicsQuality}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => onUpdateSettings({ graphicsQuality: q })}
                  className={`py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    settings.graphicsQuality === q
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Control Sensitivity */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-white">
                <Sliders className="w-4 h-4 text-amber-400" /> {t('sensitivity')}
              </span>
              <span className="text-amber-300 font-mono">
                {settings.sensitivity.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.sensitivity}
              onChange={e => onUpdateSettings({ sensitivity: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Reset Progress Confirmation Dialog */}
          {showConfirmReset ? (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 flex flex-col gap-3 text-center animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" /> {t('reset_data')}?
              </div>
              <p className="text-[11px] text-slate-300">
                {t('reset_confirm')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {t('reset_data')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 rounded-2xl border border-red-900/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> {t('reset_data')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

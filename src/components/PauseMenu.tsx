import React from 'react';
import { Play, RotateCcw, Settings as SettingsIcon, Home } from 'lucide-react';
import { t } from '../services/i18n';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onQuitToMenu
}) => {
  return (
    <div id="pause-modal-backdrop" className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-5">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">{t('pause')}</h2>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            id="pause-resume-btn"
            onClick={onResume}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            {t('resume')}
          </button>

          <button
            id="pause-restart-btn"
            onClick={onRestart}
            className="w-full py-3 px-5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {t('restart')}
          </button>

          <button
            id="pause-settings-btn"
            onClick={onOpenSettings}
            className="w-full py-3 px-5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition-transform active:scale-95 cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4" />
            {t('settings')}
          </button>

          <button
            id="pause-menu-btn"
            onClick={onQuitToMenu}
            className="w-full py-3 px-5 bg-slate-800/50 hover:bg-red-950/40 text-red-300 font-semibold rounded-2xl flex items-center justify-center gap-2 border border-slate-800 hover:border-red-800/50 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            {t('main_menu')}
          </button>
        </div>
      </div>
    </div>
  );
};

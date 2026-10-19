import React from 'react';
import { Eye, BookOpen, Globe } from 'lucide-react';
import { EyeCareSettings } from '../types';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';

interface HeaderProps {
  onOpenPassageBrowser: () => void;
  onOpenEyeShield: () => void;
  onOpenRankGuide: () => void;
  onOpenStats: () => void;
  onOpenSoundSettings?: () => void;
  eyeSettings: EyeCareSettings;
  currentPassageId: number;
  language: AppLanguage;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPassageBrowser,
  onOpenEyeShield,
  onOpenRankGuide,
  onOpenStats,
  onOpenSoundSettings,
  eyeSettings,
  currentPassageId,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-neutral-900 bg-black/95 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#arena" 
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_12px_rgba(251,191,36,0.7)]"></span>
          <span>{t.appName}</span>
        </a>
        <span className="hidden sm:inline-block text-xs text-neutral-500 font-mono">
          #{currentPassageId}
        </span>
      </div>

      {/* Zone 2: clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
        <button
          onClick={onOpenPassageBrowser}
          className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 opacity-70" />
          <span>{t.library}</span>
        </button>
        <button
          onClick={onOpenEyeShield}
          className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-4 h-4 opacity-70" />
          <span>{eyeSettings.enabled ? t.eyeShieldActive : t.eyeShield}</span>
        </button>
        {onOpenSoundSettings && (
          <button
            onClick={onOpenSoundSettings}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t.sound}</span>
          </button>
        )}
        <button
          onClick={onOpenRankGuide}
          className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>{t.typistTitles}</span>
        </button>
        <button
          onClick={onOpenStats}
          className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>{t.records}</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action button + language toggle */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleLanguage}
          className="px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          title="Switch Language / Đổi Ngôn Ngữ"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold uppercase">{language}</span>
        </button>

        <button
          onClick={onOpenPassageBrowser}
          className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t.browsePassages}</span>
        </button>
      </div>
    </header>
  );
};

import React, { useMemo } from 'react';
import { 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Eye, 
  BookOpen, 
  Clock, 
  Globe 
} from 'lucide-react';
import { Passage } from '../data/passages';
import { TimerMode, EyeCareSettings, TypingMetrics } from '../types';
import { soundEngine, SoundProfile } from '../utils/audio';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { TypingBox } from './TypingBox';

interface TypingArenaProps {
  passage: Passage;
  mode: TimerMode;
  onModeChange: (newMode: TimerMode) => void;
  eyeSettings: EyeCareSettings;
  onOpenEyeShield: () => void;
  onOpenPassageBrowser: () => void;
  onFinishTest: (metrics: TypingMetrics) => void;
  soundProfile: SoundProfile;
  onSoundProfileChange: (profile: SoundProfile) => void;
  onOpenSoundSettings: () => void;
  language: AppLanguage;
  onToggleLanguage: () => void;
  isAnyModalOpen?: boolean;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  passage,
  mode,
  onModeChange,
  eyeSettings,
  onOpenEyeShield,
  onOpenPassageBrowser,
  onFinishTest,
  soundProfile,
  onSoundProfileChange,
  onOpenSoundSettings,
  language,
  onToggleLanguage,
  isAnyModalOpen = false,
}) => {
  const t = TRANSLATIONS[language];
  const targetDuration = mode === '30s' ? 30 : mode === '1m' ? 60 : 0;
  const engineMode = mode === 'passage' ? 'passage' : 'time';

  // Core Monkeytype-inspired high-performance engine hook
  const {
    state,
    metrics,
    handleKeyDown,
    handleInputChange,
    handleCompositionStart,
    handleCompositionEnd,
    resetEngine,
  } = useTypingEngine({
    initialText: passage.text,
    mode: engineMode,
    targetDuration,
    onComplete: onFinishTest,
    allowBacktrackWord: true,
  });

  // Audio cycle
  const cycleSoundProfile = () => {
    const profiles: SoundProfile[] = ['thock', 'clicky', 'typewriter', 'muted'];
    const currentIdx = profiles.indexOf(soundProfile);
    const nextProfile = profiles[(currentIdx + 1) % profiles.length];
    onSoundProfileChange(nextProfile);
    soundEngine.setProfile(nextProfile);
  };

  // Typography scaling
  const fontSizeClass = useMemo(() => {
    switch (eyeSettings.fontSize) {
      case 'spacious':
        return 'text-2xl sm:text-[28px] leading-[2.1]';
      case 'relaxed':
        return 'text-xl sm:text-[24px] leading-[2.0]';
      case 'comfortable':
      default:
        return 'text-lg sm:text-[21px] leading-[1.9]';
    }
  }, [eyeSettings.fontSize]);

  const contrastStyle = eyeSettings.contrastSoftener
    ? { filter: 'contrast(0.9)' }
    : {};

  const isDimmed = eyeSettings.ambientTypingDim && state.status === 'running';

  // Base background theme class
  const bgClass = useMemo(() => {
    switch (eyeSettings.theme) {
      case 'warm-paper':
        return 'bg-[#F4EFE6]';
      case 'forest-calm':
        return 'bg-[#0A100D]';
      case 'e-ink':
        return 'bg-[#111214]';
      case 'midnight-ochre':
        return 'bg-[#0D0B09]';
      case 'pitch-black':
      default:
        return 'bg-[#000000]';
    }
  }, [eyeSettings.theme]);

  return (
    <div 
      className={`min-h-[calc(100vh-65px)] transition-colors duration-700 relative flex flex-col justify-between ${bgClass}`}
      style={contrastStyle}
    >
      {/* Eye Shield Warmth Tint Overlay */}
      {eyeSettings.enabled && eyeSettings.warmth > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-500"
          style={{
            backgroundColor: 'rgb(245, 158, 11)',
            opacity: (eyeSettings.warmth / 100) * 0.17,
            mixBlendMode: 'multiply',
          }}
        />
      )}

      {/* Soft Ambient Peripheral Vignette for Pitch Black */}
      {eyeSettings.enabled && eyeSettings.softVignette && (
        <div className="fixed inset-0 pointer-events-none z-20 soft-ambient-vignette opacity-80" />
      )}

      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 flex-1 flex flex-col justify-center">
        {/* Top Control Bar */}
        <div className={`transition-opacity duration-500 mb-6 flex flex-wrap items-center justify-between gap-4 ${
          isDimmed ? 'opacity-20 hover:opacity-100' : 'opacity-100'
        }`}>
          {/* Countdown Timer Modes Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900/90 rounded-xl border border-neutral-800 text-xs shadow-inner">
            <button
              onClick={() => {
                onModeChange('30s');
                resetEngine(passage.text, 'time', 30);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                mode === '30s'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t.mode30s}</span>
            </button>
            <button
              onClick={() => {
                onModeChange('1m');
                resetEngine(passage.text, 'time', 60);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                mode === '1m'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t.mode1m}</span>
            </button>
            <button
              onClick={() => {
                onModeChange('passage');
                resetEngine(passage.text, 'passage', 0);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                mode === 'passage'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.modePassage}</span>
            </button>
          </div>

          {/* Quick Settings: Language, Sound, Eye Shield, Restart */}
          <div className="flex items-center gap-2">
            {/* Vietnamese / English Language Selector */}
            <button
              onClick={onToggleLanguage}
              className="px-3 py-1.5 text-xs rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Chuyển đổi ngôn ngữ / Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
            </button>

            {/* Sound Profile & Volume Settings */}
            <button
              onClick={onOpenSoundSettings}
              className="px-3 py-1.5 text-xs rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm group"
              title={language === 'vi' ? 'Cài đặt âm thanh gõ phím & âm lượng' : 'Mechanical sound settings & volume'}
            >
              {soundProfile === 'muted' ? (
                <VolumeX className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="capitalize">{soundProfile}</span>
            </button>

            {/* Eye Shield Button */}
            <button
              onClick={onOpenEyeShield}
              className={`px-3 py-1.5 text-xs rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                eyeSettings.enabled
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              title="Configure eye protection & soft display"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.eyeShield} {eyeSettings.enabled ? `(${eyeSettings.warmth}%)` : 'Off'}</span>
            </button>

            {/* Restart Button */}
            <button
              onClick={() => resetEngine()}
              className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer shadow-sm"
              title={t.tabToRestart}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Stat HUD */}
        <div className={`transition-opacity duration-500 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 ${
          isDimmed ? 'opacity-25 hover:opacity-100' : 'opacity-100'
        }`}>
          {/* Timer Display */}
          <div className="flex items-center gap-3">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 tabular-nums">
              {mode === 'passage' ? `${state.elapsedSeconds}s` : `${state.timeRemaining}s`}
            </div>
            <div className="text-[11px] text-neutral-400 leading-tight">
              <span>{mode === 'passage' ? t.elapsed : t.remaining}</span>
              <span className="block text-neutral-500 font-mono text-[10px]">
                {mode === 'passage' ? t.modePassage : `${targetDuration}s test`}
              </span>
            </div>
          </div>

          {/* Live WPM */}
          <div className="flex items-center gap-3">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-neutral-100 tabular-nums">
              {metrics.wpm}
            </div>
            <div className="text-[11px] text-neutral-400 leading-tight">
              <span>{t.speed} (WPM)</span>
              <span className="block text-neutral-500 font-mono text-[10px]">
                {metrics.rawWpm} raw
              </span>
            </div>
          </div>

          {/* Accuracy */}
          <div className="flex items-center gap-3">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400 tabular-nums">
              {metrics.accuracy.toFixed(0)}%
            </div>
            <div className="text-[11px] text-neutral-400 leading-tight">
              <span>{t.accuracy}</span>
              <span className="block text-neutral-500 font-mono text-[10px]">
                {metrics.incorrectChars} {t.errors}
              </span>
            </div>
          </div>

          {/* Word Progress */}
          <div className="flex items-center gap-3">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-neutral-300 tabular-nums">
              {state.currentWordIndex}<span className="text-sm font-normal text-neutral-500">/{state.words.length}</span>
            </div>
            <div className="text-[11px] text-neutral-400 leading-tight">
              <span>{t.wordsTyped}</span>
              <span className="block text-neutral-500 font-mono text-[10px]">
                ~{passage.wordCount} {t.total}
              </span>
            </div>
          </div>
        </div>

        {/* Unboxed Metadata */}
        <div className={`transition-opacity duration-500 flex items-center justify-between text-xs text-neutral-400 mb-3 px-1 ${
          isDimmed ? 'opacity-20 hover:opacity-100' : 'opacity-100'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-amber-400 font-semibold">#{passage.id}</span>
            <span>·</span>
            <span className="font-semibold text-neutral-200 truncate">{passage.title}</span>
            <span>·</span>
            <span>{passage.category}</span>
            <span>·</span>
            <span className={
              passage.difficulty === 'Easy' ? 'text-emerald-400' :
              passage.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'
            }>{passage.difficulty}</span>
          </div>

          <button
            onClick={onOpenPassageBrowser}
            className="text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 text-xs flex items-center gap-1 cursor-pointer font-medium ml-2"
          >
            <span>{t.changePassage}</span>
            <BookOpen className="w-3 h-3" />
          </button>
        </div>

        {/* Monkeytype-inspired TypingBox Component */}
        <TypingBox
          words={state.words}
          currentWordIndex={state.currentWordIndex}
          currentCharIndex={state.currentCharIndex}
          currentInput={state.currentInput}
          isFinished={state.status === 'completed'}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          onReset={() => resetEngine()}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          fontSizeClass={fontSizeClass}
          theme={eyeSettings.theme}
          caretStyle={eyeSettings.caretStyle}
          clickToFocusText={t.clickToFocus}
          isAnyModalOpen={isAnyModalOpen}
        />

        {/* Bottom Helper Bar */}
        <div className={`transition-opacity duration-500 flex items-center justify-between text-xs text-neutral-500 mt-4 px-1 ${
          isDimmed ? 'opacity-20 hover:opacity-100' : 'opacity-100'
        }`}>
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-800 font-mono text-neutral-300">Tab</kbd> : {t.tabToRestart}
            </span>
            <span>·</span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-800 font-mono text-neutral-300">Space</kbd> : {t.spaceToAdvance}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono text-[11px]">
              {passage.wordCount} {t.wordsStandard}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

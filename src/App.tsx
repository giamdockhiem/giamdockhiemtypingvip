/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TypingArena } from './components/TypingArena';
import { ResultsModal } from './components/ResultsModal';
import { PassageBrowserModal } from './components/PassageBrowserModal';
import { EyeShieldModal } from './components/EyeShieldModal';
import { RankGuideModal } from './components/RankGuideModal';
import { StatsModal } from './components/StatsModal';
import { SoundSettingsModal } from './components/SoundSettingsModal';
import { PASSAGES, Passage, getPassageById, ALL_VIETNAMESE_PASSAGES, ENGLISH_PASSAGES } from './data/passages';
import { 
  TimerMode, 
  EyeCareSettings, 
  TypingMetrics, 
  TypingSessionResult, 
  getRankForWpm 
} from './types';
import { SoundProfile, soundEngine } from './utils/audio';
import { AppLanguage } from './utils/translations';

const STORAGE_KEY_HISTORY = 'auratype_session_history_v2';
const STORAGE_KEY_EYE = 'auratype_eye_settings_v2';
const STORAGE_KEY_LANG = 'auratype_app_language_v1';

export default function App() {
  // Language state (defaults to 'vi' based on user's request)
  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'en' || saved === 'vi') return saved;
    } catch {
      // ignore
    }
    return 'vi';
  });

  // Passages state: default to Vietnamese passage if 'vi', else English
  const [currentPassage, setCurrentPassage] = useState<Passage>(() => {
    return ALL_VIETNAMESE_PASSAGES[0] || PASSAGES[0];
  });

  // Mode state: '30s' | '1m' | 'passage'
  const [mode, setMode] = useState<TimerMode>('1m');

  // Audio state
  const [soundProfile, setSoundProfile] = useState<SoundProfile>('thock');

  // Eye Protection Settings (Defaults to 'pitch-black' pure black theme)
  const [eyeSettings, setEyeSettings] = useState<EyeCareSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EYE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          theme: parsed.theme || 'pitch-black',
        };
      }
    } catch {
      // ignore
    }
    return {
      enabled: true,
      warmth: 30,
      theme: 'pitch-black',
      contrastSoftener: true,
      softVignette: true,
      fontSize: 'relaxed',
      lineHeight: 'generous',
      caretStyle: 'smooth-bar',
      ambientTypingDim: true,
      smoothTransitions: true,
    };
  });

  // History records
  const [history, setHistory] = useState<TypingSessionResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Modals
  const [isPassageBrowserOpen, setIsPassageBrowserOpen] = useState(false);
  const [isEyeShieldOpen, setIsEyeShieldOpen] = useState(false);
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const [isRankGuideOpen, setIsRankGuideOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<TypingMetrics | null>(null);

  const isAnyModalOpen =
    isPassageBrowserOpen ||
    isEyeShieldOpen ||
    isSoundSettingsOpen ||
    isRankGuideOpen ||
    isStatsOpen ||
    isResultsOpen;

  // Sync language to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, language);
    } catch {
      // ignore
    }
  }, [language]);

  // Sync eye settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EYE, JSON.stringify(eyeSettings));
    } catch {
      // ignore
    }
  }, [eyeSettings]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Toggle Language Handler
  const handleToggleLanguage = useCallback(() => {
    const nextLang: AppLanguage = language === 'vi' ? 'en' : 'vi';
    setLanguage(nextLang);
    // Switch to first passage of the chosen language
    if (nextLang === 'vi') {
      setCurrentPassage(ALL_VIETNAMESE_PASSAGES[0]);
    } else {
      setCurrentPassage(ENGLISH_PASSAGES[0]);
    }
  }, [language]);

  // Handle test completion
  const handleFinishTest = useCallback((metrics: TypingMetrics) => {
    setLastMetrics(metrics);
    setIsResultsOpen(true);

    const rank = getRankForWpm(metrics.wpm, language);
    const newRecord: TypingSessionResult = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      passageId: currentPassage.id,
      passageTitle: currentPassage.title,
      passageCategory: currentPassage.category,
      mode: mode,
      wpm: metrics.wpm,
      rawWpm: metrics.rawWpm,
      accuracy: metrics.accuracy,
      rankTitle: rank.title,
      totalChars: metrics.totalChars,
      elapsedSeconds: metrics.elapsedSeconds,
      lang: language,
    };

    setHistory((prev) => [newRecord, ...prev]);
  }, [currentPassage, mode, language]);

  // Next passage handler
  const handleNextPassage = useCallback(() => {
    setIsResultsOpen(false);
    const isCurrentVi = currentPassage.id > 200;
    const pool = isCurrentVi ? ALL_VIETNAMESE_PASSAGES : ENGLISH_PASSAGES;
    const currentIndex = pool.findIndex(p => p.id === currentPassage.id);
    const nextIndex = (currentIndex + 1) % pool.length;
    setCurrentPassage(pool[nextIndex]);
  }, [currentPassage.id]);

  // Close modals on Escape
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPassageBrowserOpen(false);
        setIsEyeShieldOpen(false);
        setIsSoundSettingsOpen(false);
        setIsRankGuideOpen(false);
        setIsStatsOpen(false);
        setIsResultsOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* 3-Zone Top Bar */}
      <Header
        onOpenPassageBrowser={() => setIsPassageBrowserOpen(true)}
        onOpenEyeShield={() => setIsEyeShieldOpen(true)}
        onOpenRankGuide={() => setIsRankGuideOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSoundSettings={() => setIsSoundSettingsOpen(true)}
        eyeSettings={eyeSettings}
        currentPassageId={currentPassage.id}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Typing Arena */}
      <TypingArena
        passage={currentPassage}
        mode={mode}
        onModeChange={(newMode) => setMode(newMode)}
        eyeSettings={eyeSettings}
        onOpenEyeShield={() => setIsEyeShieldOpen(true)}
        onOpenPassageBrowser={() => setIsPassageBrowserOpen(true)}
        onFinishTest={handleFinishTest}
        soundProfile={soundProfile}
        onSoundProfileChange={setSoundProfile}
        onOpenSoundSettings={() => setIsSoundSettingsOpen(true)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        isAnyModalOpen={isAnyModalOpen}
      />

      {/* Results Modal */}
      {lastMetrics && (
        <ResultsModal
          isOpen={isResultsOpen}
          onClose={() => setIsResultsOpen(false)}
          metrics={lastMetrics}
          mode={mode}
          passage={currentPassage}
          onRestart={() => setIsResultsOpen(false)}
          onNextPassage={handleNextPassage}
          onOpenBrowser={() => {
            setIsResultsOpen(false);
            setIsPassageBrowserOpen(true);
          }}
          language={language}
        />
      )}

      {/* Library Browser Modal */}
      <PassageBrowserModal
        isOpen={isPassageBrowserOpen}
        onClose={() => setIsPassageBrowserOpen(false)}
        onSelectPassage={(p) => {
          setCurrentPassage(p);
          setIsResultsOpen(false);
        }}
        currentPassageId={currentPassage.id}
        language={language}
        onSelectLanguage={setLanguage}
      />

      {/* Eye Shield Modal */}
      <EyeShieldModal
        isOpen={isEyeShieldOpen}
        onClose={() => setIsEyeShieldOpen(false)}
        settings={eyeSettings}
        onUpdateSettings={setEyeSettings}
        language={language}
      />

      {/* Mechanical Sound Settings Modal */}
      <SoundSettingsModal
        isOpen={isSoundSettingsOpen}
        onClose={() => setIsSoundSettingsOpen(false)}
        currentProfile={soundProfile}
        onProfileChange={(newProfile) => {
          setSoundProfile(newProfile);
          soundEngine.setProfile(newProfile);
        }}
        language={language}
      />

      {/* Typist Rank Guide Modal */}
      <RankGuideModal
        isOpen={isRankGuideOpen}
        onClose={() => setIsRankGuideOpen(false)}
        currentWpm={lastMetrics?.wpm || (history[0]?.wpm || 0)}
        language={language}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
        language={language}
      />
    </div>
  );
}

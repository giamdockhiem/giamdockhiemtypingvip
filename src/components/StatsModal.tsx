import React from 'react';
import { X, Award, Flame, Calendar, Trash2 } from 'lucide-react';
import { TypingSessionResult, getRankForWpm } from '../types';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TypingSessionResult[];
  onClearHistory: () => void;
  language: AppLanguage;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  language,
}) => {
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  const totalTests = history.length;
  const bestWpm = totalTests > 0 ? Math.max(...history.map(h => h.wpm)) : 0;
  const avgWpm = totalTests > 0 ? Math.round(history.reduce((a, b) => a + b.wpm, 0) / totalTests) : 0;
  const avgAccuracy = totalTests > 0 ? (history.reduce((a, b) => a + b.accuracy, 0) / totalTests).toFixed(1) : '100.0';
  const highestRank = getRankForWpm(bestWpm, language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#09090b] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{t.records}</h2>
              <p className="text-xs text-neutral-400">
                {language === 'vi' ? 'Lịch sử thành tích, tốc độ và danh hiệu đã đạt được.' : 'Historical velocity, accuracy, and titles earned.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] bg-[#060608]">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-black border border-neutral-800 rounded-xl text-center shadow-inner">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">{t.personalBest}</span>
              <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">{bestWpm}</span>
              <span className="text-[10px] text-neutral-500 block">WPM</span>
            </div>

            <div className="p-3.5 bg-black border border-neutral-800 rounded-xl text-center shadow-inner">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">{t.average}</span>
              <span className="text-2xl font-bold text-neutral-200 font-mono tabular-nums">{avgWpm}</span>
              <span className="text-[10px] text-neutral-500 block">WPM</span>
            </div>

            <div className="p-3.5 bg-black border border-neutral-800 rounded-xl text-center shadow-inner">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">{t.accuracy}</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{avgAccuracy}%</span>
              <span className="text-[10px] text-neutral-500 block">{t.average}</span>
            </div>

            <div className="p-3.5 bg-black border border-neutral-800 rounded-xl text-center shadow-inner">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">{t.completed}</span>
              <span className="text-2xl font-bold text-neutral-300 font-mono tabular-nums">{totalTests}</span>
              <span className="text-[10px] text-neutral-500 block">{t.tests}</span>
            </div>
          </div>

          {/* Highest Title Badge */}
          {totalTests > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block">{t.highestTitle}</span>
                  <span className="text-base font-bold text-white">{highestRank.title}</span>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-400/90">{highestRank.percentile}</span>
            </div>
          )}

          {/* Recent History Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-neutral-200">{t.sessionHistory}</span>
              {totalTests > 0 && (
                <button
                  onClick={onClearHistory}
                  className="hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clearHistory}</span>
                </button>
              )}
            </div>

            {totalTests === 0 ? (
              <div className="text-center py-10 text-neutral-600 text-xs">
                {t.noTestsYet}
              </div>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-black border border-neutral-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 truncate flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-200 truncate">
                          {item.passageTitle}
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          {item.mode === '30s' ? t.mode30s : item.mode === '1m' ? t.mode1m : t.modePassage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        <Calendar className="w-3 h-3 opacity-60" />
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{item.rankTitle}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-amber-400 font-mono text-sm tabular-nums">
                        {item.wpm} <span className="text-[10px] font-normal text-neutral-500">WPM</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        {item.accuracy.toFixed(1)}% acc
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 px-6 border-t border-neutral-800 bg-black flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

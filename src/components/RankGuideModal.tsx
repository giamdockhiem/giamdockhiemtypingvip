import React from 'react';
import { X, Trophy, Crown, Sparkles, Award, Zap } from 'lucide-react';
import { getTypistRanks } from '../types';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';

interface RankGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWpm?: number;
  language: AppLanguage;
}

export const RankGuideModal: React.FC<RankGuideModalProps> = ({
  isOpen,
  onClose,
  currentWpm = 0,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const ranks = getTypistRanks(language);

  if (!isOpen) return null;

  const getRankIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-violet-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'Award':
        return <Award className="w-5 h-5 text-sky-400" />;
      default:
        return <Zap className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#09090b] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{t.ladderTitle}</h2>
              <p className="text-xs text-neutral-400">{t.ladderDesc}</p>
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

        <div className="p-6 space-y-3 overflow-y-auto max-h-[70vh] bg-[#060608]">
          {ranks.map((tier) => {
            const isUserRank = currentWpm >= tier.minWpm && currentWpm <= tier.maxWpm;
            return (
              <div
                key={tier.title}
                className={`p-4 rounded-xl border transition-all ${
                  isUserRank
                    ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'bg-black border-neutral-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                      {getRankIcon(tier.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-neutral-200">
                          {tier.title}
                        </h3>
                        {isUserRank && (
                          <span className="text-[10px] font-semibold uppercase text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded border border-amber-400/30">
                            {t.current}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400 font-mono">
                        {tier.minWpm === 0 ? `< ${tier.maxWpm + 1} WPM` : tier.maxWpm === 999 ? `${tier.minWpm}+ WPM` : `${tier.minWpm} – ${tier.maxWpm} WPM`}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 shrink-0">
                    {tier.percentile}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-2.5 leading-relaxed">
                  {tier.description}
                </p>
              </div>
            );
          })}
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

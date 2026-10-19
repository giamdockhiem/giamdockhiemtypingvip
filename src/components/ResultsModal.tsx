import React, { useEffect, useState, useMemo } from 'react';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  Award, 
  Zap, 
  RotateCcw, 
  ArrowRight, 
  Share2, 
  Check, 
  BookOpen, 
  Activity,
  X,
  Download,
  Copy,
  Image as ImageIcon,
  Flame
} from 'lucide-react';
import { TypingMetrics, TypistRankInfo, getRankForWpm, TimerMode } from '../types';
import { Passage } from '../data/passages';
import { launchConfetti } from '../utils/confetti';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';
import { 
  ShareCardData, 
  downloadShareCard, 
  copyShareCardImageToClipboard, 
  generateShareCardDataUrl 
} from '../utils/cardCanvas';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: TypingMetrics;
  mode: TimerMode;
  passage: Passage;
  onRestart: () => void;
  onNextPassage: () => void;
  onOpenBrowser: () => void;
  language: AppLanguage;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  metrics,
  mode,
  passage,
  onRestart,
  onNextPassage,
  onOpenBrowser,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const rank: TypistRankInfo = getRankForWpm(metrics.wpm, language);

  const [activeTab, setActiveTab] = useState<'overview' | 'card'>('overview');
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Trigger celebratory confetti on open, calibrated by rank
  useEffect(() => {
    if (isOpen) {
      launchConfetti({ wpm: metrics.wpm });
    }
  }, [isOpen, metrics.wpm]);

  // Construct structured data payload for the social share card
  const cardData: ShareCardData = useMemo(() => {
    const modeLabel = mode === '30s' ? t.mode30s : mode === '1m' ? t.mode1m : t.modePassage;
    return {
      rankTitle: rank.title,
      rankIconName: rank.iconName,
      wpm: metrics.wpm,
      rawWpm: metrics.rawWpm,
      accuracy: metrics.accuracy,
      elapsedSeconds: metrics.elapsedSeconds,
      mode: modeLabel,
      passageTitle: passage.title,
      passageId: passage.id,
      correctChars: metrics.correctChars,
      incorrectChars: metrics.incorrectChars,
      totalChars: metrics.totalChars,
      wpmHistory: metrics.wpmHistory,
      language: language,
    };
  }, [metrics, mode, passage, rank, t, language]);

  // Pre-generate the card preview when modal opens or tab switches
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGeneratingCard(true);

    generateShareCardDataUrl(cardData)
      .then((dataUrl) => {
        if (isMounted) {
          setCardPreviewUrl(dataUrl);
          setIsGeneratingCard(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate preview image:', err);
        if (isMounted) {
          setIsGeneratingCard(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, cardData]);

  if (!isOpen) return null;

  // 1. One-click "Download Image" (PNG)
  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      await downloadShareCard(cardData);
    } catch (err) {
      console.error('Download card error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // 2. One-click "Copy Image to Clipboard"
  const handleCopyImage = async () => {
    try {
      const success = await copyShareCardImageToClipboard(cardData);
      if (success) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
      } else {
        // Fallback to text copy if browser does not permit image writes
        await handleCopyText();
      }
    } catch {
      await handleCopyText();
    }
  };

  // 3. Fallback: Copy Formatted Text Summary
  const handleCopyText = async () => {
    const modeLabel = mode === '30s' ? t.mode30s : mode === '1m' ? t.mode1m : t.modePassage;
    const text = `⌨️ ${t.appName} - ${t.subtitle}
🏆 ${t.rankAwarded}: ${rank.title}
⚡ ${t.speed}: ${metrics.wpm} WPM (${t.rawWpm}: ${metrics.rawWpm})
🎯 ${t.accuracy}: ${metrics.accuracy.toFixed(1)}%
⏱️ Mode: ${modeLabel}
📖 #${passage.id}: "${passage.title}"
🔗 Try your speed: auratype.app`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // ignore
    }
  };

  const getRankIcon = () => {
    switch (rank.iconName) {
      case 'Crown':
        return <Crown className="w-8 h-8 text-amber-400" />;
      case 'Trophy':
        return <Trophy className="w-8 h-8 text-violet-400" />;
      case 'Sparkles':
        return <Sparkles className="w-8 h-8 text-emerald-400" />;
      case 'Award':
        return <Award className="w-8 h-8 text-sky-400" />;
      default:
        return <Zap className="w-8 h-8 text-neutral-400" />;
    }
  };

  // Cadence SVG Sparkline Calculations
  const history = metrics.wpmHistory && metrics.wpmHistory.length > 1 
    ? metrics.wpmHistory 
    : [metrics.wpm, metrics.wpm];
  const maxWpmInHistory = Math.max(...history, metrics.wpm, 60);
  const minWpmInHistory = Math.max(0, Math.min(...history) - 10);
  const wpmRange = Math.max(1, maxWpmInHistory - minWpmInHistory);
  
  const graphWidth = 460;
  const graphHeight = 65;
  const points = history.map((val, idx) => {
    const x = (idx / (history.length - 1)) * graphWidth;
    const y = graphHeight - ((val - minWpmInHistory) / wpmRange) * (graphHeight - 10) - 5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#09090b] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Celebration Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-b from-[#141416] to-[#09090b] border-b border-neutral-800 text-center space-y-2.5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div className="mx-auto w-15 h-15 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shadow-2xl shadow-black/80">
            {getRankIcon()}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 flex items-center justify-center gap-1">
              {metrics.wpm >= 70 && <Flame className="w-3 h-3 text-amber-400" />}
              <span>{t.rankAwarded}</span>
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {rank.title}
            </h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              {rank.description}
            </p>
          </div>

          {/* Tabs for Overview vs. Social Share Card Preview */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex p-1 bg-black/70 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Chỉ Số Chi Tiết' : 'Performance Stats'}</span>
              </button>
              <button
                onClick={() => setActiveTab('card')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'card'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{t.shareCard}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 bg-[#060608]">
          {activeTab === 'overview' ? (
            <>
              {/* Primary Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-black border border-neutral-800 rounded-xl text-center shadow-inner">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">{t.speed}</span>
                  <span className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                    {metrics.wpm}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">{t.netWpm}</span>
                </div>

                <div className="p-3 bg-black border border-neutral-800 rounded-xl text-center shadow-inner">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">{t.accuracy}</span>
                  <span className={`text-3xl font-extrabold font-mono tabular-nums ${
                    metrics.accuracy >= 98 ? 'text-emerald-400' :
                    metrics.accuracy >= 94 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {metrics.accuracy.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-neutral-500 block">{t.precision}</span>
                </div>

                <div className="p-3 bg-black border border-neutral-800 rounded-xl text-center shadow-inner">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">{t.rawWpm}</span>
                  <span className="text-3xl font-extrabold text-neutral-300 font-mono tabular-nums">
                    {metrics.rawWpm}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">WPM</span>
                </div>

                <div className="p-3 bg-black border border-neutral-800 rounded-xl text-center shadow-inner">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">{t.elapsed}</span>
                  <span className="text-3xl font-extrabold text-neutral-300 font-mono tabular-nums">
                    {metrics.elapsedSeconds}s
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Time</span>
                </div>
              </div>

              {/* Keystrokes Strip */}
              <div className="flex items-center justify-between p-3 px-4 bg-black/70 border border-neutral-800 rounded-xl text-xs text-neutral-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-neutral-300">{t.keystrokes}:</span>
                  <span className="text-emerald-400 font-mono font-medium">{metrics.correctChars} {t.correct}</span>
                  <span>·</span>
                  <span className="text-rose-400 font-mono font-medium">{metrics.incorrectChars} {t.errors}</span>
                  <span>·</span>
                  <span className="text-neutral-300 font-mono">{metrics.totalChars} {t.total}</span>
                </div>
                <div className="hidden sm:block text-neutral-400 font-mono text-[11px]">
                  {rank.percentile}
                </div>
              </div>

              {/* Speed Cadence Curve */}
              {history.length > 2 && (
                <div className="p-3.5 bg-black border border-neutral-800 rounded-xl space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-neutral-300">{t.cadenceCurve}</span>
                    </span>
                    <span className="font-mono text-[10px]">{t.peak}: {Math.max(...history)} WPM</span>
                  </div>
                  <div className="w-full h-16 relative pt-1">
                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${graphWidth} ${graphHeight}`}>
                      <polyline
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Passage reference */}
              <div className="text-xs text-neutral-500 flex items-center justify-between px-1">
                <span className="truncate max-w-[340px]">
                  #{passage.id}: <strong>{passage.title}</strong>
                </span>
                <span>{passage.wordCount} {t.wordsStandard}</span>
              </div>
            </>
          ) : (
            /* Social Share Card Preview Mode */
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-neutral-800 shadow-2xl bg-black aspect-[1200/630] flex items-center justify-center">
                {isGeneratingCard && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 text-xs text-neutral-400 gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>{t.generating}</span>
                  </div>
                )}
                {cardPreviewUrl ? (
                  <img
                    src={cardPreviewUrl}
                    alt="Social Share Card"
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                ) : (
                  <div className="text-xs text-neutral-500">{t.generating}</div>
                )}
              </div>

              <p className="text-[11px] text-neutral-400 text-center">
                {language === 'vi' 
                  ? 'Thẻ tổng kết đồ họa chất lượng cao (1200x630px) sẵn sàng để chia sẻ lên Twitter/X, Facebook, Discord, LinkedIn.' 
                  : 'High-resolution 1200x630px card optimized for Twitter/X, Discord, LinkedIn, and Instagram stories.'}
              </p>
            </div>
          )}
        </div>

        {/* Universal Actions Bar */}
        <div className="p-4 px-6 border-t border-neutral-800 bg-black flex flex-wrap items-center justify-between gap-3">
          {/* Share Actions: Download PNG & Copy Image */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download PNG Button */}
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-amber-500/10 disabled:opacity-50"
              title="Download high-resolution PNG image"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? t.generating : t.downloadCard}</span>
            </button>

            {/* Copy Image Button */}
            <button
              onClick={handleCopyImage}
              className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              title="Copy image directly to clipboard"
            >
              {copiedImage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">{t.imageCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.copyCardImage}</span>
                </>
              )}
            </button>

            {/* Copy Text Summary */}
            <button
              onClick={handleCopyText}
              className="px-3 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              title="Copy text summary"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.textCopied}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t.copyTextSummary}</span>
                </>
              )}
            </button>
          </div>

          {/* Test Flow Controls: Retry & Next Passage */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRestart}
              className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.retry}</span>
            </button>
            <button
              onClick={onNextPassage}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-neutral-100 hover:bg-white rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>{t.nextPassage}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

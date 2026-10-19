import { AppLanguage } from './utils/translations';

// -------------------------------------------------------------
// 1. Character & Word Object Models
// -------------------------------------------------------------
export type CharacterState = 'idle' | 'correct' | 'incorrect' | 'extra';

export interface CharacterItem {
  id: string;
  char: string;
  state: CharacterState;
  typedChar?: string;
}

export interface WordItem {
  id: string;
  original: string;
  chars: CharacterItem[];
  isCompleted: boolean;
  hasError: boolean;
}

// -------------------------------------------------------------
// 2. Test Modes & Durations
// -------------------------------------------------------------
export type TestMode = 'time' | 'words' | 'passage' | 'zen' | 'quote' | 'custom';
export type TimeOption = 15 | 30 | 60 | 120;
export type WordsOption = 10 | 25 | 50 | 100;
export type QuoteLength = 'all' | 'short' | 'medium' | 'long';
export type TimerMode = 
  | '15s' 
  | '30s' 
  | '60s' 
  | '120s' 
  | '1m' // backward compat
  | '10w' 
  | '25w' 
  | '50w' 
  | '100w' 
  | 'passage' 
  | 'zen' 
  | 'quote' 
  | 'custom';

// -------------------------------------------------------------
// 3. Engine State
// -------------------------------------------------------------
export type EngineStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TypingState {
  words: WordItem[];
  currentWordIndex: number;
  currentCharIndex: number;
  currentInput: string;
  status: EngineStatus;
  startTime: number | null;
  endTime: number | null;
  elapsedSeconds: number;
  timeRemaining: number;
  targetDuration: number;
  targetWordCount?: number;
  mode: TestMode;
  passageId?: number;
  passageTitle?: string;
  passageCategory?: string;
  quoteAuthor?: string;
  quoteSource?: string;
}

// -------------------------------------------------------------
// 4. Performance Metrics
// -------------------------------------------------------------
export interface MetricSnapshot {
  time: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TypingMetrics {
  wpm: number;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars?: number;
  totalChars: number;
  totalKeystrokes?: number;
  elapsedSeconds: number;
  timeRemaining: number;
  consistency?: number;
  wpmHistory: number[];
  metricTimeline?: MetricSnapshot[];
}

// -------------------------------------------------------------
// 5. Results & Historical Records
// -------------------------------------------------------------
export interface TypistRankInfo {
  title: string;
  minWpm: number;
  maxWpm: number;
  description: string;
  badgeColor: string;
  accentBorder: string;
  iconName: 'Award' | 'Sparkles' | 'Trophy' | 'Crown' | 'Flame' | 'Zap';
  percentile: string;
}

export interface TypingSessionResult {
  id: string;
  timestamp: number;
  passageId: number;
  passageTitle: string;
  passageCategory: string;
  mode: TimerMode;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  rankTitle: string;
  totalChars: number;
  elapsedSeconds: number;
  lang?: AppLanguage;
}

// -------------------------------------------------------------
// 6. Themes & Eye Protection Settings
// -------------------------------------------------------------
export type ThemeType = 'pitch-black' | 'midnight-ochre' | 'warm-paper' | 'forest-calm' | 'e-ink';
export type EyeTheme = ThemeType;

export interface EyeCareSettings {
  enabled: boolean;
  warmth: number; // 0 to 100 (percentage of amber blue-light filter)
  theme: EyeTheme;
  contrastSoftener: boolean; // softens high-contrast edges
  softVignette: boolean; // gentle radial peripheral blur/dimming
  fontSize: 'comfortable' | 'relaxed' | 'spacious'; // 20px, 24px, 28px
  lineHeight: 'normal' | 'generous' | 'extra'; // 1.7, 2.0, 2.3
  caretStyle: 'smooth-bar' | 'soft-block' | 'underline';
  ambientTypingDim: boolean; // gently dims surrounding UI when actively typing
  smoothTransitions: boolean; // enables smooth character and word fade transitions
}

export type SoundProfile = 'thock' | 'clicky' | 'typewriter' | 'muted';

export interface AppSettings {
  language: AppLanguage;
  soundProfile: SoundProfile;
  soundVolume: number;
  eyeCare: EyeCareSettings;
  caretSmoothness: 'off' | 'medium' | 'ultra';
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  freedomMode: boolean; // allow deleting previous words
}

// -------------------------------------------------------------
// 7. Rank Evaluation Helper
// -------------------------------------------------------------
export function getTypistRanks(lang: AppLanguage = 'en'): TypistRankInfo[] {
  return [
    {
      title: lang === 'vi' ? 'Huyền Thoại Đánh Máy (Legendary)' : 'Legendary Typist',
      minWpm: 90,
      maxWpm: 999,
      description: lang === 'vi'
        ? 'Tốc độ phi thường cùng phản xạ ngón tay chính xác tuyệt đối, thuộc nhóm 1% người đánh máy nhanh nhất thế giới.'
        : 'Transcendent velocity and near-flawless keystroke intuition, placing you in the top tier of typists worldwide.',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      accentBorder: 'border-amber-400',
      iconName: 'Crown',
      percentile: lang === 'vi' ? 'Top 1% người gõ nhanh nhất' : 'Top 1% of typists'
    },
    {
      title: lang === 'vi' ? 'Chuyên Gia Đánh Máy (Professional)' : 'Professional Typist',
      minWpm: 70,
      maxWpm: 89,
      description: lang === 'vi'
        ? 'Kỹ năng gõ mười ngón thuần thục với nhịp điệu nhanh, chuẩn xác ngay cả với các từ ngữ phức tạp.'
        : 'High-speed touch typing with rapid cadence and confident transcription across complex terminology.',
      badgeColor: 'text-violet-300 bg-violet-500/20 border-violet-500/40',
      accentBorder: 'border-violet-400',
      iconName: 'Trophy',
      percentile: lang === 'vi' ? 'Top 10% thế giới' : 'Top 10% of typists'
    },
    {
      title: lang === 'vi' ? 'Điêu Luyện (Skilled)' : 'Skilled Typist',
      minWpm: 50,
      maxWpm: 69,
      description: lang === 'vi'
        ? 'Tốc độ vượt trội so với trung bình, định vị phím chắc chắn và độ trễ ngập ngừng giữa các từ rất thấp.'
        : 'Above-average typing flow with reliable finger positioning and minimal pauses between words.',
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
      accentBorder: 'border-emerald-400',
      iconName: 'Sparkles',
      percentile: lang === 'vi' ? 'Top 30% thế giới' : 'Top 30% of typists'
    },
    {
      title: lang === 'vi' ? 'Thành Thạo (Competent)' : 'Competent Typist',
      minWpm: 30,
      maxWpm: 49,
      description: lang === 'vi'
        ? 'Nhịp gõ ổn định, thoải mái và trôi chảy phục vụ hoàn hảo cho công việc văn phòng, soạn thảo văn bản hàng ngày.'
        : 'Functional everyday typing rhythm suitable for daily work, essays, and conversational messaging.',
      badgeColor: 'text-sky-300 bg-sky-500/20 border-sky-500/40',
      accentBorder: 'border-sky-400',
      iconName: 'Award',
      percentile: lang === 'vi' ? 'Top 60% mức tiêu chuẩn' : 'Top 60% of typists'
    },
    {
      title: lang === 'vi' ? 'Người Mới Bắt Đầu (Novice)' : 'Novice Typist',
      minWpm: 0,
      maxWpm: 29,
      description: lang === 'vi'
        ? 'Đang rèn luyện trí nhớ cơ bắp, thế đặt ngón tay mười ngón và sự quen thuộc với bố cục bàn phím.'
        : 'Developing foundational muscle memory, finger positioning, and keyboard spatial familiarity.',
      badgeColor: 'text-stone-300 bg-stone-800/60 border-stone-700',
      accentBorder: 'border-stone-600',
      iconName: 'Zap',
      percentile: lang === 'vi' ? 'Mức cơ bản' : 'Beginner milestone'
    }
  ];
}

export function getRankForWpm(wpm: number, lang: AppLanguage = 'en'): TypistRankInfo {
  const ranks = getTypistRanks(lang);
  for (const rank of ranks) {
    if (wpm >= rank.minWpm) {
      return rank;
    }
  }
  return ranks[ranks.length - 1];
}

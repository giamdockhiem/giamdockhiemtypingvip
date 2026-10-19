import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  TypingState, 
  TypingMetrics, 
  WordItem, 
  CharacterItem, 
  TestMode, 
  MetricSnapshot 
} from '../types';
import { soundEngine } from '../utils/audio';

interface UseTypingEngineProps {
  initialText: string;
  mode?: TestMode;
  targetDuration?: number; // e.g. 30, 60
  onComplete?: (metrics: TypingMetrics) => void;
  allowBacktrackWord?: boolean; // allow backspacing into previous word with errors
}

// Helper to convert plain string into array of WordItem objects
export function parseTextToWords(text: string): WordItem[] {
  const tokens = text.trim().split(/\s+/);
  return tokens.map((wordStr, wIdx) => {
    const chars: CharacterItem[] = wordStr.split('').map((c, cIdx) => ({
      id: `w${wIdx}-c${cIdx}`,
      char: c,
      state: 'idle',
    }));
    return {
      id: `w${wIdx}`,
      original: wordStr,
      chars,
      isCompleted: false,
      hasError: false,
    };
  });
}

export function useTypingEngine({
  initialText,
  mode = 'time',
  targetDuration = 60,
  onComplete,
  allowBacktrackWord = true,
}: UseTypingEngineProps) {
  // Parsing target words
  const [words, setWords] = useState<WordItem[]>(() => parseTextToWords(initialText));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [status, setStatus] = useState<TypingState['status']>('idle');

  // Time tracking
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(mode === 'passage' ? 0 : targetDuration);

  // Metric tracking
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [metricTimeline, setMetricTimeline] = useState<MetricSnapshot[]>([]);
  const keystrokeTimestampsRef = useRef<number[]>([]);

  // High-precision timing & synchronization refs
  const startTimeRef = useRef<number | null>(null);
  const statusRef = useRef<TypingState['status']>('idle');
  const targetDurationRef = useRef<number>(targetDuration);
  const modeRef = useRef<TestMode>(mode);
  const latestMetricsRef = useRef<TypingMetrics | null>(null);
  const onCompleteRef = useRef(onComplete);
  const lastTimelineSecondRef = useRef<number>(0);

  // Keep synchronization refs in sync with props/state
  statusRef.current = status;
  targetDurationRef.current = targetDuration;
  modeRef.current = mode;
  onCompleteRef.current = onComplete;

  // Vietnamese IME Composition Flag
  const isComposingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate live characters breakdown
  const characterCounts = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (i < currentWordIndex) {
        // Words already finalized
        for (const ch of w.chars) {
          if (ch.state === 'correct') correct++;
          else if (ch.state === 'incorrect') incorrect++;
          else if (ch.state === 'extra') extra++;
          else if (ch.state === 'idle') missed++;
        }
        // Account for space between words
        if (!w.hasError) correct++;
      } else if (i === currentWordIndex) {
        // Current active word
        for (const ch of w.chars) {
          if (ch.state === 'correct') correct++;
          else if (ch.state === 'incorrect') incorrect++;
          else if (ch.state === 'extra') extra++;
        }
      }
    }

    const totalChars = correct + incorrect + extra;
    return { correct, incorrect, extra, missed, totalChars };
  }, [words, currentWordIndex]);

  // Real-time WPM, raw WPM, accuracy, and consistency
  const metrics: TypingMetrics = useMemo(() => {
    const { correct, incorrect, extra, missed, totalChars } = characterCounts;
    const timeInMinutes = Math.max(1 / 60, elapsedSeconds / 60);

    // Standard Monkeytype formula: 1 word = 5 characters
    const wpm = status === 'idle' ? 0 : Math.max(0, Math.round((correct / 5) / timeInMinutes));
    const rawWpm = status === 'idle' ? 0 : Math.max(0, Math.round((totalChars / 5) / timeInMinutes));
    
    const totalAttempted = correct + incorrect + extra;
    const accuracy = totalAttempted === 0 
      ? 100 
      : Math.max(0, Math.min(100, (correct / totalAttempted) * 100));

    // Consistency formula based on standard deviation of timeline WPMs
    let consistency = 100;
    if (metricTimeline.length >= 3) {
      const wpms = metricTimeline.map(m => m.wpm);
      const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      if (mean > 0) {
        const variance = wpms.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wpms.length;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100; // coefficient of variation
        consistency = Math.max(0, Math.min(100, Math.round(100 - cv)));
      }
    }

    const wpmHistory = metricTimeline.map(m => m.wpm);

    return {
      wpm,
      netWpm: wpm,
      rawWpm,
      accuracy,
      correctChars: correct,
      incorrectChars: incorrect,
      extraChars: extra,
      missedChars: missed,
      totalChars,
      totalKeystrokes,
      elapsedSeconds,
      timeRemaining,
      consistency,
      wpmHistory,
      metricTimeline,
    };
  }, [characterCounts, elapsedSeconds, status, totalKeystrokes, timeRemaining, metricTimeline]);

  // Keep latest metrics ref in sync on every render
  useEffect(() => {
    latestMetricsRef.current = metrics;
  }, [metrics]);

  // Complete the test cleanly
  const finishTest = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const end = Date.now();
    setEndTime(end);
    setStatus('completed');
    statusRef.current = 'completed';

    const start = startTimeRef.current || end;
    const finalElapsed = Math.max(1, Math.round((end - start) / 1000));

    if (onCompleteRef.current && latestMetricsRef.current) {
      onCompleteRef.current({
        ...latestMetricsRef.current,
        elapsedSeconds: finalElapsed,
        timeRemaining: 0,
      });
    }
  }, []);

  // Independent Real-Time Countdown & Stopwatch Timer
  // Uses real-time timestamps (Date.now()) and never resets or stutters during active typing
  useEffect(() => {
    if (status !== 'running') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      setStartTime(startTimeRef.current);
    }

    // High-frequency 100ms interval for ultra-smooth, responsive countdown
    timerIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current || statusRef.current !== 'running') return;

      const now = Date.now();
      const exactElapsed = Math.floor((now - startTimeRef.current) / 1000);

      setElapsedSeconds((prevElapsed) => {
        if (exactElapsed !== prevElapsed) {
          // Record 1-second metric snapshot
          if (exactElapsed > lastTimelineSecondRef.current && latestMetricsRef.current) {
            lastTimelineSecondRef.current = exactElapsed;
            const m = latestMetricsRef.current;
            setMetricTimeline((currTimeline) => [
              ...currTimeline,
              {
                time: exactElapsed,
                wpm: m.wpm,
                rawWpm: m.rawWpm,
                errors: m.incorrectChars + m.extraChars,
              },
            ]);
          }

          if (modeRef.current !== 'passage') {
            const remaining = Math.max(0, targetDurationRef.current - exactElapsed);
            setTimeRemaining(remaining);

            if (remaining <= 0) {
              finishTest();
            }
          }

          return exactElapsed;
        }
        return prevElapsed;
      });
    }, 100);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [status, finishTest]);

  // Start the test precisely on the first valid keystroke
  const startTest = useCallback(() => {
    if (statusRef.current !== 'idle') return;
    const now = Date.now();
    startTimeRef.current = now;
    lastTimelineSecondRef.current = 0;
    setStartTime(now);
    setStatus('running');
    statusRef.current = 'running';
  }, []);

  // Reset Engine to initial or new text
  const resetEngine = useCallback((newText?: string, newMode?: TestMode, newDuration?: number) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const textToUse = newText || initialText;
    const modeToUse = newMode || mode;
    const durToUse = newDuration !== undefined ? newDuration : targetDuration;

    startTimeRef.current = null;
    lastTimelineSecondRef.current = 0;
    statusRef.current = 'idle';

    setWords(parseTextToWords(textToUse));
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setCurrentInput('');
    setStatus('idle');
    setStartTime(null);
    setEndTime(null);
    setElapsedSeconds(0);
    setTimeRemaining(modeToUse === 'passage' ? 0 : durToUse);
    setTotalKeystrokes(0);
    setMetricTimeline([]);
    keystrokeTimestampsRef.current = [];

    setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
  }, [initialText, mode, targetDuration]);

  // Reset when initialText or targetDuration changes
  useEffect(() => {
    resetEngine(initialText, mode, targetDuration);
  }, [initialText, mode, targetDuration, resetEngine]);

  // Keydown event handler with zero latency
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent) => {
    if (status === 'completed') return;

    // Fast restart on Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      resetEngine();
      return;
    }

    // Do NOT block IME composition (e.g. Vietnamese Telex / VNI or CJK)
    if (
      (e as any).isComposing ||
      (e as any).nativeEvent?.isComposing ||
      e.key === 'Process' ||
      e.key === 'Unidentified'
    ) {
      if (status === 'idle') {
        startTest();
      }
      return;
    }

    // Ignore system & modifier keys
    if (
      e.ctrlKey || 
      e.altKey || 
      e.metaKey || 
      e.key === 'Shift' || 
      e.key === 'Control' || 
      e.key === 'Alt' || 
      e.key === 'CapsLock' || 
      e.key === 'Escape' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight'
    ) {
      return;
    }

    // If test hasn't started yet, trigger start on first valid typing key
    if (status === 'idle') {
      startTest();
    }

    setTotalKeystrokes((prev) => prev + 1);
    keystrokeTimestampsRef.current.push(performance.now());

    // 1. Backspace handling
    if (e.key === 'Backspace') {
      e.preventDefault();

      if (currentCharIndex > 0) {
        // Backspace within the current word
        const prevCharIndex = currentCharIndex - 1;
        setCurrentCharIndex(prevCharIndex);
        setCurrentInput((prev) => prev.slice(0, -1));

        setWords((prevWords) => {
          const nextWords = [...prevWords];
          const activeWord = { ...nextWords[currentWordIndex] };
          const activeChars = [...activeWord.chars];

          if (prevCharIndex < activeWord.original.length) {
            // Restore character to idle
            activeChars[prevCharIndex] = {
              ...activeChars[prevCharIndex],
              state: 'idle',
              typedChar: undefined,
            };
          } else {
            // Remove extra character that was appended beyond original word
            activeChars.pop();
          }

          activeWord.chars = activeChars;
          activeWord.hasError = activeChars.some((c) => c.state === 'incorrect' || c.state === 'extra');
          nextWords[currentWordIndex] = activeWord;
          return nextWords;
        });

        soundEngine.playKeypress(false, false);
      } else if (currentCharIndex === 0 && currentWordIndex > 0 && allowBacktrackWord) {
        // Backspace into previous word if it had errors
        const prevWordIdx = currentWordIndex - 1;
        const prevWord = words[prevWordIdx];

        if (prevWord && prevWord.hasError) {
          setCurrentWordIndex(prevWordIdx);
          setCurrentCharIndex(prevWord.chars.length);
          setCurrentInput(prevWord.chars.map(c => c.typedChar || c.char).join(''));

          setWords((prevWords) => {
            const nextWords = [...prevWords];
            nextWords[prevWordIdx] = {
              ...nextWords[prevWordIdx],
              isCompleted: false,
            };
            return nextWords;
          });

          soundEngine.playKeypress(false, false);
        }
      }
      return;
    }

    // 2. Space key handling (Advance Word)
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();

      // Don't advance if user hasn't typed anything in the current word yet
      if (currentCharIndex === 0) return;

      const activeWord = words[currentWordIndex];
      const targetOriginal = activeWord.original.normalize('NFC');
      const typedNormalized = currentInput.normalize('NFC');
      const isWordFullyCorrect = typedNormalized === targetOriginal;

      soundEngine.playKeypress(true, !isWordFullyCorrect);

      setWords((prevWords) => {
        const nextWords = [...prevWords];
        const updatedWord = { ...nextWords[currentWordIndex] };
        const updatedChars = [...updatedWord.chars];

        // Mark any untyped remaining characters as idle/missed
        for (let i = currentCharIndex; i < updatedWord.original.length; i++) {
          updatedChars[i] = {
            ...updatedChars[i],
            state: 'idle',
          };
        }

        updatedWord.chars = updatedChars;
        updatedWord.isCompleted = true;
        updatedWord.hasError = !isWordFullyCorrect;
        nextWords[currentWordIndex] = updatedWord;
        return nextWords;
      });

      // Advance to next word or complete test if at the end of the text
      if (currentWordIndex + 1 >= words.length) {
        finishTest();
      } else {
        setCurrentWordIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
        setCurrentInput('');
      }
      return;
    }

    // 3. Regular Character Typing
    if (e.key.length === 1) {
      e.preventDefault();
      const typedChar = e.key;
      const activeWord = words[currentWordIndex];
      const targetOriginal = activeWord.original;

      const isWithinBounds = currentCharIndex < targetOriginal.length;
      const expectedChar = isWithinBounds ? targetOriginal[currentCharIndex] : '';
      const isMatch = isWithinBounds && typedChar.normalize('NFC') === expectedChar.normalize('NFC');

      soundEngine.playKeypress(false, !isMatch);

      setCurrentInput((prev) => prev + typedChar);
      setCurrentCharIndex((prev) => prev + 1);

      setWords((prevWords) => {
        const nextWords = [...prevWords];
        const updatedWord = { ...nextWords[currentWordIndex] };
        const updatedChars = [...updatedWord.chars];

        if (isWithinBounds) {
          updatedChars[currentCharIndex] = {
            ...updatedChars[currentCharIndex],
            state: isMatch ? 'correct' : 'incorrect',
            typedChar,
          };
        } else {
          // Extra character typed beyond word length
          updatedChars.push({
            id: `w${currentWordIndex}-extra${currentCharIndex}`,
            char: typedChar,
            state: 'extra',
            typedChar,
          });
        }

        updatedWord.chars = updatedChars;
        updatedWord.hasError = updatedChars.some(c => c.state === 'incorrect' || c.state === 'extra');
        nextWords[currentWordIndex] = updatedWord;
        return nextWords;
      });

      // If user typed the last character of the last word in the text, finish immediately
      if (
        currentWordIndex === words.length - 1 &&
        currentCharIndex + 1 >= targetOriginal.length
      ) {
        finishTest();
      }
    }
  }, [
    status, 
    words, 
    currentWordIndex, 
    currentCharIndex, 
    currentInput, 
    allowBacktrackWord, 
    startTest, 
    finishTest, 
    resetEngine
  ]);

  // Composition event handlers for Vietnamese Telex/VNI IME
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback((composedText?: string) => {
    isComposingRef.current = false;
    if (composedText) {
      // Re-evaluate word with composed diacritics
      const activeWord = words[currentWordIndex];
      if (!activeWord) return;

      const normComposed = composedText.normalize('NFC');
      setCurrentInput(normComposed);
      setCurrentCharIndex(normComposed.length);

      setWords((prevWords) => {
        const nextWords = [...prevWords];
        const updatedWord = { ...nextWords[currentWordIndex] };
        const originalChars = updatedWord.original.split('');
        const updatedChars: CharacterItem[] = [];

        for (let i = 0; i < Math.max(originalChars.length, normComposed.length); i++) {
          if (i < originalChars.length && i < normComposed.length) {
            const isMatch = normComposed[i] === originalChars[i];
            updatedChars.push({
              id: `w${currentWordIndex}-c${i}`,
              char: originalChars[i],
              state: isMatch ? 'correct' : 'incorrect',
              typedChar: normComposed[i],
            });
          } else if (i < originalChars.length) {
            updatedChars.push({
              id: `w${currentWordIndex}-c${i}`,
              char: originalChars[i],
              state: 'idle',
            });
          } else {
            updatedChars.push({
              id: `w${currentWordIndex}-extra${i}`,
              char: normComposed[i],
              state: 'extra',
              typedChar: normComposed[i],
            });
          }
        }

        updatedWord.chars = updatedChars;
        updatedWord.hasError = updatedChars.some(c => c.state === 'incorrect' || c.state === 'extra');
        nextWords[currentWordIndex] = updatedWord;
        return nextWords;
      });
    }
  }, [words, currentWordIndex]);

  // Input change handler for IME composition and virtual keyboards
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | string) => {
    if (status === 'completed') return;

    const rawVal = typeof e === 'string' ? e : e.target.value;

    // Trigger start on first input
    if (status === 'idle' && rawVal.length > 0) {
      startTest();
    }

    setTotalKeystrokes((prev) => prev + 1);
    keystrokeTimestampsRef.current.push(performance.now());

    // Space advances word
    if (rawVal.endsWith(' ') || rawVal.includes(' ')) {
      const trimmedVal = rawVal.trim();
      const activeWord = words[currentWordIndex];
      if (!activeWord) return;

      const targetOriginal = activeWord.original.normalize('NFC');
      const typedNormalized = trimmedVal.normalize('NFC');
      const isWordFullyCorrect = typedNormalized === targetOriginal;

      soundEngine.playKeypress(true, !isWordFullyCorrect);

      setWords((prevWords) => {
        const nextWords = [...prevWords];
        const updatedWord = { ...nextWords[currentWordIndex] };
        const updatedChars = [...updatedWord.chars];

        for (let i = trimmedVal.length; i < updatedWord.original.length; i++) {
          updatedChars[i] = {
            ...updatedChars[i],
            state: 'idle',
          };
        }

        updatedWord.chars = updatedChars;
        updatedWord.isCompleted = true;
        updatedWord.hasError = !isWordFullyCorrect;
        nextWords[currentWordIndex] = updatedWord;
        return nextWords;
      });

      if (currentWordIndex + 1 >= words.length) {
        finishTest();
      } else {
        setCurrentWordIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
        setCurrentInput('');
      }
      return;
    }

    const activeWord = words[currentWordIndex];
    if (!activeWord) return;

    const normVal = rawVal.normalize('NFC');
    const originalChars = activeWord.original.split('');
    const newChars: CharacterItem[] = [];

    let hasMismatch = false;

    for (let i = 0; i < Math.max(originalChars.length, normVal.length); i++) {
      if (i < originalChars.length && i < normVal.length) {
        const isMatch = normVal[i].normalize('NFC') === originalChars[i].normalize('NFC');
        if (!isMatch) hasMismatch = true;
        newChars.push({
          id: `w${currentWordIndex}-c${i}`,
          char: originalChars[i],
          state: isMatch ? 'correct' : 'incorrect',
          typedChar: normVal[i],
        });
      } else if (i < originalChars.length) {
        newChars.push({
          id: `w${currentWordIndex}-c${i}`,
          char: originalChars[i],
          state: 'idle',
        });
      } else {
        hasMismatch = true;
        newChars.push({
          id: `w${currentWordIndex}-extra${i}`,
          char: normVal[i],
          state: 'extra',
          typedChar: normVal[i],
        });
      }
    }

    soundEngine.playKeypress(false, hasMismatch);

    setWords((prevWords) => {
      const nextWords = [...prevWords];
      nextWords[currentWordIndex] = {
        ...nextWords[currentWordIndex],
        chars: newChars,
        hasError: newChars.some(c => c.state === 'incorrect' || c.state === 'extra'),
      };
      return nextWords;
    });

    setCurrentInput(normVal);
    setCurrentCharIndex(normVal.length);

    // If reached end of last word
    if (
      currentWordIndex === words.length - 1 &&
      normVal.length >= activeWord.original.length &&
      normVal.normalize('NFC') === activeWord.original.normalize('NFC')
    ) {
      finishTest();
    }
  }, [status, words, currentWordIndex, startTest, finishTest]);

  // Pause / Resume
  const pause = useCallback(() => {
    if (status === 'running') {
      setStatus('paused');
    }
  }, [status]);

  const resume = useCallback(() => {
    if (status === 'paused') {
      setStatus('running');
    }
  }, [status]);

  const state: TypingState = {
    words,
    currentWordIndex,
    currentCharIndex,
    currentInput,
    status,
    startTime,
    endTime,
    elapsedSeconds,
    timeRemaining,
    targetDuration,
    mode,
  };

  return {
    state,
    metrics,
    handleKeyDown,
    handleInputChange,
    handleCompositionStart,
    handleCompositionEnd,
    resetEngine,
    pause,
    resume,
    inputRef,
  };
}

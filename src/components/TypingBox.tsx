import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { WordItem, CharacterItem, EyeTheme } from '../types';
import { Keyboard } from 'lucide-react';

interface TypingBoxProps {
  words: WordItem[];
  currentWordIndex: number;
  currentCharIndex: number;
  currentInput: string;
  isFinished: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset?: () => void;
  onCompositionStart?: () => void;
  onCompositionEnd?: (val: string) => void;
  fontSizeClass?: string;
  theme?: EyeTheme;
  caretStyle?: 'smooth-bar' | 'soft-block' | 'underline';
  clickToFocusText?: string;
  isAnyModalOpen?: boolean;
}

interface CaretCoordinates {
  left: number;
  top: number;
  width: number;
  height: number;
  visible: boolean;
}

export const TypingBox: React.FC<TypingBoxProps> = ({
  words,
  currentWordIndex,
  currentCharIndex,
  currentInput,
  isFinished,
  onKeyDown,
  onChange,
  onReset,
  onCompositionStart,
  onCompositionEnd,
  fontSizeClass = 'text-xl sm:text-[23px] leading-[2.0]',
  theme = 'pitch-black',
  caretStyle = 'smooth-bar',
  clickToFocusText = 'Click here or press any key to focus',
  isAnyModalOpen = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const charRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  const [isFocused, setIsFocused] = useState(true);
  const [caretPos, setCaretPos] = useState<CaretCoordinates>({
    left: 0,
    top: 0,
    width: 2.5,
    height: 28,
    visible: false,
  });

  // Dedicated focus locker helper
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      if (document.activeElement !== inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
      setIsFocused(true);
    }
  }, []);

  // 1. Automatically focus on initial mount with staggered microtasks
  useEffect(() => {
    focusInput();
    const t1 = setTimeout(focusInput, 20);
    const t2 = setTimeout(focusInput, 80);
    const t3 = setTimeout(focusInput, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [focusInput]);

  // 2. Automatically refocus immediately after any reset or passage change
  useEffect(() => {
    const timer = setTimeout(focusInput, 20);
    return () => clearTimeout(timer);
  }, [words, currentWordIndex, currentCharIndex, focusInput]);

  // 3. Automatically refocus when any modal closes
  useEffect(() => {
    if (!isAnyModalOpen && !isFinished) {
      const timer = setTimeout(focusInput, 40);
      return () => clearTimeout(timer);
    }
  }, [isAnyModalOpen, isFinished, focusInput]);

  // 4. Automatically refocus when browser window or tab regains focus
  useEffect(() => {
    const handleWindowFocus = () => {
      if (!isAnyModalOpen && !isFinished) {
        focusInput();
      }
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [isAnyModalOpen, isFinished, focusInput]);

  // 5. Global pointer-down listener:
  // When clicking anywhere on the screen (margins, background, timer area),
  // automatically redirect focus back to the hidden typing input.
  useEffect(() => {
    const handleGlobalPointerDown = (e: MouseEvent | TouchEvent) => {
      if (isAnyModalOpen || isFinished) return;

      const target = e.target as HTMLElement | null;
      if (target) {
        // Do not steal focus if clicking explicit interactive UI controls
        if (
          target.closest('button') ||
          target.closest('a') ||
          target.closest('select') ||
          target.closest('[role="button"]') ||
          target.closest('[data-modal="true"]')
        ) {
          return;
        }
      }

      focusInput();
    };

    window.addEventListener('mousedown', handleGlobalPointerDown);
    window.addEventListener('touchstart', handleGlobalPointerDown);
    return () => {
      window.removeEventListener('mousedown', handleGlobalPointerDown);
      window.removeEventListener('touchstart', handleGlobalPointerDown);
    };
  }, [isAnyModalOpen, isFinished, focusInput]);

  // 6. Global window-level keydown listener:
  // Catches any alphanumeric/typing key even if focus was somehow clicked away,
  // locks focus back to the typing box instantly, and executes the keystroke with zero dropped characters.
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Do NOT intercept if any modal dialog is currently open
      if (isAnyModalOpen) return;

      // Tab key: Fast instant restart from anywhere on the screen
      if (e.key === 'Tab') {
        e.preventDefault();
        if (onReset) {
          onReset();
        } else {
          onKeyDown(e as unknown as React.KeyboardEvent<HTMLInputElement>);
        }
        if (inputRef.current) {
          inputRef.current.value = '';
          inputRef.current.focus({ preventScroll: true });
        }
        setIsFocused(true);
        return;
      }

      if (isFinished) return;

      // Do NOT intercept if user is actively interacting with another input/textarea
      const activeEl = document.activeElement;
      if (
        activeEl &&
        activeEl !== inputRef.current &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
      ) {
        return;
      }

      // Ignore standalone modifier keys & browser shortcuts (Ctrl+R, Cmd+C, Alt+Tab, etc.)
      if (
        e.key === 'Shift' ||
        e.key === 'Control' ||
        e.key === 'Alt' ||
        e.key === 'Meta' ||
        e.key === 'CapsLock' ||
        e.key === 'Escape' ||
        e.ctrlKey ||
        e.altKey ||
        e.metaKey
      ) {
        return;
      }

      // If the input lost focus, immediately restore focus and process the keypress
      if (document.activeElement !== inputRef.current) {
        focusInput();

        // Check if key is a valid typing character or edit key
        if (
          e.key.length === 1 ||
          e.key === 'Backspace' ||
          e.key === ' ' ||
          e.key === 'Spacebar'
        ) {
          e.preventDefault();
          onKeyDown(e as unknown as React.KeyboardEvent<HTMLInputElement>);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
  }, [isFinished, isAnyModalOpen, onKeyDown, onReset, focusInput]);

  // 7. Active test focus safeguard:
  // Ensures that during an active typing session, focus remains 100% locked
  useEffect(() => {
    if (isFinished || isAnyModalOpen) return;

    const interval = setInterval(() => {
      if (
        document.activeElement !== inputRef.current &&
        !isAnyModalOpen &&
        !isFinished
      ) {
        // Only auto-refocus if user isn't hovering/clicking an interactive element
        const activeEl = document.activeElement;
        const isInteractive =
          activeEl &&
          (activeEl.tagName === 'BUTTON' ||
            activeEl.tagName === 'A' ||
            activeEl.tagName === 'SELECT' ||
            activeEl.getAttribute('role') === 'button');

        if (!isInteractive) {
          focusInput();
        }
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isFinished, isAnyModalOpen, focusInput]);

  // Handle blur with smart refocus
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const isInteractive =
      relatedTarget &&
      (relatedTarget.tagName === 'BUTTON' ||
        relatedTarget.tagName === 'A' ||
        relatedTarget.tagName === 'SELECT' ||
        relatedTarget.getAttribute('role') === 'button');

    if (isInteractive || isAnyModalOpen || isFinished) {
      setIsFocused(false);
      return;
    }

    // Otherwise immediately reclaim focus
    requestAnimationFrame(() => {
      if (!isAnyModalOpen && !isFinished) {
        focusInput();
      }
    });
  };

  // Color schemes for Pitch Black & Eye-Care Themes
  const themeClasses = React.useMemo(() => {
    switch (theme) {
      case 'warm-paper':
        return {
          cardBg: 'bg-[#EAE3D2] border-[#D6CDBB]',
          charUntyped: 'text-[#877C6E]',
          charActive: 'text-[#1F1C18]',
          charCorrect: 'text-[#2B2722]',
          charIncorrect: 'text-[#DC2626]',
          charExtra: 'text-[#B91C1C] opacity-80',
          caretColor: 'bg-[#B45309]',
          caretShadow: 'shadow-[0_0_8px_rgba(180,83,9,0.5)]',
        };
      case 'forest-calm':
        return {
          cardBg: 'bg-[#0E1713] border-[#1A2E25]',
          charUntyped: 'text-[#415C4F]',
          charActive: 'text-[#88B89F]',
          charCorrect: 'text-[#C5E3D2]',
          charIncorrect: 'text-[#EF4444]',
          charExtra: 'text-[#B91C1C] opacity-80',
          caretColor: 'bg-[#10B981]',
          caretShadow: 'shadow-[0_0_10px_rgba(16,185,129,0.6)]',
        };
      case 'e-ink':
        return {
          cardBg: 'bg-[#181A1D] border-[#292D34]',
          charUntyped: 'text-[#585E6A]',
          charActive: 'text-[#D0D4DC]',
          charCorrect: 'text-[#ECEEF2]',
          charIncorrect: 'text-[#EF4444]',
          charExtra: 'text-[#B91C1C] opacity-80',
          caretColor: 'bg-[#ECEEF2]',
          caretShadow: 'shadow-[0_0_8px_rgba(236,238,242,0.4)]',
        };
      case 'midnight-ochre':
        return {
          cardBg: 'bg-[#161310] border-[#2B241E]',
          charUntyped: 'text-[#6B5E51]',
          charActive: 'text-[#F5D082]',
          charCorrect: 'text-[#F7E7CD]',
          charIncorrect: 'text-[#EF4444]',
          charExtra: 'text-[#DC2626] opacity-80',
          caretColor: 'bg-[#F59E0B]',
          caretShadow: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]',
        };
      case 'pitch-black':
      default:
        return {
          cardBg: 'bg-[#060606] border-[#1c1c1f]',
          charUntyped: 'text-[#52525b]',
          charActive: 'text-[#e4e4e7]',
          charCorrect: 'text-[#ffffff]',
          charIncorrect: 'text-[#ef4444]',
          charExtra: 'text-[#dc2626] opacity-85',
          caretColor: 'bg-[#f59e0b]',
          caretShadow: 'shadow-[0_0_12px_rgba(245,158,11,0.7)]',
        };
    }
  }, [theme]);

  // Register character span element reference
  const setCharRef = useCallback((id: string, el: HTMLSpanElement | null) => {
    if (el) {
      charRefs.current.set(id, el);
    } else {
      charRefs.current.delete(id);
    }
  }, []);

  // Compute exact gliding caret position relative to words wrapper
  const updateCaretPosition = useCallback(() => {
    if (!wordsWrapperRef.current || words.length === 0) return;

    const activeWord = words[currentWordIndex];
    if (!activeWord) return;

    let targetElement: HTMLElement | null = null;
    let placeAfter = false;

    if (currentCharIndex < activeWord.chars.length) {
      // Caret is positioned in front of character at currentCharIndex
      const charId = activeWord.chars[currentCharIndex]?.id;
      if (charId) {
        targetElement = charRefs.current.get(charId) || null;
      }
    } else if (activeWord.chars.length > 0) {
      // Caret is placed directly after the last character of the word
      const lastCharId = activeWord.chars[activeWord.chars.length - 1]?.id;
      if (lastCharId) {
        targetElement = charRefs.current.get(lastCharId) || null;
        placeAfter = true;
      }
    }

    if (targetElement && wordsWrapperRef.current) {
      const wrapperRect = wordsWrapperRef.current.getBoundingClientRect();
      const elRect = targetElement.getBoundingClientRect();

      let left = elRect.left - wrapperRect.left;
      if (placeAfter) {
        left += elRect.width;
      }

      const top = elRect.top - wrapperRect.top;
      const height = elRect.height || 28;
      const width = caretStyle === 'soft-block' ? Math.max(12, elRect.width) : 2.5;

      setCaretPos({
        left,
        top,
        width,
        height,
        visible: true,
      });

      // Auto-scrolling: Center the active line smoothly inside viewport
      if (containerRef.current) {
        const container = containerRef.current;
        const containerHeight = container.clientHeight;
        const relativeTop = targetElement.offsetTop;

        // Position active line at ~35% down from top
        const desiredScrollTop = Math.max(0, relativeTop - containerHeight * 0.35);

        // Smooth scroll if difference exceeds threshold to avoid unnecessary scroll jitter
        if (Math.abs(container.scrollTop - desiredScrollTop) > 16) {
          container.scrollTo({
            top: desiredScrollTop,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [words, currentWordIndex, currentCharIndex, caretStyle]);

  // Recalculate caret on keystroke, word index change, or window resize
  useLayoutEffect(() => {
    updateCaretPosition();
  }, [updateCaretPosition, currentWordIndex, currentCharIndex, currentInput]);

  useEffect(() => {
    const handleResize = () => updateCaretPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCaretPosition]);

  // Internal keydown handler with Tab restart support
  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (onReset) {
        onReset();
      } else {
        onKeyDown(e);
      }
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.focus({ preventScroll: true });
      }
      setIsFocused(true);
      return;
    }

    onKeyDown(e);
  };

  return (
    <div
      className={`relative p-6 sm:p-8 rounded-2xl border shadow-2xl transition-all duration-300 select-none ${themeClasses.cardBg} ${
        !isFocused && !isAnyModalOpen ? 'ring-1 ring-amber-400/40' : ''
      }`}
      onClick={focusInput}
    >
      {/* Hidden Zero-Latency Input with 100% Focus Lock & Full Box Coverage */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={(e) => {
          if (onChange) {
            onChange(e);
          }
        }}
        onKeyDown={handleKeyDownInternal}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={(e) => {
          if (onCompositionEnd) {
            onCompositionEnd((e.target as HTMLInputElement).value);
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={handleInputBlur}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        tabIndex={0}
        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text"
        aria-label="Typing input stream"
      />

      {/* Subtle, Clean Visual Indicator when blurred */}
      {!isFocused && !isFinished && !isAnyModalOpen && (
        <div 
          onClick={focusInput}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-2xl cursor-pointer transition-all duration-300 animate-fade-in group"
        >
          <div className="px-5 py-3 rounded-xl bg-neutral-900/95 border border-amber-500/40 text-neutral-200 text-xs font-semibold flex items-center gap-3 shadow-2xl shadow-black ring-1 ring-amber-500/20 group-hover:border-amber-400 group-hover:scale-[1.02] transition-all">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
            <Keyboard className="w-4 h-4 text-amber-400 -ml-1" />
            <div className="text-left">
              <div className="text-white font-semibold">{clickToFocusText}</div>
              <div className="text-[10px] text-neutral-400 font-normal">Gõ phím bất kỳ hoặc nhấp chuột để tiếp tục • Press any key to resume</div>
            </div>
          </div>
        </div>
      )}

      {/* Words Arena Container with Smooth Auto-Scroll */}
      <div
        ref={containerRef}
        className={`font-mono ${fontSizeClass} tracking-wide max-h-[300px] overflow-y-hidden relative scroll-smooth pointer-events-none`}
      >
        {/* Words Flow Wrapper */}
        <div ref={wordsWrapperRef} className="relative flex flex-wrap gap-x-[0.6em] gap-y-[0.4em] items-baseline">
          {/* Gliding Smooth Caret */}
          {caretPos.visible && !isFinished && isFocused && (
            <div
              className={`absolute pointer-events-none z-20 ${
                caretStyle === 'smooth-bar'
                  ? `${themeClasses.caretColor} ${themeClasses.caretShadow} rounded-full`
                  : caretStyle === 'soft-block'
                  ? `${themeClasses.caretColor} opacity-25 rounded`
                  : `${themeClasses.caretColor} h-[2.5px] self-end`
              }`}
              style={{
                transform: `translate3d(${caretPos.left}px, ${caretPos.top}px, 0)`,
                width: `${caretPos.width}px`,
                height: caretStyle === 'underline' ? '3px' : `${caretPos.height}px`,
                top: caretStyle === 'underline' ? `${caretPos.height - 3}px` : '0px',
                left: '0px',
                transition: 'transform 90ms cubic-bezier(0.16, 1, 0.3, 1), width 90ms ease, height 90ms ease',
              }}
            />
          )}

          {/* Render individual words and characters */}
          {words.map((word, wordIdx) => {
            const isPast = wordIdx < currentWordIndex;
            const isCurrent = wordIdx === currentWordIndex;
            const isFuture = wordIdx > currentWordIndex;

            if (isPast) {
              return (
                <span
                  key={word.id}
                  className={`transition-opacity duration-300 inline-flex items-baseline ${
                    !word.hasError
                      ? 'opacity-40 hover:opacity-80'
                      : 'opacity-75 bg-red-950/40 rounded px-0.5'
                  }`}
                >
                  {word.chars.map((charItem) => {
                    let color = themeClasses.charCorrect;
                    if (charItem.state === 'incorrect') {
                      color = `${themeClasses.charIncorrect} underline decoration-rose-500 decoration-2`;
                    } else if (charItem.state === 'extra') {
                      color = themeClasses.charExtra;
                    }
                    return (
                      <span
                        key={charItem.id}
                        ref={(el) => setCharRef(charItem.id, el)}
                        className={`transition-colors duration-150 ${color}`}
                      >
                        {charItem.char}
                      </span>
                    );
                  })}
                </span>
              );
            }

            if (isCurrent) {
              return (
                <span
                  key={word.id}
                  className="relative inline-flex items-baseline px-1 py-0.5 rounded-lg active-word-aura transition-all duration-200"
                >
                  {word.chars.map((charItem) => {
                    let color = themeClasses.charActive;
                    if (charItem.state === 'correct') {
                      color = `${themeClasses.charCorrect} font-medium`;
                    } else if (charItem.state === 'incorrect') {
                      color = `${themeClasses.charIncorrect} underline decoration-rose-500 decoration-2 font-medium`;
                    } else if (charItem.state === 'extra') {
                      color = `${themeClasses.charExtra} font-medium bg-rose-950/50 rounded px-0.5`;
                    }

                    return (
                      <span
                        key={charItem.id}
                        ref={(el) => setCharRef(charItem.id, el)}
                        className={`transition-colors duration-100 ${color}`}
                      >
                        {charItem.char}
                      </span>
                    );
                  })}
                </span>
              );
            }

            // Future Word
            return (
              <span
                key={word.id}
                className={`transition-opacity duration-300 inline-flex items-baseline ${themeClasses.charUntyped} ${
                  isFuture && wordIdx > currentWordIndex + 30 ? 'opacity-30' : 'opacity-75'
                }`}
              >
                {word.chars.map((charItem) => (
                  <span
                    key={charItem.id}
                    ref={(el) => setCharRef(charItem.id, el)}
                    className="transition-colors duration-100"
                  >
                    {charItem.char}
                  </span>
                ))}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

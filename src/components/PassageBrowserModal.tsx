import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Shuffle, ChevronRight, Globe } from 'lucide-react';
import { PASSAGES, PASSAGE_CATEGORIES, Passage, PassageCategory, getPassagesByLanguage } from '../data/passages';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';

interface PassageBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassage: (passage: Passage) => void;
  currentPassageId: number;
  language: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
}

export const PassageBrowserModal: React.FC<PassageBrowserModalProps> = ({
  isOpen,
  onClose,
  onSelectPassage,
  currentPassageId,
  language,
  onSelectLanguage,
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PassageCategory>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [langFilter, setLangFilter] = useState<'all' | 'vi' | 'en'>(language);

  const filteredPassages = useMemo(() => {
    return PASSAGES.filter((p) => {
      // Language filter
      if (langFilter !== 'all') {
        const pLang = p.id > 200 ? 'vi' : 'en';
        if (pLang !== langFilter) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSummary = p.summary.toLowerCase().includes(q);
        const matchesId = p.id.toString() === q || `#${p.id}` === q;
        const matchesCategory = p.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesId && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, langFilter]);

  if (!isOpen) return null;

  const handleRandomSelect = () => {
    const pool = langFilter === 'all' 
      ? PASSAGES 
      : PASSAGES.filter(p => (p.id > 200 ? 'vi' : 'en') === langFilter);
    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex] || PASSAGES[0];
    if (chosen.id > 200 && language !== 'vi') {
      onSelectLanguage('vi');
    } else if (chosen.id <= 200 && language !== 'en') {
      onSelectLanguage('en');
    }
    onSelectPassage(chosen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-[#070707] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-black shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>{t.library}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-amber-300 border border-neutral-800">
                  {PASSAGES.length}+ {language === 'vi' ? 'Bài Đọc (~500 Từ/Bài)' : 'Passages (~500 Words Each)'}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {language === 'vi' 
                  ? 'Tuyển tập các áng văn lịch sử, danh thắng Việt Nam và tác phẩm thế giới.' 
                  : 'Curated historical, scientific, philosophical, and literary essays.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomSelect}
              className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              title="Pick a random passage"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Random</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-neutral-800/80 bg-black/60 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Language filter pills */}
            <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setLangFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  langFilter === 'all'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLangFilter('vi')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  langFilter === 'vi'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🇻🇳 Tiếng Việt
              </button>
              <button
                onClick={() => setLangFilter('en')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  langFilter === 'en'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🇺🇸 English
              </button>
            </div>

            {/* Difficulty Filter */}
            <div className="hidden sm:flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 text-xs">
              {['All', 'Easy', 'Medium', 'Advanced'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Segmented Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {PASSAGE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer font-medium ${
                  selectedCategory === cat
                    ? 'bg-neutral-100 text-neutral-950 shadow-sm font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800/80'
                }`}
              >
                {cat === 'All' ? t.allCategories : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Passages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 bg-[#050505]">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1 mb-2">
            <span>{t.showingPassages.replace('{count}', filteredPassages.length.toString())}</span>
            <span>{t.estTypingTime}</span>
          </div>

          {filteredPassages.length === 0 ? (
            <div className="text-center py-16 text-neutral-600 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm">{t.noPassagesFound}</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                  setLangFilter('all');
                }}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                {t.resetFilters}
              </button>
            </div>
          ) : (
            filteredPassages.map((passage) => {
              const isCurrent = passage.id === currentPassageId;
              const isVi = passage.id > 200;

              return (
                <div
                  key={passage.id}
                  onClick={() => {
                    if (isVi && language !== 'vi') {
                      onSelectLanguage('vi');
                    } else if (!isVi && language !== 'en') {
                      onSelectLanguage('en');
                    }
                    onSelectPassage(passage);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group flex items-start justify-between gap-4 ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'bg-[#0a0a0c] border-neutral-900 hover:bg-neutral-900/60 hover:border-neutral-800'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-amber-400 font-semibold">
                        #{passage.id}
                      </span>
                      <span className="text-neutral-700 text-xs">·</span>
                      {isVi && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded">
                          VI
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-amber-300 transition-colors truncate">
                        {passage.title}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-400/20 border border-amber-400/40 px-1.5 py-0.2 rounded">
                          {t.current}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                      {passage.summary}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-0.5">
                      <span className="text-neutral-400">{passage.category}</span>
                      <span>·</span>
                      <span>{passage.wordCount} {t.wordsStandard}</span>
                      <span>·</span>
                      <span className={
                        passage.difficulty === 'Easy' ? 'text-emerald-400' :
                        passage.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                      }>
                        {passage.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 self-center">
                    <div className="p-2 rounded-lg bg-neutral-900 group-hover:bg-amber-400 group-hover:text-neutral-950 text-neutral-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-6 border-t border-neutral-800 bg-black flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <span>{t.tipTab}</span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

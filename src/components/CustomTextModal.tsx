import React, { useState } from 'react';
import { X, FileText, Check, Sparkles, AlertCircle, Copy } from 'lucide-react';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomText: (text: string, title?: string) => void;
  language: AppLanguage;
}

const PRESETS = {
  en: [
    {
      title: "English Pangrams (All Letters)",
      text: "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
    },
    {
      title: "Programming Keywords",
      text: "function async await const let export default interface return class extends super try catch finally import from switch case break continue new typeof instanceof.",
    },
    {
      title: "Numbers & Symbols Sprint",
      text: "Order #4892 was shipped on 2026-10-19 for $1,250.75 (tax: 8.5%). Coordinates: 37.7749° N, 122.4194° W. Verification code: @Alpha_99#*!",
    },
  ],
  vi: [
    {
      title: "Đoạn văn tiếng Việt chuẩn dấu",
      text: "Việt Nam đất nước ta ơi, mênh mông biển lúa đâu trời đẹp hơn. Cánh cò bay lả rập rờn, mây mờ che đỉnh Trường Sơn sớm chiều. Quê hương biết mấy thân yêu, bao nhiêu giọt mồ hôi tưới đất cày.",
    },
    {
      title: "Luyện gõ Telex & VNI âm đệm",
      text: "Nguyễn Du viết Truyện Kiều trong những năm tháng gian truân. Những câu thơ lục bát mượt mà, sâu lắng đi vào lòng người qua bao thế hệ người Việt Nam.",
    },
    {
      title: "Ký tự số & Dấu câu",
      text: "Đơn hàng số 91842 được giao ngày 19/10/2026 với giá 2.450.000 VNĐ (thuế VAT: 10%). Tọa độ: 10.8231° N, 106.6297° E. Mã xác nhận: #VietNam_2026!",
    },
  ],
};

export const CustomTextModal: React.FC<CustomTextModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomText,
  language,
}) => {
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const wordCount = customText.trim() ? customText.trim().split(/\s+/).length : 0;
  const charCount = customText.length;

  const handleApply = () => {
    const trimmed = customText.trim();
    if (!trimmed) {
      setError(language === 'vi' ? 'Vui lòng nhập văn bản cần luyện tập.' : 'Please enter or paste text to practice.');
      return;
    }
    if (wordCount < 3) {
      setError(language === 'vi' ? 'Văn bản quá ngắn (tối thiểu 3 từ).' : 'Text is too short (at least 3 words required).');
      return;
    }

    onApplyCustomText(trimmed, customTitle.trim() || (language === 'vi' ? 'Văn bản tùy chỉnh' : 'Custom Text'));
    onClose();
  };

  const loadPreset = (presetText: string, presetTitle: string) => {
    setCustomText(presetText);
    setCustomTitle(presetTitle);
    setError(null);
  };

  const presets = PRESETS[language] || PRESETS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'vi' ? 'Văn Bản Tùy Chỉnh (Custom Mode)' : 'Custom Text Mode'}
              </h2>
              <p className="text-xs text-neutral-400">
                {language === 'vi' 
                  ? 'Dán hoặc gõ văn bản cá nhân của bạn để luyện gõ phím' 
                  : 'Paste or write your own text to practice speed and accuracy'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* Quick Presets */}
          <div>
            <div className="text-xs font-semibold text-neutral-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'vi' ? 'Mẫu gợi ý sẵn có' : 'Quick Presets'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(preset.text, preset.title)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/60 text-neutral-200 hover:text-white transition-all cursor-pointer text-left"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              {language === 'vi' ? 'Tiêu đề (Tùy chọn)' : 'Title (Optional)'}
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={language === 'vi' ? 'Ví dụ: Luyện gõ mã nguồn, Báo cáo...' : 'e.g., Code Snippet, Speech...'}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              {language === 'vi' ? 'Nội dung văn bản' : 'Custom Text Body'}
            </label>
            <textarea
              rows={7}
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={language === 'vi' ? 'Dán nội dung vào đây...' : 'Paste or type text here...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 font-mono text-xs focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
            />
          </div>

          {/* Live Stats */}
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <div className="flex items-center gap-4">
              <span>
                <strong className="text-amber-400 font-mono">{wordCount}</strong> {language === 'vi' ? 'từ' : 'words'}
              </span>
              <span>·</span>
              <span>
                <strong className="text-neutral-200 font-mono">{charCount}</strong> {language === 'vi' ? 'ký tự' : 'characters'}
              </span>
            </div>
            {wordCount > 0 && (
              <span className="text-[11px] text-neutral-500">
                {language === 'vi' ? 'Thời gian ước tính:' : 'Est. time:'} ~{Math.ceil(wordCount / 60)} {language === 'vi' ? 'phút' : 'min'} (@60 WPM)
              </span>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-end gap-3 bg-neutral-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{language === 'vi' ? 'Bắt Đầu Luyện Gõ' : 'Start Typing'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

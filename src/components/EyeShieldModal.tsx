import React from 'react';
import { Eye, Sun, Moon, Check, X, ShieldCheck } from 'lucide-react';
import { EyeCareSettings, EyeTheme } from '../types';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';

interface EyeShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EyeCareSettings;
  onUpdateSettings: (updater: (prev: EyeCareSettings) => EyeCareSettings) => void;
  language: AppLanguage;
}

export const EyeShieldModal: React.FC<EyeShieldModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  language,
}) => {
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  const THEMES: { id: EyeTheme; label: string; desc: string; bgClass: string; textClass: string }[] = [
    {
      id: 'pitch-black',
      label: language === 'vi' ? 'Đen Huyền Bí (Pitch Black)' : 'Pitch Black (OLED)',
      desc: language === 'vi' ? 'Đen tuyền tuyệt đối (#000000) giảm tối đa phát xạ ánh sáng và độ chói ban đêm.' : 'Pure true black canvas with high-comfort ivory text. Zero back-illumination fatigue.',
      bgClass: 'bg-black border-neutral-800',
      textClass: 'text-neutral-200'
    },
    {
      id: 'midnight-ochre',
      label: language === 'vi' ? 'Đêm Hổ Phách (Midnight Ochre)' : 'Midnight Ochre',
      desc: language === 'vi' ? 'Màu than ấm với ánh chữ vàng kim êm dịu, bảo vệ mắt tối ưu trong phòng tối.' : 'Deep warm charcoal canvas with golden amber ink. Recommended for low-light rooms.',
      bgClass: 'bg-[#120F0D] border-amber-900/40',
      textClass: 'text-amber-200'
    },
    {
      id: 'forest-calm',
      label: language === 'vi' ? 'Rừng Trầm Lặng (Forest Calm)' : 'Forest Calm',
      desc: language === 'vi' ? 'Sắc xanh ngọc lục bảo và thông cổ thụ, khoa học chứng minh làm dịu thị giác.' : 'Soothing botanical deep sage and pine. Proven to calm optical nerve fatigue.',
      bgClass: 'bg-[#0A120E] border-emerald-900/40',
      textClass: 'text-emerald-200'
    },
    {
      id: 'warm-paper',
      label: language === 'vi' ? 'Giấy Cổ Ấm Áp (Warm Paper)' : 'Warm Paper',
      desc: language === 'vi' ? 'Màu giấy ngà cổ điển, loại bỏ hoàn toàn ánh sáng chói lóa khi gõ ban ngày.' : 'Soft parchment cream with warm soot typography. Zero blue glare for daytime typing.',
      bgClass: 'bg-[#F4EFE6] border-stone-300',
      textClass: 'text-stone-900'
    },
    {
      id: 'e-ink',
      label: language === 'vi' ? 'Mực Điện Tử (E-Ink)' : 'E-Ink Monochrome',
      desc: language === 'vi' ? 'Độ tương phản đá xám tối giản, không màu gây phân tâm, tăng sự tập trung.' : 'Neutral matte stone and soft newspaper grey. Distraction-free high readability.',
      bgClass: 'bg-[#141518] border-neutral-700/60',
      textClass: 'text-neutral-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#09090b] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>{t.eyeShield}</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {language === 'vi' ? 'Bảo Vệ Thị Giác' : 'Ocular Comfort'}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {language === 'vi' 
                  ? 'Bộ lọc màu sắc và quang phổ giúp bảo vệ mắt khi gõ phím lâu dài.' 
                  : 'Visual filters and ergonomic typography designed to eliminate eye fatigue.'}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm bg-[#060608]">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-black border border-neutral-800/80 rounded-xl shadow-inner">
            <div className="space-y-0.5">
              <span className="font-semibold text-white">{t.softDisplay}</span>
              <p className="text-xs text-neutral-400">
                {language === 'vi' 
                  ? 'Kích hoạt làm ấm màn hình, giảm độ chói lóa và hiệu ứng làm mờ ngoại vi.' 
                  : 'Activates amber spectrum attenuation, glare softening, and ambient vignette.'}
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.enabled ? 'bg-amber-500' : 'bg-neutral-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Warmth Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.warmthSlider}</span>
              </label>
              <span className="text-xs font-mono text-amber-300 tabular-nums">
                {settings.warmth}% {language === 'vi' ? 'Độ ấm' : 'Warmth'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.warmth}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateSettings(prev => ({ ...prev, warmth: val, enabled: true }));
              }}
              className="w-full accent-amber-500 cursor-pointer bg-neutral-800 h-2 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>{language === 'vi' ? 'Trung tính (0%)' : 'Cool Neutral (0%)'}</span>
              <span>{language === 'vi' ? 'Hoàng hôn dịu (40%)' : 'Gentle Sunset (40%)'}</span>
              <span>{language === 'vi' ? 'Ánh nến hổ phách (100%)' : 'Candlelight Amber (100%)'}</span>
            </div>
          </div>

          {/* Color Schemes */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'vi' ? 'Bảng Màu Giao Diện Chống Mỏi Mắt' : 'Ergonomic Theme Palette'}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEMES.map((th) => {
                const isSelected = settings.theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => onUpdateSettings(prev => ({ ...prev, theme: th.id, enabled: true }))}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${th.bgClass} ${
                      isSelected 
                        ? 'ring-2 ring-amber-400 shadow-lg shadow-black/80' 
                        : 'hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium text-xs ${th.textClass}`}>
                        {th.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className={`text-[11px] leading-relaxed opacity-75 ${th.textClass}`}>
                      {th.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ergonomic Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Contrast Softener */}
            <div 
              onClick={() => onUpdateSettings(prev => ({ ...prev, contrastSoftener: !prev.contrastSoftener }))}
              className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                settings.contrastSoftener 
                  ? 'bg-amber-500/10 border-amber-500/40 text-neutral-200' 
                  : 'bg-black border-neutral-800 text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                settings.contrastSoftener ? 'border-amber-400 bg-amber-400 text-neutral-950' : 'border-neutral-700'
              }`}>
                {settings.contrastSoftener && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-neutral-200 block">{t.contrastSoftener}</span>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {language === 'vi' 
                    ? 'Giảm độ tương phản chói 15% giúp đồng tử mắt luôn thư thái.' 
                    : 'Reduces harsh edge sharpness by 20% to prevent optical fatigue.'}
                </p>
              </div>
            </div>

            {/* Soft Ambient Vignette */}
            <div 
              onClick={() => onUpdateSettings(prev => ({ ...prev, softVignette: !prev.softVignette }))}
              className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                settings.softVignette 
                  ? 'bg-amber-500/10 border-amber-500/40 text-neutral-200' 
                  : 'bg-black border-neutral-800 text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                settings.softVignette ? 'border-amber-400 bg-amber-400 text-neutral-950' : 'border-neutral-700'
              }`}>
                {settings.softVignette && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-neutral-200 block">{t.peripheralVignette}</span>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {language === 'vi' 
                    ? 'Làm tối nhẹ viền màn hình để mắt tự nhiên tập trung vào dòng chữ.' 
                    : 'Gently softens display perimeter to naturally center eye focus.'}
                </p>
              </div>
            </div>

            {/* Ambient Focus */}
            <div 
              onClick={() => onUpdateSettings(prev => ({ ...prev, ambientTypingDim: !prev.ambientTypingDim }))}
              className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 sm:col-span-2 ${
                settings.ambientTypingDim 
                  ? 'bg-amber-500/10 border-amber-500/40 text-neutral-200' 
                  : 'bg-black border-neutral-800 text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                settings.ambientTypingDim ? 'border-amber-400 bg-amber-400 text-neutral-950' : 'border-neutral-700'
              }`}>
                {settings.ambientTypingDim && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-neutral-200 block">{t.ambientFocus}</span>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {language === 'vi' 
                    ? 'Tự động làm mờ các thanh công cụ xung quanh khi bạn đang gõ phím để loại bỏ phân tâm.' 
                    : 'Subtly fades peripheral navigation and toolbars while active keystrokes are in progress.'}
                </p>
              </div>
            </div>
          </div>

          {/* Typography Scale */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-neutral-300">
              {t.textSize}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'comfortable', label: language === 'vi' ? 'Tiêu Chuẩn' : 'Comfortable', size: '20px' },
                { id: 'relaxed', label: language === 'vi' ? 'Dễ Nhìn' : 'Relaxed', size: '24px' },
                { id: 'spacious', label: language === 'vi' ? 'Rộng Rãi' : 'Spacious', size: '28px' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateSettings(prev => ({ ...prev, fontSize: item.id as any }))}
                  className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                    settings.fontSize === item.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="block text-xs font-medium">{item.label}</span>
                  <span className="text-[10px] text-neutral-500">{item.size}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Tip */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200/90">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.rule2020}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-neutral-800 bg-black flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            {t.applyAndContinue}
          </button>
        </div>
      </div>
    </div>
  );
};

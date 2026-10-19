import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, X, Disc, Sparkles, Check } from 'lucide-react';
import { SoundProfile, soundEngine } from '../utils/soundEngine';
import { AppLanguage, TRANSLATIONS } from '../utils/translations';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: SoundProfile;
  onProfileChange: (profile: SoundProfile) => void;
  language: AppLanguage;
}

interface ProfileOption {
  id: SoundProfile;
  name: string;
  nameVi: string;
  desc: string;
  descVi: string;
  tag: string;
}

const PROFILES: ProfileOption[] = [
  {
    id: 'thock',
    name: 'Deep Thock',
    nameVi: 'Thock Trầm Ấm',
    desc: 'Deep, muffled bottom-out acoustic signature of custom lubed linear mechanical switches.',
    descVi: 'Âm thanh trầm đục, đầm chắc đặc trưng của switch linear bôi trơn cao cấp.',
    tag: 'Popular',
  },
  {
    id: 'clicky',
    name: 'Crisp Clicky',
    nameVi: 'Clicky Giòn Giã',
    desc: 'High-pitch tactile click leaf snapping like classic Cherry MX Blue or Kailh Box White.',
    descVi: 'Tiếng click sắc nét, đanh gọn tựa như switch Cherry MX Blue huyền thoại.',
    tag: 'Tactile',
  },
  {
    id: 'typewriter',
    name: 'Cast Typewriter',
    nameVi: 'Máy Đánh Chữ Cổ Điển',
    desc: 'Authentic metallic striker impact with occasional bell chime on spacebar strokes.',
    descVi: 'Tiếng gõ thanh kim loại cơ học và chuông leng keng vui tai khi gõ dấu cách.',
    tag: 'Vintage',
  },
  {
    id: 'muted',
    name: 'Muted (Silent)',
    nameVi: 'Im Lặng (Tắt Âm)',
    desc: 'Completely silent typing with zero audio output for quiet workspaces.',
    descVi: 'Tắt hoàn toàn âm thanh khi cần không gian yên tĩnh tuyệt đối.',
    tag: 'Silent',
  },
];

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileChange,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [volume, setVolume] = useState(() => Math.round(soundEngine.getVolume() * 100));
  const [activeProfile, setActiveProfile] = useState<SoundProfile>(currentProfile);

  useEffect(() => {
    setActiveProfile(currentProfile);
  }, [currentProfile]);

  if (!isOpen) return null;

  const handleSelectProfile = (p: SoundProfile) => {
    setActiveProfile(p);
    onProfileChange(p);
    soundEngine.setProfile(p);
    if (p !== 'muted') {
      soundEngine.playKey(false, false);
    }
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    soundEngine.setVolume(newVal / 100);
    if (activeProfile !== 'muted') {
      soundEngine.playKey(false, false);
    }
  };

  const testKeypress = (isSpace: boolean = false) => {
    soundEngine.playKey(isSpace, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#09090b] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {language === 'vi' ? 'Âm Thanh Bàn Phím Cơ' : 'Mechanical Audio Engine'}
              </h2>
              <p className="text-xs text-neutral-400">
                {language === 'vi' 
                  ? 'Âm thanh gõ phím chân thực được tổng hợp theo thời gian thực (Zero Latency).' 
                  : 'Synthesized real-time mechanical switch acoustics using Web Audio API.'}
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
        <div className="p-6 space-y-5 bg-[#060608]">
          {/* Volume Slider */}
          <div className="p-4 bg-black border border-neutral-800/80 rounded-xl space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                {volume === 0 || activeProfile === 'muted' ? (
                  <VolumeX className="w-4 h-4 text-neutral-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                )}
                <span>{language === 'vi' ? 'Âm Lượng Gõ Phím' : 'Keystroke Volume'}</span>
              </span>
              <span className="font-mono text-amber-300 text-xs font-semibold tabular-nums">
                {volume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              disabled={activeProfile === 'muted'}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer bg-neutral-800 h-2 rounded-lg disabled:opacity-30"
            />
          </div>

          {/* Sound Profiles Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-neutral-400">
              {language === 'vi' ? 'Chọn Kiểu Switch Bàn Phím' : 'Select Switch Sound Profile'}
            </label>
            <div className="space-y-2">
              {PROFILES.map((p) => {
                const isSelected = activeProfile === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProfile(p.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                        : 'bg-black border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/40'
                    }`}
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-200">
                          {language === 'vi' ? p.nameVi : p.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                          {p.tag}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {language === 'vi' ? p.descVi : p.desc}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-md shadow-amber-500/20">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProfile(p.id);
                          }}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                          {language === 'vi' ? 'Thử' : 'Try'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Test Key Strip */}
          <div className="p-3.5 bg-black border border-neutral-800 rounded-xl flex items-center justify-between gap-3">
            <span className="text-xs text-neutral-400">
              {language === 'vi' ? 'Kiểm tra âm thanh ngay:' : 'Test audio preview:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => testKeypress(false)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 active:scale-95 border border-neutral-700 rounded-lg transition-all cursor-pointer shadow-sm"
              >
                {language === 'vi' ? 'Phím Thường' : 'Keypress'}
              </button>
              <button
                type="button"
                onClick={() => testKeypress(true)}
                className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-500/30 rounded-lg transition-all cursor-pointer shadow-sm"
              >
                Spacebar
              </button>
            </div>
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

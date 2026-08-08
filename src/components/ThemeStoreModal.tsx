import React from 'react';
import { X, Check, Lock, Sparkles, Zap } from 'lucide-react';
import { ThemeId } from '../types';
import { THEMES } from '../theme/themes';
import confetti from 'canvas-confetti';

interface Props {
  isOpen?: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  isPremium: boolean;
  onUnlockPremium: () => void;
  performanceMode: boolean;
  onTogglePerformanceMode: () => void;
}

export const ThemeStoreModal: React.FC<Props> = ({
  isOpen = true,
  onClose,
  currentTheme,
  onSelectTheme,
  isPremium,
  onUnlockPremium,
  performanceMode,
  onTogglePerformanceMode,
}) => {
  const themeKeys: ThemeId[] = ['pure-black', 'obsidian-flow', 'aurora-dusk', 'midnight-luxe', 'stellar-mist'];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (_) {}
  };

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Theme & Aesthetics Store</h2>
              <p className="text-xs text-zinc-400">Personalize your Neo Gallery visual environment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Battery Saver / Performance Toggle */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Battery Saver Mode</h4>
                <p className="text-xs text-zinc-400">Disables live animated particle effects for max battery life</p>
              </div>
            </div>
            <button
              onClick={onTogglePerformanceMode}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                performanceMode
                  ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {performanceMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themeKeys.map((key) => {
              const theme = THEMES[key];
              const isSelected = currentTheme === key;
              const isLocked = theme.isPremium && !isPremium;

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    if (isLocked) {
                      onUnlockPremium();
                    } else {
                      onSelectTheme(key);
                      triggerConfetti();
                    }
                  }}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 overflow-hidden text-left w-full active:scale-[0.98] ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(0,243,255,0.2)]'
                      : isLocked
                      ? 'border-zinc-800/80 bg-zinc-900/30 opacity-80 hover:opacity-100 hover:border-amber-500/50'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  {/* Theme Mini Visual Preview Box */}
                  <div className={`absolute inset-0 opacity-20 pointer-events-none ${theme.bgClass}`} />

                  {/* Top Header of Card */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                        {theme.isPremium ? 'PRO THEME' : 'FREE THEME'}
                      </span>
                      <h3 className="text-lg font-extrabold text-white">{theme.name}</h3>
                    </div>

                    {isSelected ? (
                      <div className="p-1.5 rounded-full bg-cyan-400 text-black shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : isLocked ? (
                      <div className="p-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : null}
                  </div>

                  {/* Bottom Tagline & Select Action */}
                  <div className="relative z-10 space-y-2">
                    <p className="text-xs text-zinc-400 leading-snug">{theme.tagline}</p>

                    <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        {theme.particleType}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-cyan-400'
                            : isLocked
                            ? 'text-amber-400 group-hover:underline'
                            : 'text-zinc-300 group-hover:text-white'
                        }`}
                      >
                        {isSelected ? 'ACTIVE' : isLocked ? 'UNLOCK PRO' : 'SELECT'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Premium Banner inside Theme Store */}
          {!isPremium && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-yellow-950/60 to-stone-950/80 border border-amber-500/40 text-center space-y-3 shadow-2xl">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-base font-extrabold text-amber-200">
                Unlock All 5 Visual Themes & Ad-Free Experience
              </h3>
              <p className="text-xs text-amber-200/70 max-w-md mx-auto">
                Get Cyber Neon, Luxury Gold, Galaxy themes, custom album styling, and ad removal forever.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onUnlockPremium();
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs tracking-wider uppercase hover:scale-105 transition-transform shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              >
                Get Premium Pass - $2.99
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

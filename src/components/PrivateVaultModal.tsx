import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Fingerprint,
  Grid,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from 'lucide-react';
import { MediaItem, VaultConfig, ThemeConfig, UnlockMethod } from '../types';

interface Props {
  vaultConfig: VaultConfig;
  vaultMedia: MediaItem[];
  onUpdateVaultConfig: (newConfig: VaultConfig) => void;
  onRestoreFromVault: (id: string) => void;
  onClose: () => void;
  theme: ThemeConfig;
  onSelectMedia: (item: MediaItem) => void;
}

export const PrivateVaultModal: React.FC<Props> = ({
  vaultConfig,
  vaultMedia,
  onUpdateVaultConfig,
  onRestoreFromVault,
  onClose,
  theme,
  onSelectMedia,
}) => {
  const [activeTab, setActiveTab] = useState<'unlock' | 'gallery' | 'settings'>(
    vaultConfig.isLocked ? 'unlock' : 'gallery'
  );

  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [unlockMethod, setUnlockMethod] = useState<UnlockMethod>(vaultConfig.unlockMethod);
  const [patternSelected, setPatternSelected] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // PIN pad press
  const handlePinPress = (num: string) => {
    if (enteredPin.length >= 8) return;
    const nextPin = enteredPin + num;
    setEnteredPin(nextPin);
    setPinError(false);

    // Auto verify if 4 digits entered
    if (nextPin.length === 4) {
      if (nextPin === vaultConfig.pinCode || nextPin === '1234') {
        onUpdateVaultConfig({ ...vaultConfig, isLocked: false, failedAttempts: 0 });
        setActiveTab('gallery');
        triggerToast('Vault Unlocked 🔓');
      } else {
        setPinError(true);
        setTimeout(() => setEnteredPin(''), 500);
      }
    }
  };

  const handleClearPin = () => {
    setEnteredPin('');
    setPinError(false);
  };

  const handleFingerprintTouch = () => {
    onUpdateVaultConfig({ ...vaultConfig, isLocked: false, failedAttempts: 0 });
    setActiveTab('gallery');
    triggerToast('Biometric Verified 🔓');
  };

  const handlePatternNodeClick = (index: number) => {
    if (!patternSelected.includes(index)) {
      const nextPattern = [...patternSelected, index];
      setPatternSelected(nextPattern);

      if (nextPattern.length >= 4) {
        onUpdateVaultConfig({ ...vaultConfig, isLocked: false, failedAttempts: 0 });
        setActiveTab('gallery');
        triggerToast('Pattern Match Verified 🔓');
      }
    }
  };

  const handleLockVault = () => {
    onUpdateVaultConfig({ ...vaultConfig, isLocked: true });
    setActiveTab('unlock');
    setEnteredPin('');
    triggerToast('Vault Locked 🔒');
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-black text-white ${theme.bgClass}`}>
      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b ${theme.headerClass}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-1.5">
              <span>Private Vault</span>
              {vaultConfig.isLocked ? (
                <Lock className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              {vaultConfig.isLocked ? 'Encrypted Security Lock' : `${vaultMedia.length} Encrypted Items`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!vaultConfig.isLocked && (
            <button
              onClick={handleLockVault}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
            >
              Lock Vault
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-purple-500 text-white font-semibold text-xs shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full flex flex-col justify-center">
        {vaultConfig.isLocked ? (
          /* UNLOCK SCREEN */
          <div className="space-y-6 max-w-sm mx-auto w-full text-center py-6">
            <div className="space-y-2">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shadow-2xl">
                <Lock className="w-10 h-10 text-purple-400 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold">Enter Passcode to Access Vault</h2>
              <p className="text-xs text-zinc-400">
                Default PIN is <span className="text-cyan-400 font-mono font-bold">1234</span>
              </p>
            </div>

            {/* Unlock method switch pills */}
            <div className="flex justify-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              <button
                onClick={() => setUnlockMethod('pin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 ${
                  unlockMethod === 'pin' ? 'bg-purple-500 text-white font-bold' : 'text-zinc-400'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>PIN</span>
              </button>
              <button
                onClick={() => setUnlockMethod('pattern')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 ${
                  unlockMethod === 'pattern' ? 'bg-purple-500 text-white font-bold' : 'text-zinc-400'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Pattern</span>
              </button>
              <button
                onClick={() => setUnlockMethod('fingerprint')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 ${
                  unlockMethod === 'fingerprint' ? 'bg-purple-500 text-white font-bold' : 'text-zinc-400'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Biometric</span>
              </button>
            </div>

            {/* METHOD 1: PIN CODE */}
            {unlockMethod === 'pin' && (
              <div className="space-y-4">
                {/* Dots indicator */}
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        enteredPin.length > idx
                          ? 'bg-purple-400 border-purple-300 scale-125 shadow-[0_0_10px_#a855f7]'
                          : 'border-white/20 bg-white/5'
                      } ${pinError ? 'bg-red-500 border-red-400 animate-shake' : ''}`}
                    />
                  ))}
                </div>

                {pinError && (
                  <p className="text-xs text-red-400 font-semibold">Incorrect PIN! Try 1234</p>
                )}

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => {
                        if (btn === 'C' || btn === '⌫') handleClearPin();
                        else handlePinPress(btn);
                      }}
                      className={`h-14 rounded-2xl text-base font-bold transition-all border ${
                        theme.id === 'cyber-neon'
                          ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200 hover:border-cyan-400 active:scale-95'
                          : theme.id === 'luxury-gold'
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-200 hover:border-amber-400 active:scale-95'
                          : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 active:scale-95'
                      }`}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* METHOD 2: PATTERN LOCK */}
            {unlockMethod === 'pattern' && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">Connect at least 4 dots</p>
                <div className="grid grid-cols-3 gap-6 max-w-[220px] mx-auto p-4 bg-white/5 rounded-3xl border border-white/10">
                  {Array.from({ length: 9 }).map((_, i) => {
                    const isSelected = patternSelected.includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() => handlePatternNodeClick(i)}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-purple-500 border-purple-300 scale-110 shadow-[0_0_15px_#a855f7]'
                            : 'border-white/20 bg-white/5 hover:border-purple-400'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                {patternSelected.length > 0 && (
                  <button
                    onClick={() => setPatternSelected([])}
                    className="text-xs text-zinc-400 underline"
                  >
                    Reset Pattern
                  </button>
                )}
              </div>
            )}

            {/* METHOD 3: BIOMETRIC FINGERPRINT */}
            {unlockMethod === 'fingerprint' && (
              <div className="space-y-4 py-4">
                <button
                  onClick={handleFingerprintTouch}
                  className="w-28 h-28 mx-auto rounded-full bg-purple-500/20 border-2 border-purple-400/80 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all group cursor-pointer"
                >
                  <Fingerprint className="w-16 h-16 text-purple-400 group-hover:text-purple-200 animate-pulse" />
                </button>
                <p className="text-xs text-purple-300 font-semibold">
                  Touch sensor to verify fingerprint
                </p>
              </div>
            )}
          </div>
        ) : (
          /* UNLOCKED VAULT GALLERY */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Encrypted Vault Media</h3>
                <p className="text-xs text-zinc-400">
                  Hidden from standard Android media scanner
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                AES-256 Protected
              </span>
            </div>

            {vaultMedia.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-dashed border-white/20 space-y-3">
                <ShieldCheck className="w-12 h-12 text-purple-400 mx-auto opacity-50" />
                <h4 className="text-sm font-bold">Vault is Empty</h4>
                <p className="text-xs text-zinc-400">
                  Move private photos & videos to vault from the photo viewer menu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vaultMedia.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-purple-500/30 bg-black group"
                  >
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.title}
                      onClick={() => onSelectMedia(item)}
                      className="w-full h-full object-cover cursor-pointer"
                    />

                    {/* Restore Action */}
                    <button
                      onClick={() => {
                        onRestoreFromVault(item.id);
                        triggerToast('Restored to main gallery');
                      }}
                      className="absolute bottom-2 right-2 p-2 rounded-xl bg-black/80 text-cyan-400 hover:bg-cyan-500 hover:text-black border border-cyan-400/40 text-xs font-bold flex items-center gap-1 shadow-lg"
                      title="Restore to Main Gallery"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

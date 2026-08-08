// ============================================================================
// VAULT LOCK SCREEN COMPONENT
// Supports PIN (4-8 digits), Pattern (3x3 grid), Fingerprint placeholder,
// recovery question, full reset flow, and 5-attempt 30s lockout countdown.
// // TODO: Capacitor native swap point -> Swap with @capacitor-community/biometric-auth
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Fingerprint,
  Grid,
  KeyRound,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  X,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { AuthService } from '../services/auth';

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onToast: (msg: string) => void;
}

export const VaultLockScreen: React.FC<Props> = ({ isOpen, onSuccess, onCancel, onToast }) => {
  const [lockMode, setLockMode] = useState<'pin' | 'pattern'>('pin');
  const [pinInput, setPinInput] = useState('');
  const [patternSelected, setPatternSelected] = useState<number[]>([]);
  const [isDrawingPattern, setIsDrawingPattern] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Recovery Flow State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  // Check Lockout on Mount / Interval
  useEffect(() => {
    if (!isOpen) return;

    const checkLockout = () => {
      const status = AuthService.isLockedOut();
      if (status.locked) {
        setLockoutTimer(status.remainingSeconds);
        setErrorMessage(`Too many failed attempts. Try again in ${status.remainingSeconds}s.`);
      } else {
        setLockoutTimer(0);
        if (errorMessage?.includes('failed attempts')) {
          setErrorMessage(null);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [isOpen, errorMessage]);

  if (!isOpen) return null;

  // Keypad Digit Click
  const handleDigitClick = async (digit: string) => {
    if (lockoutTimer > 0) return;
    if (pinInput.length >= 8) return;

    const newPin = pinInput + digit;
    setPinInput(newPin);

    // Auto-verify if 4 digits or user taps submit
    if (newPin.length >= 4) {
      const res = await AuthService.verifyPin(newPin);
      if (res.success) {
        setPinInput('');
        setErrorMessage(null);
        onSuccess();
      } else {
        if (newPin.length >= 4 && !res.errorMsg?.includes('attempts remaining')) {
          // If fail after 4 digits, show error but don't reset until 8 digits or explicit error
        }
      }
    }
  };

  const handlePinSubmit = async () => {
    if (lockoutTimer > 0) return;
    const res = await AuthService.verifyPin(pinInput);
    if (res.success) {
      setPinInput('');
      setErrorMessage(null);
      onSuccess();
    } else {
      setPinInput('');
      setErrorMessage(res.errorMsg || 'Incorrect PIN');
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  // Pattern Dot Click / Drag
  const handlePatternDotClick = (index: number) => {
    if (lockoutTimer > 0) return;
    if (!patternSelected.includes(index)) {
      const newPattern = [...patternSelected, index];
      setPatternSelected(newPattern);
    }
  };

  const handlePatternComplete = async () => {
    if (patternSelected.length < 3) {
      setErrorMessage('Pattern must connect at least 3 dots');
      setPatternSelected([]);
      return;
    }

    const res = await AuthService.verifyPattern(patternSelected);
    if (res.success) {
      setPatternSelected([]);
      setErrorMessage(null);
      onSuccess();
    } else {
      setPatternSelected([]);
      setErrorMessage(res.errorMsg || 'Incorrect Pattern');
    }
  };

  // Fingerprint Biometric Trigger
  const handleFingerprintClick = async () => {
    const res = await AuthService.triggerBiometricAuth();
    onToast(res.message);
  };

  // Recovery Answer Submit
  const handleRecoverySubmit = async () => {
    const isCorrect = await AuthService.verifyRecoveryAnswer(recoveryAnswer);
    if (isCorrect) {
      AuthService.resetVaultSecurity();
      setShowForgotModal(false);
      setRecoveryAnswer('');
      setRecoveryError(null);
      onToast('Vault Security Reset! Default PIN is 1234.');
      onSuccess();
    } else {
      setRecoveryError('Incorrect answer to recovery question.');
    }
  };

  const handleFullReset = () => {
    if (window.confirm('Are you sure you want to reset Private Vault data and security?')) {
      AuthService.resetVaultSecurity();
      setShowForgotModal(false);
      onToast('Vault security reset to default (1234).');
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fade-in select-none">
      <div className="w-full max-w-sm bg-zinc-950 border border-cyan-500/30 rounded-3xl p-6 text-white space-y-5 shadow-2xl relative">
        {/* Close / Cancel Button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,243,255,0.2)]">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">Private Vault</h2>
          <p className="text-xs text-zinc-400">
            {lockoutTimer > 0 ? `Locked for ${lockoutTimer}s` : 'Enter PIN or Pattern to unlock'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex justify-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              setLockMode('pin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              lockMode === 'pin' ? 'bg-cyan-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            PIN Code
          </button>
          <button
            onClick={() => {
              setLockMode('pattern');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              lockMode === 'pattern' ? 'bg-cyan-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pattern Grid
          </button>
        </div>

        {/* Error message / Lockout Banner */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs text-center font-medium flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MODE 1: PIN KEYPAD */}
        {lockMode === 'pin' && (
          <div className="space-y-4">
            {/* PIN Dots Display */}
            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border border-cyan-400 transition-all ${
                    pinInput.length > idx ? 'bg-cyan-400 shadow-[0_0_10px_#00f0ff]' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigitClick(digit)}
                  disabled={lockoutTimer > 0}
                  className="h-12 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-cyan-400 hover:bg-cyan-950/40 active:scale-95 text-lg font-bold text-white transition-all flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={handleFingerprintClick}
                className="h-12 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-400 active:scale-95 text-purple-400 flex items-center justify-center"
                title="Fingerprint Unlock"
              >
                <Fingerprint className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDigitClick('0')}
                disabled={lockoutTimer > 0}
                className="h-12 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-cyan-400 hover:bg-cyan-950/40 active:scale-95 text-lg font-bold text-white transition-all flex items-center justify-center"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-12 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-red-400 active:scale-95 text-zinc-400 hover:text-red-400 flex items-center justify-center"
              >
                ⌫
              </button>
            </div>

            {pinInput.length >= 4 && (
              <button
                onClick={handlePinSubmit}
                className="w-full py-2.5 rounded-2xl bg-cyan-400 text-black font-extrabold text-xs hover:bg-cyan-300"
              >
                Unlock Vault
              </button>
            )}
          </div>
        )}

        {/* MODE 2: PATTERN GRID */}
        {lockMode === 'pattern' && (
          <div className="space-y-4 text-center">
            <div className="grid grid-cols-3 gap-4 w-48 mx-auto p-3 bg-zinc-900/60 rounded-3xl border border-white/10">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((dotIndex) => {
                const isSelected = patternSelected.includes(dotIndex);
                return (
                  <button
                    key={dotIndex}
                    onClick={() => handlePatternDotClick(dotIndex)}
                    disabled={lockoutTimer > 0}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-cyan-400 border-cyan-300 text-black shadow-[0_0_15px_#00f0ff] scale-110'
                        : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950 text-zinc-600'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-black' : 'bg-zinc-600'}`} />
                  </button>
                );
              })}
            </div>

            {patternSelected.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setPatternSelected([])}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-xs font-bold hover:bg-zinc-700"
                >
                  Clear
                </button>
                <button
                  onClick={handlePatternComplete}
                  className="flex-1 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300"
                >
                  Confirm Pattern
                </button>
              </div>
            )}
          </div>
        )}

        {/* Forgot PIN / Recovery link */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setShowForgotModal(true)}
            className="text-xs text-zinc-400 hover:text-cyan-400 underline font-medium"
          >
            Forgot PIN / Recovery Option?
          </button>
        </div>

        {/* FORGOT PIN MODAL */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-zinc-950 border border-cyan-500/40 rounded-3xl p-5 text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>Vault Recovery</span>
                </div>
                <button onClick={() => setShowForgotModal(false)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-zinc-300">Security Question:</p>
                <p className="text-xs font-bold text-cyan-300 bg-cyan-950/50 p-2.5 rounded-xl border border-cyan-500/20">
                  What is your favorite color?
                </p>
                <input
                  type="text"
                  placeholder="Enter answer (e.g., blue)..."
                  value={recoveryAnswer}
                  onChange={(e) => setRecoveryAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />

                {recoveryError && <p className="text-[10px] text-red-400 font-medium">{recoveryError}</p>}

                <button
                  onClick={handleRecoverySubmit}
                  className="w-full py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300"
                >
                  Submit Recovery Answer
                </button>
              </div>

              <div className="border-t border-white/10 pt-3 text-center">
                <button
                  onClick={handleFullReset}
                  className="text-[11px] text-red-400 hover:underline font-bold"
                >
                  Reset Security to Default (1234)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

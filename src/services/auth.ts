// ============================================================================
// AUTH SERVICE - CAPACITOR-READY ABSTRACTION LAYER
// Handles Private Vault PIN (4-8 digits), Pattern lock, SHA-256 hash security,
// recovery question, failed attempt lockouts, and Fingerprint placeholder.
// // TODO: Capacitor native swap point -> Swap with @capacitor-community/biometric-auth
// ============================================================================

import { StorageService, hashString } from './storage';

export interface VaultLockConfig {
  lockType: 'pin' | 'pattern' | 'none';
  pinHash: string | null;
  patternHash: string | null;
  recoveryQuestion: string;
  recoveryAnswerHash: string | null;
  failedAttempts: number;
  lockoutUntil: number | null; // timestamp
}

const DEFAULT_CONFIG: VaultLockConfig = {
  lockType: 'pin',
  pinHash: null, // Default initial setup required if null
  patternHash: null,
  recoveryQuestion: 'What is your favorite color?',
  recoveryAnswerHash: null,
  failedAttempts: 0,
  lockoutUntil: null,
};

export const AuthService = {
  getConfig(): VaultLockConfig {
    return StorageService.getItem<VaultLockConfig>('vault_lock_config', DEFAULT_CONFIG);
  },

  saveConfig(config: VaultLockConfig): void {
    StorageService.setItem('vault_lock_config', config);
  },

  // Check if temporary lockout is active (30 seconds after 5 failed attempts)
  isLockedOut(): { locked: boolean; remainingSeconds: number } {
    const config = this.getConfig();
    if (config.lockoutUntil && Date.now() < config.lockoutUntil) {
      const remaining = Math.ceil((config.lockoutUntil - Date.now()) / 1000);
      return { locked: true, remainingSeconds: remaining };
    }
    // Lockout expired, reset lockoutUntil if set
    if (config.lockoutUntil) {
      config.lockoutUntil = null;
      config.failedAttempts = 0;
      this.saveConfig(config);
    }
    return { locked: false, remainingSeconds: 0 };
  },

  // Set PIN (4 to 8 digits)
  async setPin(pin: string, recoveryAnswer: string): Promise<void> {
    if (pin.length < 4 || pin.length > 8) {
      throw new Error('PIN must be 4 to 8 digits');
    }
    const config = this.getConfig();
    config.pinHash = await hashString(pin);
    config.recoveryAnswerHash = await hashString(recoveryAnswer.toLowerCase().trim());
    config.lockType = 'pin';
    config.failedAttempts = 0;
    config.lockoutUntil = null;
    this.saveConfig(config);
  },

  // Set Pattern (Array of dot indices 0-8)
  async setPattern(pattern: number[], recoveryAnswer: string): Promise<void> {
    if (pattern.length < 3) {
      throw new Error('Pattern must connect at least 3 dots');
    }
    const config = this.getConfig();
    const patternStr = pattern.join('-');
    config.patternHash = await hashString(patternStr);
    config.recoveryAnswerHash = await hashString(recoveryAnswer.toLowerCase().trim());
    config.lockType = 'pattern';
    config.failedAttempts = 0;
    config.lockoutUntil = null;
    this.saveConfig(config);
  },

  // Verify PIN
  async verifyPin(pin: string): Promise<{ success: boolean; errorMsg?: string }> {
    const lockout = this.isLockedOut();
    if (lockout.locked) {
      return { success: false, errorMsg: `Too many failed attempts. Try again in ${lockout.remainingSeconds}s.` };
    }

    const config = this.getConfig();
    if (!config.pinHash) {
      // Default initial PIN demo fallback is "1234"
      if (pin === '1234') return { success: true };
    }

    const inputHash = await hashString(pin);
    const matches = config.pinHash ? inputHash === config.pinHash : pin === '1234';

    if (matches) {
      config.failedAttempts = 0;
      config.lockoutUntil = null;
      this.saveConfig(config);
      return { success: true };
    } else {
      config.failedAttempts += 1;
      if (config.failedAttempts >= 5) {
        config.lockoutUntil = Date.now() + 30000; // 30 seconds lockout
      }
      this.saveConfig(config);
      const remaining = 5 - config.failedAttempts;
      return {
        success: false,
        errorMsg:
          config.failedAttempts >= 5
            ? '5 failed attempts. Vault locked for 30 seconds.'
            : `Incorrect PIN. ${remaining} attempts remaining.`,
      };
    }
  },

  // Verify Pattern
  async verifyPattern(pattern: number[]): Promise<{ success: boolean; errorMsg?: string }> {
    const lockout = this.isLockedOut();
    if (lockout.locked) {
      return { success: false, errorMsg: `Too many failed attempts. Try again in ${lockout.remainingSeconds}s.` };
    }

    const config = this.getConfig();
    const patternStr = pattern.join('-');
    const inputHash = await hashString(patternStr);

    const matches = config.patternHash ? inputHash === config.patternHash : patternStr === '0-1-2-5';

    if (matches) {
      config.failedAttempts = 0;
      config.lockoutUntil = null;
      this.saveConfig(config);
      return { success: true };
    } else {
      config.failedAttempts += 1;
      if (config.failedAttempts >= 5) {
        config.lockoutUntil = Date.now() + 30000;
      }
      this.saveConfig(config);
      const remaining = 5 - config.failedAttempts;
      return {
        success: false,
        errorMsg:
          config.failedAttempts >= 5
            ? '5 failed attempts. Vault locked for 30 seconds.'
            : `Incorrect Pattern. ${remaining} attempts remaining.`,
      };
    }
  },

  // Recovery Answer flow
  async verifyRecoveryAnswer(answer: string): Promise<boolean> {
    const config = this.getConfig();
    if (!config.recoveryAnswerHash) {
      return answer.toLowerCase().trim() === 'blue';
    }
    const inputHash = await hashString(answer.toLowerCase().trim());
    return inputHash === config.recoveryAnswerHash;
  },

  // Reset PIN/Pattern via recovery answer or full reset
  resetVaultSecurity(): void {
    const config = this.getConfig();
    config.pinHash = null;
    config.patternHash = null;
    config.recoveryAnswerHash = null;
    config.failedAttempts = 0;
    config.lockoutUntil = null;
    this.saveConfig(config);
  },

  // Fingerprint Biometric Auth Placeholder
  // // TODO: Capacitor native swap point -> Swap with @capacitor-community/biometric-auth NativeBiometric.verifyIdentity()
  async triggerBiometricAuth(): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'Fingerprint available after installing the native Android app.',
    };
  },
};

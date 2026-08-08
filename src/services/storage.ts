// ============================================================================
// STORAGE SERVICE - CAPACITOR-READY ABSTRACTION LAYER
// Handles persistent key-value storage, IndexedDB media cache, and secure hashes.
// // TODO: Capacitor native swap point -> Swap with @capacitor/preferences or @capacitor/filesystem
// ============================================================================

const STORAGE_PREFIX = 'neogallery_';

// Simple SHA-256 hash using Web Crypto API or JS fallback for PIN/Pattern security
export async function hashString(input: string): Promise<string> {
  if (window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(input);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallthrough to simple hash if crypto fail
    }
  }
  // Simple fallback hash for older WebViews
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'fallback_hash_' + Math.abs(hash).toString(16);
}

export const StorageService = {
  // Sync LocalStorage wrappers
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (e) {
      console.warn('LocalStorage remove failed:', e);
    }
  },

  clearAllData(): void {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  },

  // Native FileSystem Storage Stats Mock
  // // TODO: Capacitor native swap point -> Swap with @capacitor/filesystem getStat()
  async getStorageStats(): Promise<{ usedMb: number; freeMb: number; totalMb: number }> {
    return {
      usedMb: 1420,
      freeMb: 24500,
      totalMb: 32000,
    };
  },
};

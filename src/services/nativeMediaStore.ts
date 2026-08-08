import { registerPlugin, Capacitor } from '@capacitor/core';

export interface NativeMediaItem {
  id: string;
  title: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl: string;
  date: string; // YYYY-MM-DD
  time?: string;
  timestamp: number;
  sizeMb: number;
  album: string; // Real bucket name e.g. "Camera", "WhatsApp Images", "Screenshots", "Downloads"
  mimeType: string;
  durationSec?: number;
  width?: number;
  height?: number;
}

export interface NativeAlbum {
  id: string;
  name: string;
  count: number;
  coverUri: string;
}

export interface NativeMediaStorePlugin {
  checkPermissions(): Promise<{ granted: boolean; permissionState?: string }>;
  requestPermissions(): Promise<{ granted: boolean; permissionState?: string }>;
  getAlbums(): Promise<{ albums: NativeAlbum[] }>;
  getMedia(options?: { bucketId?: string; offset?: number; limit?: number }): Promise<{ items: NativeMediaItem[] }>;
}

const NativeMediaStore = registerPlugin<NativeMediaStorePlugin>('MediaStorePlugin', {
  web: {
    checkPermissions: async () => ({ granted: true, permissionState: 'granted' }),
    requestPermissions: async () => ({ granted: true, permissionState: 'granted' }),
    getAlbums: async () => ({ albums: [] }),
    getMedia: async () => ({ items: [] }),
  },
});

export function formatMediaUrl(rawPath: string): string {
  if (!rawPath) return '';
  if (
    rawPath.startsWith('http://') ||
    rawPath.startsWith('https://') ||
    rawPath.startsWith('data:') ||
    rawPath.startsWith('blob:')
  ) {
    return rawPath;
  }
  if (Capacitor.isNativePlatform()) {
    return Capacitor.convertFileSrc(rawPath);
  }
  return rawPath;
}

export { NativeMediaStore };

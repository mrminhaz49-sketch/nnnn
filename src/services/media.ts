// ============================================================================
// MEDIA SERVICE - NATIVE MEDIASTORE & REAL DEVICE MEDIA ENGINE
// Queries Android MediaStore directly, handles runtime permissions, converts local
// thumbnails on disk via Capacitor, and merges persisted metadata seamlessly.
// ============================================================================

import { MediaItem, Album, MemoryCard } from '../types';
import { StorageService } from './storage';
import { NativeMediaStore, formatMediaUrl, NativeMediaItem } from './nativeMediaStore';
import { Capacitor } from '@capacitor/core';

export const MediaService = {
  // Explicit runtime permissions check and request
  async checkPermissions(): Promise<boolean> {
    try {
      const res = await NativeMediaStore.checkPermissions();
      return !!res.granted;
    } catch {
      return false;
    }
  },

  async requestPermissions(): Promise<boolean> {
    try {
      const res = await NativeMediaStore.requestPermissions();
      return !!res.granted;
    } catch {
      return false;
    }
  },

  // Retrieve all real media items from Android MediaStore
  async getAllMedia(): Promise<MediaItem[]> {
    const savedUserMetadata = StorageService.getItem<MediaItem[]>('custom_media_items', []);
    const metaMap = new Map<string, Partial<MediaItem>>();

    savedUserMetadata.forEach((meta) => {
      if (meta && meta.id) {
        metaMap.set(meta.id, meta);
        if (meta.url) metaMap.set(meta.url, meta);
      }
    });

    let scannedItems: MediaItem[] = [];

    if (Capacitor.isNativePlatform()) {
      try {
        const { items } = await NativeMediaStore.getMedia();
        scannedItems = items.map((raw) => this.mapNativeItemToMediaItem(raw, metaMap));
      } catch (err) {
        console.warn('Native MediaStore query failed:', err);
      }
    }

    // Merge vaulted and deleted items that were saved previously
    const vaultedOrDeleted = savedUserMetadata.filter((m) => m.inVault || m.isDeleted);
    const scannedIds = new Set(scannedItems.map((i) => i.id));

    vaultedOrDeleted.forEach((item) => {
      if (!scannedIds.has(item.id)) {
        scannedItems.push(item);
      }
    });

    return scannedItems;
  },

  mapNativeItemToMediaItem(raw: NativeMediaItem, metaMap: Map<string, Partial<MediaItem>>): MediaItem {
    const savedMeta = metaMap.get(raw.id) || metaMap.get(raw.url) || {};

    const formattedUrl = formatMediaUrl(raw.url);
    const formattedThumb = formatMediaUrl(raw.thumbnailUrl || raw.url);

    return {
      id: raw.id,
      title: raw.title || 'Untitled',
      type: raw.type,
      url: formattedUrl,
      thumbnailUrl: formattedThumb,
      date: raw.date || new Date().toISOString().split('T')[0],
      time: raw.time || '12:00',
      sizeMb: raw.sizeMb || 1.0,
      album: raw.album || (raw.type === 'video' ? 'Videos' : 'Camera'),
      mimeType: raw.mimeType || (raw.type === 'video' ? 'video/mp4' : 'image/jpeg'),
      durationSec: raw.durationSec,
      width: raw.width,
      height: raw.height,
      isFavorite: savedMeta.isFavorite ?? false,
      inVault: savedMeta.inVault ?? false,
      isDeleted: savedMeta.isDeleted ?? false,
      deletedAt: savedMeta.deletedAt,
      daysRemainingInBin: savedMeta.daysRemainingInBin,
      tags: savedMeta.tags || [],
    };
  },

  // Save lightweight media list metadata
  async saveMediaList(items: MediaItem[]): Promise<void> {
    const lightweightItems = items.map((item) => {
      // Omit heavy base64 strings if any exist
      let cleanUrl = item.url;
      let cleanThumb = item.thumbnailUrl;

      if (cleanUrl && cleanUrl.startsWith('data:image')) {
        cleanUrl = 'placeholder_data_url';
      }
      if (cleanThumb && cleanThumb.startsWith('data:image')) {
        cleanThumb = 'placeholder_data_url';
      }

      return {
        id: item.id,
        title: item.title,
        type: item.type,
        url: cleanUrl,
        thumbnailUrl: cleanThumb,
        date: item.date,
        time: item.time,
        sizeMb: item.sizeMb,
        album: item.album,
        mimeType: item.mimeType,
        durationSec: item.durationSec,
        width: item.width,
        height: item.height,
        isFavorite: item.isFavorite,
        inVault: item.inVault,
        isDeleted: item.isDeleted,
        deletedAt: item.deletedAt,
        daysRemainingInBin: item.daysRemainingInBin,
        tags: item.tags,
      };
    });

    StorageService.setItem('custom_media_items', lightweightItems);
  },

  // Get real album list grouped by actual folder buckets (Camera, Screenshots, WhatsApp, Downloads, etc.)
  async getAlbumsFromMedia(items: MediaItem[]): Promise<Album[]> {
    const albumMap = new Map<string, { count: number; coverUrl: string; items: MediaItem[] }>();

    const validItems = items.filter((item) => !item.inVault && !item.isDeleted);

    validItems.forEach((item) => {
      const folderName = item.album || (item.type === 'video' ? 'Videos' : 'Camera');

      if (!albumMap.has(folderName)) {
        albumMap.set(folderName, {
          count: 1,
          coverUrl: item.thumbnailUrl || item.url,
          items: [item],
        });
      } else {
        const current = albumMap.get(folderName)!;
        current.count++;
        current.items.push(item);
      }
    });

    const resultAlbums: Album[] = [];

    albumMap.forEach((data, folderName) => {
      let systemType: Album['systemType'] = 'custom';
      const lower = folderName.toLowerCase();

      if (lower.includes('camera')) systemType = 'camera';
      else if (lower.includes('screenshot')) systemType = 'screenshots';
      else if (lower.includes('download')) systemType = 'downloads';
      else if (lower.includes('whatsapp')) systemType = 'whatsapp';
      else if (lower.includes('video')) systemType = 'videos';

      resultAlbums.push({
        id: `alb-${folderName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: folderName,
        coverUrl: data.coverUrl,
        count: data.count,
        systemType,
      });
    });

    // Add Favorites album if items are favorited
    const favCount = validItems.filter((i) => i.isFavorite).length;
    if (favCount > 0) {
      const favCover = validItems.find((i) => i.isFavorite)?.thumbnailUrl || '';
      resultAlbums.unshift({
        id: 'alb-favorites',
        name: 'Favorites ❤️',
        coverUrl: favCover,
        count: favCount,
        systemType: 'favorites',
      });
    }

    return resultAlbums;
  },

  // Generate Memories dynamically from real device media
  generateDateBasedMemories(items: MediaItem[]): MemoryCard[] {
    const validItems = items.filter((m) => !m.inVault && !m.isDeleted);
    if (validItems.length === 0) return [];

    const memories: MemoryCard[] = [];

    // Group items by dates or photos
    const photos = validItems.filter((i) => i.type === 'photo');

    if (photos.length > 0) {
      memories.push({
        id: 'mem-today-1',
        title: 'Recent Memories',
        subtitle: 'Captured on your device',
        timeframe: 'on_this_day',
        dateString: photos[0].date || 'Recent',
        coverMediaId: photos[0].id,
        mediaIds: photos.slice(0, 6).map((p) => p.id),
        storyText: 'Your latest captured moments stored on your device.',
        mood: 'serene',
      });
    }

    if (validItems.length >= 4) {
      memories.push({
        id: 'mem-today-2',
        title: 'Gallery Highlights',
        subtitle: 'Your photo & video collection',
        timeframe: '1_year',
        dateString: 'Highlights',
        coverMediaId: validItems[1]?.id || validItems[0].id,
        mediaIds: validItems.slice(1, 7).map((i) => i.id),
        storyText: 'A glance at your photo collection.',
        mood: 'nostalgic',
      });
    }

    return memories;
  },

  // Basic search
  basicSearch(items: MediaItem[], query: string, type: 'all' | 'photo' | 'video'): MediaItem[] {
    const q = query.toLowerCase().trim();
    return items.filter((item) => {
      if (type !== 'all' && item.type !== type) return false;
      if (!q) return true;

      const matchName = item.title.toLowerCase().includes(q);
      const matchDate = item.date.toLowerCase().includes(q);
      const matchAlbum = (item.album || '').toLowerCase().includes(q);
      const matchTag = (item.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchName || matchDate || matchAlbum || matchTag;
    });
  },
};

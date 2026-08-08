/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MainTab, BottomNav } from './components/BottomNav';
import { AppHeader } from './components/AppHeader';
import { PhotoGrid } from './components/PhotoGrid';
import { PhotoViewer } from './components/PhotoViewer';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PhotoEditorModal } from './components/PhotoEditorModal';
import { PhotoCompressorModal } from './components/PhotoCompressorModal';
import { PrivateVaultModal } from './components/PrivateVaultModal';
import { SmartCleanerModal } from './components/SmartCleanerModal';
import { MemoriesView } from './components/MemoriesView';
import { AlbumsView } from './components/AlbumsView';
import { SearchView } from './components/SearchView';
import { RecycleBinModal } from './components/RecycleBinModal';
import { ThemeStoreModal } from './components/ThemeStoreModal';
import { SettingsView } from './components/SettingsView';
import { ThemeBackground } from './theme/ThemeBackground';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidToast } from './components/AndroidToast';

import { AdBanner } from './components/AdBanner';
import { AdInterstitial } from './components/AdInterstitial';
import { PremiumModal } from './components/PremiumModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsModal } from './components/TermsModal';
import { PermissionsModal } from './components/PermissionsModal';
import { PlayStoreAssetsModal } from './components/PlayStoreAssetsModal';
import { VaultLockScreen } from './components/VaultLockScreen';
import { BillingService } from './services/billing';
import { MediaService } from './services/media';

import { getThemeConfig } from './theme/themes';
import {
  INITIAL_MEDIA,
  INITIAL_ALBUMS,
  INITIAL_MEMORIES,
} from './data/sampleMedia';
import {
  MediaItem,
  Album,
  MemoryCard,
  VaultConfig,
  AppSettings,
  ThemeId,
  GridColumns,
} from './types';

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // App state with local persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('neo_gallery_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const validThemes: ThemeId[] = ['pure-black', 'obsidian-flow', 'aurora-dusk', 'midnight-luxe', 'stellar-mist'];
        if (!validThemes.includes(parsed.currentTheme)) {
          parsed.currentTheme = 'pure-black';
        }
        return parsed;
      }
    } catch {}
    return {
      currentTheme: 'pure-black',
      isPremium: false,
      performanceMode: false,
      adsEnabled: true,
      gridColumns: 3,
      autoLockVault: true,
      sortBy: 'date-desc',
    };
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('neo_gallery_media');
      if (saved && Array.isArray(JSON.parse(saved))) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEDIA;
  });

  const [albums, setAlbums] = useState<Album[]>(() => {
    try {
      const saved = localStorage.getItem('neo_gallery_albums');
      if (saved && Array.isArray(JSON.parse(saved))) return JSON.parse(saved);
    } catch {}
    return INITIAL_ALBUMS;
  });

  const [memories, setMemories] = useState<MemoryCard[]>(() => {
    try {
      const saved = localStorage.getItem('neo_gallery_memories');
      if (saved && Array.isArray(JSON.parse(saved))) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEMORIES;
  });

  const [vaultConfig, setVaultConfig] = useState<VaultConfig>(() => {
    try {
      const saved = localStorage.getItem('neo_gallery_vault_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      isLocked: true,
      unlockMethod: 'pin',
      pinCode: '1234',
      patternNodes: [0, 1, 2, 4],
      isFingerprintEnabled: true,
      failedAttempts: 0,
      lockUntil: null,
      isHiddenMode: false,
    };
  });

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<MainTab>('photos');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Modals
  const [viewingMedia, setViewingMedia] = useState<MediaItem | null>(null);
  const [playingVideoMedia, setPlayingVideoMedia] = useState<MediaItem | null>(null);
  const [editingPhotoMedia, setEditingPhotoMedia] = useState<MediaItem | null>(null);
  const [compressingMedia, setCompressingMedia] = useState<MediaItem | null>(null);

  const [showVault, setShowVault] = useState(false);
  const [showVaultLock, setShowVaultLock] = useState(false);
  const [showCleaner, setShowCleaner] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showThemeStore, setShowThemeStore] = useState(false);

  // New Compliance & Premium States
  const [showPremium, setShowPremium] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showPlayStoreAssets, setShowPlayStoreAssets] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);

  const [appToast, setAppToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAppToast(msg);
    setTimeout(() => setAppToast(null), 2500);
  };

  // Load Device Media & Request Permissions
  const loadDeviceMedia = async () => {
    let granted = await MediaService.checkPermissions();
    if (!granted) {
      granted = await MediaService.requestPermissions();
    }
    setHasPermission(granted);

    if (granted) {
      const items = await MediaService.getAllMedia();
      setMediaItems(items);

      const realAlbums = await MediaService.getAlbumsFromMedia(items);
      setAlbums(realAlbums);

      const realMemories = MediaService.generateDateBasedMemories(items);
      setMemories(realMemories);
    }
  };

  useEffect(() => {
    loadDeviceMedia();
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('neo_gallery_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    MediaService.saveMediaList(mediaItems);
  }, [mediaItems]);

  useEffect(() => {
    localStorage.setItem('neo_gallery_albums', JSON.stringify(albums));
  }, [albums]);

  useEffect(() => {
    localStorage.setItem('neo_gallery_vault_config', JSON.stringify(vaultConfig));
  }, [vaultConfig]);

  const activeTheme = useMemo(() => getThemeConfig(settings.currentTheme), [settings.currentTheme]);

  // Main filtered gallery photos (excluding vault items & deleted items)
  const visiblePhotos = useMemo(() => {
    return mediaItems.filter((item) => {
      if (item.inVault || item.isDeleted) return false;

      if (selectedAlbum) {
        if (selectedAlbum.systemType === 'favorites') return item.isFavorite;
        if (selectedAlbum.systemType === 'videos') return item.type === 'video';
        return item.album.toLowerCase() === selectedAlbum.name.toLowerCase();
      }

      return true;
    });
  }, [mediaItems, selectedAlbum]);

  const vaultMedia = useMemo(() => {
    return mediaItems.filter((m) => m.inVault && !m.isDeleted);
  }, [mediaItems]);

  const deletedMedia = useMemo(() => {
    return mediaItems.filter((m) => m.isDeleted);
  }, [mediaItems]);

  // Handlers
  const handleToggleFavorite = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const handleDeleteMedia = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isDeleted: true,
              deletedAt: new Date().toISOString().split('T')[0],
              daysRemainingInBin: 30,
            }
          : item
      )
    );
    if (viewingMedia?.id === id) setViewingMedia(null);
  };

  const handleBatchDeleteMedia = (ids: string[]) => {
    setMediaItems((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? {
              ...item,
              isDeleted: true,
              deletedAt: new Date().toISOString().split('T')[0],
              daysRemainingInBin: 30,
            }
          : item
      )
    );
  };

  const handleMoveToVault = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inVault: true } : item))
    );
    if (viewingMedia?.id === id) setViewingMedia(null);
  };

  const handleRestoreFromVault = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inVault: false } : item))
    );
  };

  const handleRestoreFromBin = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isDeleted: false } : item))
    );
  };

  const handlePermanentDelete = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEmptyBin = () => {
    setMediaItems((prev) => prev.filter((item) => !item.isDeleted));
  };

  const handleSaveCompressed = (originalId: string, compressedSizeMb: number) => {
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === originalId
          ? {
              ...item,
              originalSizeMb: item.sizeMb,
              sizeMb: compressedSizeMb,
              compressedSizeMb: compressedSizeMb,
            }
          : item
      )
    );
  };

  const handleSaveEditedPhoto = (editedMedia: MediaItem) => {
    setMediaItems((prev) => [editedMedia, ...prev]);
  };

  const handleCreateAlbum = (name: string) => {
    const newAlbum: Album = {
      id: `alb-custom-${Date.now()}`,
      name,
      coverUrl:
        mediaItems[0]?.thumbnailUrl ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      count: 0,
      systemType: 'custom',
    };
    setAlbums((prev) => [...prev, newAlbum]);
  };

  const handleDeleteAlbum = (id: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUnlockPremium = () => {
    setSettings((prev) => ({ ...prev, isPremium: true, adsEnabled: false }));
  };

  // Photo viewer prev / next navigation
  const currentIndexInGrid = viewingMedia
    ? visiblePhotos.findIndex((m) => m.id === viewingMedia.id)
    : -1;

  const handleViewerNext = () => {
    if (currentIndexInGrid >= 0 && currentIndexInGrid < visiblePhotos.length - 1) {
      setViewingMedia(visiblePhotos[currentIndexInGrid + 1]);
    }
  };

  const handleViewerPrev = () => {
    if (currentIndexInGrid > 0) {
      setViewingMedia(visiblePhotos[currentIndexInGrid - 1]);
    }
  };

  return (
    <div className={`min-h-screen relative font-sans ${activeTheme.bgClass} transition-colors duration-300 select-none`}>
      {/* Android Toast Notification */}
      <AndroidToast message={appToast} onClose={() => setAppToast(null)} />

      {/* Background visual graphics */}
      <ThemeBackground themeId={settings.currentTheme} performanceMode={settings.performanceMode} />

      {/* Main Header */}
      <AppHeader
        theme={activeTheme}
        gridColumns={settings.gridColumns}
        onChangeGridColumns={(cols) => setSettings((prev) => ({ ...prev, gridColumns: cols }))}
        onOpenSearch={() => setShowSearch(true)}
        onOpenThemeStore={() => setShowThemeStore(true)}
        onOpenRecycleBin={() => setShowRecycleBin(true)}
        isPremium={settings.isPremium}
        performanceMode={settings.performanceMode}
        onTogglePerformanceMode={() =>
          setSettings((prev) => ({ ...prev, performanceMode: !prev.performanceMode }))
        }
        deletedItemsCount={deletedMedia.length}
      />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-2 sm:px-4 pt-3">
        {/* Selected Album Filter Header Banner */}
          {selectedAlbum && activeTab === 'photos' && (
            <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400">Album:</span>
                <span className="text-sm font-bold text-white">{selectedAlbum.name}</span>
              </div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="text-xs text-zinc-400 hover:text-white underline"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* TAB 1: PHOTOS GRID */}
          {activeTab === 'photos' && (
            <PhotoGrid
              mediaItems={visiblePhotos}
              gridColumns={settings.gridColumns}
              theme={activeTheme}
              onSelectMedia={(item) => setViewingMedia(item)}
              selectedIds={[]}
              onToggleSelect={() => {}}
              isSelectionMode={false}
              hasPermission={hasPermission ?? true}
              onRequestPermission={loadDeviceMedia}
            />
          )}

          {/* TAB 2: ALBUMS */}
          {activeTab === 'albums' && (
            <AlbumsView
              albums={albums}
              mediaItems={mediaItems}
              theme={activeTheme}
              onSelectAlbum={(alb) => {
                setSelectedAlbum(alb);
                setActiveTab('photos');
              }}
              onCreateAlbum={handleCreateAlbum}
              onDeleteAlbum={handleDeleteAlbum}
              isPremium={settings.isPremium}
            />
          )}

          {/* TAB 3: MEMORIES */}
          {activeTab === 'memories' && (
            <MemoriesView
              memories={memories}
              mediaItems={mediaItems}
              theme={activeTheme}
              onOpenMedia={(item) => setViewingMedia(item)}
            />
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              mediaItems={mediaItems}
              theme={activeTheme}
              onOpenCleaner={() => setShowCleaner(true)}
              onOpenVault={() => setShowVaultLock(true)}
              onOpenRecycleBin={() => setShowRecycleBin(true)}
              onOpenThemeStore={() => setShowThemeStore(true)}
              onTogglePerformanceMode={() =>
                setSettings((prev) => ({ ...prev, performanceMode: !prev.performanceMode }))
              }
              onUnlockPremium={() => setShowPremium(true)}
              onOpenPrivacyPolicy={() => setShowPrivacyPolicy(true)}
              onOpenTerms={() => setShowTerms(true)}
              onOpenPermissions={() => setShowPermissions(true)}
              onOpenPlayStoreAssets={() => setShowPlayStoreAssets(true)}
            />
          )}
        </main>

        {/* AdBanner placed above Bottom Navigation */}
        <AdBanner />

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'photos') setSelectedAlbum(null);
          }}
          theme={activeTheme}
          onOpenVault={() => setShowVaultLock(true)}
          onOpenCleaner={() => setShowCleaner(true)}
        />

      {/* MODALS */}
      {/* 1. Fullscreen Photo Viewer */}
      {viewingMedia && (
        <PhotoViewer
          media={viewingMedia}
          onClose={() => setViewingMedia(null)}
          onNext={handleViewerNext}
          onPrev={handleViewerPrev}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDeleteMedia}
          onMoveToVault={handleMoveToVault}
          onOpenEditor={(media) => setEditingPhotoMedia(media)}
          onOpenCompressor={(media) => setCompressingMedia(media)}
          onOpenVideoPlayer={(media) => setPlayingVideoMedia(media)}
          theme={activeTheme}
        />
      )}

      {/* 2. Premium Video Player */}
      {playingVideoMedia && (
        <VideoPlayerModal
          media={playingVideoMedia}
          onClose={() => setPlayingVideoMedia(null)}
          theme={activeTheme}
        />
      )}

      {/* 3. Photo Editor */}
      {editingPhotoMedia && (
        <PhotoEditorModal
          media={editingPhotoMedia}
          onClose={() => setEditingPhotoMedia(null)}
          onSave={handleSaveEditedPhoto}
          theme={activeTheme}
        />
      )}

      {/* 4. Photo Compressor */}
      {compressingMedia && (
        <PhotoCompressorModal
          media={compressingMedia}
          onClose={() => setCompressingMedia(null)}
          onSaveCompressed={handleSaveCompressed}
          theme={activeTheme}
        />
      )}

      {/* Vault Lock Screen */}
      <VaultLockScreen
        isOpen={showVaultLock}
        onSuccess={() => {
          setShowVaultLock(false);
          setShowVault(true);
        }}
        onCancel={() => setShowVaultLock(false)}
        onToast={showToast}
      />

      {/* 5. Private Vault */}
      {showVault && (
        <PrivateVaultModal
          vaultConfig={vaultConfig}
          vaultMedia={vaultMedia}
          onUpdateVaultConfig={(cfg) => setVaultConfig(cfg)}
          onRestoreFromVault={handleRestoreFromVault}
          onClose={() => setShowVault(false)}
          theme={activeTheme}
          onSelectMedia={(item) => setViewingMedia(item)}
        />
      )}

      {/* 6. Smart Storage Cleaner */}
      {showCleaner && (
        <SmartCleanerModal
          mediaItems={mediaItems.filter((m) => !m.inVault && !m.isDeleted)}
          onDeleteMedia={handleDeleteMedia}
          onBatchDeleteMedia={handleBatchDeleteMedia}
          onClose={() => setShowCleaner(false)}
          theme={activeTheme}
        />
      )}

      {/* 7. Search */}
      {showSearch && (
        <SearchView
          mediaItems={mediaItems}
          theme={activeTheme}
          onSelectMedia={(item) => {
            setViewingMedia(item);
            setShowSearch(false);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* 8. Recycle Bin */}
      {showRecycleBin && (
        <RecycleBinModal
          deletedItems={deletedMedia}
          onRestore={handleRestoreFromBin}
          onPermanentDelete={handlePermanentDelete}
          onEmptyBin={handleEmptyBin}
          onClose={() => setShowRecycleBin(false)}
          theme={activeTheme}
        />
      )}

      {/* 9. Theme Store Engine */}
      {showThemeStore && (
        <ThemeStoreModal
          isOpen={showThemeStore}
          currentTheme={settings.currentTheme}
          onSelectTheme={(themeId: ThemeId) =>
            setSettings((prev) => ({ ...prev, currentTheme: themeId }))
          }
          isPremium={settings.isPremium}
          onUnlockPremium={() => setShowPremium(true)}
          onClose={() => setShowThemeStore(false)}
          performanceMode={settings.performanceMode}
          onTogglePerformanceMode={() =>
            setSettings((prev) => ({ ...prev, performanceMode: !prev.performanceMode }))
          }
        />
      )}

      {/* 10. Premium Pro Modal */}
      <PremiumModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        onStatusChanged={() => {
          const isPrem = BillingService.isPremium();
          setSettings((prev) => ({ ...prev, isPremium: isPrem, adsEnabled: !isPrem }));
          showToast(isPrem ? 'Upgraded to Neo Gallery Pro!' : 'Reverted to Free Tier');
        }}
      />

      {/* 11. Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />

      {/* 12. Terms & Conditions Modal */}
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />

      {/* 13. Permissions Disclosure Modal */}
      <PermissionsModal
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
        onRequestPermission={loadDeviceMedia}
      />

      {/* 14. Play Store Assets Modal */}
      <PlayStoreAssetsModal
        isOpen={showPlayStoreAssets}
        onClose={() => setShowPlayStoreAssets(false)}
        onToast={showToast}
      />

      {/* Interstitial Ad Slot */}
      <AdInterstitial
        isOpen={showInterstitial}
        onClose={() => setShowInterstitial(false)}
      />
    </div>
  );
}

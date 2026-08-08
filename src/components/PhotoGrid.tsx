import React, { useMemo } from 'react';
import { Play, Heart, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { MediaItem, GridColumns, ThemeConfig } from '../types';

interface Props {
  mediaItems: MediaItem[];
  gridColumns: GridColumns;
  theme: ThemeConfig;
  onSelectMedia: (item: MediaItem) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  isSelectionMode: boolean;
  hasPermission?: boolean;
  onRequestPermission?: () => void;
}

export const PhotoGrid: React.FC<Props> = ({
  mediaItems,
  gridColumns,
  theme,
  onSelectMedia,
  selectedIds,
  onToggleSelect,
  isSelectionMode,
  hasPermission = true,
  onRequestPermission,
}) => {
  // Group media items by date
  const groupedMedia = useMemo(() => {
    const groups: { dateLabel: string; items: MediaItem[] }[] = [];
    const map = new Map<string, MediaItem[]>();

    mediaItems.forEach((item) => {
      const dateKey = item.date || 'Unknown Date';
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(item);
    });

    // Sort dates descending
    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));

    sortedDates.forEach((dateKey) => {
      // Format pretty date string
      let dateLabel = dateKey;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (dateKey === today) dateLabel = 'Today';
      else if (dateKey === yesterday) dateLabel = 'Yesterday';
      else {
        try {
          const d = new Date(dateKey + 'T00:00:00');
          dateLabel = d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        } catch {
          dateLabel = dateKey;
        }
      }

      groups.push({
        dateLabel,
        items: map.get(dateKey)!,
      });
    });

    return groups;
  }, [mediaItems]);

  const gridClassMap: Record<GridColumns, string> = {
    2: 'grid-cols-2 gap-2 sm:gap-3',
    3: 'grid-cols-3 gap-1.5 sm:gap-2.5',
    4: 'grid-cols-4 gap-1 sm:gap-2',
    5: 'grid-cols-5 gap-1 sm:gap-1.5',
  };

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className={`text-base font-bold ${theme.textPrimaryClass}`}>Storage Permission Required</h3>
        <p className={`text-xs mt-1 max-w-sm ${theme.textSecondaryClass}`}>
          Grant access to your device's photos and videos to view your real media, albums, and memories in Neo Gallery.
        </p>
        {onRequestPermission && (
          <button
            onClick={onRequestPermission}
            className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Grant Storage Permission
          </button>
        )}
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
          <ShieldAlert className="w-8 h-8 opacity-40" />
        </div>
        <h3 className={`text-base font-semibold ${theme.textPrimaryClass}`}>No Media Found</h3>
        <p className={`text-xs mt-1 ${theme.textSecondaryClass}`}>
          Photos and videos stored on your device will appear here.
        </p>
        {onRequestPermission && (
          <button
            onClick={onRequestPermission}
            className="mt-4 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/15 cursor-pointer"
          >
            Scan Device Storage
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {groupedMedia.map((group) => (
        <div key={group.dateLabel} className="space-y-2">
          {/* Group Header with Cyan Divider Line from Design */}
          <div className="px-1 py-2 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              {group.dateLabel}
            </h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-cyan-900/60 to-transparent mx-3" />
            <span className="text-[10px] text-gray-500 font-mono">
              {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Grid Layout */}
          <div className={`grid ${gridClassMap[gridColumns]}`}>
            {group.items.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isSelectionMode) {
                      onToggleSelect(item.id);
                    } else {
                      onSelectMedia(item);
                    }
                  }}
                  className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 select-none ${
                    theme.cardClass
                  } ${
                    isSelected ? 'ring-2 ring-cyan-400 scale-[0.98]' : 'hover:scale-[1.01]'
                  }`}
                >
                  {/* Image Thumbnail */}
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Video Indicator */}
                  {item.type === 'video' && (
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-medium text-white">
                      <Play className="w-2.5 h-2.5 fill-white" />
                      <span>
                        {item.durationSec
                          ? `${Math.floor(item.durationSec / 60)}:${(item.durationSec % 60)
                              .toString()
                              .padStart(2, '0')}`
                          : 'Video'}
                      </span>
                    </div>
                  )}

                  {/* Favorite Badge */}
                  {item.isFavorite && (
                    <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md">
                      <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                    </div>
                  )}

                  {/* Selection Checkbox */}
                  {isSelectionMode && (
                    <div className="absolute top-1.5 left-1.5">
                      <CheckCircle2
                        className={`w-5 h-5 transition-transform ${
                          isSelected ? 'text-cyan-400 fill-cyan-400 scale-110' : 'text-white/60'
                        }`}
                      />
                    </div>
                  )}

                  {/* Title overlay on hover / 2-col view */}
                  {gridColumns <= 3 && (
                    <div className="absolute bottom-1 right-1.5 left-1.5 text-[9px] font-medium text-white/90 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

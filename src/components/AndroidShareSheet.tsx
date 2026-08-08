import React from 'react';
import { X, Share2, Copy, Send, Download, QrCode, Smartphone, Sparkles, Check } from 'lucide-react';
import { MediaItem } from '../types';

interface Props {
  media: MediaItem | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const AndroidShareSheet: React.FC<Props> = ({ media, onClose, onToast }) => {
  if (!media) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(media.url);
    onToast('Link copied to Android Clipboard');
    onClose();
  };

  const handleQuickShare = (targetName: string) => {
    onToast(`Shared via Android Quick Share to ${targetName}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-950 border-t border-cyan-500/30 rounded-t-3xl p-5 text-white space-y-4 shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto -mt-1 mb-2" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Android Quick Share</h3>
              <p className="text-[10px] text-zinc-400 font-mono">Nearby Devices & Apps</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Preview item */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
          <img
            src={media.thumbnailUrl || media.url}
            alt={media.title}
            className="w-12 h-12 object-cover rounded-xl"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{media.title}</h4>
            <p className="text-[10px] font-mono text-cyan-400">{media.sizeMb} MB • {media.mimeType || 'image/jpeg'}</p>
          </div>
        </div>

        {/* Nearby Android Targets */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
            Nearby Devices (Android Quick Share)
          </span>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {[
              { name: 'Galaxy S25 Ultra', icon: '📱' },
              { name: 'Pixel 9 Pro', icon: '📱' },
              { name: 'Android Tablet', icon: '💻' },
              { name: 'Android TV', icon: '📺' },
            ].map((dev) => (
              <button
                key={dev.name}
                onClick={() => handleQuickShare(dev.name)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-cyan-400 hover:bg-cyan-950/40 min-w-[90px] transition-all group shrink-0"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{dev.icon}</span>
                <span className="text-[10px] font-medium text-zinc-300 text-center truncate max-w-[80px]">
                  {dev.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={handleCopyLink}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-1 text-xs font-bold hover:border-cyan-400 hover:text-cyan-300"
          >
            <Copy className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px]">Copy Link</span>
          </button>
          <button
            onClick={() => handleQuickShare('WhatsApp')}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-1 text-xs font-bold hover:border-emerald-400 hover:text-emerald-300"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px]">WhatsApp</span>
          </button>
          <button
            onClick={() => {
              onToast('Downloaded to Android Local Gallery');
              onClose();
            }}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-1 text-xs font-bold hover:border-blue-400 hover:text-blue-300"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span className="text-[10px]">Save File</span>
          </button>
        </div>
      </div>
    </div>
  );
};

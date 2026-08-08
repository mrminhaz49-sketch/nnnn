import React from 'react';
import {
  Settings as SettingsIcon,
  HardDrive,
  Wand2,
  ShieldCheck,
  Trash2,
  Palette,
  Info,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  PieChart,
} from 'lucide-react';
import { MediaItem, AppSettings, ThemeConfig } from '../types';

interface Props {
  settings: AppSettings;
  mediaItems: MediaItem[];
  theme: ThemeConfig;
  onOpenCleaner: () => void;
  onOpenVault: () => void;
  onOpenRecycleBin: () => void;
  onOpenThemeStore: () => void;
  onTogglePerformanceMode: () => void;
  onUnlockPremium: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenTerms: () => void;
  onOpenPermissions: () => void;
  onOpenPlayStoreAssets: () => void;
}

export const SettingsView: React.FC<Props> = ({
  settings,
  mediaItems,
  theme,
  onOpenCleaner,
  onOpenVault,
  onOpenRecycleBin,
  onOpenThemeStore,
  onTogglePerformanceMode,
  onUnlockPremium,
  onOpenPrivacyPolicy,
  onOpenTerms,
  onOpenPermissions,
  onOpenPlayStoreAssets,
}) => {
  // Compute storage statistics
  const totalPhotosMb = mediaItems
    .filter((m) => m.type === 'photo' && !m.inVault && !m.isDeleted)
    .reduce((acc, curr) => acc + curr.sizeMb, 0);

  const totalVideosMb = mediaItems
    .filter((m) => m.type === 'video' && !m.inVault && !m.isDeleted)
    .reduce((acc, curr) => acc + curr.sizeMb, 0);

  const totalUsedMb = totalPhotosMb + totalVideosMb + 1400; // includes system app data
  const deviceTotalGb = 128;
  const usedGb = Number((totalUsedMb / 1024).toFixed(1));
  const freeGb = Number((deviceTotalGb - usedGb).toFixed(1));
  const usedPercent = Math.min(100, Math.round((usedGb / deviceTotalGb) * 100));

  return (
    <div className="space-y-6 pb-28 px-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="pt-2">
        <h2 className={`text-xl font-extrabold flex items-center gap-2 ${theme.textPrimaryClass}`}>
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <span>Gallery Settings</span>
        </h2>
        <p className={`text-xs ${theme.textSecondaryClass}`}>
          Configure themes, security, storage analyzer, and performance
        </p>
      </div>

      {/* STORAGE ANALYZER DASHBOARD */}
      <div className={`p-5 rounded-3xl border space-y-4 ${theme.cardClass}`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Storage Analyzer</h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                {usedGb} GB Used of {deviceTotalGb} GB Total
              </p>
            </div>
          </div>

          <span className="text-xs font-bold font-mono text-cyan-300">
            {freeGb} GB Free
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
            <div
              className="bg-cyan-400 h-full"
              style={{ width: `${(totalPhotosMb / 1024 / deviceTotalGb) * 100 + 10}%` }}
              title="Photos"
            />
            <div
              className="bg-purple-500 h-full"
              style={{ width: `${(totalVideosMb / 1024 / deviceTotalGb) * 100}%` }}
              title="Videos"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Photos (
              {(totalPhotosMb / 1024).toFixed(1)} GB)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Videos (
              {(totalVideosMb / 1024).toFixed(1)} GB)
            </span>
          </div>
        </div>

        {/* Action Button to Cleaner */}
        <button
          onClick={onOpenCleaner}
          className="w-full py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-all"
        >
          <Wand2 className="w-4 h-4 animate-pulse" />
          <span>Open Smart Storage Cleaner</span>
        </button>
      </div>

      {/* QUICK TOOLS LIST */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Security & Organization
        </h4>

        <div className={`rounded-3xl border divide-y divide-white/10 overflow-hidden ${theme.cardClass}`}>
          {/* Vault */}
          <button
            onClick={onOpenVault}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Private Vault 🔒</h4>
                <p className="text-[10px] text-zinc-400">
                  PIN, Pattern & Biometric Encrypted Protection
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Theme Store */}
          <button
            type="button"
            onClick={onOpenThemeStore}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 active:bg-white/10 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Themes & Visual Engine</h4>
                <p className="text-[10px] text-zinc-400">
                  Active: <span className="font-bold text-cyan-300">{theme.name}</span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Recycle Bin */}
          <button
            onClick={onOpenRecycleBin}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Recycle Bin</h4>
                <p className="text-[10px] text-zinc-400">30-day automatic deletion safety</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* PLAY STORE COMPLIANCE & LEGAL SECTION */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Play Store Compliance & Legal
        </h4>

        <div className={`rounded-3xl border divide-y divide-white/10 overflow-hidden ${theme.cardClass}`}>
          {/* Privacy Policy */}
          <button
            onClick={onOpenPrivacyPolicy}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Privacy Policy</h4>
                <p className="text-[10px] text-zinc-400">In-app privacy disclosures & data rights</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Terms & Conditions */}
          <button
            onClick={onOpenTerms}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Terms & Conditions</h4>
                <p className="text-[10px] text-zinc-400">Usage agreement & Play refund rules</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>

          {/* Permissions Disclosure */}
          <button
            onClick={onOpenPermissions}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Permissions Disclosure</h4>
                <p className="text-[10px] text-zinc-400">Plain-language Android permission usage</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* AD STATUS BANNER */}
      {!settings.isPremium ? (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-amber-400">Ad Status: Non-intrusive Ads active</span>
            <p className="text-[10px] text-zinc-500">
              Upgrade to Pro to remove all advertisements.
            </p>
          </div>
          <button
            onClick={onUnlockPremium}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-[11px]"
          >
            Remove Ads
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Pro Active: 100% Ad-Free Experience</span>
        </div>
      )}

      {/* ABOUT NEO GALLERY */}
      <div className="p-4 rounded-3xl bg-zinc-950/80 border border-cyan-500/20 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
          <span>🤖 Android 15 (API level 35)</span>
          <span>•</span>
          <span>Material You Compatible</span>
        </div>
        <h3 className="text-xs font-bold text-white">Neo Gallery for Android v2.5 Pro</h3>
        <p className="text-[10px] text-zinc-400">Optimized for Android Phones, Foldables & Tablets</p>
        <p className="text-[9px] text-zinc-500 font-mono pt-1">
          Package: com.neogallery.app • Quick Share Enabled
        </p>
      </div>
    </div>
  );
};

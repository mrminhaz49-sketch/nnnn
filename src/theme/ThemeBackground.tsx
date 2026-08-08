import React from 'react';
import { ThemeId } from '../types';

interface Props {
  themeId: ThemeId;
  performanceMode?: boolean;
}

export const ThemeBackground: React.FC<Props> = ({ themeId, performanceMode }) => {
  /* 1. PURE BLACK (FREE) */
  if (themeId === 'pure-black') {
    return <div className="fixed inset-0 bg-black pointer-events-none -z-10" />;
  }

  /* 2. OBSIDIAN FLOW (PREMIUM) */
  if (themeId === 'obsidian-flow') {
    return (
      <div className="fixed inset-0 bg-[#07080a] overflow-hidden pointer-events-none -z-10">
        {!performanceMode ? (
          <>
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-900/20 blur-[130px] animate-[floatUpSlow_12s_infinite_ease-in-out]" />
            <div className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] rounded-full bg-slate-800/30 blur-[140px] animate-[floatDownSlow_14s_infinite_ease-in-out_2s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-950/20 blur-[110px] animate-[pulseGlow_8s_infinite_ease-in-out]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,243,255,0.04),transparent_70%)]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,243,255,0.05),transparent_60%)]" />
        )}
      </div>
    );
  }

  /* 3. AURORA DUSK (PREMIUM) */
  if (themeId === 'aurora-dusk') {
    return (
      <div className="fixed inset-0 bg-[#060a12] overflow-hidden pointer-events-none -z-10">
        {!performanceMode ? (
          <>
            <div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-teal-900/25 rounded-full blur-[150px] animate-[floatUpSlow_14s_infinite_ease-in-out]" />
            <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-cyan-950/30 rounded-full blur-[140px] animate-[floatDownSlow_16s_infinite_ease-in-out_3s]" />
            <div className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] bg-emerald-950/20 rounded-full blur-[160px] animate-[pulseGlow_12s_infinite_ease-in-out]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.05),transparent_70%)]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.05),transparent_60%)]" />
        )}
      </div>
    );
  }

  /* 4. MIDNIGHT LUXE (PREMIUM) */
  if (themeId === 'midnight-luxe') {
    return (
      <div className="fixed inset-0 bg-[#080708] overflow-hidden pointer-events-none -z-10">
        {!performanceMode ? (
          <>
            <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-amber-950/20 rounded-full blur-[140px] animate-[floatUpSlow_15s_infinite_ease-in-out]" />
            <div className="absolute bottom-0 left-5 w-[650px] h-[650px] bg-stone-900/40 rounded-full blur-[150px] animate-[floatDownSlow_17s_infinite_ease-in-out_4s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] animate-[pulseGlow_10s_infinite_ease-in-out]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04),transparent_60%)]" />
        )}
      </div>
    );
  }

  /* 5. STELLAR MIST (PREMIUM) */
  if (themeId === 'stellar-mist') {
    return (
      <div className="fixed inset-0 bg-[#070612] overflow-hidden pointer-events-none -z-10">
        {!performanceMode ? (
          <>
            <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-purple-950/25 rounded-full blur-[150px] animate-[floatUpSlow_13s_infinite_ease-in-out]" />
            <div className="absolute bottom-0 left-0 w-[650px] h-[650px] bg-indigo-950/25 rounded-full blur-[150px] animate-[floatDownSlow_15s_infinite_ease-in-out_3s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-violet-950/20 rounded-full blur-[140px] animate-[pulseGlow_9s_infinite_ease-in-out]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.05),transparent_60%)]" />
        )}
      </div>
    );
  }

  return <div className="fixed inset-0 bg-black pointer-events-none -z-10" />;
};

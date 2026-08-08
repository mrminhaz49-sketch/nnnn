import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glow?: boolean;
}

export const AppIcon: React.FC<Props> = ({ size = 'md', className = '', glow = true }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  };

  const svgSizes = {
    sm: 18,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const s = svgSizes[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 bg-gradient-to-br from-[#0e1628] via-[#080d19] to-[#03050a] border border-cyan-500/30 overflow-hidden shadow-lg ${
        sizeClasses[size]
      } ${glow ? 'shadow-[0_0_15px_rgba(0,240,255,0.25)]' : ''} ${className}`}
    >
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,240,255,0.25),transparent_70%)]" />

      {/* Camera lens aperture + N-shaped geometric symbol SVG */}
      <svg
        width={s}
        height={s}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,240,255,0.5)]"
      >
        {/* Outer Lens Ring */}
        <circle cx="16" cy="16" r="13" stroke="url(#cyanGlow)" strokeWidth="1.5" strokeDasharray="60 10" />

        {/* Aperture Blades forming 'N' Negative Space */}
        {/* Left diagonal leg of 'N' */}
        <path d="M10 22V10L17 22V10" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Right leg of 'N' with futuristic aperture blade extension */}
        <path d="M17 22L22 10V22" stroke="url(#fuchsiaGlow)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Aperture Iris Center Optical Dot */}
        <circle cx="16" cy="16" r="2.5" fill="#00F0FF" className="animate-pulse" />

        <defs>
          <linearGradient id="cyanGlow" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00F0FF" />
            <stop offset="0.5" stopColor="#A855F7" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="fuchsiaGlow" x1="17" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E086FF" />
            <stop offset="1" stopColor="#00F0FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

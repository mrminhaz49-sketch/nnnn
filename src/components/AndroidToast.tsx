import React from 'react';
import { CheckCircle2, Sparkles, Smartphone } from 'lucide-react';

interface Props {
  message: string | null;
  onClose: () => void;
}

export const AndroidToast: React.FC<Props> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="px-4 py-2.5 rounded-full bg-zinc-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-medium shadow-[0_0_20px_rgba(0,243,255,0.2)] backdrop-blur-xl flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
        <span>{message}</span>
      </div>
    </div>
  );
};

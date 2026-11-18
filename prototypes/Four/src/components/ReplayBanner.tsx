import type { MapPower } from '../appTypes';
import { Crosshair, Film } from 'lucide-react';

interface ReplayBannerProps {
  isReplaying: boolean;
  stopHighlightReplay: () => void;
  replayHudText: string;
  powerHint: string | null;
  selectedPower: MapPower | null;
}

/** Replay Banner or Power Deployment Toast */
export function ReplayBanner({
  isReplaying,
  stopHighlightReplay,
  replayHudText,
  powerHint,
  selectedPower,
}: ReplayBannerProps) {
  return isReplaying ? (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30">
      <button
        onClick={stopHighlightReplay}
        className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 hover:bg-amber-400"
      >
        <Film size={14} />
        <span>HIGHLIGHT {replayHudText} · Clic para saltar</span>
      </button>
    </div>
  ) : powerHint || selectedPower ? (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div
        className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide shadow-2xl backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap ${
          powerHint
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60'
            : 'bg-cyan-950/90 text-cyan-300 border-cyan-400/80 animate-pulse'
        }`}
      >
        <Crosshair size={13} />
        <span>{powerHint || `CLIC EN PISTA PARA DESPLEGAR [${selectedPower?.toUpperCase()}] · [Esc] cancelar`}</span>
      </div>
    </div>
  ) : null;
}

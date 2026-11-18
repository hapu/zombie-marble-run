import { WEAPON_SPECS } from '../constants';
import { Marble } from '../types';
import { ChevronLeft, ChevronRight, ShieldCheck, Skull } from 'lucide-react';

interface TopHudProps {
  hudTime: string;
  livingHumansCount: number;
  extractedHumansCount: number;
  activeZombiesCount: number;
  hudLeaderColor: string;
  hudLeader: string;
  hudProgress: number;
  followedMarble: Marble | null;
  cycleFollowMarble: (delta: number) => void;
}

/** Top-Left HUD: Telemetry + Followed Marble Indicator */
export function TopHud({
  hudTime,
  livingHumansCount,
  extractedHumansCount,
  activeZombiesCount,
  hudLeaderColor,
  hudLeader,
  hudProgress,
  followedMarble,
  cycleFollowMarble,
}: TopHudProps) {
  return (
    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 max-w-[calc(100%-360px)]">
      <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg text-xs whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">Tiempo</span>
          <span className="font-mono text-xs font-bold text-white tabular-nums">{hudTime}</span>
        </div>

        <div className="w-[1px] h-6 bg-slate-700/60" />

        <div className="flex flex-col">
          <span className="text-[9px] font-semibold tracking-wider text-cyan-400 uppercase flex items-center gap-1">
            <ShieldCheck size={10} />
            <span>Humanos</span>
          </span>
          <span className="font-mono text-xs font-bold text-cyan-300 tabular-nums">
            {livingHumansCount} vivos{extractedHumansCount > 0 ? ` · ${extractedHumansCount} salv.` : ''}
          </span>
        </div>

        <div className="w-[1px] h-6 bg-slate-700/60" />

        <div className="flex flex-col">
          <span className="text-[9px] font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1">
            <Skull size={10} />
            <span>Horda</span>
          </span>
          <span className="font-mono text-xs font-bold text-emerald-300 tabular-nums">{activeZombiesCount}</span>
        </div>

        <div className="hidden sm:block w-[1px] h-6 bg-slate-700/60" />

        <div className="hidden sm:flex flex-col">
          <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">Líder</span>
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: hudLeaderColor }} />
            <span className="text-white max-w-[90px] truncate">{hudLeader}</span>
            <span className="font-mono text-amber-400">{hudProgress}%</span>
          </div>
        </div>
      </div>

      {/* Tap-to-Follow / Cycle Marble Indicator Pill */}
      {followedMarble && (
        <div className="inline-flex self-start items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-700/80 shadow-md text-[11px] whitespace-nowrap">
          <button
            onClick={() => cycleFollowMarble(-1)}
            className="p-0.5 rounded hover:bg-slate-800 text-slate-300"
            title="Canica anterior [Tecla ]"
          >
            <ChevronLeft size={14} />
          </button>
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: followedMarble.isZombie ? '#22c55e' : followedMarble.color }}
          />
          <span className="font-bold text-white max-w-[110px] truncate">{followedMarble.name}</span>
          {followedMarble.isZombie ? (
            <span className="font-mono text-[10px] text-lime-400">☣ Zombi</span>
          ) : followedMarble.isExtracted ? (
            <span className="font-mono text-[10px] text-amber-400">🛡️ Salvado</span>
          ) : (
            <>
              <span className="font-mono text-[10px] text-cyan-300">{followedMarble.hp}/5 HP</span>
              <span className="font-mono text-[10px] text-amber-300">
                {(WEAPON_SPECS[followedMarble.weaponType || 'blaster'] || WEAPON_SPECS.blaster).icon}
              </span>
            </>
          )}
          <button
            onClick={() => cycleFollowMarble(1)}
            className="p-0.5 rounded hover:bg-slate-800 text-slate-300"
            title="Siguiente canica [Tecla ]]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

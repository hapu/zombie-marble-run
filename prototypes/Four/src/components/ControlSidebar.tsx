import { DEFAULT_MARBLE_COLORS } from '../constants';
import { Marble } from '../types';
import { Leaderboard } from './Leaderboard';
import { MarbleSelector } from './MarbleSelector';
import { Calendar, CheckCircle2, Link2, RotateCcw, Shuffle, Skull } from 'lucide-react';
import React from 'react';

interface ControlSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  startRace: (newSeed?: string, pzOverride?: number) => void;
  patientZeroCount: number;
  setPatientZeroCount: React.Dispatch<React.SetStateAction<number>>;
  seed: string;
  setSeed: React.Dispatch<React.SetStateAction<string>>;
  handleRandomizeSeed: () => void;
  handleDailySeed: () => void;
  handleCopySeedLink: () => Promise<void>;
  selectedIds: string[];
  customNames: Record<string, string>;
  handleToggleSelect: (id: string) => void;
  handleNameChange: (id: string, newName: string) => void;
  handleSelectAll: () => void;
  handleResetNames: () => void;
  standings: Marble[];
  followedMarbleId: string | null;
  selectFollowMarble: (id: string | null, switchCam?: boolean) => void;
  activeChunkCount: number;
}

/** Right Control Sidebar */
export function ControlSidebar({
  sidebarOpen,
  setSidebarOpen,
  startRace,
  patientZeroCount,
  setPatientZeroCount,
  seed,
  setSeed,
  handleRandomizeSeed,
  handleDailySeed,
  handleCopySeedLink,
  selectedIds,
  customNames,
  handleToggleSelect,
  handleNameChange,
  handleSelectAll,
  handleResetNames,
  standings,
  followedMarbleId,
  selectFollowMarble,
  activeChunkCount,
}: ControlSidebarProps) {
  return (
    <aside
      className={`fixed md:static right-0 top-0 h-full w-84 bg-slate-900/95 md:bg-slate-900 border-l border-slate-800 flex flex-col z-30 transition-transform duration-300 backdrop-blur-md ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
            <span>ZOMBIE RUN</span>
            <span className="text-emerald-400 text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              LABYRINTH
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Laberinto 5×5 de Salas Cuadradas</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Start / Restart */}
        <button
          onClick={() => startRace()}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
        >
          <RotateCcw size={16} />
          <span>Iniciar Supervivencia</span>
        </button>

        {/* Patient Zero selector */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1 text-emerald-400">
              <Skull size={12} />
              <span>Pacientes Cero</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              {patientZeroCount} {patientZeroCount === 1 ? 'Zombi' : 'Zombis'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setPatientZeroCount(num);
                  startRace(undefined, num);
                }}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                  patientZeroCount === num
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {num} {num === 1 ? 'Zombi' : 'Zombis'}
              </button>
            ))}
          </div>
        </div>

        {/* Seed Input + Random + Daily + Copy Link */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-[10px] uppercase tracking-wider">Semilla Determinista</span>
            <span className="text-[10px] text-slate-500 font-mono">#URL Sync</span>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startRace()}
              placeholder="Semilla..."
              maxLength={20}
              className="flex-1 min-w-0 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleRandomizeSeed}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1 transition-colors shrink-0"
              title="Semilla aleatoria"
            >
              <Shuffle size={13} className="text-amber-400" />
              <span>Azar</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleDailySeed}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Cargar el laberinto oficial de hoy"
            >
              <Calendar size={12} className="text-cyan-400" />
              <span>Hoy</span>
            </button>
            <button
              onClick={handleCopySeedLink}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Copiar enlace compartible con esta semilla"
            >
              <Link2 size={12} className="text-emerald-400" />
              <span>Copiar</span>
            </button>
          </div>
        </div>

        <MarbleSelector
          colors={DEFAULT_MARBLE_COLORS}
          selectedIds={selectedIds}
          customNames={customNames}
          onToggleSelect={handleToggleSelect}
          onNameChange={handleNameChange}
          onSelectAll={handleSelectAll}
          onResetNames={handleResetNames}
        />

        <Leaderboard
          standings={standings}
          followedMarbleId={followedMarbleId}
          onFollowMarble={(id) => selectFollowMarble(id, true)}
        />
      </div>

      <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={12} className="text-emerald-400" />
          <span>Rapier2D CCD · {activeChunkCount}/25</span>
        </span>
        <span className="font-mono text-emerald-400">5×5 Laberinto</span>
      </div>
    </aside>
  );
}

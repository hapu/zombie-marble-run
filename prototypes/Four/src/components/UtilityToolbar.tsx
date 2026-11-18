import type { CameraMode } from '../appTypes';
import { SIMULATION_SPEEDS } from '../constants';
import { Bug, Camera, Map as MapIcon, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import React from 'react';

interface UtilityToolbarProps {
  handleToggleSound: () => void;
  soundEnabled: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  isPaused: boolean;
  setSimSpeed: React.Dispatch<React.SetStateAction<number>>;
  simSpeed: number;
  cameraMode: CameraMode;
  setCameraMode: React.Dispatch<React.SetStateAction<CameraMode>>;
  setShowLabyrinthMap: React.Dispatch<React.SetStateAction<boolean>>;
  showLabyrinthMap: boolean;
  setShowDebugHud: React.Dispatch<React.SetStateAction<boolean>>;
  showDebugHud: boolean;
  handleToggleFullscreen: () => void;
  isFullscreen: boolean;
}

/** Top-Right Utility Toolbar */
export function UtilityToolbar({
  handleToggleSound,
  soundEnabled,
  setIsPaused,
  isPaused,
  setSimSpeed,
  simSpeed,
  cameraMode,
  setCameraMode,
  setShowLabyrinthMap,
  showLabyrinthMap,
  setShowDebugHud,
  showDebugHud,
  handleToggleFullscreen,
  isFullscreen,
}: UtilityToolbarProps) {
  return (
    <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg z-10">
      <button
        onClick={handleToggleSound}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
      >
        {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="text-red-400" />}
      </button>

      <button
        onClick={() => setIsPaused(!isPaused)}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Pausar / Reanudar [Espacio]"
      >
        {isPaused ? <Play size={15} className="text-emerald-400" /> : <Pause size={15} />}
      </button>

      <div className="w-[1px] h-5 bg-slate-700/60" />

      {SIMULATION_SPEEDS.map((spd) => (
        <button
          key={spd}
          onClick={() => setSimSpeed(spd)}
          className={`px-1.5 py-1 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap ${
            simSpeed === spd
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {spd}x
        </button>
      ))}

      <div className="w-[1px] h-5 bg-slate-700/60" />

      <button
        onClick={() => {
          if (cameraMode === 'follow') setCameraMode('half_pack');
          else if (cameraMode === 'half_pack') setCameraMode('leader');
          else if (cameraMode === 'leader') setCameraMode('overview');
          else setCameraMode('follow');
        }}
        className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
        title="Cambiar enfoque de cámara"
      >
        <Camera size={13} className="text-amber-400" />
        <span className="hidden lg:inline">
          {cameraMode === 'follow'
            ? 'Seguir'
            : cameraMode === 'half_pack'
              ? 'Grupo'
              : cameraMode === 'leader'
                ? 'Líder'
                : '5×5'}
        </span>
      </button>

      <button
        onClick={() => setShowLabyrinthMap((v) => !v)}
        className={`p-1.5 rounded-lg transition-colors ${
          showLabyrinthMap ? 'bg-cyan-500/25 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
        title="Mapa del Laberinto 5×5 [M]"
      >
        <MapIcon size={15} />
      </button>

      <button
        onClick={() => setShowDebugHud((v) => !v)}
        className={`p-1.5 rounded-lg transition-colors ${
          showDebugHud ? 'bg-amber-500/25 text-amber-300' : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
        title="Telemetría de rendimiento [D]"
      >
        <Bug size={15} />
      </button>

      <button
        onClick={handleToggleFullscreen}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Pantalla completa"
      >
        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
      </button>
    </div>
  );
}

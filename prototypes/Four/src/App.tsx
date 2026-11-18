import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { SlidersHorizontal, Shield } from 'lucide-react';
import { Marble, CourseData } from './types';
import { DEFAULT_MARBLE_COLORS, ZOMBIE_SPECS } from './constants';
import { sound } from './audio';
import { generateCourse } from './courseGenerator';
import { createGameplayRng } from './rng';
import { getInitialSeedFromHash, getDailySeedString } from './seedUtils';
import type { CameraMode, MapPower, FocusAnimState, ReplayPlaybackState } from './appTypes';
import { SimulationEngine, initPhysicsEngine, isPhysicsReady } from './simulation';

import { TopHud } from './components/TopHud';
import { UtilityToolbar } from './components/UtilityToolbar';
import { DebugOverlay } from './components/DebugOverlay';
import { ReplayBanner } from './components/ReplayBanner';
import { StageBanner } from './components/StageBanner';
import { PowerDock } from './components/PowerDock';
import { LabyrinthMapModal } from './components/LabyrinthMapModal';
import { ControlSidebar } from './components/ControlSidebar';
import { ResultsModal } from './components/ResultsModal';
import { useGameLoop } from './hooks/useGameLoop';
import { usePowers } from './hooks/usePowers';
import { useHighlightReplay } from './hooks/useHighlightReplay';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useStageViewport } from './hooks/useStageViewport';

export default function App() {
  const defaultNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    DEFAULT_MARBLE_COLORS.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, []);

  // Core Race & Config State
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_MARBLE_COLORS.map((c) => c.id));
  const [customNames, setCustomNames] = useState<Record<string, string>>(defaultNamesMap);
  const [seed, setSeed] = useState<string>(() => getInitialSeedFromHash());
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<CameraMode>('half_pack');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [patientZeroCount, setPatientZeroCount] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [physicsReady, setPhysicsReady] = useState<boolean>(() => isPhysicsReady());

  // Follow Target State
  const [followedMarbleId, setFollowedMarbleId] = useState<string | null>(null);
  const followedMarbleIdRef = useRef<string | null>(null);
  followedMarbleIdRef.current = followedMarbleId;

  // Survival HUD Telemetry (Throttled)
  const [hudTime, setHudTime] = useState<string>('00:00 / 05:00');
  const [hudLeader, setHudLeader] = useState<string>('-');
  const [hudLeaderColor, setHudLeaderColor] = useState<string>('#f0be38');
  const [hudProgress, setHudProgress] = useState<number>(0);
  const [livingHumansCount, setLivingHumansCount] = useState<number>(0);
  const [extractedHumansCount, setExtractedHumansCount] = useState<number>(0);
  const [activeZombiesCount, setActiveZombiesCount] = useState<number>(0);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [standings, setStandings] = useState<Marble[]>([]);
  const [stageBanner, setStageBanner] = useState<string>('SALA (1,1): SALA DE SALIDA');
  const [bannerVisible, setBannerVisible] = useState<boolean>(true);
  const [activeChunkCount, setActiveChunkCount] = useState<number>(1);

  // Dual Ability Cooldowns: Targeted (Boost/Shield/Heal) + Map Commander (EMP/Barricade/Airdrop)
  const [selectedPower, setSelectedPower] = useState<MapPower | null>(null);
  const [boostCooldown, setBoostCooldown] = useState<number>(0);
  const [shieldCooldown, setShieldCooldown] = useState<number>(0);
  const [healCooldown, setHealCooldown] = useState<number>(0);
  const [empCooldown, setEmpCooldown] = useState<number>(0);
  const [barricadeCooldown, setBarricadeCooldown] = useState<number>(0);
  const [airdropCooldown, setAirdropCooldown] = useState<number>(0);
  const [powerHint, setPowerHint] = useState<string | null>(null);

  // Modals & Overlays
  const [showLabyrinthMap, setShowLabyrinthMap] = useState<boolean>(false);
  const [showDebugHud, setShowDebugHud] = useState<boolean>(false);
  const [showSkyline, setShowSkyline] = useState<boolean>(true);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [debugStats, setDebugStats] = useState({
    fps: 60,
    worstMs: 16.7,
    physMs: 0.8,
    drawMs: 1.4,
    entities: 0,
  });

  // Post-Race Summary & Highlight Replay
  const [winnerModal, setWinnerModal] = useState<Marble | null>(null);
  const [summaryDismissed, setSummaryDismissed] = useState<boolean>(false);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replayHudText, setReplayHudText] = useState<string>('');

  // DOM & Simulation Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageWrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<SimulationEngine>(new SimulationEngine());
  const courseRef = useRef<CourseData | null>(null);

  const camXRef = useRef<number>(500);
  const camYRef = useRef<number>(210);
  const camZoomRef = useRef<number>(1.0);
  const lastTimeRef = useRef<number>(performance.now());
  const lastHudUpdateRef = useRef<number>(0);
  const firstExtractTimeRef = useRef<number | null>(null);

  const isPausedRef = useRef<boolean>(false);
  const simSpeedRef = useRef<number>(1);
  const cameraModeRef = useRef<CameraMode>('half_pack');
  const showSkylineRef = useRef<boolean>(true);
  const showParticlesRef = useRef<boolean>(true);
  const selectedPowerRef = useRef<MapPower | null>(null);
  const winnerModalRef = useRef<Marble | null>(null);
  const summaryDismissedRef = useRef<boolean>(false);

  isPausedRef.current = isPaused;
  simSpeedRef.current = simSpeed;
  cameraModeRef.current = cameraMode;
  showSkylineRef.current = showSkyline;
  showParticlesRef.current = showParticles;
  selectedPowerRef.current = selectedPower;
  winnerModalRef.current = winnerModal;
  summaryDismissedRef.current = summaryDismissed;

  // Cooldown Refs
  const boostCooldownRef = useRef<number>(0);
  const shieldCooldownRef = useRef<number>(0);
  const healCooldownRef = useRef<number>(0);
  const empCooldownRef = useRef<number>(0);
  const barricadeCooldownRef = useRef<number>(0);
  const airdropCooldownRef = useRef<number>(0);

  // FX & Replay Refs
  const focusAnimRef = useRef<FocusAnimState | null>(null);
  const damageFlashAlphaRef = useRef<number>(0);
  const replayStateRef = useRef<ReplayPlaybackState | null>(null);
  const fpsSamplesRef = useRef<{ frames: number; timer: number; worstMs: number; physMs: number; drawMs: number }>({
    frames: 0,
    timer: 0,
    worstMs: 0,
    physMs: 0,
    drawMs: 0,
  });

  const flashToast = useCallback((msg: string, ms = 2200) => {
    setPowerHint(msg);
    setTimeout(() => {
      setPowerHint((cur) => (cur === msg ? null : cur));
    }, ms);
  }, []);

  const handleToggleSound = useCallback(() => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled]);

  const handleNameChange = useCallback((id: string, newName: string) => {
    setCustomNames((prev) => ({ ...prev, [id]: newName }));
    const targetMarble = simulationRef.current.getMarbles().find((m) => m.id === id);
    if (targetMarble) targetMarble.name = newName;
  }, []);

  const handleResetNames = useCallback(() => {
    setCustomNames({ ...defaultNamesMap });
    simulationRef.current.getMarbles().forEach((m) => {
      if (defaultNamesMap[m.id]) m.name = defaultNamesMap[m.id];
    });
  }, [defaultNamesMap]);

  const selectFollowMarble = useCallback((id: string | null, switchCam = false) => {
    setFollowedMarbleId(id);
    followedMarbleIdRef.current = id;
    simulationRef.current.setFollowedMarbleId(id);
    if (switchCam && id) {
      setCameraMode('follow');
    }
  }, []);

  const cycleFollowMarble = useCallback((delta: number) => {
    const players = simulationRef.current.getPlayerMarbles();
    if (players.length === 0) return;
    const living = players.filter((m) => !m.isZombie && !m.finished && !m.gone);
    const pool = living.length > 0 ? living : players;
    const curIdx = pool.findIndex((m) => m.id === followedMarbleIdRef.current);
    const nextIdx = curIdx === -1 ? 0 : (curIdx + delta + pool.length) % pool.length;
    selectFollowMarble(pool[nextIdx].id, true);
  }, [selectFollowMarble]);

  // Start / Re-seed 5x5 Labyrinth Survival Race
  const startRace = useCallback((newSeed?: string, pzOverride?: number) => {
    if (!isPhysicsReady()) return;
    const targetSeed = (newSeed ?? seed).trim() || 'zombierun808';
    const numPz = pzOverride ?? patientZeroCount;
    const newCourse = generateCourse(targetSeed);
    courseRef.current = newCourse;

    // Sync URL hash cleanly for deterministic sharing
    if (typeof window !== 'undefined') {
      const nextHash = `#seed=${encodeURIComponent(targetSeed)}`;
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, '', nextHash);
      }
    }

    setWinnerModal(null);
    setSummaryDismissed(false);
    summaryDismissedRef.current = false;
    firstExtractTimeRef.current = null;
    replayStateRef.current = null;
    setIsReplaying(false);
    focusAnimRef.current = null;
    damageFlashAlphaRef.current = 0;

    // Reset ability cooldowns
    boostCooldownRef.current = 0;
    shieldCooldownRef.current = 0;
    healCooldownRef.current = 0;
    empCooldownRef.current = 0;
    barricadeCooldownRef.current = 0;
    airdropCooldownRef.current = 0;
    setBoostCooldown(0);
    setShieldCooldown(0);
    setHealCooldown(0);
    setEmpCooldown(0);
    setBarricadeCooldown(0);
    setAirdropCooldown(0);
    setSelectedPower(null);

    const activeDefs = DEFAULT_MARBLE_COLORS.filter((c) => selectedIds.includes(c.id));
    const count = activeDefs.length;

    const spawnRng = createGameplayRng(newCourse.seed, 'spawn');
    const spawned: Marble[] = activeDefs.map((def, idx) => {
      const offsetX = ((idx % 5) - 2) * 26;
      const offsetY = Math.floor(idx / 5) * 24;
      const assignedName = customNames[def.id]?.trim() || def.name;
      const startPosX = newCourse.startX + offsetX;
      const startPosY = newCourse.startY + offsetY;
      // Put Patient Zero(s) at the back of the spawn cluster (end of array)
      const isPatientZero = idx >= count - numPz;

      return {
        id: def.id,
        name: assignedName,
        color: def.color,
        border: def.border,
        mass: def.mass ?? 1.0,
        restitution: def.restitution ?? 0.5,
        materialType: def.materialType ?? 'glass',
        x: startPosX,
        y: startPosY,
        vx: (spawnRng() - 0.5) * 1.5,
        vy: 1.0 + spawnRng(),
        angle: 0,
        omega: 0,
        prevX: startPosX,
        prevY: startPosY,
        prevAngle: 0,
        renderX: startPosX,
        renderY: startPosY,
        renderAngle: 0,
        radius: 12.5,
        rank: idx + 1,
        finished: false,
        finishTime: null,
        finishPosition: null,
        currentCheckpointIdx: 0,
        progressScore: 0,
        history: [],
        isZombie: isPatientZero,
        zombieType: isPatientZero ? 'runner' : undefined,
        zhp: isPatientZero ? ZOMBIE_SPECS.runner.hp : undefined,
        maxZhp: isPatientZero ? ZOMBIE_SPECS.runner.hp : undefined,
        zSpeedMult: isPatientZero ? ZOMBIE_SPECS.runner.speedMult : undefined,
        zForceMult: isPatientZero ? ZOMBIE_SPECS.runner.forceMult : undefined,
        hp: 5,
        maxHp: 5,
        shield: 0,
        infectionTime: isPatientZero ? 0 : null,
        kills: 0,
        isExtracted: false,
        weaponCooldown: 0,
        weaponType: 'blaster',
        weaponUpgradeTimer: 0,
        aimAngle: 0,
        currentRoomId: 0,
      };
    });

    simulationRef.current.init(newCourse, spawned);
    const firstHuman = spawned.find((m) => !m.isZombie) || spawned[0];
    selectFollowMarble(firstHuman ? firstHuman.id : null, false);

    camXRef.current = newCourse.startX;
    camYRef.current = newCourse.startY;
    camZoomRef.current = 1.0;

    setStageBanner('SALA (1,1): LABERINTO BIOHAZARD 5×5');
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 2600);
  }, [seed, selectedIds, customNames, patientZeroCount, selectFollowMarble]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev;
        return prev.filter((c) => c !== id);
      }
      return [...prev, id];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === DEFAULT_MARBLE_COLORS.length) {
      setSelectedIds(['orange', 'red', 'cyan', 'yellow']);
    } else {
      setSelectedIds(DEFAULT_MARBLE_COLORS.map((c) => c.id));
    }
  }, [selectedIds.length]);

  const handleRandomizeSeed = useCallback(() => {
    const randomSeed = Math.floor(Math.random() * 899999 + 100000).toString();
    setSeed(randomSeed);
    startRace(randomSeed);
  }, [startRace]);

  const handleDailySeed = useCallback(() => {
    const daily = getDailySeedString();
    setSeed(daily);
    startRace(daily);
    flashToast(`📅 SEMILLA DIARIA CARGADA: ${daily}`);
  }, [startRace, flashToast]);

  const handleCopySeedLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flashToast('🔗 ENLACE DE SEMILLA COPIADO');
    } catch {
      flashToast(`🔗 URL ACTUALIZADA: #seed=${seed}`);
    }
  }, [seed, flashToast]);

  const { activateTargetedPower, activateMapPower } = usePowers({
    simulationRef,
    followedMarbleIdRef,
    flashToast,
    boostCooldownRef,
    setBoostCooldown,
    shieldCooldownRef,
    setShieldCooldown,
    healCooldownRef,
    setHealCooldown,
    camXRef,
    camYRef,
    empCooldownRef,
    setEmpCooldown,
    setSelectedPower,
    barricadeCooldownRef,
    setBarricadeCooldown,
    airdropCooldownRef,
    setAirdropCooldown,
  });

  const { startHighlightReplay, stopHighlightReplay } = useHighlightReplay({
    simulationRef,
    flashToast,
    setWinnerModal,
    setSummaryDismissed,
    summaryDismissedRef,
    replayStateRef,
    setIsReplaying,
    setReplayHudText,
  });

  // Canvas Click: Exit replay OR place commander power OR Tap-to-Follow marble
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (replayStateRef.current) {
      stopHighlightReplay();
      return;
    }
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const screenX = (e.clientX - rect.left) * scaleX;
    const screenY = (e.clientY - rect.top) * scaleY;
    const worldX = (screenX - canvasRef.current.width / 2) / camZoomRef.current + camXRef.current;
    const worldY = (screenY - canvasRef.current.height / 2) / camZoomRef.current + camYRef.current;

    if (selectedPowerRef.current) {
      activateMapPower(selectedPowerRef.current, worldX, worldY);
      return;
    }

    // Tap-to-Follow nearest marble within 44px
    const marbles = simulationRef.current.getMarbles();
    let best: Marble | null = null;
    let bestD = 44;
    for (let i = 0; i < marbles.length; i++) {
      const m = marbles[i];
      if (m.gone) continue;
      const mx = m.renderX ?? m.x;
      const my = m.renderY ?? m.y;
      const d = Math.hypot(mx - worldX, my - worldY);
      if (d < bestD) {
        bestD = d;
        best = m;
      }
    }
    if (best) {
      selectFollowMarble(best.id, true);
      flashToast(`🎯 SIGUIENDO A ${best.name.toUpperCase()}`, 1600);
    }
  }, [activateMapPower, selectFollowMarble, stopHighlightReplay, flashToast]);

  useKeyboardShortcuts({
    activateTargetedPower,
    empCooldownRef,
    setSelectedPower,
    barricadeCooldownRef,
    airdropCooldownRef,
    cycleFollowMarble,
    setIsPaused,
    setShowLabyrinthMap,
    setShowDebugHud,
    replayStateRef,
    stopHighlightReplay,
  });

  const { handleToggleFullscreen, updateAspect } = useStageViewport({
    stageWrapperRef,
    setIsFullscreen,
    canvasContainerRef,
    canvasRef,
    setIsPortrait,
  });

  // Initial Race Boot (Async Rapier2D WASM Init)
  useEffect(() => {
    let cancelled = false;
    updateAspect();
    initPhysicsEngine().then(() => {
      if (cancelled) return;
      setPhysicsReady(true);
      startRace();
    });
    return () => {
      cancelled = true;
      simulationRef.current.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main Simulation, Replay & Render Loop
  useGameLoop({
    lastTimeRef,
    simulationRef,
    canvasRef,
    replayStateRef,
    stopHighlightReplay,
    setReplayHudText,
    camXRef,
    camYRef,
    camZoomRef,
    showSkylineRef,
    showParticlesRef,
    focusAnimRef,
    damageFlashAlphaRef,
    simSpeedRef,
    isPausedRef,
    firstExtractTimeRef,
    winnerModalRef,
    summaryDismissedRef,
    setWinnerModal,
    setStageBanner,
    setBannerVisible,
    boostCooldownRef,
    shieldCooldownRef,
    healCooldownRef,
    empCooldownRef,
    barricadeCooldownRef,
    airdropCooldownRef,
    cameraModeRef,
    followedMarbleIdRef,
    fpsSamplesRef,
    lastHudUpdateRef,
    setHudTime,
    setHudLeader,
    setHudLeaderColor,
    setHudProgress,
    setLivingHumansCount,
    setExtractedHumansCount,
    setActiveZombiesCount,
    setBoostCooldown,
    setShieldCooldown,
    setHealCooldown,
    setEmpCooldown,
    setBarricadeCooldown,
    setAirdropCooldown,
    setActiveChunkCount,
    setDebugStats,
    setStandings,
  });

  // Derived Followed Marble Info
  const followedMarble = useMemo(
    () => standings.find((m) => m.id === followedMarbleId) || null,
    [standings, followedMarbleId]
  );

  // Deadliest Room Calculation for Summary Modal
  const deadliestRoomText = useMemo(() => {
    const counts = simulationRef.current.getRoomDamageCounts();
    const course = courseRef.current;
    let bestId = -1;
    let bestDmg = 0;
    for (const [k, v] of Object.entries(counts)) {
      if (v > bestDmg) {
        bestDmg = v;
        bestId = Number(k);
      }
    }
    if (bestId === -1 || !course?.chunks[bestId]) return 'Ninguna (sin bajas)';
    const r = course.chunks[bestId];
    return `Sala (${r.col + 1},${r.row + 1}) · ${r.name} (${bestDmg} impactos)`;
  }, [winnerModal]);

  const playerStandings = useMemo(
    () => standings.filter((m) => !m.id.startsWith('npc_')),
    [standings]
  );

  const totalKillsCount = useMemo(
    () => playerStandings.reduce((acc, m) => acc + (m.isZombie ? 0 : m.kills || 0), 0),
    [playerStandings]
  );

  return (
    <div className="flex w-screen h-screen bg-[#090b12] text-slate-100 font-sans overflow-hidden select-none">
      {/* Center Stage & Adaptive 16:9 / 9:16 Viewport */}
      <main
        ref={stageWrapperRef}
        className="flex-1 h-full flex items-center justify-center bg-[#07090f] relative overflow-hidden"
      >
        <div
          ref={canvasContainerRef}
          className="relative bg-[#0d101b] rounded-xl shadow-[0_0_36px_rgba(0,0,0,0.85)] border border-slate-800/80 overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="block w-full h-full"
            onClick={handleCanvasClick}
            style={{ cursor: selectedPower ? 'crosshair' : 'pointer' }}
          />

          {!physicsReady && (
            <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-slate-200">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <span className="text-xs font-mono tracking-wider text-emerald-300 uppercase">
                Inicializando motor físico Rapier2D...
              </span>
            </div>
          )}

          <TopHud
            hudTime={hudTime}
            livingHumansCount={livingHumansCount}
            extractedHumansCount={extractedHumansCount}
            activeZombiesCount={activeZombiesCount}
            hudLeaderColor={hudLeaderColor}
            hudLeader={hudLeader}
            hudProgress={hudProgress}
            followedMarble={followedMarble}
            cycleFollowMarble={cycleFollowMarble}
          />

          <UtilityToolbar
            handleToggleSound={handleToggleSound}
            soundEnabled={soundEnabled}
            setIsPaused={setIsPaused}
            isPaused={isPaused}
            setSimSpeed={setSimSpeed}
            simSpeed={simSpeed}
            cameraMode={cameraMode}
            setCameraMode={setCameraMode}
            setShowLabyrinthMap={setShowLabyrinthMap}
            showLabyrinthMap={showLabyrinthMap}
            setShowDebugHud={setShowDebugHud}
            showDebugHud={showDebugHud}
            handleToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
          />

          <DebugOverlay
            showDebugHud={showDebugHud}
            setShowDebugHud={setShowDebugHud}
            debugStats={debugStats}
            activeChunkCount={activeChunkCount}
            setShowSkyline={setShowSkyline}
            showSkyline={showSkyline}
            setShowParticles={setShowParticles}
            showParticles={showParticles}
          />

          <ReplayBanner
            isReplaying={isReplaying}
            stopHighlightReplay={stopHighlightReplay}
            replayHudText={replayHudText}
            powerHint={powerHint}
            selectedPower={selectedPower}
          />

          <StageBanner
            isReplaying={isReplaying}
            bannerVisible={bannerVisible}
            stageBanner={stageBanner}
          />

          <PowerDock
            isReplaying={isReplaying}
            activateTargetedPower={activateTargetedPower}
            boostCooldown={boostCooldown}
            shieldCooldown={shieldCooldown}
            healCooldown={healCooldown}
            empCooldown={empCooldown}
            setSelectedPower={setSelectedPower}
            selectedPower={selectedPower}
            barricadeCooldown={barricadeCooldown}
            airdropCooldown={airdropCooldown}
          />

          <LabyrinthMapModal
            showLabyrinthMap={showLabyrinthMap}
            courseRef={courseRef}
            seed={seed}
            setShowLabyrinthMap={setShowLabyrinthMap}
            standings={standings}
          />
        </div>
      </main>

      {/* Mobile Drawer Trigger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-4 right-4 z-40 bg-amber-500 text-slate-950 p-3 rounded-full shadow-2xl active:scale-95 transition-transform"
        aria-label="Abrir panel de control"
      >
        <SlidersHorizontal size={22} />
      </button>

      <ControlSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        startRace={startRace}
        patientZeroCount={patientZeroCount}
        setPatientZeroCount={setPatientZeroCount}
        seed={seed}
        setSeed={setSeed}
        handleRandomizeSeed={handleRandomizeSeed}
        handleDailySeed={handleDailySeed}
        handleCopySeedLink={handleCopySeedLink}
        selectedIds={selectedIds}
        customNames={customNames}
        handleToggleSelect={handleToggleSelect}
        handleNameChange={handleNameChange}
        handleSelectAll={handleSelectAll}
        handleResetNames={handleResetNames}
        standings={standings}
        followedMarbleId={followedMarbleId}
        selectFollowMarble={selectFollowMarble}
        activeChunkCount={activeChunkCount}
      />

      <ResultsModal
        winnerModal={winnerModal}
        extractedHumansCount={extractedHumansCount}
        seed={seed}
        totalKillsCount={totalKillsCount}
        hudTime={hudTime}
        deadliestRoomText={deadliestRoomText}
        startHighlightReplay={startHighlightReplay}
        setSummaryDismissed={setSummaryDismissed}
        summaryDismissedRef={summaryDismissedRef}
        setWinnerModal={setWinnerModal}
        startRace={startRace}
      />
    </div>
  );
}

import type { CameraMode, FocusAnimState, ReplayPlaybackState } from '../appTypes';
import { ZOMBIE_SPECS } from '../constants';
import { RenderFocusFx, renderCourse } from '../renderer';
import { SimulationEngine } from '../simulation';
import { Marble, ReplayFrame } from '../types';
import React, { useEffect } from 'react';

export interface useGameLoopParams {
  lastTimeRef: React.RefObject<number>;
  simulationRef: React.RefObject<SimulationEngine>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  replayStateRef: React.RefObject<ReplayPlaybackState | null>;
  stopHighlightReplay: () => void;
  setReplayHudText: React.Dispatch<React.SetStateAction<string>>;
  camXRef: React.RefObject<number>;
  camYRef: React.RefObject<number>;
  camZoomRef: React.RefObject<number>;
  showSkylineRef: React.RefObject<boolean>;
  showParticlesRef: React.RefObject<boolean>;
  focusAnimRef: React.RefObject<FocusAnimState | null>;
  damageFlashAlphaRef: React.RefObject<number>;
  simSpeedRef: React.RefObject<number>;
  isPausedRef: React.RefObject<boolean>;
  firstExtractTimeRef: React.RefObject<number | null>;
  winnerModalRef: React.RefObject<Marble | null>;
  summaryDismissedRef: React.RefObject<boolean>;
  setWinnerModal: React.Dispatch<React.SetStateAction<Marble | null>>;
  setStageBanner: React.Dispatch<React.SetStateAction<string>>;
  setBannerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  boostCooldownRef: React.RefObject<number>;
  shieldCooldownRef: React.RefObject<number>;
  healCooldownRef: React.RefObject<number>;
  empCooldownRef: React.RefObject<number>;
  barricadeCooldownRef: React.RefObject<number>;
  airdropCooldownRef: React.RefObject<number>;
  cameraModeRef: React.RefObject<CameraMode>;
  followedMarbleIdRef: React.RefObject<string | null>;
  fpsSamplesRef: React.RefObject<{ frames: number; timer: number; worstMs: number; physMs: number; drawMs: number }>;
  lastHudUpdateRef: React.RefObject<number>;
  setHudTime: React.Dispatch<React.SetStateAction<string>>;
  setHudLeader: React.Dispatch<React.SetStateAction<string>>;
  setHudLeaderColor: React.Dispatch<React.SetStateAction<string>>;
  setHudProgress: React.Dispatch<React.SetStateAction<number>>;
  setLivingHumansCount: React.Dispatch<React.SetStateAction<number>>;
  setExtractedHumansCount: React.Dispatch<React.SetStateAction<number>>;
  setActiveZombiesCount: React.Dispatch<React.SetStateAction<number>>;
  setBoostCooldown: React.Dispatch<React.SetStateAction<number>>;
  setShieldCooldown: React.Dispatch<React.SetStateAction<number>>;
  setHealCooldown: React.Dispatch<React.SetStateAction<number>>;
  setEmpCooldown: React.Dispatch<React.SetStateAction<number>>;
  setBarricadeCooldown: React.Dispatch<React.SetStateAction<number>>;
  setAirdropCooldown: React.Dispatch<React.SetStateAction<number>>;
  setActiveChunkCount: React.Dispatch<React.SetStateAction<number>>;
  setDebugStats: React.Dispatch<
    React.SetStateAction<{ fps: number; worstMs: number; physMs: number; drawMs: number; entities: number }>
  >;
  setStandings: React.Dispatch<React.SetStateAction<Marble[]>>;
}

/** Main requestAnimationFrame loop: steps the simulation, renders the canvas, updates the HUD and drives replay playback. */
export function useGameLoop({
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
}: useGameLoopParams) {
  useEffect(() => {
    let animId: number;

    const sampleReplayFrame = (frames: ReplayFrame[], t: number, baseMarbles: Marble[]): Marble[] => {
      if (frames.length === 0) return baseMarbles;
      let idx = 0;
      while (idx < frames.length - 1 && frames[idx + 1].t < t) idx++;
      const f0 = frames[idx];
      const f1 = frames[Math.min(frames.length - 1, idx + 1)];
      const span = Math.max(0.0001, f1.t - f0.t);
      const frac = Math.max(0, Math.min(1, (t - f0.t) / span));

      const map1 = new Map(f1.marbles.map((s) => [s.id, s]));
      return f0.marbles.map((s0) => {
        const s1 = map1.get(s0.id) || s0;
        const meta = baseMarbles.find((b) => b.id === s0.id);
        return {
          ...(meta || ({} as Marble)),
          id: s0.id,
          name: meta?.name || (s0.zombieType ? ZOMBIE_SPECS[s0.zombieType].label : s0.id),
          color: meta?.color || '#4d9b36',
          border: meta?.border,
          mass: meta?.mass ?? 1,
          restitution: meta?.restitution ?? 0.5,
          x: s0.x + (s1.x - s0.x) * frac,
          y: s0.y + (s1.y - s0.y) * frac,
          renderX: s0.x + (s1.x - s0.x) * frac,
          renderY: s0.y + (s1.y - s0.y) * frac,
          vx: (s1.x - s0.x) * 20,
          vy: (s1.y - s0.y) * 20,
          angle: s0.angle + (s1.angle - s0.angle) * frac,
          renderAngle: s0.angle + (s1.angle - s0.angle) * frac,
          omega: 0,
          radius: s0.radius,
          rank: meta?.rank ?? 1,
          finished: s0.finished,
          finishTime: meta?.finishTime ?? null,
          finishPosition: meta?.finishPosition ?? null,
          currentCheckpointIdx: 0,
          progressScore: 0,
          history: [],
          isZombie: s0.isZombie,
          zombieType: s0.zombieType,
          hp: s0.hp,
          maxHp: 5,
          zhp: s0.zhp,
          maxZhp: s0.maxZhp,
          isExtracted: s0.isExtracted,
          gone: s0.gone,
          shield: s0.shield,
          weaponType: s0.weaponType,
        };
      });
    };

    const gameLoop = (now: number) => {
      const rawDt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      const sim = simulationRef.current;
      const course = sim.getCourse();
      const marbles = sim.getMarbles();
      const canvas = canvasRef.current;

      if (course && marbles.length > 0 && canvas) {
        const virtualW = canvas.width;
        const virtualH = canvas.height;
        const rep = replayStateRef.current;

        if (rep) {
          // ==========================================
          // HIGHLIGHT REPLAY MODE (0.35x Slow-Motion)
          // ==========================================
          rep.curT += rawDt * 0.35;
          const activeClip = rep.clips[rep.clipIndex];
          if (rep.curT >= activeClip.endT) {
            rep.clipIndex++;
            if (rep.clipIndex >= rep.clips.length) {
              stopHighlightReplay();
            } else {
              const nextClip = rep.clips[rep.clipIndex];
              rep.curT = nextClip.startT;
              setReplayHudText(`${rep.clipIndex + 1}/${rep.clips.length} · ${nextClip.event.text}`);
            }
          }

          if (replayStateRef.current) {
            const clipNow = replayStateRef.current.clips[replayStateRef.current.clipIndex];
            const snapMarbles = sampleReplayFrame(sim.getReplayFrames(), replayStateRef.current.curT, marbles);
            const hero = snapMarbles.find((m) => m.id === clipNow.event.marbleId) || snapMarbles[0];
            if (hero) {
              camXRef.current += (hero.x - camXRef.current) * 0.16;
              camYRef.current += (hero.y - camYRef.current) * 0.16;
              camZoomRef.current += (1.18 - camZoomRef.current) * 0.1;
            }
            const ctx = canvas.getContext('2d');
            if (ctx) {
              renderCourse(
                ctx,
                course,
                snapMarbles,
                virtualW,
                virtualH,
                camXRef.current,
                camYRef.current,
                camZoomRef.current,
                replayStateRef.current.curT,
                [],
                [],
                [],
                [],
                [],
                {
                  followedMarbleId: hero?.id,
                  showSkyline: showSkylineRef.current,
                  showParticles: showParticlesRef.current,
                  focusFx: hero
                    ? {
                        x: hero.x,
                        y: hero.y,
                        color: clipNow.event.color,
                        text: clipNow.event.text,
                        progress: 0.35,
                      }
                    : null,
                },
              );
            }
          }
          animId = requestAnimationFrame(gameLoop);
          return;
        }

        // ==========================================
        // 1. ADVANCE PHYSICS (With Slow-Mo Focus Dilation)
        // ==========================================
        const tPhysStart = performance.now();
        const trigFocus = sim.consumePendingFocus();
        if (trigFocus) {
          focusAnimRef.current = {
            x: trigFocus.x,
            y: trigFocus.y,
            color: trigFocus.color,
            text: trigFocus.text,
            elapsed: 0,
            duration: trigFocus.durationSec,
          };
        }
        if (sim.consumePendingDamageFlash()) {
          damageFlashAlphaRef.current = 0.65;
        }
        if (damageFlashAlphaRef.current > 0) {
          damageFlashAlphaRef.current = Math.max(0, damageFlashAlphaRef.current - rawDt * 2.2);
        }

        let effectiveSimSpeed = simSpeedRef.current;
        let renderFocusFx: RenderFocusFx | null = null;
        if (focusAnimRef.current) {
          focusAnimRef.current.elapsed += rawDt;
          if (focusAnimRef.current.elapsed >= focusAnimRef.current.duration) {
            focusAnimRef.current = null;
          } else {
            effectiveSimSpeed = Math.min(effectiveSimSpeed, 0.3);
            renderFocusFx = {
              x: focusAnimRef.current.x,
              y: focusAnimRef.current.y,
              color: focusAnimRef.current.color,
              text: focusAnimRef.current.text,
              progress: focusAnimRef.current.elapsed / focusAnimRef.current.duration,
            };
          }
        }

        sim.update(rawDt, effectiveSimSpeed, isPausedRef.current, {
          onWinner: (winner) => {
            if (firstExtractTimeRef.current === null) {
              firstExtractTimeRef.current = sim.getRaceTime();
            }
            if (!winnerModalRef.current && !summaryDismissedRef.current) {
              // Wait briefly if other living humans are still running so they can finish/turn, else show immediately
              const living = marbles.filter((m) => !m.id.startsWith('npc_') && !m.isZombie && !m.finished);
              if (living.length === 0) {
                setWinnerModal(winner);
              }
            }
          },
          onStageChange: (stageName) => {
            setStageBanner(stageName);
            setBannerVisible(true);
            setTimeout(() => setBannerVisible(false), 2400);
          },
        });
        const physMs = performance.now() - tPhysStart;

        // Decay Ability Cooldowns
        if (!isPausedRef.current) {
          const stepSec = rawDt * effectiveSimSpeed;
          if (boostCooldownRef.current > 0) boostCooldownRef.current = Math.max(0, boostCooldownRef.current - stepSec);
          if (shieldCooldownRef.current > 0)
            shieldCooldownRef.current = Math.max(0, shieldCooldownRef.current - stepSec);
          if (healCooldownRef.current > 0) healCooldownRef.current = Math.max(0, healCooldownRef.current - stepSec);
          if (empCooldownRef.current > 0) empCooldownRef.current = Math.max(0, empCooldownRef.current - stepSec);
          if (barricadeCooldownRef.current > 0)
            barricadeCooldownRef.current = Math.max(0, barricadeCooldownRef.current - stepSec);
          if (airdropCooldownRef.current > 0)
            airdropCooldownRef.current = Math.max(0, airdropCooldownRef.current - stepSec);
        }

        // ==========================================
        // 2. SMART CAMERA (Focus -> Follow -> Leader -> Half-Pack -> Overview)
        // ==========================================
        const playerMarbles = marbles.filter((m) => !m.id.startsWith('npc_') && !m.gone);
        const mode = cameraModeRef.current;

        if (focusAnimRef.current) {
          camXRef.current += (focusAnimRef.current.x - camXRef.current) * 0.18;
          camYRef.current += (focusAnimRef.current.y - camYRef.current) * 0.18;
          camZoomRef.current += (1.22 - camZoomRef.current) * 0.12;
        } else if (mode === 'follow' && followedMarbleIdRef.current) {
          const target = marbles.find((m) => m.id === followedMarbleIdRef.current && !m.gone) || playerMarbles[0];
          if (target) {
            const tx = target.renderX ?? target.x;
            const ty = target.renderY ?? target.y;
            camXRef.current += (tx - camXRef.current) * 0.14;
            camYRef.current += (ty - camYRef.current) * 0.14;
            camZoomRef.current += (1.08 - camZoomRef.current) * 0.08;
          }
        } else if (mode === 'overview') {
          camXRef.current += (1250 - camXRef.current) * 0.08;
          camYRef.current += (1250 - camYRef.current) * 0.08;
          const targetZoom = Math.min(virtualW / 2680, virtualH / 2680);
          camZoomRef.current += (targetZoom - camZoomRef.current) * 0.08;
        } else if (mode === 'leader') {
          const leader = sim.getLeader() || playerMarbles[0];
          if (leader) {
            const lx = leader.renderX ?? leader.x;
            const ly = leader.renderY ?? leader.y;
            camXRef.current += (lx - camXRef.current) * 0.12;
            camYRef.current += (ly - camYRef.current) * 0.12;
            camZoomRef.current += (1.12 - camZoomRef.current) * 0.08;
          }
        } else {
          const pool = playerMarbles.filter((m) => !m.finished);
          const activeSet = pool.length > 0 ? pool : playerMarbles;
          const halfCount = Math.max(1, Math.ceil(activeSet.length / 2));
          const tracked = activeSet.slice(0, halfCount);
          if (tracked.length > 0) {
            let minX = tracked[0].renderX ?? tracked[0].x;
            let maxX = minX;
            let minY = tracked[0].renderY ?? tracked[0].y;
            let maxY = minY;
            for (let i = 1; i < tracked.length; i++) {
              const mx = tracked[i].renderX ?? tracked[i].x;
              const my = tracked[i].renderY ?? tracked[i].y;
              if (mx < minX) minX = mx;
              if (mx > maxX) maxX = mx;
              if (my < minY) minY = my;
              if (my > maxY) maxY = my;
            }
            const spanX = maxX - minX + 260;
            const spanY = maxY - minY + 240;
            const targetZoom = Math.max(0.55, Math.min(1.22, Math.min(virtualW / spanX, virtualH / spanY)));
            camXRef.current += ((minX + maxX) / 2 - camXRef.current) * 0.09;
            camYRef.current += ((minY + maxY) / 2 - camYRef.current) * 0.09;
            camZoomRef.current += (targetZoom - camZoomRef.current) * 0.06;
          }
        }

        // ==========================================
        // 3. RENDER COURSE
        // ==========================================
        const tDrawStart = performance.now();
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderCourse(
            ctx,
            course,
            marbles,
            virtualW,
            virtualH,
            camXRef.current,
            camYRef.current,
            camZoomRef.current,
            sim.getRaceTime(),
            sim.getProjectiles(),
            sim.getParticles(),
            sim.getFloatingTexts(),
            sim.getBarricades(),
            sim.getCombatFeed(),
            {
              followedMarbleId: followedMarbleIdRef.current,
              showSkyline: showSkylineRef.current,
              showParticles: showParticlesRef.current,
              focusFx: renderFocusFx,
              damageFlashAlpha: damageFlashAlphaRef.current,
            },
          );
        }
        const drawMs = performance.now() - tDrawStart;

        // Track telemetry
        const frameMs = rawDt * 1000;
        fpsSamplesRef.current.frames++;
        fpsSamplesRef.current.timer += rawDt;
        fpsSamplesRef.current.worstMs = Math.max(fpsSamplesRef.current.worstMs, frameMs);
        fpsSamplesRef.current.physMs = physMs;
        fpsSamplesRef.current.drawMs = drawMs;

        // ==========================================
        // 4. THROTTLED HUD UPDATES (2.5 Hz)
        // ==========================================
        if (now - lastHudUpdateRef.current > 400) {
          lastHudUpdateRef.current = now;

          const timeSec = sim.getRaceTime();
          const mins = Math.floor(timeSec / 60);
          const secs = Math.floor(timeSec % 60);
          setHudTime(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} / 05:00`);

          const leader = sim.getLeader();
          if (leader) {
            setHudLeader(leader.name);
            setHudLeaderColor(leader.isZombie ? '#22c55e' : leader.color);
            setHudProgress(sim.getLeaderProgressPercent());
          }

          const players = sim.getPlayerMarbles();
          const living = players.filter((m) => !m.isZombie && !m.finished).length;
          const extracted = players.filter((m) => m.isExtracted).length;
          const zombies = marbles.filter((m) => m.isZombie && !m.gone).length;

          setLivingHumansCount(living);
          setExtractedHumansCount(extracted);
          setActiveZombiesCount(zombies);

          setBoostCooldown(Math.ceil(boostCooldownRef.current));
          setShieldCooldown(Math.ceil(shieldCooldownRef.current));
          setHealCooldown(Math.ceil(healCooldownRef.current));
          setEmpCooldown(Math.ceil(empCooldownRef.current));
          setBarricadeCooldown(Math.ceil(barricadeCooldownRef.current));
          setAirdropCooldown(Math.ceil(airdropCooldownRef.current));
          setActiveChunkCount(sim.getActiveChunkCount());

          // Debug telemetry snapshot
          if (fpsSamplesRef.current.timer > 0) {
            setDebugStats({
              fps: Math.round(fpsSamplesRef.current.frames / fpsSamplesRef.current.timer),
              worstMs: Number(fpsSamplesRef.current.worstMs.toFixed(1)),
              physMs: Number(fpsSamplesRef.current.physMs.toFixed(2)),
              drawMs: Number(fpsSamplesRef.current.drawMs.toFixed(2)),
              entities: marbles.filter((m) => !m.gone).length + sim.getProjectiles().length + sim.getParticles().length,
            });
            fpsSamplesRef.current.frames = 0;
            fpsSamplesRef.current.timer = 0;
            fpsSamplesRef.current.worstMs = 0;
          }

          // Auto-open summary when all human marbles finish/turn OR 3.5s after 1st survivor escapes
          if (!winnerModalRef.current && !summaryDismissedRef.current) {
            if (living === 0) {
              const winCandidate =
                sim.getWinner() ||
                (extracted > 0
                  ? players.find((m) => m.isExtracted)
                  : [...players].sort((a, b) => (b.kills || 0) - (a.kills || 0))[0]);
              if (winCandidate) setWinnerModal(winCandidate);
            } else if (firstExtractTimeRef.current !== null && timeSec - firstExtractTimeRef.current >= 3.5) {
              const winCandidate = sim.getWinner();
              if (winCandidate) setWinnerModal(winCandidate);
            }
          }

          setStandings([...marbles]);
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [stopHighlightReplay]);
}

/** RapierRaceEngine: owns the Rapier world and per-race state; update() runs the staged simulation. */
import RAPIER from '@dimforge/rapier2d-compat';
import type { Marble, CourseData, Projectile, CombatParticle, FloatingText, TemporaryBarricade, CombatEvent, HighlightEvent, ReplayFrame, ZombieType } from '../types';
import { ROOM_SIZE } from '../constants';
import { createGameplayRng } from '../rng';
import type { FocusTrigger, ColliderMeta, TickCtx } from './types';
import { createMarbleBody, buildWorld } from './worldBuilder';
import { spawnNpcZombie, triggerEmpShockwave, deployBarricade, deployAirdrop, triggerMarbleBoost, triggerMarbleShield, triggerMarbleHeal, applyHumanDamage, processCollisions, damageZombie } from './combat';
import { updateActiveRooms, updateHazards } from './hazards';
import { updateSteering } from './steering';
import { updateProjectiles } from './projectiles';
import { syncBodies, recordReplayAndRank } from './sync';

export class RapierRaceEngine {
  public world: RAPIER.World | null = null;
  public eventQueue: RAPIER.EventQueue | null = null;
  public chunkBodies: RAPIER.RigidBody[][] = [];
  public spinnerBodies: Map<number, RAPIER.RigidBody[]> = new Map();
  public pistonBodies: Map<string, RAPIER.RigidBody> = new Map();
  public pendulumBodies: Map<string, RAPIER.RigidBody> = new Map();
  public marbleBodies: Map<string, RAPIER.RigidBody> = new Map();
  public colliderMeta: Map<number, ColliderMeta> = new Map();

  public activeChunkIndices: number[] = [];
  public projectiles: Projectile[] = [];
  public particles: CombatParticle[] = [];
  public floatingTexts: FloatingText[] = [];
  public barricades: TemporaryBarricade[] = [];
  public barricadeBodies: Map<string, RAPIER.RigidBody> = new Map();
  public combatFeed: CombatEvent[] = [];
  public highlightEvents: HighlightEvent[] = [];
  public replayFrames: ReplayFrame[] = [];
  public pendingFocus: FocusTrigger | null = null;
  public pendingDamageFlash: boolean = false;
  public followedMarbleId: string | null = null;
  public roomDamageCounts: Record<number, number> = {};

  public currentCourse: CourseData | null = null;
  public lastMarbles: Marble[] = [];
  public lastRaceTime: number = 0;
  public simTickCounter: number = 0;
  public firstFinisherRecorded: boolean = false;
  public pendingZombieSpawns: Array<{ x: number; y: number; zombieType: ZombieType; roomId: number }> = [];

  public dispose() {
    if (this.eventQueue) {
      this.eventQueue.free();
      this.eventQueue = null;
    }
    if (this.world) {
      this.world.free();
      this.world = null;
    }
    this.chunkBodies = [];
    this.spinnerBodies.clear();
    this.pistonBodies.clear();
    this.pendulumBodies.clear();
    this.marbleBodies.clear();
    this.barricadeBodies.clear();
    this.colliderMeta.clear();
  }

  public addParticles(x: number, y: number, color: string, count = 6, speed = 4, type: CombatParticle['type'] = 'spark') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.5 + Math.random()) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: 2 + Math.random() * 2.5,
        alpha: 1.0,
        lifetime: 0.35 + Math.random() * 0.25,
        maxLifetime: 0.6,
        type,
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 7),
      x,
      y,
      text,
      color,
      alpha: 1.0,
      lifetime: 0.9,
      maxLifetime: 0.9,
    });
  }

  public addCombatEvent(text: string, color: string) {
    this.combatFeed.unshift({
      id: Math.random().toString(36).substring(2, 7),
      text,
      color,
      time: this.lastRaceTime,
    });
    if (this.combatFeed.length > 6) {
      this.combatFeed.pop();
    }
  }



  // =========================================================================
  // PLAYER COMMANDER POWERS (EMP, BARRICADE, AIRDROP)
  // =========================================================================




  // =========================================================================
  // TARGETED MARBLE ABILITIES (BOOST, SHIELD, HEAL)
  // =========================================================================




  // =========================================================================
  // DAMAGE & INFECTION HELPER
  // =========================================================================



  /** Seeded stream for every gameplay-affecting roll (cosmetics keep Math.random). */
  public rng: () => number = createGameplayRng(undefined);
  public idCounter = 0;
  public activeMask = -1;
  public marbleById: Map<string, Marble> = new Map();
  public exitTargets: Array<{ x: number; y: number } | undefined> = [];

  public nextId(prefix: string): string {
    return `${prefix}_${(this.idCounter++).toString(36)}`;
  }




  /** Exit target per room never changes during a race, so it is computed once and cached (treat as read-only). */
  public getRoomExitTarget(course: CourseData, room: { x: number; y: number; nextDir?: 'n' | 'e' | 's' | 'w' | null; id: number }) {
    const cached = this.exitTargets[room.id];
    if (cached) return cached;
    let t: { x: number; y: number };
    const half = ROOM_SIZE / 2;
    if (room.id === 24 || !room.nextDir) t = { x: course.finishX, y: course.finishY };
    else if (room.nextDir === 'e') t = { x: room.x + ROOM_SIZE - 16, y: room.y + half };
    else if (room.nextDir === 'w') t = { x: room.x + 16, y: room.y + half };
    else if (room.nextDir === 'n') t = { x: room.x + half, y: room.y + 16 };
    else t = { x: room.x + half, y: room.y + ROOM_SIZE - 16 };
    this.exitTargets[room.id] = t;
    return t;
  }

  /** Reusable per-tick context shared by the update stages (avoids per-tick allocation). */
  public tickCtx: TickCtx = {
    course: null as unknown as CourseData,
    marbles: [],
    raceTime: 0,
    effectiveDt: 0,
    stepScale: 0,
    onFinishFirst: () => {},
    finishedCount: 0,
  };

  public createMarbleBody(m: Marble): RAPIER.RigidBody | null {
    return createMarbleBody(this, m);
  }

  public init(course: CourseData, marbles: Marble[]) {
    buildWorld(this, course, marbles);
  }

  public spawnNpcZombie(x: number, y: number, zombieType: ZombieType, roomId: number) {
    spawnNpcZombie(this, x, y, zombieType, roomId);
  }

  public triggerEmpShockwave(targetX: number, targetY: number) {
    triggerEmpShockwave(this, targetX, targetY);
  }

  public deployBarricade(targetX: number, targetY: number) {
    deployBarricade(this, targetX, targetY);
  }

  public deployAirdrop(targetX: number, targetY: number, course: CourseData) {
    deployAirdrop(this, targetX, targetY, course);
  }

  public triggerMarbleBoost(marbleId: string): boolean {
    return triggerMarbleBoost(this, marbleId);
  }

  public triggerMarbleShield(marbleId: string): boolean {
    return triggerMarbleShield(this, marbleId);
  }

  public triggerMarbleHeal(marbleId: string): boolean {
    return triggerMarbleHeal(this, marbleId);
  }

  public applyHumanDamage(human: Marble, attackerZombie?: Marble) {
    applyHumanDamage(this, human, attackerZombie);
  }

  public processCollisions(marbles: Marble[]) {
    processCollisions(this, marbles);
  }

  public damageZombie(z: Marble, dmg: number, pushVxPx: number, pushVyPx: number, attacker: Marble) {
    damageZombie(this, z, dmg, pushVxPx, pushVyPx, attacker);
  }

  public update(
    course: CourseData,
    marbles: Marble[],
    dt: number,
    simSpeed: number,
    raceTime: number,
    onFinishFirst: (winner: Marble) => void
  ) {
    if (!this.world || !this.eventQueue) return;
    if (this.currentCourse !== course) {
      this.init(course, marbles);
    }

    this.lastMarbles = marbles;
    if (this.marbleById.size !== marbles.length) {
      this.marbleById.clear();
      for (let i = 0; i < marbles.length; i++) this.marbleById.set(marbles[i].id, marbles[i]);
    }
    this.lastRaceTime = raceTime;
    this.simTickCounter++;

    const effectiveDt = dt * simSpeed;
    const stepScale = effectiveDt * 60; // Normalized to 60Hz feel for non-Rapier scalar particles/projectiles
    const c = this.tickCtx;
    c.course = course;
    c.marbles = marbles;
    c.raceTime = raceTime;
    c.effectiveDt = effectiveDt;
    c.stepScale = stepScale;
    c.onFinishFirst = onFinishFirst;
    c.finishedCount = 0;

    updateActiveRooms(this, c);
    updateHazards(this, c);
    updateSteering(this, c);
    updateProjectiles(this, c);

    // 5. Step Rapier2D WASM World & Drain Collision Events
    this.world.timestep = effectiveDt;
    this.world.step(this.eventQueue);
    this.processCollisions(marbles);

    syncBodies(this, c);
    recordReplayAndRank(this, c);
  }
}

export const matterRaceEngine = new RapierRaceEngine();

export function updateSimulation(
  course: CourseData,
  marbles: Marble[],
  dt: number,
  simSpeed: number,
  raceTime: number,
  onFinishFirst: (winner: Marble) => void
) {
  matterRaceEngine.update(course, marbles, dt, simSpeed, raceTime, onFinishFirst);
}

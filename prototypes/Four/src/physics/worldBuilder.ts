/** Rapier world construction: marble bodies and the labyrinth colliders for a course. */
import RAPIER from '@dimforge/rapier2d-compat';
import type { Marble, CourseData } from '../types';
import { ZOMBIE_SPECS } from '../constants';
import { createGameplayRng } from '../rng';
import { physicsConfig } from '../physicsConfig';
import { WORLD_W, WORLD_H, SCALE, INV_SCALE } from './constants';
import { getActiveChunkIndices } from './spatial';
import { isPhysicsReady } from './rapier';
import type { RapierRaceEngine } from './engine';

export function createMarbleBody(eng: RapierRaceEngine, m: Marble): RAPIER.RigidBody | null {
  if (!eng.world) return null;

  // Convert initial px/tick-style velocity into m/s (approx 60/50 factor)
  const initVx = (m.vx || 0) * (60 / SCALE);
  const initVy = (m.vy || 0) * (60 / SCALE);

  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(m.x * INV_SCALE, m.y * INV_SCALE)
    .setLinvel(initVx, initVy)
    .setCcdEnabled(true)
    .setLinearDamping(0.24)
    .setAngularDamping(0.38)
    .setCanSleep(false);

  const body = eng.world!.createRigidBody(bodyDesc);
  const colliderDesc = RAPIER.ColliderDesc.ball((m.radius || 12.5) * INV_SCALE)
    .setMass(m.mass || 1.0)
    .setFriction(0.34)
    .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Average)
    .setRestitution(Math.min(0.88, m.restitution ?? 0.48))
    .setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max)
    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

  const collider = eng.world!.createCollider(colliderDesc, body);
  eng.marbleBodies.set(m.id, body);
  eng.colliderMeta.set(collider.handle, { kind: 'marble', marbleId: m.id });
  return body;
}

export function buildWorld(eng: RapierRaceEngine, course: CourseData, marbles: Marble[]) {
  if (!isPhysicsReady()) {
    throw new Error('Rapier2D WASM engine has not finished initializing.');
  }

  eng.dispose();
  eng.currentCourse = course;
  eng.lastMarbles = marbles;
  eng.rng = createGameplayRng(course.seed);
  eng.idCounter = 0;
  eng.activeMask = -1;
  eng.marbleById.clear();
  for (let i = 0; i < marbles.length; i++) eng.marbleById.set(marbles[i].id, marbles[i]);
  eng.exitTargets = [];

  // Heavier, grounded gravity in m/s² for weighty rolling momentum
  eng.world = new RAPIER.World({ x: 0, y: 18.0 });
  eng.world!.timestep = 1 / physicsConfig.hz;
  eng.world!.numSolverIterations = physicsConfig.solverIterations;
  eng.world!.maxCcdSubsteps = physicsConfig.ccdSubsteps;
  eng.eventQueue = new RAPIER.EventQueue(true);

  eng.activeChunkIndices = [];
  eng.projectiles = [];
  eng.particles = [];
  eng.floatingTexts = [];
  eng.barricades = [];
  eng.combatFeed = [];
  eng.highlightEvents = [];
  eng.replayFrames = [];
  eng.pendingFocus = null;
  eng.pendingDamageFlash = false;
  eng.roomDamageCounts = {};
  eng.simTickCounter = 0;
  eng.firstFinisherRecorded = false;
  eng.pendingZombieSpawns = [];

  // Outer containment arena walls enclosing 0..2500 x 0..2500px (0..50m x 0..50m)
  const addBound = (cx: number, cy: number, w: number, h: number) => {
    if (!eng.world) return;
    const rb = eng.world!.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(cx * INV_SCALE, cy * INV_SCALE)
    );
    eng.world!.createCollider(
      RAPIER.ColliderDesc.cuboid((w / 2) * INV_SCALE, (h / 2) * INV_SCALE)
        .setRestitution(0.35)
        .setFriction(0.22),
      rb
    );
  };
  addBound(WORLD_W / 2, -60, WORLD_W + 400, 120);
  addBound(WORLD_W / 2, WORLD_H + 60, WORLD_W + 400, 120);
  addBound(-60, WORLD_H / 2, 120, WORLD_H + 400);
  addBound(WORLD_W + 60, WORLD_H / 2, 120, WORLD_H + 400);

  // Pre-build Rapier bodies per room (disabled when inactive for zero-allocation O(1) room toggling)
  for (let c = 0; c < course.chunks.length; c++) {
    const chunk = course.chunks[c];
    const bodiesForRoom: RAPIER.RigidBody[] = [];
    const spinnersForRoom: RAPIER.RigidBody[] = [];

    // Walls: single seamless capsule per segment matching visual thickness (11px outer wall, 7px guide rail)
    for (let i = 0; i < chunk.walls.length; i++) {
      const w = chunk.walls[i];
      const cx = (w.x1 + w.x2) / 2;
      const cy = (w.y1 + w.y2) / 2;
      const dx = w.x2 - w.x1;
      const dy = w.y2 - w.y1;
      const len = Math.hypot(dx, dy) || 1;
      const angle = Math.atan2(dy, dx);
      const capRadius = w.kind === 'guide' ? 7 : 11;

      const wallBody = eng.world!.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
          .setTranslation(cx * INV_SCALE, cy * INV_SCALE)
          .setRotation(angle - Math.PI / 2)
          .setEnabled(false)
      );
      const wallCol = eng.world!.createCollider(
        RAPIER.ColliderDesc.capsule((len / 2) * INV_SCALE, capRadius * INV_SCALE)
          .setRestitution(w.bounce ?? 0.38)
          .setFriction(w.kind === 'guide' ? 0.08 : 0.22)
          .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
        wallBody
      );
      eng.colliderMeta.set(wallCol.handle, { kind: 'wall' });
      bodiesForRoom.push(wallBody);
    }

    // Bumpers
    for (let i = 0; i < chunk.bumpers.length; i++) {
      const b = chunk.bumpers[i];
      const bBody = eng.world!.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
          .setTranslation(b.x * INV_SCALE, b.y * INV_SCALE)
          .setEnabled(false)
      );
      const bCol = eng.world!.createCollider(
        RAPIER.ColliderDesc.ball(b.r * INV_SCALE)
          .setRestitution(Math.min(1.0, b.bounce ?? 0.95))
          .setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max)
          .setFriction(0.05)
          .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
        bBody
      );
      eng.colliderMeta.set(bCol.handle, {
        kind: 'bumper',
        x: b.x,
        y: b.y,
        bounce: b.bounce ?? 1.3,
      });
      bodiesForRoom.push(bBody);
    }

    // Spinners (Kinematic Position-Based Rotating Compound Colliders)
    for (let i = 0; i < chunk.spinners.length; i++) {
      const s = chunk.spinners[i];
      const sBody = eng.world!.createRigidBody(
        RAPIER.RigidBodyDesc.kinematicPositionBased()
          .setTranslation(s.x * INV_SCALE, s.y * INV_SCALE)
          .setRotation(s.angle)
          .setEnabled(false)
      );
      const hubCol = eng.world!.createCollider(
        RAPIER.ColliderDesc.ball(12 * INV_SCALE).setRestitution(0.55).setFriction(0.2),
        sBody
      );
      eng.colliderMeta.set(hubCol.handle, { kind: 'spinner' });

      for (let a = 0; a < s.arms; a++) {
        const ang = (a * 2 * Math.PI) / s.arms;
        const ax = Math.cos(ang) * (s.r / 2) * INV_SCALE;
        const ay = Math.sin(ang) * (s.r / 2) * INV_SCALE;
        const armCol = eng.world!.createCollider(
          RAPIER.ColliderDesc.cuboid((s.r / 2) * INV_SCALE, 5 * INV_SCALE)
            .setTranslation(ax, ay)
            .setRotation(ang)
            .setRestitution(0.6)
            .setFriction(0.2)
            .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
          sBody
        );
        eng.colliderMeta.set(armCol.handle, { kind: 'spinner' });
      }

      spinnersForRoom.push(sBody);
      bodiesForRoom.push(sBody);
    }

    // Pistons (Kinematic Position-Based Cuboids aligned with top-left renderer box)
    if (chunk.pistons) {
      for (let i = 0; i < chunk.pistons.length; i++) {
        const p = chunk.pistons[i];
        const pBody = eng.world!.createRigidBody(
          RAPIER.RigidBodyDesc.kinematicPositionBased()
            .setTranslation((p.x + p.w / 2) * INV_SCALE, (p.y + p.h / 2) * INV_SCALE)
            .setEnabled(false)
        );
        const pCol = eng.world!.createCollider(
          RAPIER.ColliderDesc.cuboid((p.w / 2) * INV_SCALE, (p.h / 2) * INV_SCALE)
            .setRestitution(0.85)
            .setFriction(0.2)
            .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
          pBody
        );
        eng.colliderMeta.set(pCol.handle, { kind: 'piston' });
        eng.pistonBodies.set(p.id, pBody);
        bodiesForRoom.push(pBody);
      }
    }

    // Pendulums (Kinematic Position-Based Metallic Bobs)
    if (chunk.pendulums) {
      for (let i = 0; i < chunk.pendulums.length; i++) {
        const pend = chunk.pendulums[i];
        const bobBody = eng.world!.createRigidBody(
          RAPIER.RigidBodyDesc.kinematicPositionBased()
            .setTranslation(pend.pivotX * INV_SCALE, (pend.pivotY + pend.length) * INV_SCALE)
            .setEnabled(false)
        );
        const bobCol = eng.world!.createCollider(
          RAPIER.ColliderDesc.ball(pend.bobRadius * INV_SCALE)
            .setRestitution(0.88)
            .setFriction(0.15)
            .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
          bobBody
        );
        eng.colliderMeta.set(bobCol.handle, { kind: 'pendulum' });
        eng.pendulumBodies.set(pend.id, bobBody);
        bodiesForRoom.push(bobBody);
      }
    }

    eng.spinnerBodies.set(chunk.id, spinnersForRoom);
    eng.chunkBodies.push(bodiesForRoom);
  }

  // Create dynamic CCD-enabled bodies for player marbles
  for (let i = 0; i < marbles.length; i++) {
    const m = marbles[i];
    if (m.isZombie && !m.zombieType) {
      m.zombieType = 'walker';
      const spec = ZOMBIE_SPECS.walker;
      m.zhp = spec.hp;
      m.maxZhp = spec.hp;
      m.zSpeedMult = spec.speedMult;
      m.zForceMult = spec.forceMult;
    }
    eng.createMarbleBody(m);
  }

  // Spawn wandering patrol zombies across deeper rooms
  if (course.roomZombies && course.roomZombies.length > 0) {
    for (const rz of course.roomZombies) {
      eng.spawnNpcZombie(rz.x, rz.y, rz.zombieType, rz.chunkId);
    }
  }

  // Initial dynamic room activation
  eng.activeChunkIndices = getActiveChunkIndices(course, eng.lastMarbles, [], []);
  for (const idx of eng.activeChunkIndices) {
    const bodies = eng.chunkBodies[idx];
    if (bodies) {
      for (let i = 0; i < bodies.length; i++) {
        bodies[i].setEnabled(true);
      }
    }
  }
}

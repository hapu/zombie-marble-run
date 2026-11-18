/** Update stage 3: steering, weapons and zombie AI. */
import type { Marble } from '../types';
import { WEAPON_SPECS, ROOM_SIZE } from '../constants';
import { sound } from '../audio';
import { ticksAtCurrentRate, dampingForDt } from '../physicsConfig';
import { getChunkIndexAt } from './spatial';
import type { TickCtx } from './types';
import type { RapierRaceEngine } from './engine';

/** Stage 3: steering forces, boosters, elevators, weapons and zombie AI for every marble. */
export function updateSteering(eng: RapierRaceEngine, c: TickCtx): void {
  const { course, marbles, raceTime, effectiveDt } = c;
  for (let idx = 0; idx < marbles.length; idx++) {
    const m = marbles[idx];
    if (m.gone) continue;
    const body = eng.marbleBodies.get(m.id);
    if (!body) continue;

    const vel = body.linvel();
    const mass = body.mass();

    if (m.finished) {
      const damp = dampingForDt(0.94, effectiveDt);
      body.setLinvel({ x: vel.x * damp, y: vel.y * damp }, true);
      continue;
    }

    const roomIdx = getChunkIndexAt(course, m.x, m.y);
    m.currentRoomId = roomIdx;
    const room = course.chunks[roomIdx];

    // Active Turbo / Boost surge
    if ((m.turboTime && m.turboTime > raceTime) || (m.boostUntil && m.boostUntil > raceTime)) {
      const curSpd = Math.hypot(vel.x, vel.y) || 1;
      body.addForce({ x: (vel.x / curSpd) * 18.0 * mass, y: (vel.y / curSpd) * 18.0 * mass }, true);
    }

    if (m.isZombie) {
      let nearestHuman: Marble | null = null;
      let minHDist = 360;
      let minH2 = 360 * 360;
      for (let j = 0; j < marbles.length; j++) {
        const other = marbles[j];
        if (!other.isZombie && !other.finished && !other.gone) {
          const ex = other.x - m.x;
          const ey = other.y - m.y;
          const d2 = ex * ex + ey * ey;
          if (d2 < minH2) {
            minH2 = d2;
            nearestHuman = other;
          }
        }
      }
      if (nearestHuman) minHDist = Math.hypot(nearestHuman.x - m.x, nearestHuman.y - m.y);
      const fMult = m.zForceMult ?? 1.0;
      if (nearestHuman) {
        const dirX = (nearestHuman.x - m.x) / (minHDist || 1);
        const dirY = (nearestHuman.y - m.y) / (minHDist || 1);
        body.addForce({ x: dirX * 14.5 * fMult * mass, y: dirY * 14.5 * fMult * mass }, true);
      } else if (room && !m.id.startsWith('npc_')) {
        const targetPt = eng.getRoomExitTarget(course, room);
        const dx = targetPt.x - m.x;
        const dy = targetPt.y - m.y;
        const d = Math.hypot(dx, dy) || 1;
        body.addForce({ x: (dx / d) * 10.5 * fMult * mass, y: (dy / d) * 10.5 * fMult * mass }, true);
      }
    } else {
      // Living Survivor: Smooth BFS Maze Exit Steering + Corridor Centering + Auto-Target Weapons
      if (room) {
        const targetPt = eng.getRoomExitTarget(course, room);
        const dx = targetPt.x - m.x;
        const dy = targetPt.y - m.y;
        const d = Math.hypot(dx, dy) || 1;
        const spd = Math.hypot(vel.x, vel.y);
        const steerMag = room.nextDir === 'n' ? 20.5 : spd < 2.6 ? 15.5 : 11.8;

        // Gentle corridor-centering bias so marbles glide cleanly through doorway openings
        let alignFx = 0;
        let alignFy = 0;
        if (room.nextDir === 'e' || room.nextDir === 'w') {
          alignFy = ((room.y + ROOM_SIZE / 2) - m.y) * 0.045;
        } else if (room.nextDir === 'n' || room.nextDir === 's') {
          alignFx = ((room.x + ROOM_SIZE / 2) - m.x) * 0.045;
        }

        body.addForce(
          {
            x: ((dx / d) * steerMag + alignFx) * mass,
            y: ((dy / d) * steerMag + alignFy) * mass,
          },
          true
        );
      }

      // Weapons update
      m.weaponCooldown = Math.max(0, (m.weaponCooldown || 0) - effectiveDt);
      if (m.weaponUpgradeTimer && m.weaponUpgradeTimer > 0) {
        m.weaponUpgradeTimer -= effectiveDt;
        if (m.weaponUpgradeTimer <= 0) m.weaponType = 'blaster';
      }

      const wSpec = WEAPON_SPECS[m.weaponType || 'blaster'] || WEAPON_SPECS.blaster;
      let nearestZombie: Marble | null = null;
      let minZ2 = wSpec.range * wSpec.range;

      for (let j = 0; j < marbles.length; j++) {
        const other = marbles[j];
        if (other.isZombie && !other.finished && !other.gone) {
          const ex = other.x - m.x;
          const ey = other.y - m.y;
          const d2 = ex * ex + ey * ey;
          if (d2 < minZ2) {
            minZ2 = d2;
            nearestZombie = other;
          }
        }
      }

      if (nearestZombie) {
        const aim = Math.atan2(nearestZombie.y - m.y, nearestZombie.x - m.x);
        m.aimAngle = aim;

        if ((m.weaponCooldown || 0) <= 0) {
          m.weaponCooldown = wSpec.cooldown;

          if (wSpec.isMelee) {
            sound.playImpact(7, 1.0, 220);
            const nx = Math.cos(aim);
            const ny = Math.sin(aim);
            eng.projectiles.push({
              id: eng.nextId('melee'),
              x1: m.x,
              y1: m.y,
              x: nearestZombie.x,
              y: nearestZombie.y,
              vx: nx * 0.01,
              vy: ny * 0.01,
              ownerId: m.id,
              lifetime: 0.14,
              maxLifetime: 0.14,
              color: wSpec.color,
              isMelee: true,
            });
            eng.damageZombie(nearestZombie, wSpec.damage, nx * wSpec.knockback, ny * wSpec.knockback, m);
          } else {
            sound.playLaserShot();
            const pellets = wSpec.pellets || 1;
            const pSpeed = wSpec.id === 'rifle' ? 25 : 19;
            const spreadArc = wSpec.id === 'shotgun' ? 0.34 : 0.22;

            for (let p = 0; p < pellets; p++) {
              const angleOffset = pellets === 1 ? 0 : ((p / (pellets - 1)) - 0.5) * spreadArc;
              const sa = aim + angleOffset;
              eng.projectiles.push({
                id: eng.nextId('p'),
                x: m.x + Math.cos(sa) * (m.radius + 3),
                y: m.y + Math.sin(sa) * (m.radius + 3),
                vx: Math.cos(sa) * pSpeed,
                vy: Math.sin(sa) * pSpeed,
                ownerId: m.id,
                lifetime: wSpec.id === 'rifle' ? 0.6 : 0.45,
                maxLifetime: wSpec.id === 'rifle' ? 0.6 : 0.45,
                color: wSpec.color || m.color,
                damage: wSpec.damage,
                knockback: wSpec.knockback,
              });
            }
          }
        }
      } else {
        m.aimAngle = Math.atan2(m.vy || 1, m.vx || 0);
      }
    }

    // Elevators / Air-Lift shafts in active rooms
    let inElevator = false;
    for (const cIdx of eng.activeChunkIndices) {
      const ch = course.chunks[cIdx];
      if (!ch) continue;
      for (let i = 0; i < ch.elevators.length; i++) {
        const el = ch.elevators[i];
        if (m.x >= el.x && m.x <= el.x + el.w && m.y >= el.y && m.y <= el.y + el.h) {
          inElevator = true;
          const centerPullX = ((el.x + el.w / 2) - m.x) * 0.09;
          const targetVy = (el.liftSpeed || -6.5) * 1.25;
          body.setLinvel(
            {
              x: Math.max(-4.5, Math.min(4.5, vel.x * 0.85 + centerPullX)),
              y: targetVy,
            },
            true
          );
          sound.playBoosterZap();
          break;
        }
      }
      if (inElevator) break;
    }

    // Boosters in active rooms
    for (const cIdx of eng.activeChunkIndices) {
      const ch = course.chunks[cIdx];
      if (!ch) continue;
      let boosted = false;
      for (let i = 0; i < ch.boosters.length; i++) {
        const b = ch.boosters[i];
        if (m.x >= b.x && m.x <= b.x + b.w && m.y >= b.y && m.y <= b.y + b.h) {
          body.addForce({ x: b.forceX * 16.0 * mass, y: b.forceY * 16.0 * mass }, true);
          sound.playBoosterZap();
          boosted = true;
          break;
        }
      }
      if (boosted) break;
    }

    // Anti-stuck safeguard
    if (!inElevator) {
      const moveDist = Math.hypot(m.x - (m.lastX ?? m.x), m.y - (m.lastY ?? m.y));
      if (moveDist < 0.08) {
        m.stuckFrames = (m.stuckFrames || 0) + 1;
      } else {
        m.stuckFrames = 0;
        m.lastX = m.x;
        m.lastY = m.y;
      }

      if ((m.stuckFrames || 0) > ticksAtCurrentRate(220) && room && !m.isZombie) {
        m.stuckFrames = 0;
        const exitPt = eng.getRoomExitTarget(course, room);
        const dirX = exitPt.x - m.x;
        const dirY = exitPt.y - m.y;
        const d = Math.hypot(dirX, dirY) || 1;
        body.setLinvel({ x: (dirX / d) * 8.0, y: (dirY / d) * 8.0 - 2.0 }, true);
        eng.addParticles(m.x, m.y, '#38bdf8', 8, 3);
      }
    }
  }

}

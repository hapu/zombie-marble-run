/** Update stages 6-7: body sync, extraction/progress, replay recording and standings. */
import { ROOM_SIZE } from '../constants';
import { sound } from '../audio';
import { ticksAtCurrentRate } from '../physicsConfig';
import { WORLD_W, WORLD_H, SCALE, INV_SCALE } from './constants';
import { getChunkIndexAt } from './spatial';
import type { TickCtx } from './types';
import type { RapierRaceEngine } from './engine';

/** Stage 6: copy Rapier state back to marbles, clamp speed, recover out-of-bounds, handle extraction and progress. */
export function syncBodies(eng: RapierRaceEngine, c: TickCtx): void {
  const { course, marbles, raceTime, effectiveDt, onFinishFirst } = c;
  const maxDist = course.maxDistToFinish || 12;

  for (let idx = 0; idx < marbles.length; idx++) {
    const m = marbles[idx];
    if (m.gone) continue;
    const body = eng.marbleBodies.get(m.id);
    if (!body) continue;

    const vel = body.linvel();
    const maxSpd = m.isZombie ? 12.6 * (m.zSpeedMult ?? 1.0) : m.boostUntil && m.boostUntil > raceTime ? 15.6 : 14.4;
    const spd = Math.hypot(vel.x, vel.y);
    if (spd > maxSpd) {
      body.setLinvel({ x: (vel.x / spd) * maxSpd, y: (vel.y / spd) * maxSpd }, true);
    }

    const pos = body.translation();
    let px = pos.x * SCALE;
    let py = pos.y * SCALE;

    const isOutOfBounds = isNaN(px) || isNaN(py) || px < 15 || px > WORLD_W - 15 || py < 15 || py > WORLD_H - 15;
    if (isOutOfBounds) {
      const fallbackRoom = course.chunks[m.currentRoomId ?? 0] || course.chunks[0];
      px = fallbackRoom.x + ROOM_SIZE / 2;
      py = fallbackRoom.y + ROOM_SIZE / 2;
      body.setTranslation({ x: px * INV_SCALE, y: py * INV_SCALE }, true);
      body.setLinvel({ x: 0, y: 1.5 }, true);
    }

    const clampedVel = body.linvel();
    m.x = px;
    m.y = py;
    m.vx = clampedVel.x * (SCALE / 60);
    m.vy = clampedVel.y * (SCALE / 60);
    m.angle = body.rotation();
    m.omega = body.angvel();

    const rIdx = getChunkIndexAt(course, m.x, m.y);
    m.currentRoomId = rIdx;
    const room = course.chunks[rIdx];

    // Finish Bunker Extraction in Room 24
    if (!m.finished && rIdx === 24) {
      const distToFinish = Math.hypot(m.x - course.finishX, m.y - course.finishY);
      if (distToFinish < 115) {
        if (m.isZombie && m.id.startsWith('npc_')) {
          m.gone = true;
          for (let ci = 0; ci < body.numColliders(); ci++) {
            eng.colliderMeta.delete(body.collider(ci).handle);
          }
          eng.world!.removeRigidBody(body);
          eng.marbleBodies.delete(m.id);
        } else {
          m.finished = true;
          m.isExtracted = !m.isZombie;
          m.finishTime = raceTime + effectiveDt;
          c.finishedCount++;
          m.finishPosition = c.finishedCount;
          if (!eng.firstFinisherRecorded && m.isExtracted) {
            eng.firstFinisherRecorded = true;
            sound.playVictory();
            eng.highlightEvents.push({
              t: raceTime,
              marbleId: m.id,
              text: `🏁 ¡${m.name} escapó primero!`,
              color: m.color,
              weight: 10,
              kind: 'win',
            });
            eng.pendingFocus = {
              x: m.x,
              y: m.y,
              color: m.color,
              text: `🏁 ¡${m.name} ESCAPÓ PRIMERO!`,
              durationSec: 1.4,
            };
            onFinishFirst(m);
          } else {
            sound.playCheckpoint();
          }
        }
      }
    }

    // BFS Labyrinth Progress Score
    if (!m.finished && room) {
      const distRem = room.distToFinish ?? maxDist;
      const exitPt = eng.getRoomExitTarget(course, room);
      const dToExit = Math.hypot(exitPt.x - m.x, exitPt.y - m.y);
      const subProgress = Math.max(0, Math.min(0.98, 1 - dToExit / ROOM_SIZE));
      m.progressScore = Math.max(0, maxDist - distRem) + subProgress;
    } else if (m.finished) {
      m.progressScore = maxDist + 10 - (m.finishPosition || 10);
    }
  }

}

/** Stage 7: record replay snapshots, then sort standings and assign ranks. */
export function recordReplayAndRank(eng: RapierRaceEngine, c: TickCtx): void {
  const { marbles, raceTime } = c;
  if (eng.simTickCounter % ticksAtCurrentRate(6) === 0 && eng.replayFrames.length < 4000) {
    eng.replayFrames.push({
      t: raceTime,
      marbles: marbles.map((m) => ({
        id: m.id,
        x: m.x,
        y: m.y,
        angle: m.angle,
        isZombie: m.isZombie,
        zombieType: m.zombieType,
        hp: m.hp,
        zhp: m.zhp,
        maxZhp: m.maxZhp,
        finished: m.finished,
        isExtracted: m.isExtracted,
        gone: m.gone,
        shield: m.shield,
        weaponType: m.weaponType,
        radius: m.radius,
      })),
    });
  }

  // Sort standings
  marbles.sort((a, b) => {
    if (a.isExtracted && !b.isExtracted) return -1;
    if (!a.isExtracted && b.isExtracted) return 1;
    if (a.isExtracted && b.isExtracted) return (a.finishPosition || 0) - (b.finishPosition || 0);

    if (!a.isZombie && b.isZombie) return -1;
    if (a.isZombie && !b.isZombie) return 1;

    if (!a.isZombie && !b.isZombie) return b.progressScore - a.progressScore;

    const aIsNpc = a.id.startsWith('npc_');
    const bIsNpc = b.id.startsWith('npc_');
    if (!aIsNpc && bIsNpc) return -1;
    if (aIsNpc && !bIsNpc) return 1;

    if ((b.kills || 0) !== (a.kills || 0)) return (b.kills || 0) - (a.kills || 0);
    return b.progressScore - a.progressScore;
  });

  let rankCounter = 1;
  for (let i = 0; i < marbles.length; i++) {
    if (!marbles[i].id.startsWith('npc_')) {
      marbles[i].rank = rankCounter++;
    } else {
      marbles[i].rank = 99;
    }
  }
}

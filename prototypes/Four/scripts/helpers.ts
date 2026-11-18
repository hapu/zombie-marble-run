import { generateCourse } from '../src/courseGenerator';
import { DEFAULT_MARBLE_COLORS, ZOMBIE_SPECS } from '../src/constants';
import { createGameplayRng } from '../src/rng';
import type { Marble } from '../src/types';

export function buildMarbles(course: ReturnType<typeof generateCourse>, numPz = 2): Marble[] {
  const rng = createGameplayRng(course.seed, 'spawn');
  const defs = DEFAULT_MARBLE_COLORS;
  return defs.map((def, idx) => {
    const pz = idx >= defs.length - numPz;
    const x = course.startX + ((idx % 5) - 2) * 26;
    const y = course.startY + Math.floor(idx / 5) * 24;
    return {
      id: def.id, name: def.name, color: def.color, border: def.border,
      mass: def.mass ?? 1, restitution: def.restitution ?? 0.5, materialType: def.materialType ?? 'glass',
      x, y, vx: (rng() - 0.5) * 1.5, vy: 1 + rng(), angle: 0, omega: 0,
      prevX: x, prevY: y, prevAngle: 0, renderX: x, renderY: y, renderAngle: 0,
      radius: 12.5, rank: idx + 1, finished: false, finishTime: null, finishPosition: null,
      currentCheckpointIdx: 0, progressScore: 0, history: [],
      isZombie: pz, zombieType: pz ? 'runner' : undefined,
      zhp: pz ? ZOMBIE_SPECS.runner.hp : undefined, maxZhp: pz ? ZOMBIE_SPECS.runner.hp : undefined,
      zSpeedMult: pz ? ZOMBIE_SPECS.runner.speedMult : undefined, zForceMult: pz ? ZOMBIE_SPECS.runner.forceMult : undefined,
      hp: 5, maxHp: 5, shield: 0, infectionTime: pz ? 0 : null, kills: 0, isExtracted: false,
      weaponCooldown: 0, weaponType: 'blaster', weaponUpgradeTimer: 0, aimAngle: 0,
    } as Marble;
  });
}

export function stateHash(marbles: Marble[]): string {
  const h = marbles.slice().sort((x, y) => x.id.localeCompare(y.id))
    .map((m) => `${m.id}:${m.x.toFixed(3)},${m.y.toFixed(3)},${m.hp.toFixed(2)},${m.isZombie ? 1 : 0},${m.finished ? 1 : 0}`).join('|');
  let acc = 7;
  for (let i = 0; i < h.length; i++) acc = (acc * 31 + h.charCodeAt(i)) >>> 0;
  return `${marbles.length}:${acc}`;
}

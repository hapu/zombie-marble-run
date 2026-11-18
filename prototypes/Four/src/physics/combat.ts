/** Combat, powers, infection and collision handling. */
import RAPIER from '@dimforge/rapier2d-compat';
import type { Marble, CourseData, Bumper, PickupCrate, ZombieType } from '../types';
import { ZOMBIE_SPECS } from '../constants';
import { sound } from '../audio';
import { INV_SCALE } from './constants';
import { getChunkIndexAt } from './spatial';
import type { RapierRaceEngine } from './engine';

export function spawnNpcZombie(eng: RapierRaceEngine, x: number, y: number, zombieType: ZombieType, roomId: number) {
  const spec = ZOMBIE_SPECS[zombieType];
  const id = eng.nextId(`npc_${zombieType}`);
  const zm: Marble = {
    id,
    name: spec.label,
    color: spec.color,
    border: spec.border,
    mass: spec.mass,
    restitution: 0.44,
    materialType: 'dense',
    x,
    y,
    vx: (eng.rng() - 0.5) * 1.4,
    vy: (eng.rng() - 0.5) * 1.4,
    angle: 0,
    omega: 0,
    prevX: x,
    prevY: y,
    prevAngle: 0,
    renderX: x,
    renderY: y,
    renderAngle: 0,
    radius: spec.radius,
    rank: 99,
    finished: false,
    finishTime: null,
    finishPosition: null,
    currentCheckpointIdx: 0,
    progressScore: 0,
    history: [],
    isZombie: true,
    zombieType,
    zhp: spec.hp,
    maxZhp: spec.hp,
    zSpeedMult: spec.speedMult,
    zForceMult: spec.forceMult,
    hp: 0,
    maxHp: 5,
    shield: 0,
    infectionTime: 0,
    kills: 0,
    currentRoomId: roomId,
  };
  eng.lastMarbles.push(zm);
  eng.marbleById.set(zm.id, zm);
  eng.createMarbleBody(zm);
}

export function triggerEmpShockwave(eng: RapierRaceEngine, targetX: number, targetY: number) {
  sound.playEmpPower();
  eng.addParticles(targetX, targetY, '#38bdf8', 24, 8);
  eng.addFloatingText(targetX, targetY - 20, '💥 ONDA EMP!', '#38bdf8');
  eng.addCombatEvent('⚡ COMANDANTE detonó ONDA EMP', '#38bdf8');

  for (let i = 0; i < eng.lastMarbles.length; i++) {
    const m = eng.lastMarbles[i];
    if (!m.isZombie || m.finished || m.gone) continue;
    const dist = Math.hypot(m.x - targetX, m.y - targetY);
    if (dist < 400) {
      const body = eng.marbleBodies.get(m.id);
      if (body) {
        const pushX = (m.x - targetX) / (dist || 1);
        const pushY = (m.y - targetY) / (dist || 1);
        body.setLinvel({ x: pushX * 15.0, y: pushY * 15.0 - 3.5 }, true);
        eng.addParticles(m.x, m.y, '#67e8f9', 6, 3);
      }
    }
  }
}

export function deployBarricade(eng: RapierRaceEngine, targetX: number, targetY: number) {
  if (!eng.world) return;
  sound.playBarricade();
  const id = eng.nextId('barr');
  const bW = 120;
  const bH = 26;

  const bBody = eng.world!.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(targetX * INV_SCALE, targetY * INV_SCALE)
  );
  const bCol = eng.world!.createCollider(
    RAPIER.ColliderDesc.cuboid((bW / 2) * INV_SCALE, (bH / 2) * INV_SCALE)
      .setRestitution(0.75)
      .setFriction(0.15)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
    bBody
  );

  eng.colliderMeta.set(bCol.handle, { kind: 'barricade' });
  eng.barricadeBodies.set(id, bBody);
  eng.barricades.push({
    id,
    x: targetX,
    y: targetY,
    w: bW,
    h: bH,
    lifetime: 8.0,
    maxLifetime: 8.0,
  });

  eng.addParticles(targetX, targetY, '#06b6d4', 16, 5);
  eng.addFloatingText(targetX, targetY - 20, '🛡️ BARRICADA (8s)', '#06b6d4');
  eng.addCombatEvent('🛡️ BARRICADA HOLOGRÁFICA desplegada', '#06b6d4');
}

export function deployAirdrop(eng: RapierRaceEngine, targetX: number, targetY: number, course: CourseData) {
  sound.playAirdrop();
  const id = eng.nextId('crate_air');
  const types: PickupCrate['type'][] = ['shotgun', 'rifle', 'spread', 'rapid', 'sword', 'shield', 'repair'];
  const chosenType = types[Math.floor(eng.rng() * types.length)];

  const newCrate: PickupCrate = {
    id,
    chunkId: getChunkIndexAt(course, targetX, targetY),
    x: targetX,
    y: targetY,
    type: chosenType,
    active: true,
    respawnTimer: 0,
  };

  if (course.chunks[newCrate.chunkId]) {
    course.chunks[newCrate.chunkId].crates.push(newCrate);
  }
  course.crates.push(newCrate);

  eng.addParticles(targetX, targetY, '#f59e0b', 20, 6);
  eng.addFloatingText(targetX, targetY - 20, `📦 SUMINISTRO: ${chosenType.toUpperCase()}`, '#f59e0b');
  eng.addCombatEvent(`📦 SUMINISTRO AÉREO [${chosenType.toUpperCase()}]`, '#f59e0b');
}

export function triggerMarbleBoost(eng: RapierRaceEngine, marbleId: string): boolean {
  const m = eng.lastMarbles.find((x) => x.id === marbleId && !x.isZombie && !x.finished && !x.gone);
  if (!m) return false;
  const body = eng.marbleBodies.get(m.id);
  if (!body) return false;

  sound.playBoosterZap();
  m.boostUntil = eng.lastRaceTime + 3.0;
  m.turboTime = Math.max(m.turboTime || 0, eng.lastRaceTime + 3.0);
  const v = body.linvel();
  const spd = Math.hypot(v.x, v.y) || 1;
  const nx = v.x / spd;
  const ny = v.y / spd;
  body.setLinvel({ x: nx * 13.5, y: ny * 13.5 - 2.2 }, true);
  eng.addParticles(m.x, m.y, '#fde047', 16, 5.5);
  eng.addFloatingText(m.x, m.y - 16, '⚡ TURBO BOOST!', '#fde047');
  eng.addCombatEvent(`⚡ BOOST activado en ${m.name}`, '#fde047');
  return true;
}

export function triggerMarbleShield(eng: RapierRaceEngine, marbleId: string): boolean {
  const m = eng.lastMarbles.find((x) => x.id === marbleId && !x.isZombie && !x.finished && !x.gone);
  if (!m) return false;

  sound.playCratePickup();
  m.shield = 100;
  m.shieldUntil = eng.lastRaceTime + 5.0;
  eng.addParticles(m.x, m.y, '#38bdf8', 16, 4.5);
  eng.addFloatingText(m.x, m.y - 16, '🛡️ ESCUDO 5s!', '#38bdf8');
  eng.addCombatEvent(`🛡️ ESCUDO activo en ${m.name}`, '#38bdf8');
  return true;
}

export function triggerMarbleHeal(eng: RapierRaceEngine, marbleId: string): boolean {
  const m = eng.lastMarbles.find((x) => x.id === marbleId && !x.isZombie && !x.finished && !x.gone);
  if (!m || m.hp >= m.maxHp) return false;

  sound.playCratePickup();
  m.hp = Math.min(m.maxHp, m.hp + 2);
  eng.addParticles(m.x, m.y, '#4ade80', 16, 4.5);
  eng.addFloatingText(m.x, m.y - 16, '❤️ +2 HP!', '#4ade80');
  eng.addCombatEvent(`❤️ ${m.name} recuperó +2 HP`, '#4ade80');
  return true;
}

export function applyHumanDamage(eng: RapierRaceEngine, human: Marble, attackerZombie?: Marble) {
  if (human.finished || human.isZombie || human.gone) return;
  if ((human.hitCooldownUntil || 0) > eng.lastRaceTime) return;

  const hBody = eng.marbleBodies.get(human.id);

  if (human.shield > 0 || (human.shieldUntil || 0) > eng.lastRaceTime) {
    human.shield = Math.max(0, human.shield - 50);
    human.hitCooldownUntil = eng.lastRaceTime + 0.55;
    if (attackerZombie) {
      const zBody = eng.marbleBodies.get(attackerZombie.id);
      if (zBody && hBody) {
        const hp = hBody.translation();
        const zp = zBody.translation();
        const dx = zp.x - hp.x;
        const dy = zp.y - hp.y;
        const d = Math.hypot(dx, dy) || 1;
        zBody.setLinvel({ x: (dx / d) * 11.5, y: (dy / d) * 11.5 }, true);
      }
    }
    sound.playBumper(360);
    eng.addParticles(human.x, human.y, '#38bdf8', 10, 4.5);
    eng.addFloatingText(human.x, human.y - 14, '🛡️ BLOQUEADO!', '#38bdf8');
    return;
  }

  human.hitCooldownUntil = eng.lastRaceTime + 0.7;
  human.hp = Math.max(0, human.hp - 1);

  const rIdx = human.currentRoomId ?? (eng.currentCourse ? getChunkIndexAt(eng.currentCourse, human.x, human.y) : 0);
  eng.roomDamageCounts[rIdx] = (eng.roomDamageCounts[rIdx] || 0) + 1;

  if (eng.followedMarbleId === human.id) {
    eng.pendingDamageFlash = true;
  }

  if (human.hp <= 0) {
    human.isZombie = true;
    human.zombieType = 'walker';
    const wSpec = ZOMBIE_SPECS.walker;
    human.zhp = wSpec.hp;
    human.maxZhp = wSpec.hp;
    human.zSpeedMult = wSpec.speedMult;
    human.zForceMult = wSpec.forceMult;
    human.infectionTime = eng.lastRaceTime;
    human.turnCooldownUntil = eng.lastRaceTime + 1.5;
    if (eng.currentCourse?.chunks[rIdx]) {
      human.infectedRoomName = eng.currentCourse.chunks[rIdx].name;
    }
    if (attackerZombie) {
      attackerZombie.kills = (attackerZombie.kills || 0) + 1;
    }
    sound.playInfection();
    eng.addParticles(human.x, human.y, '#22c55e', 20, 5.5, 'slime');
    eng.addFloatingText(human.x, human.y - 16, '☣ ¡INFECTADO!', '#4ade80');
    eng.addCombatEvent(`☣ ¡CONTAGIO! ${human.name} se volvió zombi`, '#4ade80');

    const isFollowed = eng.followedMarbleId === human.id;
    const firstInf = !eng.highlightEvents.some((e) => e.kind === 'inf');
    eng.highlightEvents.push({
      t: eng.lastRaceTime,
      marbleId: human.id,
      text: `☣ ${human.name} infectado!`,
      color: '#22c55e',
      weight: (isFollowed ? 9 : 4) + (firstInf ? 3 : 0),
      kind: 'inf',
    });
    eng.pendingFocus = {
      x: human.x,
      y: human.y,
      color: '#22c55e',
      text: `☣ ¡${human.name} INFECTADO!`,
      durationSec: isFollowed ? 1.5 : 1.0,
    };
  } else {
    sound.playHeartLost();
    eng.addParticles(human.x, human.y, '#ef4444', 8, 3.5);
    eng.addFloatingText(human.x, human.y - 14, '-1 HP!', '#ef4444');
    if (attackerZombie && hBody) {
      const zBody = eng.marbleBodies.get(attackerZombie.id);
      if (zBody) {
        const hp = hBody.translation();
        const zp = zBody.translation();
        const dx = hp.x - zp.x;
        const dy = hp.y - zp.y;
        const d = Math.hypot(dx, dy) || 1;
        hBody.setLinvel({ x: (dx / d) * 7.8, y: (dy / d) * 7.8 }, true);
        zBody.setLinvel({ x: -(dx / d) * 5.6, y: -(dy / d) * 5.6 }, true);
      }
    }
  }
}

export function processCollisions(eng: RapierRaceEngine, marbles: Marble[]) {
  if (!eng.eventQueue!) return;

  eng.eventQueue!.drainCollisionEvents((h1, h2, started) => {
    if (!started) return;
    const metaA = eng.colliderMeta.get(h1);
    const metaB = eng.colliderMeta.get(h2);
    if (!metaA || !metaB) return;

    // 1. Marble vs Bumper
    if (
      (metaA.kind === 'marble' && metaB.kind === 'bumper') ||
      (metaB.kind === 'marble' && metaA.kind === 'bumper')
    ) {
      const mMeta = metaA.kind === 'marble' ? metaA : (metaB as { kind: 'marble'; marbleId: string });
      const bMeta = metaA.kind === 'bumper' ? metaA : (metaB as { kind: 'bumper'; x: number; y: number; bounce: number });
      const mBody = eng.marbleBodies.get(mMeta.marbleId);
      if (mBody) {
        const p = mBody.translation();
        const dx = p.x - bMeta.x * INV_SCALE;
        const dy = p.y - bMeta.y * INV_SCALE;
        const d = Math.hypot(dx, dy) || 1;
        const kick = 8.2 * Math.max(0.85, bMeta.bounce);
        mBody.setLinvel({ x: (dx / d) * kick, y: (dy / d) * kick }, true);
        sound.playBumper(480 + Math.random() * 160);
      }
      return;
    }

    // 2. Marble vs Marble
    if (metaA.kind === 'marble' && metaB.kind === 'marble') {
      const mA = eng.marbleById.get(metaA.marbleId);
      const mB = eng.marbleById.get(metaB.marbleId);
      if (mA && mB) {
        if (mA.isZombie !== mB.isZombie) {
          const zombie = mA.isZombie ? mA : mB;
          const human = mA.isZombie ? mB : mA;
          if ((zombie.turnCooldownUntil || 0) <= eng.lastRaceTime) {
            eng.applyHumanDamage(human, zombie);
          }
        } else {
          const bA = eng.marbleBodies.get(mA.id);
          const bB = eng.marbleBodies.get(mB.id);
          if (bA && bB) {
            const va = bA.linvel();
            const vb = bB.linvel();
            const rel = Math.hypot(va.x - vb.x, va.y - vb.y);
            if (rel > 2.4) {
              sound.playImpact(rel * 0.45, 1.0, 380);
            }
          }
        }
      }
      return;
    }

    // 3. Marble vs Walls / Hazards / Barricades
    const mMeta = metaA.kind === 'marble' ? metaA : metaB.kind === 'marble' ? metaB : null;
    if (mMeta) {
      const mBody = eng.marbleBodies.get(mMeta.marbleId);
      if (mBody) {
        const v = mBody.linvel();
        const spd = Math.hypot(v.x, v.y);
        if (spd > 2.6) {
          sound.playImpact(spd * 0.38, 1.0, 360);
        }
      }
    }
  });
}

export function damageZombie(eng: RapierRaceEngine, z: Marble, dmg: number, pushVxPx: number, pushVyPx: number, attacker: Marble) {
  if (z.gone || z.finished || !z.isZombie) return;

  z.zhp = (z.zhp ?? 4) - dmg;
  const zBody = eng.marbleBodies.get(z.id);
  if (zBody) {
    const curV = zBody.linvel();
    zBody.setLinvel(
      {
        x: curV.x * 0.25 + pushVxPx * 1.15,
        y: curV.y * 0.25 + pushVyPx * 1.15,
      },
      true
    );
  }

  if (z.zhp <= 0) {
    z.gone = true;
    if (zBody && eng.world) {
      for (let ci = 0; ci < zBody.numColliders(); ci++) {
        eng.colliderMeta.delete(zBody.collider(ci).handle);
      }
      eng.world!.removeRigidBody(zBody);
      eng.marbleBodies.delete(z.id);
    }
    attacker.kills = (attacker.kills || 0) + 1;
    sound.playInfection();
    eng.addParticles(z.x, z.y, '#84cc16', 14, 5.5, 'slime');

    const zt = z.zombieType || 'walker';
    if (zt === 'tank' || zt === 'boss') {
      const title = zt === 'boss' ? '👑 ¡JEFE ELIMINADO!' : '💀 ¡TANQUE ABATIDO!';
      eng.addParticles(z.x, z.y, '#fde047', 18, 6.5, 'spark');
      eng.addFloatingText(z.x, z.y - 18, title, '#fde047');
      eng.addCombatEvent(`${title} por ${attacker.name}`, '#fde047');
      eng.highlightEvents.push({
        t: eng.lastRaceTime,
        marbleId: attacker.id,
        text: `${title} (${attacker.name})`,
        color: '#fde047',
        weight: zt === 'boss' ? 9 : 6,
        kind: 'kill',
      });
      eng.pendingFocus = {
        x: z.x,
        y: z.y,
        color: '#fde047',
        text: title,
        durationSec: 1.1,
      };
    } else {
      eng.addFloatingText(z.x, z.y - 14, '💀 +1 BAJA', '#a3e635');
    }
  }
}

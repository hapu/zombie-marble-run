/** Update stages 1-2: active-room culling and hazards/zones. */
import type { WeaponType, ZombieType } from '../types';
import { WEAPON_SPECS } from '../constants';
import { sound } from '../audio';
import { INV_SCALE } from './constants';
import { computeActiveMask, getActiveChunkIndices } from './spatial';
import type { TickCtx } from './types';
import type { RapierRaceEngine } from './engine';

/** Stage 1: enable/disable room bodies so only rooms near marbles, projectiles or barricades are simulated. */
export function updateActiveRooms(eng: RapierRaceEngine, c: TickCtx): void {
  const { course, marbles } = c;
  const activeMask = computeActiveMask(course, marbles, eng.projectiles, eng.barricades);
  if (activeMask !== eng.activeMask) {
    eng.activeMask = activeMask;
    const newActive = getActiveChunkIndices(course, marbles, eng.projectiles, eng.barricades);
    const toRemove = eng.activeChunkIndices.filter((i) => !newActive.includes(i));
    const toAdd = newActive.filter((i) => !eng.activeChunkIndices.includes(i));

    for (const idx of toRemove) {
      const bodies = eng.chunkBodies[idx];
      if (bodies) {
        for (let b = 0; b < bodies.length; b++) bodies[b].setEnabled(false);
      }
    }
    for (const idx of toAdd) {
      const bodies = eng.chunkBodies[idx];
      if (bodies) {
        for (let b = 0; b < bodies.length; b++) bodies[b].setEnabled(true);
      }
    }
    eng.activeChunkIndices = newActive;
  }

  // Reset continuous user forces on all dynamic marble bodies before eng tick
  for (let i = 0; i < marbles.length; i++) {
    const m = marbles[i];
    if (m.gone) continue;
    const rb = eng.marbleBodies.get(m.id);
    if (rb) rb.resetForces(true);
  }

}

/** Stage 2: animate kinematic hazards and apply interactive zones (wind, magnets, portals, kickers, spikes, crypts, crates...) in active rooms. */
export function updateHazards(eng: RapierRaceEngine, c: TickCtx): void {
  const { course, marbles, raceTime, effectiveDt, stepScale } = c;
  for (const cIdx of eng.activeChunkIndices) {
    const chunk = course.chunks[cIdx];
    if (!chunk) continue;

    // Spinners
    const spinBodies = eng.spinnerBodies.get(cIdx);
    if (spinBodies) {
      for (let i = 0; i < chunk.spinners.length; i++) {
        const s = chunk.spinners[i];
        const sBody = spinBodies[i];
        s.angle += s.speed * effectiveDt * 60;
        if (sBody) sBody.setNextKinematicRotation(s.angle);
      }
    }

    // Pistons
    if (chunk.pistons) {
      for (let i = 0; i < chunk.pistons.length; i++) {
        const p = chunk.pistons[i];
        const pBody = eng.pistonBodies.get(p.id);
        if (!pBody) continue;
        const cycleT = ((raceTime / p.period + p.phase) % 1 + 1) % 1;
        let tg = 0;
        if (p.dutyCycle && p.dutyCycle > 0 && p.dutyCycle < 1) {
          tg = cycleT < p.dutyCycle ? cycleT / p.dutyCycle : (1 - cycleT) / (1 - p.dutyCycle);
        } else {
          tg = 0.5 - 0.5 * Math.cos(2 * Math.PI * (raceTime / p.period + p.phase));
        }
        pBody.setNextKinematicTranslation({
          x: (p.x + p.w / 2 + p.dx * tg) * INV_SCALE,
          y: (p.y + p.h / 2 + p.dy * tg) * INV_SCALE,
        });
      }
    }

    // Pendulums
    if (chunk.pendulums) {
      for (let i = 0; i < chunk.pendulums.length; i++) {
        const pend = chunk.pendulums[i];
        const bobBody = eng.pendulumBodies.get(pend.id);
        if (!bobBody) continue;
        const ang = pend.maxAngle * Math.sin(2 * Math.PI * (raceTime / pend.period + pend.phase));
        bobBody.setNextKinematicTranslation({
          x: (pend.pivotX + Math.sin(ang) * pend.length) * INV_SCALE,
          y: (pend.pivotY + Math.cos(ang) * pend.length) * INV_SCALE,
        });
        bobBody.setNextKinematicRotation(ang);
      }
    }

    // Wind Zones
    if (chunk.windZones) {
      for (let i = 0; i < chunk.windZones.length; i++) {
        const w = chunk.windZones[i];
        const gust = w.gustPeriod ? 1 + 0.35 * Math.sin(raceTime * (2 * Math.PI / w.gustPeriod)) : 1;
        for (let mIdx = 0; mIdx < marbles.length; mIdx++) {
          const m = marbles[mIdx];
          if (m.finished || m.gone) continue;
          if (m.x >= w.x && m.x <= w.x + w.w && m.y >= w.y && m.y <= w.y + w.h) {
            const rb = eng.marbleBodies.get(m.id);
            if (!rb) continue;
            const mass = rb.mass();
            rb.addForce({ x: w.forceX * 15.0 * gust * mass, y: w.forceY * 15.0 * gust * mass }, true);
          }
        }
      }
    }

    // Magnet Zones
    if (chunk.magnetZones) {
      for (let i = 0; i < chunk.magnetZones.length; i++) {
        const mag = chunk.magnetZones[i];
        for (let mIdx = 0; mIdx < marbles.length; mIdx++) {
          const m = marbles[mIdx];
          if (m.finished || m.gone) continue;
          const dx = mag.x - m.x;
          const dy = mag.y - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < mag.r * mag.r && d2 > 144) {
            const rb = eng.marbleBodies.get(m.id);
            if (!rb) continue;
            const d = Math.hypot(dx, dy);
            const mass = rb.mass();
            rb.addForce(
              { x: (dx / d) * mag.force * 12.5 * mass, y: (dy / d) * mag.force * 12.5 * mass },
              true
            );
          }
        }
      }
    }

    // Sticky Slow Zones
    if (chunk.slowZones) {
      for (let i = 0; i < chunk.slowZones.length; i++) {
        const sz = chunk.slowZones[i];
        for (let mIdx = 0; mIdx < marbles.length; mIdx++) {
          const m = marbles[mIdx];
          if (m.finished || m.gone) continue;
          if (m.x >= sz.x && m.x <= sz.x + sz.w && m.y >= sz.y && m.y <= sz.y + sz.h) {
            const rb = eng.marbleBodies.get(m.id);
            if (!rb) continue;
            const v = rb.linvel();
            const keep = Math.max(0.75, 1 - sz.drag * stepScale);
            rb.setLinvel({ x: v.x * keep, y: v.y * keep }, true);
          }
        }
      }
    }

    // Teleporter Portals
    if (chunk.portals) {
      for (let i = 0; i < chunk.portals.length; i++) {
        const tp = chunk.portals[i];
        for (let mIdx = 0; mIdx < marbles.length; mIdx++) {
          const m = marbles[mIdx];
          if (m.finished || m.gone) continue;
          if ((m.tpCooldownUntil || 0) > raceTime) continue;
          if (m.x >= tp.x && m.x <= tp.x + tp.w && m.y >= tp.y && m.y <= tp.y + tp.h) {
            const rb = eng.marbleBodies.get(m.id);
            if (!rb) continue;
            m.tpCooldownUntil = raceTime + 1.6;
            eng.addParticles(m.x, m.y, tp.color || '#a855f7', 12, 4.5);
            rb.setTranslation({ x: tp.tx * INV_SCALE, y: tp.ty * INV_SCALE }, true);
            const v = rb.linvel();
            rb.setLinvel({ x: v.x * 0.4, y: v.y * 0.4 }, true);
            eng.addParticles(tp.tx, tp.ty, '#38bdf8', 12, 4.5);
            sound.playBoosterZap();
            eng.addFloatingText(tp.tx, tp.ty - 16, '🌀 WARP!', '#c084fc');
          }
        }
      }
    }

    // Spike Strips
    if (chunk.spikeZones) {
      for (let i = 0; i < chunk.spikeZones.length; i++) {
        const spk = chunk.spikeZones[i];
        for (let mIdx = 0; mIdx < marbles.length; mIdx++) {
          const m = marbles[mIdx];
          if (m.isZombie || m.finished || m.gone) continue;
          if (m.x >= spk.x && m.x <= spk.x + spk.w && m.y >= spk.y && m.y <= spk.y + spk.h) {
            eng.applyHumanDamage(m);
          }
        }
      }
    }

    // Timed Kicker Launch Pads
    if (chunk.kickerZones) {
      for (let i = 0; i < chunk.kickerZones.length; i++) {
        const kz = chunk.kickerZones[i];
        const stepNum = Math.floor((raceTime + kz.phase * kz.period) / kz.period);
        if (stepNum !== kz.lastStep) {
          kz.lastStep = stepNum;
          kz.flashUntil = raceTime + 0.3;
          for (let mIdx = 0; mIdx < marbles.length; mIdx++) {
            const m = marbles[mIdx];
            if (m.finished || m.gone) continue;
            if (
              m.x >= kz.x - 10 &&
              m.x <= kz.x + kz.w + 10 &&
              m.y >= kz.y - 24 &&
              m.y <= kz.y + kz.h + 10
            ) {
              const rb = eng.marbleBodies.get(m.id);
              if (!rb) continue;
              const v = rb.linvel();
              rb.setLinvel({ x: v.x + kz.ix * 1.15, y: kz.iy * 1.25 }, true);
              sound.playBumper(620);
              eng.addParticles(m.x, m.y, '#fde047', 8, 4);
            }
          }
        }
      }
    }

    // Healing Pads
    if (chunk.healZones) {
      for (let i = 0; i < chunk.healZones.length; i++) {
        const hz = chunk.healZones[i];
        for (let mIdx = 0; mIdx < marbles.length; mIdx++) {
          const m = marbles[mIdx];
          if (m.isZombie || m.finished || m.gone) continue;
          if (m.hp >= m.maxHp) continue;
          if (m.healedZones && m.healedZones[hz.id]) continue;
          if (m.x >= hz.x && m.x <= hz.x + hz.w && m.y >= hz.y && m.y <= hz.y + hz.h) {
            m.healedZones = m.healedZones || {};
            m.healedZones[hz.id] = true;
            m.hp = Math.min(m.maxHp, m.hp + hz.amount);
            sound.playCratePickup();
            eng.addParticles(m.x, m.y, '#4ade80', 12, 4);
            eng.addFloatingText(m.x, m.y - 16, `❤️ +${hz.amount} HP!`, '#4ade80');
          }
        }
      }
    }

    // Crypt Zombie Ambush Spawners
    if (chunk.cryptZones) {
      for (let i = 0; i < chunk.cryptZones.length; i++) {
        const cz = chunk.cryptZones[i];
        if (cz.triggered) continue;
        for (let mIdx = 0; mIdx < marbles.length; mIdx++) {
          const m = marbles[mIdx];
          if (m.isZombie || m.finished || m.gone) continue;
          if (m.x >= cz.x && m.x <= cz.x + cz.w && m.y >= cz.y && m.y <= cz.y + cz.h) {
            cz.triggered = true;
            sound.playEmpPower();
            eng.addParticles(cz.spawnX, cz.spawnY, '#a855f7', 22, 6, 'slime');
            eng.addFloatingText(cz.spawnX, cz.spawnY - 22, `⚰️ ¡CRIPTA ABIERTA (+${cz.count})!`, '#c084fc');
            eng.addCombatEvent(`⚰️ ¡CRIPTA ABIERTA en ${chunk.name}!`, '#c084fc');
            for (let j = 0; j < cz.count; j++) {
              const zt: ZombieType =
                j === 0 && cz.count >= 4 ? 'boss' : eng.rng() < 0.25 ? 'runner' : eng.rng() < 0.2 ? 'tank' : 'walker';
              eng.pendingZombieSpawns.push({
                x: cz.spawnX + (j - cz.count / 2) * 26,
                y: cz.spawnY + (eng.rng() - 0.5) * 24,
                zombieType: zt,
                roomId: chunk.id,
              });
            }
            break;
          }
        }
      }
    }

    // Pickup Crates
    if (chunk.crates) {
      for (let c = 0; c < chunk.crates.length; c++) {
        const crate = chunk.crates[c];
        if (!crate.active) {
          crate.respawnTimer -= effectiveDt;
          if (crate.respawnTimer <= 0) crate.active = true;
          continue;
        }

        for (let mIdx = 0; mIdx < marbles.length; mIdx++) {
          const m = marbles[mIdx];
          if (m.finished || m.gone || m.isZombie) continue;
          const distToCrate = Math.hypot(m.x - crate.x, m.y - crate.y);
          if (distToCrate < 30) {
            crate.active = false;
            crate.respawnTimer = 14;

            if (crate.type === 'emp') {
              sound.playEmpBlast();
              eng.addParticles(crate.x, crate.y, '#38bdf8', 16, 6);
              eng.addFloatingText(crate.x, crate.y - 16, '⚡ EMP EXPANSIVO!', '#38bdf8');
              for (let j = 0; j < marbles.length; j++) {
                const other = marbles[j];
                if (!other.isZombie || other.gone) continue;
                const distToOther = Math.hypot(other.x - crate.x, other.y - crate.y);
                if (distToOther < 340) {
                  const oBody = eng.marbleBodies.get(other.id);
                  if (oBody) {
                    const pushX = (other.x - crate.x) / (distToOther || 1);
                    const pushY = (other.y - crate.y) / (distToOther || 1);
                    oBody.setLinvel({ x: pushX * 13.5, y: pushY * 13.5 - 2.5 }, true);
                  }
                }
              }
            } else if (crate.type === 'turbo') {
              sound.playBoosterZap();
              m.turboTime = raceTime + 3.0;
              eng.addParticles(crate.x, crate.y, '#f59e0b', 12, 5);
              eng.addFloatingText(m.x, m.y - 16, '⏩ TURBO!', '#f59e0b');
            } else if (crate.type === 'shield') {
              sound.playCratePickup();
              m.shield = 100;
              eng.addParticles(crate.x, crate.y, '#10b981', 12, 4);
              eng.addFloatingText(m.x, m.y - 16, '🛡️ ESCUDO!', '#10b981');
            } else if (crate.type === 'repair') {
              sound.playCratePickup();
              m.hp = Math.min(m.maxHp, m.hp + 2);
              eng.addParticles(crate.x, crate.y, '#ef4444', 12, 4);
              eng.addFloatingText(m.x, m.y - 16, '❤️ +2 HP!', '#ef4444');
            } else {
              const weaponPool: WeaponType[] = ['shotgun', 'rifle', 'spread', 'rapid', 'sword', 'bat'];
              const chosenW: WeaponType =
                crate.type === 'weapon_swap'
                  ? weaponPool.filter((w) => w !== m.weaponType)[Math.floor(eng.rng() * (weaponPool.length - 1))] || 'shotgun'
                  : (crate.type as WeaponType);
              const wSpec = WEAPON_SPECS[chosenW] || WEAPON_SPECS.blaster;
              sound.playCratePickup();
              m.weaponType = chosenW;
              m.weaponUpgradeTimer = 12.0;
              eng.addParticles(crate.x, crate.y, wSpec.color, 14, 5);
              eng.addFloatingText(m.x, m.y - 16, `${wSpec.icon} ${wSpec.name.toUpperCase()}!`, wSpec.color);
              eng.addCombatEvent(`${wSpec.icon} ${m.name} equipó ${wSpec.name}`, wSpec.color);
            }
            break;
          }
        }
      }
    }
  }

  // Flush queued Crypt zombies
  if (eng.pendingZombieSpawns.length > 0) {
    for (const sp of eng.pendingZombieSpawns) {
      eng.spawnNpcZombie(sp.x, sp.y, sp.zombieType, sp.roomId);
    }
    eng.pendingZombieSpawns.length = 0;
  }

  c.finishedCount = 0;
  for (let i = 0; i < marbles.length; i++) {
    if (marbles[i].finished) c.finishedCount++;
  }

}

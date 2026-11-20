// Entity management: marbles, zombies, physics stepping.
// Ported from prototype Two's makeWorld S.mk / stepSim logic.

import { CS, HP, R, ZT, TEAMS, WEAPONS } from "./gameConfig.js";
import { circ, O } from "./world.js";
import { abilityStateTarget, abilityStateBoostUntil, abilityStateShieldUntil } from "./combat.js";
import { metersToPixels, pixelsToMeters } from "./physicsUnits.js";

const VMAX = 190;
const ZVMAX = 120;
const ZACCEL = 260;
const BELT_SPEED = 140;
const HITCD = 0.7;
const ZR = 140;
const ZF = 0.0002;

// Spawn player marbles at the start chunk.
export function spawnMarbles(world, S) {
  const n = TEAMS.length;
  const startCell = S.route.find(c => c.type === "S");
  if (!startCell) return;
  const ox = startCell.ox;
  const oy = startCell.oy;
  TEAMS.forEach((t, j) => {
    const m = circ(world, ox + 204 + (j % 4) * 22, oy + 343 - Math.floor(j / 4) * 20, R, t.c, {
      restitution: 0.35 + Math.random() * 0.15,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0.002,
      density: 0.002,
    });
    m.team = j;
    m.zombie = false;
    m.hp = HP;
    m.zhp = S.zhp ?? ZT.walker.hp;
    m.zmax = m.zhp;
    m.zf = 1;
    m.zv = 1.2;
    m.w = WEAPONS[j % WEAPONS.length];
    m.ammo = m.w.clip;
    m.prog = 0;
    m.ri = undefined;
    m.safe = null;
    m.gone = false;
    m.fin = 0;
    m.kills = 0;
    S.marbles.push(m);
    S.bodies.push(m);
  });
}

// Spawn zombies at the start chunk.
export function spawnZombies(world, S, nz = S.nz ?? 30) {
  const startCell = S.route.find(c => c.type === "S");
  if (!startCell) return;
  const ox = startCell.ox;
  const oy = startCell.oy;
  const rnd = () => Math.random();
  for (let j = 0; j < nz; j++) {
    const q = rnd();
    const zt = q < 0.2 ? "runner" : q < 0.32 ? "tank" : "walker";
    const T = ZT[zt];
    const m = circ(world, ox + 24 + (j % 8) * 22, oy + 343 - Math.floor(j / 8) * 20, T.r, "#6fa84a", {
      restitution: 0.35,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0.002,
      density: T.d,
    });
    m.team = -1;
    m.zombie = true;
    m.zt = zt;
    m.hp = 0;
    m.zhp = T.hp;
    m.zmax = m.zhp;
    m.zf = T.f;
    m.zv = T.v;
    m.w = null;
    m.ammo = 0;
    m.prog = 0;
    m.ri = undefined;
    m.safe = null;
    m.gone = false;
    m.fin = 0;
    m.kills = 0;
    S.marbles.push(m);
    S.zombies.push(m);
    S.bodies.push(m);
  }
}

export function humans(S) {
  return S.marbles.filter(m => m.team >= 0);
}

function removeStatic(world, S, b) {
  if (!b) return;
  if (b.rb) world.removeRigidBody(b.rb);
  S.statics = S.statics.filter(x => x !== b);
}

export function stepSim(world, S, dt) {
  S.tick++;
  S.simT += dt;

  const act = S.marbles.filter(m => !m.gone);

  // Open the start gate when racing begins.
  if (S.gate) { removeStatic(world, S, S.gate); S.gate = null; }

  // Release zombies after gate delay.
  if (!S.zrel && S.simT >= S.zd) {
    removeStatic(world, S, S.zgate);
    S.zgate = null;
    S.zrel = true;
  }

  // Belt zones: match horizontal speed
  for (const z of S.zones) {
    if (z.t !== "belt") continue;
    for (const m of act) {
      if (m.fin) continue;
      const position = m.rb.translation();
      const mx = metersToPixels(position.x);
      const my = metersToPixels(position.y);
      const inZone = Math.abs(mx - z.x) < z.w / 2 && Math.abs(my - z.y) < z.h / 2;
      if (!inZone) continue;
      const targetSpeed = z.f * z.dir * BELT_SPEED;
      const velocity = m.rb.linvel();
      const vx = metersToPixels(velocity.x);
      const response = 0.22;
      m.rb.setLinvel({
        x: pixelsToMeters(vx + (targetSpeed - vx) * response),
        y: velocity.y,
      }, true);
      m._beltLast = S.simT;
    }
  }

  // Bleed off belt momentum
  for (const m of act) {
    if (m.fin || m._beltLast === undefined) continue;
    const elapsed = S.simT - m._beltLast;
    if (elapsed > 0 && elapsed < 0.45) {
      const v = m.rb.linvel();
      m.rb.setLinvel({ x: v.x * 0.90, y: v.y }, true);
    } else if (elapsed >= 0.45) {
      m._beltLast = undefined;
    }
  }

  // Zombie chase
  if (S.zrel) {
    const humansList = humans(S);
    for (const m of act) {
      if (!m.zombie || m.fin) continue;
      const position = m.rb.translation();
      const mx = metersToPixels(position.x);
      const my = metersToPixels(position.y);
      let t = null;
      let bd = ZR;
      for (const h of humansList) {
        const humanPosition = h.rb.translation();
        const hx = metersToPixels(humanPosition.x);
        const hy = metersToPixels(humanPosition.y);
        const d = Math.hypot(hx - mx, hy - my);
        if (d < bd) { bd = d; t = h; }
      }
      let dx = 0, dy = 0;
      if (t) {
        const targetPosition = t.rb.translation();
        const tx = metersToPixels(targetPosition.x);
        const ty = metersToPixels(targetPosition.y);
        dx = tx - mx; dy = ty - my;
        const l = Math.hypot(dx, dy) || 1;
        dx /= l; dy /= l;
      }
      const accel = ZACCEL * ((S.zf ?? ZF) / 0.00026);
      const mass = m.rb.mass();
      m.rb.addForce({
        x: pixelsToMeters(dx * accel * mass),
        y: pixelsToMeters(dy * accel * mass),
      }, true);
    }
  }

  // Cap marble velocity
  for (const m of act) {
    const boosted = m === abilityStateTarget() && S.simT < abilityStateBoostUntil();
    const vm = m.zombie ? ZVMAX * (m.zv || 1.2) : (boosted ? 300 : VMAX);
    const rawVelocity = m.rb.linvel();
    const v = {
      x: metersToPixels(rawVelocity.x),
      y: metersToPixels(rawVelocity.y),
    };
    const sp = Math.hypot(v.x, v.y);
    if (sp > vm) {
      m.rb.setLinvel({
        x: pixelsToMeters(v.x * vm / sp),
        y: pixelsToMeters(v.y * vm / sp),
      }, true);
    }

    // Track progress through chunks
    track(S, m);

    const cell = S.route[m.ri];
    if (cell && cell.type === "F" && m.lx > 70) {
      if (m.zombie) {
        m.gone = true;
        world.removeRigidBody(m.rb);
      } else if (!m.fin) {
        m.fin = ++S.fins;
        m.time = S.simT;
      }
    }
  }

  // Check game end
  const hs = humans(S);
  if (hs.every(h => h.fin || h.zombie) || S.simT > 240) {
    S.gameOver = true;
  }
}

// Track which chunk a marble is in and its progress.
function track(S, m) {
  const position = m.rb.translation();
  const px = metersToPixels(position.x);
  const py = metersToPixels(position.y);
  const gy = Math.floor(py / CS);
  const gx = Math.floor(px / CS);
  const ri = S.grid[gy] ? S.grid[gy][gx] : undefined;
  if (ri === undefined || (m.ri !== undefined && Math.abs(ri - m.ri) > 1)) {
    if (m.safe) {
      m.rb.setTranslation({
        x: pixelsToMeters(m.safe.x),
        y: pixelsToMeters(m.safe.y),
      }, true);
      m.rb.setLinvel({ x: 0, y: 0 }, true);
    }
    return;
  }
  m.ri = ri;
  const cell = S.route[ri];
  const lx = cell.mir ? CS - (px - cell.ox) : px - cell.ox;
  const ly = py - cell.oy;
  m.lx = lx;
  m.ly = ly;
  m.prog = ri * CS + (cell.type === "D2" ? (lx + ly) / 2 : cell.type === "U2" ? (lx + CS - ly) / 2 : lx);
  if (S.tick % 20 === 0) m.safe = { x: px, y: py };
}

// Hurt a marble (infection on zombie touch).
export function hurt(S, h) {
  if (abilityStateTarget() === h && S.simT < abilityStateShieldUntil()) {
    return; // shielded
  }
  if (S.simT - (h.hitT === undefined ? -9 : h.hitT) < HITCD) return;
  h.hitT = S.simT;
  h.hp--;
  S.hits.push(h);
  S.dmg[h.ri] = (S.dmg[h.ri] || 0) + 1;
  if (h.hp <= 0) {
    h.zombie = true;
    h.zt = "walker";
    h.zhp = 2;
    h.zmax = 2;
    h.zf = 0.8;
    h.zv = 1.1;
    h.turn = S.simT + 1.5;
    h.infAt = h.ri;
    h.infT = S.simT;
    S.infected.push(h);
  }
}

// Collision detection: marble vs zombie infection.
export function checkCollisions(world, S) {
  // Simple overlap-based infection check
  const act = S.marbles.filter(m => !m.gone);
  const humansList = humans(S);
  const zombies = act.filter(m => m.zombie);
  for (const z of zombies) {
    const zombiePosition = z.rb.translation();
    const zx = metersToPixels(zombiePosition.x);
    const zy = metersToPixels(zombiePosition.y);
    for (const h of humansList) {
      if (h.fin || h.gone) continue;
      const humanPosition = h.rb.translation();
      const hx = metersToPixels(humanPosition.x);
      const hy = metersToPixels(humanPosition.y);
      const d = Math.hypot(hx - zx, hy - zy);
      const reach = (z.rad || R) + (h.rad || R) + 4;
      if (d < reach) {
        hurt(S, h);
      }
    }
  }
}

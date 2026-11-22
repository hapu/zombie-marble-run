// Combat: weapon auto-fire and player abilities (boost/shield/heal).
// Ported from prototype Two's combat / ability logic.

import { HP, TEAMS } from "./gameConfig.js";
import { metersToPixels, pixelsToMeters } from "./physicsUnits.js";

let abilityTarget = null;
let abilityBoostUntil = 0;
let abilityShieldUntil = 0;
let abilityBoostReady = 0;
let abilityShieldReady = 0;
let abilityHealReady = 0;

export function abilityStateTarget() { return abilityTarget; }
export function abilityStateBoostUntil() { return abilityBoostUntil; }
export function abilityStateShieldUntil() { return abilityShieldUntil; }

export function resetAbilityState() {
  abilityTarget = null;
  abilityBoostUntil = 0;
  abilityShieldUntil = 0;
  abilityBoostReady = 0;
  abilityShieldReady = 0;
  abilityHealReady = 0;
}

// Auto-fire weapons for human marbles against nearby zombies.
export function combatStep(S, dt) {
  if (!S.zrel) return;
  const now = S.simT;
  const humansList = S.marbles.filter(m => m.team >= 0 && !m.gone && !m.fin);

  for (const h of humansList) {
    if (h.zombie || (h.wt !== undefined && now < h.wt)) continue;
    if (h.w.clip < 99 && h.ammo <= 0) {
      if (h.reloadAt === undefined) h.reloadAt = now + 1.5;
      if (now < h.reloadAt) continue;
      h.ammo = h.w.clip;
      h.reloadAt = undefined;
    }

    let target = null;
    let bd = h.w.range;
    const humanPosition = h.rb.translation();
    const hx = metersToPixels(humanPosition.x);
    const hy = metersToPixels(humanPosition.y);
    for (const z of S.marbles) {
      if (!z.zombie || z.gone || z.ri !== h.ri) continue;
      const zombiePosition = z.rb.translation();
      const zx = metersToPixels(zombiePosition.x);
      const zy = metersToPixels(zombiePosition.y);
      const d = Math.hypot(zx - hx, zy - hy);
      if (d < bd) { bd = d; target = z; }
    }
    if (!target) continue;

    h.wt = now + h.w.cd * (0.85 + Math.random() * 0.3);
    target.zhp -= h.w.dmg;
    if (h.w.clip < 99) h.ammo--;

    const targetPosition = target.rb.translation();
    const tx = metersToPixels(targetPosition.x);
    const ty = metersToPixels(targetPosition.y);
    const dx = tx - hx, dy = ty - hy;
    const l = Math.hypot(dx, dy) || 1;
    const impulse = pixelsToMeters(h.w.kb * 4) * target.rb.mass();
    target.rb.applyImpulse({ x: dx / l * impulse, y: dy / l * impulse }, true);

    S.shots.push({ x1: hx, y1: hy, x2: tx, y2: ty, c: TEAMS[h.team].c, melee: h.w.range < 60, t: S.simT });

    if (target.zhp <= 0) {
      target.gone = true;
      if (S.world) S.world.removeRigidBody(target.rb);
      S.zombies = S.zombies.filter(z => z !== target);
      S.bodies = S.bodies.filter(b => b !== target);
      S.kills.push(target);
      h.kills = (h.kills || 0) + 1;
    }
  }

  // Cleanup gone zombies
  S.marbles = S.marbles.filter(m => !m.gone);
}

export function useAbility(S, kind) {
  const now = S.simT;
  const t = abilityTarget;
  if (!t) return;
  abilityTarget = t;

  if (kind === "boost" && now >= abilityBoostReady) {
    abilityBoostUntil = now + 3;
    abilityBoostReady = now + 9;
    const rawVelocity = t.rb.linvel();
    const v = {
      x: metersToPixels(rawVelocity.x),
      y: metersToPixels(rawVelocity.y),
    };
    const mag = Math.hypot(v.x, v.y) || 1;
    const speed = Math.max(220, Math.min(300, mag * 1.65));
    t.rb.setLinvel({
      x: pixelsToMeters(v.x / mag * speed),
      y: pixelsToMeters(v.y / mag * speed),
    }, true);
  } else if (kind === "shield" && now >= abilityShieldReady) {
    abilityShieldUntil = now + 4.5;
    abilityShieldReady = now + 12.5;
  } else if (kind === "heal" && now >= abilityHealReady && t.hp < HP) {
    t.hp = Math.min(HP, t.hp + 2);
    abilityHealReady = now + 15;
  }
}

// Called each frame to update the ability target (closest living human marble).
export function updateAbilityTarget(S) {
  const humansList = S.marbles.filter(m => m.team >= 0 && !m.zombie && !m.fin && !m.gone);
  if (humansList.length === 0) { abilityTarget = null; return; }
  // Prefer the previously targeted marble if still valid
  if (abilityTarget && humansList.includes(abilityTarget)) return;
  abilityTarget = humansList[0];
}


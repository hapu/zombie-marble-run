/** Update stage 4: projectiles, barricades, particles and floating texts. */
import { sound } from '../audio';
import type { TickCtx } from './types';
import type { RapierRaceEngine } from './engine';

/** Stage 4: projectiles and zombie hits, barricade expiry, particles and floating texts. */
export function updateProjectiles(eng: RapierRaceEngine, c: TickCtx): void {
  const { marbles, effectiveDt, stepScale } = c;
  for (let pIdx = eng.projectiles.length - 1; pIdx >= 0; pIdx--) {
    const p = eng.projectiles[pIdx];
    p.lifetime -= effectiveDt;
    if (p.lifetime <= 0) {
      eng.projectiles.splice(pIdx, 1);
      continue;
    }
    if (p.isMelee) continue;

    p.x += p.vx * stepScale;
    p.y += p.vy * stepScale;

    let hit = false;
    for (let mIdx = 0; mIdx < marbles.length; mIdx++) {
      const z = marbles[mIdx];
      if (!z.isZombie || z.finished || z.gone) continue;
      const dist = Math.hypot(z.x - p.x, z.y - p.y);
      if (dist < (z.radius || 12.5) + 6) {
        hit = true;
        sound.playPlasmaHit();
        eng.addParticles(p.x, p.y, p.color || '#38bdf8', 7, 4.5);
        const pSpd = Math.hypot(p.vx, p.vy) || 1;
        const kb = p.knockback ?? 7.5;
        const owner = eng.marbleById.get(p.ownerId) || marbles[0];
        eng.damageZombie(z, p.damage ?? 1.2, (p.vx / pSpd) * kb, (p.vy / pSpd) * kb, owner);
        break;
      }
    }

    if (hit) {
      eng.projectiles.splice(pIdx, 1);
    }
  }

  // Update Barricades, Particles, Floating Texts
  for (let bIdx = eng.barricades.length - 1; bIdx >= 0; bIdx--) {
    const b = eng.barricades[bIdx];
    b.lifetime -= effectiveDt;
    if (b.lifetime <= 0) {
      const body = eng.barricadeBodies.get(b.id);
      if (body && eng.world) {
        for (let ci = 0; ci < body.numColliders(); ci++) {
          eng.colliderMeta.delete(body.collider(ci).handle);
        }
        eng.world!.removeRigidBody(body);
        eng.barricadeBodies.delete(b.id);
      }
      eng.barricades.splice(bIdx, 1);
    }
  }

  for (let i = eng.particles.length - 1; i >= 0; i--) {
    const pt = eng.particles[i];
    pt.x += pt.vx * stepScale;
    pt.y += pt.vy * stepScale;
    pt.vx *= 0.94;
    pt.vy *= 0.94;
    pt.lifetime -= effectiveDt;
    pt.alpha = Math.max(0, pt.lifetime / pt.maxLifetime);
    if (pt.lifetime <= 0) eng.particles.splice(i, 1);
  }

  for (let i = eng.floatingTexts.length - 1; i >= 0; i--) {
    const ft = eng.floatingTexts[i];
    ft.y -= 0.65 * stepScale;
    ft.lifetime -= effectiveDt;
    ft.alpha = Math.max(0, ft.lifetime / ft.maxLifetime);
    if (ft.lifetime <= 0) eng.floatingTexts.splice(i, 1);
  }

}

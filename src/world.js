// World / chunk generation ported from prototype Two.
// Builds a ROWS x COLS grid of chunks, each with obstacles, belts,
// spawn/start/finish zones. Rapier2D bodies are created directly.

import RAPIER from "../vendor/rapier.mjs";
import { CS, ROWS, COLS, HP, R, ZT, TEAMS, WEAPONS, DIFFS } from "./gameConfig.js";
import {
  pixelsToMeters,
  densityPerPixelSquaredToPerMeterSquared,
} from "./physicsUnits.js";

const O = { isStatic: true, friction: 0.02, frictionStatic: 0, restitution: 0.25 };

// Simple seeded RNG (port of prototype's rngOf)
function rngOf(s) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rect(world, x, y, w, h, angle = 0, col = null, statics = null) {
  const rb = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed()
      .setTranslation(pixelsToMeters(x), pixelsToMeters(y))
      .setRotation(angle),
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(pixelsToMeters(w / 2), pixelsToMeters(h / 2)),
    rb,
  );
  const b = { rb, col, x, y, w, h, angle };
  if (statics) statics.push(b);
  return b;
}

function circ(world, x, y, rad, col = null, opts = {}) {
  const rb = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(pixelsToMeters(x), pixelsToMeters(y))
      .setLinearDamping((opts.frictionAir ?? 0) * 60),
  );
  const cd = RAPIER.ColliderDesc.ball(pixelsToMeters(rad))
    .setRestitution(opts.restitution ?? 0.25)
    .setFriction(opts.friction ?? 0)
    .setDensity(densityPerPixelSquaredToPerMeterSquared(opts.density ?? 1));
  world.createCollider(cd, rb);
  return { rb, col, x, y, rad, kind: "circle" };
}

export function makeWorld(world, nz, seed, opts = {}) {
  const D = DIFFS[opts.diff ?? "normal"];
  const zhp = D.zhp;
  const zf = D.zf;
  const zd = D.zd;
  nz = Math.round(nz * D.n);

  const rnd = rngOf(seed);
  // Top-down layouts work with gravity; the lift/wind content for bottom-up
  // layouts is not ported yet.
  const up = opts.up === true;

  const S = {
    world,
    seed,
    ROWS,
    COLS,
    CS,
    up,
    zhp,
    zf,
    zd,
    simT: 0,
    tick: 0,
    fins: 0,
    nz,
    zrel: false,
    bodies: [],
    statics: [],
    movers: [],
    zones: [],
    marbles: [],
    zombies: [],
    pickups: [],
    route: [],
    grid: [],
    hits: [],
    infected: [],
    heals: [],
    shots: [],
    kills: [],
    picks: [],
    dmg: {},
    gate: null,
    zgate: null,
  };

  // Build route grid (snake pattern)
  for (let r = 0; r < ROWS; r++) {
    const cs = [...Array(COLS).keys()];
    if (r % 2) cs.reverse();
    const gy = up ? ROWS - 1 - r : r;
    cs.forEach((c, k) => {
      const type = k === 0 ? (r ? (up ? "U2" : "D2") : "S") : k === COLS - 1 ? (r === ROWS - 1 ? "F" : up ? "U1" : "D1") : "H";
      const name = { S: "Start", F: "Finish", U1: "Lift", U2: "Rooftop", D1: "Drop", D2: "Landing" }[type] || "Track";
      const ox = c * CS;
      const oy = gy * CS;
      S.route.push({ r, gy, c, k, mir: r % 2 === 1, type, name, ox, oy, conn: {} });
      (S.grid[gy] = S.grid[gy] || [])[c] = S.route.length - 1;
    });
  }

  S.route.forEach((a, i) => {
    const b = S.route[i + 1];
    if (!b) return;
    const s = b.r === a.r ? (b.c > a.c ? "r" : "l") : b.oy > a.oy ? "b" : "t";
    const o = { r: "l", l: "r", b: "t", t: "b" }[s];
    a.conn[s] = 1;
    b.conn[o] = 1;
  });

  // Span helpers matching the prototype: hw(x1,x2,y) and vw(x,y1,y2).
  const hw = (x1, x2, y) => rect(world, (x1 + x2) / 2, y, x2 - x1 + 16, 16, 0, null, S.statics);
  const vw = (x, y1, y2) => rect(world, x, (y1 + y2) / 2, 16, y2 - y1, 0, null, S.statics);

  // Build each chunk: walls + obstacles
  S.route.forEach((cell) => {
    const { ox, oy, type, conn, c } = cell;

    // Walls (shared boundaries built once)
    for (const [y, k, on] of [[oy + CS, "b", 1], [oy, "t", cell.gy === 0]]) {
      if (on) {
        // Vertical row transitions are open shafts so marbles drop cleanly
        // into the next row instead of skimming a narrow slot at speed.
        if (k === "b" && conn.b) continue;
        if (conn[k]) {
          hw(ox, ox + CS / 2 - 52, y);
          hw(ox + CS / 2 + 52, ox + CS, y);
        } else {
          hw(ox, ox + CS, y);
        }
      }
    }
    for (const [x, k, on] of [[ox + CS, "r", 1], [ox, "l", c === 0]]) {
      if (on) {
        if (conn[k]) {
          vw(x, oy, oy + CS - 112);
        } else {
          vw(x, oy, oy + CS);
        }
      }
    }

    // Chunk-specific content
    if (type === "S") {
      // Start: spawn marbles here
      S.gate = rect(world, ox + 292, oy + 180, 14, 344, 0, null, S.statics);
      S.zgate = rect(world, ox + 190, oy + 180, 14, 344, 0, null, S.statics);
    } else if (type === "F") {
      // Finish
    } else if (type === "H" && rnd() < 0.25) {
      S.pickups.push({
        kind: "med",
        x: ox + CS / 2,
        y: oy + CS - 18,
        r: 13,
        amount: 2,
        taken: false,
      });
    }
    // Belt zones (mirrored rows push the opposite way)
    S.zones.push({ t: "belt", x: ox + CS / 2, y: oy + CS - 45, w: CS, h: 90, f: 1, dir: cell.mir ? -1 : 1 });
  });

  return S;
}

export { CS, ROWS, COLS, HP, R, ZT, TEAMS, WEAPONS, DIFFS, rect, circ, O };

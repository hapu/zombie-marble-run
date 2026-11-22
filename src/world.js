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
    RAPIER.ColliderDesc.cuboid(pixelsToMeters(w / 2), pixelsToMeters(h / 2))
      .setFriction(O.friction)
      .setRestitution(O.restitution),
    rb,
  );
  const b = { rb, col, x, y, w, h, angle };
  if (statics) statics.push(b);
  return b;
}

function staticCirc(world, x, y, rad, col, kind, statics) {
  const rb = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(pixelsToMeters(x), pixelsToMeters(y)),
  );
  world.createCollider(
    RAPIER.ColliderDesc.ball(pixelsToMeters(rad))
      .setRestitution(kind === "bumper" ? 1.15 : 0.25)
      .setFriction(0.02),
    rb,
  );
  const b = { rb, col, x, y, rad, kind };
  statics.push(b);
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
  const obstacleRnd = rngOf(`${seed}:obstacles`);
  const forceRnd = rngOf(`${seed}:forces`);
  // Wind and lift zone accelerations are stored in SI units.
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
    rescues: [],
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
    const { ox, oy, type, conn, c, mir } = cell;

    // Walls (shared boundaries built once)
    for (const [y, k, on] of [[oy + CS, "b", 1], [oy, "t", cell.gy === 0]]) {
      if (on) {
        if (conn[k]) {
          // Row transitions keep a central 104 px drop slot.
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
    const dir = mir ? -1 : 1;
    const bx = (localX) => ox + (mir ? CS - localX : localX);
    let fullBelt = true;
    if (type === "S") {
      // Start: spawn marbles here
      S.gate = rect(world, ox + 292, oy + 180, 14, 344, 0, null, S.statics);
      S.zgate = rect(world, ox + 190, oy + 180, 14, 344, 0, null, S.statics);
    } else if (type === "F") {
      // Finish
    } else if (type === "D1") {
      // Drop: converging belts feed the central row-transition slot.
      S.zones.push({ t: "belt", x: bx(64), y: oy + CS - 45, w: 128, h: 90, f: 1.2, dir });
      S.zones.push({ t: "belt", x: bx(296), y: oy + CS - 45, w: 128, h: 90, f: -1, dir });
      if (obstacleRnd() < 0.5) {
        staticCirc(world, bx(180), oy + 200, 16, "#ff5ea8", "bumper", S.statics);
      } else {
        staticCirc(world, bx(180), oy + 230, 20, "#9aa4bd", "peg", S.statics);
      }
      fullBelt = false;
    } else if (type === "D2") {
      // Landing: break the fall from the row above.
      staticCirc(world, bx(150), oy + 170, 7, "#9aa4bd", "peg", S.statics);
      staticCirc(world, bx(210), oy + 170, 7, "#9aa4bd", "peg", S.statics);
    } else if (type === "U1") {
      // Lift: converging belts feed the upward zone.
      S.zones.push({ t: "belt", x: bx(64), y: oy + CS - 45, w: 128, h: 90, f: 1.2, dir });
      S.zones.push({ t: "belt", x: bx(296), y: oy + CS - 45, w: 128, h: 90, f: -1, dir });
      // Lift acceleration exceeds gravity so marbles rise through the zone.
      S.zones.push({
        t: "lift",
        x: ox + 180,
        y: oy + 180,
        w: 104,
        h: 344,
        ax: 0,
        ay: -12.5,
      });
      fullBelt = false;
    } else if (type === "U2") {
      S.zones.push({
        t: "lift",
        x: ox + 180,
        y: oy + 300,
        w: 104,
        h: 120,
        ax: 0,
        ay: -12.5,
      });
      S.zones.push({
        t: "wind",
        x: ox + (mir ? CS - 255 : 255),
        y: oy + 170,
        w: 220,
        h: 300,
        ax: 2,
        ay: 0,
        dir: mir ? -1 : 1,
      });
    } else if (type === "H") {
      const layout = obstacleRnd();
      if (layout < 0.16) {
        for (let localX = 50; localX < 340; localX += 50) {
          staticCirc(world, bx(localX), oy + 300, 7, "#9aa4bd", "peg", S.statics);
        }
      } else if (layout < 0.28) {
        staticCirc(world, bx(180), oy + 255, 26, "#ff5ea8", "bumper", S.statics);
      } else if (layout < 0.4) {
        staticCirc(world, bx(110), oy + 240, 20, "#ff5ea8", "bumper", S.statics);
        staticCirc(world, bx(250), oy + 290, 20, "#ff5ea8", "bumper", S.statics);
      } else if (layout < 0.52) {
        for (let i = 0; i < 8; i++) {
          staticCirc(world, bx(50 + i * 37), oy + 120 + i * 24, 7, "#9aa4bd", "peg", S.statics);
        }
      }

      if (forceRnd() < 0.18) {
        S.zones.push({
          t: "wind",
          x: ox + CS / 2,
          y: oy + CS / 2,
          w: CS,
          h: CS,
          ax: 2,
          ay: 0,
          dir: mir ? -1 : 1,
        });
      }

      if (rnd() < 0.25) {
        S.pickups.push({
          kind: "med",
          x: ox + CS / 2,
          y: oy + CS - 18,
          r: 13,
          amount: 2,
          taken: false,
        });
      }
    }
    // Full-width belt for chunks without split belts (mirrored rows reverse it).
    if (fullBelt) {
      S.zones.push({ t: "belt", x: ox + CS / 2, y: oy + CS - 45, w: CS, h: 90, f: 1, dir });
    }
  });

  return S;
}

export { CS, ROWS, COLS, HP, R, ZT, TEAMS, WEAPONS, DIFFS, rect, circ, O };

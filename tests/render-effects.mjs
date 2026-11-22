import assert from "node:assert/strict";
import { draw } from "../src/render.js";
import { pixelsToMeters } from "../src/physicsUnits.js";

const calls = [];
const ctx = new Proxy({}, {
  get(target, prop) {
    if (prop in target) return target[prop];
    const fn = (...args) => { calls.push({ prop: String(prop), args }); };
    target[prop] = fn;
    return fn;
  },
  set(target, prop, value) {
    target[prop] = value;
    calls.push({ prop: `set:${String(prop)}`, args: [value] });
    return true;
  },
});

const human = {
  team: 0,
  zombie: false,
  fin: 0,
  gone: false,
  prog: 0,
  hp: 5,
  rb: {
    translation: () => ({
      x: pixelsToMeters(180),
      y: pixelsToMeters(200),
    }),
  },
};

const S = {
  simT: 0.05,
  marbles: [human],
  route: [{ ox: 0, oy: 0, type: "H", name: "Track" }],
  statics: [],
  pickups: [],
  zones: [{ t: "belt", x: 180, y: 315, w: 360, h: 90, f: 1, dir: 1 }],
  shots: [
    { x1: 180, y1: 200, x2: 220, y2: 200, c: "#ff2d2d", melee: false, t: 0.0 },
    { x1: 10, y1: 10, x2: 20, y2: 20, c: "#1fcf3a", melee: false, t: -1 },
  ],
};

draw(ctx, S, "racing", S.simT, 800, 600);

assert.ok(
  calls.some(call => call.prop === "setLineDash" && Array.isArray(call.args[0]) && call.args[0].length === 2),
  "belt should be drawn with a dashed surface",
);
assert.ok(
  calls.some(call => call.prop === "moveTo" && Math.abs(call.args[1] - 346) < 1e-6),
  "belt dashes should sit just above the chunk floor",
);
assert.ok(
  calls.some(call => call.prop === "moveTo" && call.args[0] === 180 && call.args[1] === 200),
  "recent weapon shot should start at the shooter",
);
assert.ok(
  calls.some(call => call.prop === "lineTo" && call.args[0] === 220 && call.args[1] === 200),
  "recent weapon shot should reach its target",
);
assert.ok(
  calls.some(call => call.prop === "set:strokeStyle" && call.args[0] === "#ff2d2d"),
  "weapon shot should use the team color",
);
assert.ok(
  !calls.some(call => call.prop === "moveTo" && call.args[0] === 10 && call.args[1] === 10),
  "expired weapon shots should not be drawn",
);

console.log("ok    belts and weapon effects render");

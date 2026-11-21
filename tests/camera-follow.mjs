import assert from "node:assert/strict";
import { draw } from "../src/render.js";
import { pixelsToMeters } from "../src/physicsUnits.js";

const translations = [];
const ctx = {
  clearRect() {},
  fillRect() {},
  fillText() {},
  save() {},
  restore() {},
  translate(...args) { translations.push(args); },
  scale() {},
  beginPath() {},
  arc() {},
  fill() {},
  stroke() {},
};

const racers = [
  { team: 0, prog: 20, position: { x: 100, y: 120 } },
  { team: 1, prog: 100, position: { x: 500, y: 400 } },
  { team: 2, prog: 50, position: { x: 200, y: 240 } },
].map(racer => ({
  ...racer,
  fin: 0,
  zombie: false,
  gone: false,
  hp: 5,
  rad: 9,
  rb: {
    translation: () => ({
      x: pixelsToMeters(racer.position.x),
      y: pixelsToMeters(racer.position.y),
    }),
  },
}));

draw(ctx, { route: [], statics: [], marbles: racers }, "racing", 0, 560, 560);

const averageX = racers.reduce((sum, racer) => sum + racer.position.x, 0) / racers.length;
const averageY = racers.reduce((sum, racer) => sum + racer.position.y, 0) / racers.length;
const leader = racers[1].position;
const expectedX = 180 + (leader.x * 0.6 + averageX * 0.4 - 180) * 0.1;
const expectedY = 200 + (leader.y * 0.6 + averageY * 0.4 - 200) * 0.1;
const cameraTranslation = translations.at(-1);
assert.ok(Math.abs(cameraTranslation[0] + expectedX) < 1e-6, "camera should follow the highest-progress racer");
assert.ok(Math.abs(cameraTranslation[1] + expectedY) < 1e-6, "camera should follow the highest-progress racer's position");

console.log("ok    camera follows highest-progress racer");

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../dist/zombie-marble-run.html", import.meta.url), "utf8");
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, "offline bundle contains an inline script");

const elements = new Map();
const context2d = { setTransform() {} };
function getElement(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      textContent: "",
      style: {},
      classList: { add() {}, remove() {} },
      addEventListener() {},
      getContext: () => context2d,
    });
  }
  return elements.get(id);
}

let animationFrames = 0;
const windowShim = {
  innerWidth: 800,
  innerHeight: 600,
  devicePixelRatio: 1,
  addEventListener() {},
};
const sandbox = {
  document: { getElementById: getElement },
  window: windowShim,
  requestAnimationFrame() { animationFrames++; },
  performance,
  setInterval,
  clearInterval,
  console,
  TextEncoder,
  TextDecoder,
};

vm.runInNewContext(script, sandbox, { timeout: 5000 });
const status = getElement("status");
const deadline = Date.now() + 5000;
while (!windowShim.__game && Date.now() < deadline) {
  await new Promise(resolve => setTimeout(resolve, 10));
}

assert.ok(windowShim.__game?.world, `physics world failed to initialize: ${status.textContent}`);
assert.match(status.textContent, /rapier .* ready/);
assert.equal(animationFrames, 1, "game loop is scheduled after initialization");
console.log(`ok    offline startup (${status.textContent})`);

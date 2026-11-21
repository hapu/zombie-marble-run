import RAPIER from "../vendor/rapier.mjs";
import { makeWorld } from "./world.js";
import {
  spawnMarbles, spawnZombies, stepSim, checkCollisions,
} from "./entities.js";
import {
  combatStep, resetAbilityState, useAbility, updateAbilityTarget,
} from "./combat.js";
import {
  draw, resize,
} from "./render.js";
import { setupInput } from "./input.js";
import { GRAVITY_MPS2, PHYSICS_HZ, pixelsToMeters } from "./physicsUnits.js";

const canvas = document.getElementById("game");
const status = document.getElementById("status");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const btnStart = document.getElementById("btnStart");
const hud = document.getElementById("hud");
const zombiesEl = document.getElementById("zombies");
const timeEl = document.getElementById("time");
const btnBoost = document.getElementById("btnBoost");
const btnShield = document.getElementById("btnShield");
const btnHeal = document.getElementById("btnHeal");

const FIXED_DT = 1 / PHYSICS_HZ;
const GROUND_Y = 0;

const dpr = Math.min(window.devicePixelRatio || 1, 2);

let width = 0;
let height = 0;
let world = null;
let S = null;
let accumulator = 0;
let lastFrame = 0;
let state = "ready"; // ready | countdown | racing | done
let simT = 0;
let countdownId = null;

function startGame() {
  try {
    if (state !== "ready") return;
    overlay.classList.add("hidden");
    hud.classList.remove("hidden");
    state = "countdown";
    let c = 3;
    status.textContent = c;
    countdownId = setInterval(() => {
      try {
        c--;
        if (c > 0) status.textContent = c;
        else {
          clearInterval(countdownId);
          countdownId = null;
          status.textContent = "";
          state = "racing";
          simT = 0;
          accumulator = 0;
          resetAbilityState();
          S = makeWorld(world, 30, "seed", { diff: "normal" });
          spawnMarbles(world, S);
          spawnZombies(world, S);
          lastFrame = performance.now();
        }
      } catch (err) {
        clearInterval(countdownId);
        countdownId = null;
        console.error("startGame error:", err);
        disposeSession();
        S = null;
        state = "ready";
        overlay.classList.remove("hidden");
        hud.classList.add("hidden");
        status.textContent = `Start failed: ${err.message}`;
      }
    }, 700);
  } catch (err) {
    console.error("startGame error:", err);
    disposeSession();
    S = null;
    state = "ready";
    overlay.classList.remove("hidden");
    hud.classList.add("hidden");
    status.textContent = `Start failed: ${err.message}`;
  }
}

function disposeSession() {
  if (!S || !world) return;
  const seen = new Set();
  const bodies = [
    ...S.statics.map(b => b && b.rb),
    ...S.marbles.map(m => m && m.rb),
    ...S.zombies.map(m => m && m.rb),
    S.gate && S.gate.rb,
    S.zgate && S.zgate.rb,
  ];
  for (const rb of bodies) {
    if (!rb || seen.has(rb)) continue;
    seen.add(rb);
    try { world.removeRigidBody(rb); } catch { /* already removed */ }
  }
}

function resetGame() {
  try {
    if (countdownId !== null) {
      clearInterval(countdownId);
      countdownId = null;
    }
    disposeSession();
    S = null;
    state = "ready";
    simT = 0;
    accumulator = 0;
    overlay.classList.remove("hidden");
    hud.classList.add("hidden");
    status.textContent = "rapier ready - click or SPACE to start";
  } catch (err) {
    console.error("resetGame error:", err);
  }
}

async function initPhysics() {
  await RAPIER.init();
  world = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
  world.timestep = FIXED_DT;
  world.numSolverIterations = 6;
  world.maxCcdSubsteps = 4;

  const ground = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(0, pixelsToMeters(GROUND_Y)),
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(pixelsToMeters(50), pixelsToMeters(0.5)),
    ground,
  );

  window.__game = { world };

  const { width: w, height: h } = resize(canvas, dpr);
  width = w;
  height = h;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  window.addEventListener("resize", () => {
    const { width: w2, height: h2 } = resize(canvas, dpr);
    width = w2;
    height = h2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  });

  status.textContent = `rapier ${RAPIER.version ? RAPIER.version() : "unknown"} ready`;
  setupInput(canvas, {
    startGame,
    resetGame,
    useBoost: () => S && useAbility(S, "boost"),
    useShield: () => S && useAbility(S, "shield"),
    useHeal: () => S && useAbility(S, "heal"),
  });
  btnBoost.addEventListener("click", () => S && useAbility(S, "boost"));
  btnShield.addEventListener("click", () => S && useAbility(S, "shield"));
  btnHeal.addEventListener("click", () => S && useAbility(S, "heal"));
  btnStart.addEventListener("click", startGame);

  lastFrame = performance.now();
  requestAnimationFrame(frame);
}

function frame(now) {
  accumulator += Math.min((now - lastFrame) / 1000, 0.1);
  lastFrame = now;

  try {
    if (state === "racing" && S) {
      while (accumulator >= FIXED_DT) {
        simT += FIXED_DT;
        stepSim(world, S, FIXED_DT);
        world.step();
        combatStep(S, FIXED_DT);
        checkCollisions(world, S);
        updateAbilityTarget(S);
        accumulator -= FIXED_DT;
      }
      if (S && S.gameOver) state = "done";
    }

    draw(ctx, S, state, simT, width, height);

    if (state === "racing" && S) {
      const zCount = S.marbles.filter(m => m.zombie && !m.gone).length;
      zombiesEl.textContent = `🧟 ${zCount}`;
      timeEl.textContent = `${simT.toFixed(1)}s`;
    }
  } catch (err) {
    console.error("frame error:", err);
    status.textContent = `Game error: ${err.message}`;
  }

  requestAnimationFrame(frame);
}

initPhysics().catch((error) => {
  console.error("initPhysics error:", error);
  status.textContent = `Physics engine failed: ${error.message}`;
  // Still attach button so user can retry
  btnStart.addEventListener("click", startGame);
});

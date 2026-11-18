import RAPIER from "../vendor/rapier.mjs";

const canvas = document.getElementById("game");
const status = document.getElementById("status");
const ctx = canvas.getContext("2d");

const PX_PER_M = 50;
const FIXED_DT = 1 / 60;
const GROUND_Y = 0;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

let width = 0;
let height = 0;
let world = null;
let ball = null;
let accumulator = 0;
let lastFrame = 0;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function toScreen(x, y) {
  return {
    x: width / 2 + x * PX_PER_M,
    y: height - 40 - (y - GROUND_Y) * PX_PER_M,
  };
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#12121a";
  ctx.fillRect(0, 0, width, height);

  const groundTop = toScreen(0, GROUND_Y + 0.5).y;
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(0, groundTop, width, height - groundTop);

  if (ball) {
    const t = ball.translation();
    const p = toScreen(t.x, t.y);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(ball.rotation());
    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.arc(0, 0, 0.35 * PX_PER_M, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0b3b22";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0.35 * PX_PER_M, 0);
    ctx.stroke();
    ctx.restore();
  }
}

function frame(now) {
  accumulator += Math.min((now - lastFrame) / 1000, 0.1);
  lastFrame = now;
  while (accumulator >= FIXED_DT) {
    world.step();
    accumulator -= FIXED_DT;
  }
  draw();
  requestAnimationFrame(frame);
}

async function start() {
  await RAPIER.init();
  world = new RAPIER.World({ x: 0, y: -9.81 });

  const ground = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, GROUND_Y));
  world.createCollider(RAPIER.ColliderDesc.cuboid(50, 0.5), ground);

  ball = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 6));
  world.createCollider(
    RAPIER.ColliderDesc.ball(0.35).setRestitution(0.6).setFriction(0.4),
    ball,
  );

  canvas.addEventListener("pointerdown", () => {
    ball.applyImpulse({ x: 0, y: 4 }, true);
  });

  window.__game = { world, ball };

  resize();
  window.addEventListener("resize", resize);
  lastFrame = performance.now();
  requestAnimationFrame(frame);

  status.textContent = `rapier ${RAPIER.version()} ready`;
}

start().catch((error) => {
  status.textContent = `Physics engine failed: ${error.message}`;
});

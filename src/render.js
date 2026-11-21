// Canvas rendering with camera follow.
// Ported from prototype Two's draw() logic.

import { CS, HP, R, ZT, TEAMS } from "./gameConfig.js";
import { metersToPixels } from "./physicsUnits.js";

let cam = { x: 180, y: 200 };
let zoom = 1;
let foc = null;

const ZCOL = { walker: "#6fa84a", runner: "#d9e04a", tank: "#3f7a3a", boss: "#8e44ad" };
const HPC = ["#ff3b3b", "#ff3b3b", "#ff9f1c", "#ffd23f", "#8bd450", "#3ddc84"];

export function resize(canvas, dpr) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  return { width, height };
}

export function fit(canvas, ctx, dpr) {
  const d = Math.min(devicePixelRatio || 1, 1.5);
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  canvas.width = cw * d;
  canvas.height = ch * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return { cw, ch };
}

export function draw(ctx, S, state, simT, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#12121a";
  ctx.fillRect(0, 0, width, height);

  const groundTop = height - 40;
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(0, groundTop, width, height - groundTop);

  if (!S) return;

  // Camera: follow the leading human marble
  const humansList = S.marbles.filter(m => m.team >= 0 && !m.fin && !m.zombie && !m.gone);
  if (humansList.length > 0) {
    const ld = humansList.reduce((a, b) => b.prog > a.prog ? b : a);
    let cx = 0, cy = 0;
    humansList.forEach(m => {
      const p = m.rb.translation();
      cx += metersToPixels(p.x);
      cy += metersToPixels(p.y);
    });
    cx /= humansList.length; cy /= humansList.length;
    const leaderPosition = ld.rb.translation();
    const lx = metersToPixels(leaderPosition.x);
    const ly = metersToPixels(leaderPosition.y);
    cam.x += (lx * 0.6 + cx * 0.4 - cam.x) * 0.1;
    cam.y += (ly * 0.6 + cy * 0.4 - cam.y) * 0.1;
  }

  const sc = Math.min(width, height) / 560 * zoom;
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(sc, sc);
  ctx.translate(-cam.x, -cam.y);

  const vw = width / sc / 2 + 60;
  const vh = height / sc / 2 + 60;
  const inv = (x, y, m = 0) => Math.abs(x - cam.x) < vw + m && Math.abs(y - cam.y) < vh + m;

  // Draw chunks
  for (const cell of S.route) {
    if (!inv(cell.ox + 180, cell.oy + 180, 200)) continue;
    ctx.fillStyle = cell.type === "H" ? "#2a2e3b" : cell.type === "S" ? "#2b3a2e" : cell.type === "F" ? "#3a3a2b" : "#262a36";
    ctx.fillRect(cell.ox, cell.oy, CS, CS);
    ctx.fillStyle = "rgba(255,255,255,.4)";
    ctx.font = "700 15px system-ui";
    ctx.fillText(cell.name, cell.ox + 16, cell.oy + 32);
  }

  // Draw static walls/obstacles
  for (const b of S.statics) {
    if (!inv(b.x, b.y, 260)) continue;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle || 0);
    ctx.fillStyle = b.col || "#7a8296";
    ctx.strokeStyle = b.col || "#7a8296";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (b.rad !== undefined) {
      ctx.arc(0, 0, b.rad, 0, Math.PI * 2);
    } else {
      ctx.rect(-b.w / 2, -b.h / 2, b.w, b.h);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  for (const pickup of S.pickups) {
    if (pickup.taken || !inv(pickup.x, pickup.y, pickup.r)) continue;
    ctx.beginPath();
    ctx.arc(pickup.x, pickup.y, pickup.r, 0, Math.PI * 2);
    ctx.fillStyle = "#35b86b";
    ctx.fill();
    ctx.strokeStyle = "#d8ffe2";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillRect(pickup.x - 2, pickup.y - 7, 4, 14);
    ctx.fillRect(pickup.x - 7, pickup.y - 2, 14, 4);
  }

  // Draw marbles and zombies
  for (const m of S.marbles) {
    if (m.gone) continue;
    const position = m.rb.translation();
    const x = metersToPixels(position.x);
    const y = metersToPixels(position.y);
    if (!inv(x, y)) continue;
    const rr = m.rad || R;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI * 2);
    ctx.fillStyle = m.zombie ? (ZCOL[m.zt || "walker"] || "#6fa84a") : TEAMS[m.team].c;
    ctx.fill();
    ctx.lineWidth = m.zt === "boss" ? 3 : 2;
    ctx.strokeStyle = m.zombie ? "rgba(0,0,0,.5)" : (TEAMS[m.team].rim || "rgba(0,0,0,.3)");
    ctx.stroke();

    // HP bar for humans
    if (!m.zombie && !m.fin) {
      ctx.fillStyle = "rgba(0,0,0,.6)";
      ctx.fillRect(x - 8, y - rr - 7, 16, 4);
      ctx.fillStyle = HPC[Math.min(m.hp, 5)];
      ctx.fillRect(x - 7, y - rr - 6, 14 * m.hp / HP, 2);
    }
    // Zombie HP bar
    if (m.zombie && m.zhp < m.zmax) {
      ctx.fillStyle = "rgba(0,0,0,.6)";
      ctx.fillRect(x - rr - 1, y - rr - 7, rr * 2 + 2, 4);
      ctx.fillStyle = "#9be36b";
      ctx.fillRect(x - rr, y - rr - 6, rr * 2 * Math.max(0, m.zhp) / m.zmax, 2);
    }
  }

  ctx.restore();

  // HUD text
  ctx.fillStyle = "#f3f6ff";
  ctx.font = "16px system-ui";
  const zombiesAlive = S.marbles.filter(m => m.zombie && !m.gone).length;
  ctx.fillText(`Zombies: ${zombiesAlive}  Time: ${simT.toFixed(1)}s`, 10, 30);

  if (state === "done") {
    ctx.fillStyle = "rgba(0,0,0,.7)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", width / 2, height / 2);
    ctx.font = "18px system-ui";
    ctx.fillText("Press R to restart", width / 2, height / 2 + 40);
    ctx.textAlign = "left";
  }
}

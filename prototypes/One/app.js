const canvas = document.querySelector("#gameCanvas");
const context = canvas.getContext("2d");
const startButton = document.querySelector("#startButton");
const resetButton = document.querySelector("#resetButton");
const marbleCount = document.querySelector("#marbleCount");
const seedInput = document.querySelector("#seedInput");
const randomSeedButton = document.querySelector("#randomSeedButton");
const dailySeedButton = document.querySelector("#dailySeedButton");
const copyLinkButton = document.querySelector("#copyLinkButton");
const mapButton = document.querySelector("#mapButton");
const debugButton = document.querySelector("#debugButton");
const raceStatus = document.querySelector("#raceStatus");
const winnerDisplay = document.querySelector("#winnerDisplay");
const timerLabel = document.querySelector("#timerLabel");
const raceBanner = document.querySelector("#raceBanner");
const raceHud = document.querySelector("#raceHud");
const mapPanel = document.querySelector("#mapPanel");
const debugPanel = document.querySelector("#debugPanel");
const toast = document.querySelector("#toast");

const WIDTH = 900;
const HEIGHT = 660;
const MARBLE_RADIUS = 11;
const RESTITUTION = 0.72;
const MAX_SPEED = 170;
const STEERING = 820;
const colors = ["#ff627d", "#ffc857", "#52d6a5", "#58a6ff", "#bd8cff", "#ff8f5c", "#50d9e8", "#f38dcc"];

canvas.width = WIDTH;
canvas.height = HEIGHT;

let maze = null;
let routeSegments = [];
let walls = [];
let worldHeight = HEIGHT;
let marbles = [];
let raceState = "ready";
let lastFrame = 0;
let animationFrame = 0;
let countdownTimer = null;
let clockTime = 0;
let cameraY = 0;
let debugEnabled = false;
let fpsSample = 0;
let fpsFrameCount = 0;
let lastTimestamp = 0;

function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seedValue) {
  let state = hashSeed(seedValue) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeSeed(value) {
  const seed = String(value || "").trim();
  return seed || generateDailySeed();
}

function generateDailySeed() {
  const date = new Date();
  const stamp = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  return `day-${stamp}`;
}

function generateRandomSeed() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let index = 0; index < 8; index += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `seed-${result}`;
}

function cellKey(row, column) {
  return `${row},${column}`;
}

function buildMaze(seedValue) {
  const rng = createRng(seedValue);
  const columns = 10;
  const rows = 15;
  const cellWidth = 82;
  const cellHeight = 76;
  const left = (WIDTH - columns * cellWidth) / 2;
  const top = 72;
  const doorWidth = 48;
  const cells = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({ passages: new Set() })),
  );
  const start = { row: 0, column: Math.floor(rng() * columns) };
  const visited = new Set([cellKey(start.row, start.column)]);
  const stack = [start];
  const directions = [
    { name: "up", opposite: "down", row: -1, column: 0 },
    { name: "right", opposite: "left", row: 0, column: 1 },
    { name: "down", opposite: "up", row: 1, column: 0 },
    { name: "left", opposite: "right", row: 0, column: -1 },
  ];

  while (stack.length) {
    const current = stack[stack.length - 1];
    const options = directions
      .map((direction) => ({
        ...direction,
        row: current.row + direction.row,
        column: current.column + direction.column,
      }))
      .filter((next) =>
        next.row >= 0 &&
        next.row < rows &&
        next.column >= 0 &&
        next.column < columns &&
        !visited.has(cellKey(next.row, next.column)),
      );

    if (!options.length) {
      stack.pop();
      continue;
    }

    const next = options[Math.floor(rng() * options.length)];
    cells[current.row][current.column].passages.add(next.name);
    cells[next.row][next.column].passages.add(next.opposite);
    visited.add(cellKey(next.row, next.column));
    stack.push({ row: next.row, column: next.column });
  }

  const distanceByCell = new Map([[cellKey(start.row, start.column), 0]]);
  const parentByCell = new Map();
  const queue = [start];
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const currentKey = cellKey(current.row, current.column);
    for (const direction of directions) {
      if (!cells[current.row][current.column].passages.has(direction.name)) continue;
      const next = { row: current.row + direction.row, column: current.column + direction.column };
      const nextKey = cellKey(next.row, next.column);
      if (distanceByCell.has(nextKey)) continue;
      distanceByCell.set(nextKey, distanceByCell.get(currentKey) + 1);
      parentByCell.set(nextKey, current);
      queue.push(next);
    }
  }

  const exit = cells[rows - 1]
    .map((_, column) => ({ row: rows - 1, column }))
    .reduce((farthest, cell) =>
      distanceByCell.get(cellKey(cell.row, cell.column)) > distanceByCell.get(cellKey(farthest.row, farthest.column))
        ? cell
        : farthest,
    );
  const reversedPath = [];
  for (let current = exit; current; current = parentByCell.get(cellKey(current.row, current.column))) {
    reversedPath.push(current);
    if (current.row === start.row && current.column === start.column) break;
  }
  const cellPath = reversedPath.reverse();
  const centerOf = (cell) => ({
    x: left + (cell.column + 0.5) * cellWidth,
    y: top + (cell.row + 0.5) * cellHeight,
  });
  const points = cellPath.map(centerOf);
  points.push({ x: centerOf(exit).x, y: top + rows * cellHeight + 34 });

  const segments = [];
  let totalLength = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const startPoint = points[index];
    const endPoint = points[index + 1];
    const length = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
    segments.push({
      start: startPoint,
      end: endPoint,
      length,
      progress: totalLength,
      dx: (endPoint.x - startPoint.x) / length,
      dy: (endPoint.y - startPoint.y) / length,
    });
    totalLength += length;
  }

  const track = { columns, rows, cellWidth, cellHeight, left, top, doorWidth, cells, start, exit, cellPath, points, totalLength };
  return { maze: track, segments, walls: buildMazeWalls(track), worldHeight: top + rows * cellHeight + 78 };
}

function buildMazeWalls(track) {
  const segments = [];
  const { columns, rows, cellWidth, cellHeight, left, top, doorWidth, cells, start, exit } = track;

  function addWall(x1, y1, x2, y2) {
    segments.push({ x1, y1, x2, y2 });
  }

  for (let row = 0; row < rows; row += 1) {
    const y1 = top + row * cellHeight;
    const y2 = y1 + cellHeight;
    for (let boundary = 0; boundary <= columns; boundary += 1) {
      const x = left + boundary * cellWidth;
      if (boundary === 0 || boundary === columns) {
        addWall(x, y1, x, y2);
      } else if (!cells[row][boundary - 1].passages.has("right")) {
        addWall(x, y1, x, y2);
      } else {
        const gapTop = y1 + (cellHeight - doorWidth) / 2;
        const gapBottom = gapTop + doorWidth;
        addWall(x, y1, x, gapTop);
        addWall(x, gapBottom, x, y2);
      }
    }
  }

  for (let boundary = 0; boundary <= rows; boundary += 1) {
    const y = top + boundary * cellHeight;
    for (let column = 0; column < columns; column += 1) {
      const x1 = left + column * cellWidth;
      const x2 = x1 + cellWidth;
      const isEntrance = boundary === 0 && column === start.column;
      const isExit = boundary === rows && column === exit.column;
      const hasPassage = boundary > 0 && boundary < rows && cells[boundary - 1][column].passages.has("down");
      if (isEntrance || isExit || hasPassage) {
        const gapLeft = x1 + (cellWidth - doorWidth) / 2;
        const gapRight = gapLeft + doorWidth;
        addWall(x1, y, gapLeft, y);
        addWall(gapRight, y, x2, y);
      } else {
        addWall(x1, y, x2, y);
      }
    }
  }
  return segments;
}

function makeMarbles(count) {
  const startX = maze.left + (maze.start.column + 0.5) * maze.cellWidth;
  const startY = maze.top + maze.cellHeight / 2;
  const spacing = Math.min(25, maze.doorWidth / count);
  const rng = createRng(normalizeSeed(seedInput.value));

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    x: startX + (index - (count - 1) / 2) * spacing + (rng() - 0.5) * 3,
    y: startY + (rng() - 0.5) * 8,
    vx: 0,
    vy: 0,
    color: colors[index % colors.length],
    finished: false,
    finishOrder: null,
    progress: 0,
  }));
}

function updateStatus(text) {
  raceStatus.textContent = text;
}

function updateTimer() {
  timerLabel.textContent = `${clockTime.toFixed(1)}s`;
}

function showBanner(text, kind = "default") {
  raceBanner.textContent = text;
  raceBanner.className = `race-banner ${kind}`;
  raceBanner.style.display = "block";
}

function hideBanner() {
  raceBanner.textContent = "";
  raceBanner.className = "race-banner";
  raceBanner.style.display = "none";
}

function toastMessage(text) {
  toast.textContent = text;
  toast.style.display = "block";
  clearTimeout(toastMessage.timeoutId);
  toastMessage.timeoutId = setTimeout(() => {
    toast.style.display = "none";
  }, 1400);
}

function updateRaceHud() {
  const html = marbles
    .map((marble) => {
      const isFinished = marble.finished;
      const marker = isFinished ? `#${marble.finishOrder}` : `R${marble.id}`;
      const name = isFinished ? "✓" : marble.id;
      return `
        <div class="race-pill" style="border-color:${marble.color}; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);">
          <strong style="color:${marble.color};">${name}</strong>
          <span>${marker}</span>
        </div>
      `;
    })
    .join("");

  raceHud.innerHTML = html;
}

function renderMapPanel() {
  const routeCells = new Set(maze.cellPath.map((cell) => cellKey(cell.row, cell.column)));
  const grid = document.createElement("div");
  grid.className = "map-grid";
  grid.style.gridTemplateColumns = `repeat(${maze.columns}, minmax(0, 1fr))`;
  for (let row = 0; row < maze.rows; row += 1) {
    for (let column = 0; column < maze.columns; column += 1) {
      const cell = maze.cells[row][column];
      const tile = document.createElement("div");
      const onRoute = routeCells.has(cellKey(row, column));
      tile.textContent = row === maze.start.row && column === maze.start.column
        ? "S"
        : row === maze.exit.row && column === maze.exit.column ? "E" : "";
      tile.style.minHeight = "10px";
      tile.style.borderRadius = "1px";
      tile.style.background = onRoute ? "rgba(125, 226, 194, 0.35)" : "rgba(72, 86, 106, 0.28)";
      tile.style.borderTop = row === 0 || !maze.cells[row - 1][column].passages.has("down") ? "1px solid #718198" : "1px solid transparent";
      tile.style.borderRight = column === maze.columns - 1 || !cell.passages.has("right") ? "1px solid #718198" : "1px solid transparent";
      tile.style.borderBottom = row === maze.rows - 1 || !cell.passages.has("down") ? "1px solid #718198" : "1px solid transparent";
      tile.style.borderLeft = column === 0 || !maze.cells[row][column - 1].passages.has("right") ? "1px solid #718198" : "1px solid transparent";
      grid.append(tile);
    }
  }

  const title = document.createElement("strong");
  title.textContent = `Seed ${normalizeSeed(seedInput.value)} · ${maze.columns}×${maze.rows} maze`;
  mapPanel.replaceChildren(title, grid);
}

function updateDebugPanel() {
  if (!debugEnabled) {
    debugPanel.style.display = "none";
    return;
  }

  const liveMarbles = marbles.filter((marble) => !marble.finished).length;
  debugPanel.innerHTML = `fps ${fpsSample.toFixed(0)}<br>wall count ${walls.length}<br>marbles ${liveMarbles}<br>state ${raceState}<br>seed ${normalizeSeed(seedInput.value)}`;
  debugPanel.style.display = "block";
}

function setSeedValue(value) {
  seedInput.value = normalizeSeed(value);
  resetRace();
}

function resetRace() {
  clearInterval(countdownTimer);
  cancelAnimationFrame(animationFrame);

  const seedValue = normalizeSeed(seedInput.value);
  const track = buildMaze(seedValue);
  maze = track.maze;
  routeSegments = track.segments;
  walls = track.walls;
  worldHeight = track.worldHeight;
  marbles = makeMarbles(Number(marbleCount.value));
  raceState = "ready";
  cameraY = 0;
  lastFrame = 0;
  lastTimestamp = 0;
  fpsFrameCount = 0;
  fpsSample = 0;
  clockTime = 0;
  updateTimer();
  winnerDisplay.textContent = "";
  updateStatus("Ready at the starting line");
  startButton.disabled = false;
  hideBanner();
  renderMapPanel();
  updateRaceHud();
  updateDebugPanel();
  draw();
}

function startRace() {
  if (raceState === "racing" || raceState === "countdown") return;

  if (raceState === "finished") {
    resetRace();
  }

  raceState = "countdown";
  startButton.disabled = true;
  let countdown = 3;
  showBanner(String(countdown));

  countdownTimer = setInterval(() => {
    countdown -= 1;
    if (countdown > 0) {
      showBanner(String(countdown));
      return;
    }

    clearInterval(countdownTimer);
    hideBanner();
    raceState = "racing";
    updateStatus("Race in progress");
    lastFrame = 0;
    clockTime = 0;
    animationFrame = requestAnimationFrame(tick);
  }, 700);
}

function finishRace() {
  raceState = "finished";
  lastTimestamp = 0;
  startButton.disabled = false;
  updateStatus("Race complete");

  const ordered = [...marbles].sort((a, b) => (a.finishOrder ?? Number.MAX_SAFE_INTEGER) - (b.finishOrder ?? Number.MAX_SAFE_INTEGER));
  const winner = ordered[0];
  winnerDisplay.textContent = winner ? `Marble ${winner.id} wins!` : "Race complete!";

  const rows = ordered
    .map((marble, index) => {
      const prefix = index === 0 ? "1st" : index === 1 ? "2nd" : index === 2 ? "3rd" : `#${index + 1}`;
      return `
        <div class="result-row">
          <span><span class="swatch" style="background:${marble.color};"></span>${prefix} Marble ${marble.id}</span>
          <span>${clockTime.toFixed(1)}s</span>
        </div>
      `;
    })
    .join("");

  const headline = winner ? `Marble ${winner.id} takes the win!` : "Race complete";
  raceBanner.className = "race-banner result";
  raceBanner.innerHTML = `<h2>${headline}</h2>${rows}`;
  raceBanner.style.display = "block";
  updateRaceHud();
}

function simulate(delta) {
  for (const marble of marbles) {
    if (marble.finished) continue;

    const segmentIndex = findRouteSegment(marble);
    const segment = routeSegments[segmentIndex];
    const nextSegment = routeSegments[Math.min(segmentIndex + 1, routeSegments.length - 1)];
    const projection = projectToSegment(marble.x, marble.y, segment);
    const target = projection.t > 0.68 && segmentIndex < routeSegments.length - 1
      ? nextSegment.end
      : segment.end;
    const targetDx = target.x - marble.x;
    const targetDy = target.y - marble.y;
    const targetDistance = Math.hypot(targetDx, targetDy) || 1;
    const desiredSpeed = Math.min(MAX_SPEED, Math.max(70, targetDistance * 2));
    const desiredVx = (targetDx / targetDistance) * desiredSpeed;
    const desiredVy = (targetDy / targetDistance) * desiredSpeed;
    const velocityChange = Math.hypot(desiredVx - marble.vx, desiredVy - marble.vy);
    const steeringScale = Math.min(1, (STEERING * delta) / (velocityChange || 1));
    marble.vx += (desiredVx - marble.vx) * steeringScale;
    marble.vy += (desiredVy - marble.vy) * steeringScale;
    marble.x += marble.vx * delta;
    marble.y += marble.vy * delta;

    for (const wall of walls) {
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const wallLengthSquared = dx * dx + dy * dy;
      const wallProgress = wallLengthSquared
        ? Math.max(0, Math.min(1, ((marble.x - wall.x1) * dx + (marble.y - wall.y1) * dy) / wallLengthSquared))
        : 0;
      const closestX = wall.x1 + wallProgress * dx;
      const closestY = wall.y1 + wallProgress * dy;
      const offsetX = marble.x - closestX;
      const offsetY = marble.y - closestY;
      const distance = Math.hypot(offsetX, offsetY);
      const minimumDistance = MARBLE_RADIUS + 2;
      if (distance >= minimumDistance) continue;

      const normalX = distance > 0 ? offsetX / distance : dy === 0 ? 0 : Math.sign(marble.x - wall.x1) || 1;
      const normalY = distance > 0 ? offsetY / distance : dx === 0 ? 0 : Math.sign(marble.y - wall.y1) || 1;
      marble.x = closestX + normalX * minimumDistance;
      marble.y = closestY + normalY * minimumDistance;
      const velocityAlongNormal = marble.vx * normalX + marble.vy * normalY;
      if (velocityAlongNormal < 0) {
        marble.vx -= (1 + RESTITUTION) * velocityAlongNormal * normalX;
        marble.vy -= (1 + RESTITUTION) * velocityAlongNormal * normalY;
      }
    }

    const progress = projectProgress(marble);
    marble.progress = Math.max(marble.progress, progress);
    if (marble.progress >= maze.totalLength - MARBLE_RADIUS && marble.y >= maze.top + maze.rows * maze.cellHeight) {
      marble.finished = true;
      marble.finishOrder = marbles.filter((item) => item.finished).length;
    }
  }

  for (let first = 0; first < marbles.length; first += 1) {
    for (let second = first + 1; second < marbles.length; second += 1) {
      collideMarbles(marbles[first], marbles[second]);
    }
  }

  updateCamera();
}

function projectToSegment(x, y, segment) {
  const relativeX = x - segment.start.x;
  const relativeY = y - segment.start.y;
  const t = Math.max(0, Math.min(1, (relativeX * segment.dx + relativeY * segment.dy) / segment.length));
  const projectedX = segment.start.x + segment.dx * segment.length * t;
  const projectedY = segment.start.y + segment.dy * segment.length * t;
  return { t, distance: Math.hypot(x - projectedX, y - projectedY) };
}

function findRouteSegment(marble) {
  let closestIndex = 0;
  let closestDistance = Infinity;
  for (let index = 0; index < routeSegments.length; index += 1) {
    const distance = projectToSegment(marble.x, marble.y, routeSegments[index]).distance;
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }
  return closestIndex;
}

function projectProgress(marble) {
  const segmentIndex = findRouteSegment(marble);
  const segment = routeSegments[segmentIndex];
  const projection = projectToSegment(marble.x, marble.y, segment);
  return segment.progress + segment.length * projection.t;
}

function updateCamera() {
  const leader = marbles
    .filter((marble) => !marble.finished)
    .reduce((best, marble) => !best || marble.progress > best.progress ? marble : best, null);
  if (!leader) return;
  const targetY = Math.max(0, Math.min(worldHeight - HEIGHT, leader.y - HEIGHT * 0.54));
  cameraY += (targetY - cameraY) * 0.1;
}

function collideMarbles(first, second) {
  if (first.finished || second.finished) return;
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  const distance = Math.hypot(dx, dy);
  const minimumDistance = MARBLE_RADIUS * 2;
  if (distance === 0 || distance >= minimumDistance) return;

  const normalX = dx / distance;
  const normalY = dy / distance;
  const overlap = minimumDistance - distance;
  first.x -= normalX * overlap / 2;
  first.y -= normalY * overlap / 2;
  second.x += normalX * overlap / 2;
  second.y += normalY * overlap / 2;

  const relativeVelocity = (second.vx - first.vx) * normalX + (second.vy - first.vy) * normalY;
  if (relativeVelocity < 0) {
    const impulse = -(1 + 0.82) * relativeVelocity / 2;
    first.vx -= impulse * normalX;
    first.vy -= impulse * normalY;
    second.vx += impulse * normalX;
    second.vy += impulse * normalY;
  }
}

function draw() {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  const background = context.createLinearGradient(0, 0, 0, HEIGHT);
  background.addColorStop(0, "#111a2b");
  background.addColorStop(1, "#0b1220");
  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.save();
  context.translate(0, -cameraY);
  context.fillStyle = "#0e1726";
  context.fillRect(0, 0, WIDTH, worldHeight);
  for (let row = 0; row < maze.rows; row += 1) {
    for (let column = 0; column < maze.columns; column += 1) {
      context.fillStyle = (row + column) % 2 === 0 ? "rgba(44, 63, 88, 0.2)" : "rgba(25, 39, 59, 0.2)";
      context.fillRect(
        maze.left + column * maze.cellWidth,
        maze.top + row * maze.cellHeight,
        maze.cellWidth,
        maze.cellHeight,
      );
    }
  }
  context.strokeStyle = "#273750";
  context.lineWidth = 8;
  context.lineCap = "round";
  context.beginPath();
  for (const wall of walls) {
    context.moveTo(wall.x1, wall.y1);
    context.lineTo(wall.x2, wall.y2);
  }
  context.stroke();
  context.lineCap = "butt";

  context.fillStyle = "#7de2c2";
  context.font = "700 12px system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText("START", maze.left + (maze.start.column + 0.5) * maze.cellWidth, maze.top - 16);
  context.fillStyle = "#ffd166";
  context.fillText("EXIT", maze.left + (maze.exit.column + 0.5) * maze.cellWidth, maze.top + maze.rows * maze.cellHeight + 55);
  for (const marble of marbles) drawMarble(marble);
  context.restore();
}

function drawMarble(marble) {
  context.save();
  context.shadowColor = marble.color;
  context.shadowBlur = 16;
  context.beginPath();
  context.arc(marble.x, marble.y, MARBLE_RADIUS, 0, Math.PI * 2);
  context.fillStyle = marble.color;
  context.fill();
  context.shadowBlur = 0;
  context.beginPath();
  context.arc(marble.x - 3.5, marble.y - 4, 3.2, 0, Math.PI * 2);
  context.fillStyle = "rgba(255, 255, 255, 0.78)";
  context.fill();
  context.fillStyle = "#101827";
  context.font = "700 9px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(marble.id), marble.x, marble.y + 1);
  if (marble.finished) {
    context.fillStyle = "#d9e5f4";
    context.font = "700 11px system-ui, sans-serif";
    context.fillText(`#${marble.finishOrder}`, marble.x, marble.y + 22);
  }
  context.restore();
}

function tick(timestamp) {
  if (raceState !== "racing") return;

  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }

  fpsFrameCount += 1;
  const elapsed = timestamp - lastTimestamp;
  if (elapsed > 500) {
    fpsSample = (fpsFrameCount * 1000) / elapsed;
    fpsFrameCount = 0;
    lastTimestamp = timestamp;
    updateDebugPanel();
  }

  const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 1 / 30) : 1 / 60;
  lastFrame = timestamp;
  clockTime += delta;
  updateTimer();

  const steps = 2;
  for (let step = 0; step < steps; step += 1) {
    simulate(delta / steps);
  }

  draw();
  updateRaceHud();

  if (marbles.every((marble) => marble.finished)) {
    finishRace();
    return;
  }

  animationFrame = requestAnimationFrame(tick);
}

function showMap() {
  if (mapPanel.style.display === "block") {
    mapPanel.style.display = "none";
    return;
  }
  renderMapPanel();
  mapPanel.style.display = "block";
}

function toggleDebug() {
  debugEnabled = !debugEnabled;
  if (!debugEnabled) {
    debugPanel.style.display = "none";
    return;
  }
  updateDebugPanel();
}

function copySeedLink() {
  const seedValue = normalizeSeed(seedInput.value);
  const url = `${location.href.split("#")[0]}#${encodeURIComponent(seedValue)}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => toastMessage("Link copied"))
      .catch(() => toastMessage(url));
    return;
  }

  toastMessage(url);
}

function parseSeedFromUrl() {
  const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!hash) return null;
  return hash;
}

function applySeedFromUrl() {
  const seed = parseSeedFromUrl();
  if (!seed) {
    seedInput.value = generateDailySeed();
    return;
  }
  seedInput.value = seed;
}

startButton.addEventListener("click", startRace);
resetButton.addEventListener("click", resetRace);
marbleCount.addEventListener("change", resetRace);
seedInput.addEventListener("change", resetRace);
randomSeedButton.addEventListener("click", () => {
  seedInput.value = generateRandomSeed();
  resetRace();
});
dailySeedButton.addEventListener("click", () => {
  seedInput.value = generateDailySeed();
  resetRace();
});
copyLinkButton.addEventListener("click", copySeedLink);
mapButton.addEventListener("click", showMap);
debugButton.addEventListener("click", toggleDebug);

applySeedFromUrl();
resetRace();

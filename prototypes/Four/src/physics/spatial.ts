/** Pure spatial helpers: segment distance, room lookup, active-room selection. */
import type { Marble, CourseData, Wall, Bumper, Projectile, TemporaryBarricade } from '../types';
import { ROOM_SIZE, GRID_COLS, GRID_ROWS } from '../constants';

export function distToSegmentSquared(
  px: number,
  py: number,
  vx: number,
  vy: number,
  wx: number,
  wy: number
) {
  const segDx = wx - vx;
  const segDy = wy - vy;
  const l2 = segDx * segDx + segDy * segDy;
  if (l2 === 0) {
    const dx = px - vx;
    const dy = py - vy;
    return { distSq: dx * dx + dy * dy, projX: vx, projY: vy, nx: dx, ny: dy, t: 0, segDx: 0, segDy: 0 };
  }
  let t = ((px - vx) * segDx + (py - vy) * segDy) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = vx + t * segDx;
  const projY = vy + t * segDy;
  const dx = px - projX;
  const dy = py - projY;

  return {
    distSq: dx * dx + dy * dy,
    projX,
    projY,
    nx: dx,
    ny: dy,
    t,
    segDx,
    segDy,
  };
}

export class SpatialHashGrid {
  public cellSize: number;
  constructor(cellSize: number = 200) {
    this.cellSize = cellSize;
  }
  public insertWall(_w: Wall) {}
  public insertBumper(_b: Bumper) {}
  public queryWallsInto(_x: number, _y: number, _r: number, outList: Wall[], seenSet: Set<Wall>): void {
    outList.length = 0;
    seenSet.clear();
  }
  public queryBumpersInto(_x: number, _y: number, _r: number, outList: Bumper[], seenSet: Set<Bumper>): void {
    outList.length = 0;
    seenSet.clear();
  }
}

// Returns the room chunk index (0..24) in the 5x5 grid
export function getChunkIndexAt(course: CourseData, x: number, y: number): number {
  if (!course.chunks || course.chunks.length === 0) return 0;
  const col = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(x / ROOM_SIZE)));
  const row = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(y / ROOM_SIZE)));
  const idx = row * GRID_COLS + col;
  if (course.chunks[idx]) return idx;

  let bestIdx = 0;
  let minDistSq = Infinity;
  for (let i = 0; i < course.chunks.length; i++) {
    const c = course.chunks[i];
    const cx = c.x + c.size / 2;
    const cy = c.y + c.size / 2;
    const dSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
    if (dSq < minDistSq) {
      minDistSq = dSq;
      bestIdx = i;
    }
  }
  return bestIdx;
}

// Entity-Based Dynamic Spatial Activation for the 5x5 branching labyrinth:
// Activates rooms occupied by active marbles/zombies/projectiles/barricades PLUS doorway-connected neighbors
/**
 * Allocation-free 25-bit mask of the rooms getActiveChunkIndices() would return.
 * Used each tick to detect a change cheaply; the array is only rebuilt when the mask changes.
 */
export function computeActiveMask(
  course: CourseData,
  marbles: Marble[],
  projectiles: Projectile[],
  barricades: TemporaryBarricade[]
): number {
  const chunks = course.chunks;
  if (!chunks || chunks.length === 0) return 0;
  let mask = 0;
  for (let i = 0; i < marbles.length; i++) {
    const m = marbles[i];
    if (m.finished || m.gone) continue;
    const cIdx = getChunkIndexAt(course, m.x, m.y);
    mask |= 1 << cIdx;
    const room = chunks[cIdx];
    if (!room || !room.doors) continue;
    if (room.doors.n && room.row > 0) mask |= 1 << ((room.row - 1) * 5 + room.col);
    if (room.doors.s && room.row < 4) mask |= 1 << ((room.row + 1) * 5 + room.col);
    if (room.doors.w && room.col > 0) mask |= 1 << (room.row * 5 + (room.col - 1));
    if (room.doors.e && room.col < 4) mask |= 1 << (room.row * 5 + (room.col + 1));
  }
  for (let i = 0; i < projectiles.length; i++) mask |= 1 << getChunkIndexAt(course, projectiles[i].x, projectiles[i].y);
  for (let i = 0; i < barricades.length; i++) mask |= 1 << getChunkIndexAt(course, barricades[i].x, barricades[i].y);
  if (mask === 0) mask = 1 << (chunks.length - 1);
  return mask;
}

export function getActiveChunkIndices(
  course: CourseData,
  marbles: Marble[],
  projectiles: Projectile[] = [],
  barricades: TemporaryBarricade[] = []
): number[] {
  if (!course.chunks || course.chunks.length === 0) return [];
  const activeSet = new Set<number>();

  const addRoomWithNeighbors = (cIdx: number) => {
    activeSet.add(cIdx);
    const room = course.chunks[cIdx];
    if (!room || !room.doors) return;
    if (room.doors.n && room.row > 0) activeSet.add((room.row - 1) * 5 + room.col);
    if (room.doors.s && room.row < 4) activeSet.add((room.row + 1) * 5 + room.col);
    if (room.doors.w && room.col > 0) activeSet.add(room.row * 5 + (room.col - 1));
    if (room.doors.e && room.col < 4) activeSet.add(room.row * 5 + (room.col + 1));
  };

  for (let i = 0; i < marbles.length; i++) {
    const m = marbles[i];
    if (!m.finished && !m.gone) {
      const cIdx = getChunkIndexAt(course, m.x, m.y);
      addRoomWithNeighbors(cIdx);
    }
  }

  for (let i = 0; i < projectiles.length; i++) {
    const p = projectiles[i];
    activeSet.add(getChunkIndexAt(course, p.x, p.y));
  }

  for (let i = 0; i < barricades.length; i++) {
    const b = barricades[i];
    activeSet.add(getChunkIndexAt(course, b.x, b.y));
  }

  if (activeSet.size === 0) {
    activeSet.add(course.chunks.length - 1);
  }

  return Array.from(activeSet).sort((a, b) => a - b);
}

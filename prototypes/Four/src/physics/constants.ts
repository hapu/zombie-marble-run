import { ROOM_SIZE, GRID_COLS, GRID_ROWS } from '../constants';

export const WORLD_W = ROOM_SIZE * GRID_COLS; // 2500px
export const WORLD_H = ROOM_SIZE * GRID_ROWS; // 2500px

// Rapier2D world unit scale: 50 pixels = 1 meter for optimal solver stability & realistic rolling inertia
export const SCALE = 50;
export const INV_SCALE = 1 / SCALE;

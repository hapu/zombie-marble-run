// Shared game values that both physics and rendering may read.
// Rendering must never import physics modules or Rapier.

export const CS = 360;
export const ROWS = 5;
export const COLS = 5;
export const HP = 5;
export const R = 9;

export const ZT = {
  walker: { r: 9, hp: 4, f: 1, v: 1.2, d: 0.002 },
  runner: { r: 8, hp: 2, f: 1.8, v: 1.6, d: 0.002 },
  tank: { r: 11, hp: 10, f: 0.8, v: 1.1, d: 0.004 },
  boss: { r: 12, hp: 24, f: 0.9, v: 1.1, d: 0.006 },
};

export const TEAMS = [
  { n: "Red", c: "#ff2d2d" }, { n: "Green", c: "#1fcf3a" }, { n: "Blue", c: "#2f5bff" },
  { n: "Yellow", c: "#ffe81f" }, { n: "Cyan", c: "#00e5ff" }, { n: "Magenta", c: "#ff2bd6" },
  { n: "Orange", c: "#ff8a00" }, { n: "Chartreuse", c: "#8cff00" }, { n: "Spring Green", c: "#00ff7f" },
  { n: "Azure", c: "#0a8cff" }, { n: "Violet", c: "#8b3dff" }, { n: "Rose", c: "#ff2d7f" },
  { n: "Black", c: "#111111" }, { n: "Grey", c: "#8a8a8a" }, { n: "White", c: "#ffffff" },
];

export const WEAPONS = [
  { n: "Pistol", i: "🔫", range: 150, cd: 1.1, dmg: 1, kb: 0.8, clip: 14 },
  { n: "Shotgun", i: "💥", range: 90, cd: 2, dmg: 2, kb: 2, clip: 6 },
  { n: "Bat", i: "🏏", range: 34, cd: 0.8, dmg: 1, kb: 2.2, clip: 99 },
  { n: "Sword", i: "🗡️", range: 40, cd: 0.6, dmg: 1.5, kb: 0.6, clip: 99 },
  { n: "Rifle", i: "🎯", range: 220, cd: 1.6, dmg: 2, kb: 0.4, clip: 8 },
];

export const DIFFS = {
  easy: { zhp: 4, zf: 0.0002, zd: 5, n: 1 },
  normal: { zhp: 5, zf: 0.00026, zd: 0.75, n: 1.25 },
  hard: { zhp: 6, zf: 0.00032, zd: 2, n: 1.5 },
};

// Input handling: start/reset, abilities, marble selection, restart.

export function setupInput(canvas, { startGame, resetGame, useBoost, useShield, useHeal }) {
  canvas.addEventListener("pointerdown", () => {
    if (startGame) startGame();
  });

  window.addEventListener("keydown", (e) => {
    if (e.target && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
    if (e.key === " ") { startGame?.(); }
    else if (e.key === "1") { useBoost?.(); }
    else if (e.key === "2") { useShield?.(); }
    else if (e.key === "3") { useHeal?.(); }
    else if (e.key === "r" || e.key === "R") { resetGame?.(); }
  });
}

import RAPIER from '@dimforge/rapier2d-compat';

let rapierInitPromise: Promise<void> | null = null;
let rapierInitialized = false;

export async function initPhysicsEngine(): Promise<void> {
  if (rapierInitialized) return;
  if (!rapierInitPromise) {
    rapierInitPromise = RAPIER.init().then(() => {
      rapierInitialized = true;
    });
  }
  await rapierInitPromise;
}

export function isPhysicsReady(): boolean {
  return rapierInitialized;
}

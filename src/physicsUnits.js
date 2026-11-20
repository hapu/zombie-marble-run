export const PX_PER_METER = 50;
export const PHYSICS_HZ = 60;
export const GRAVITY_MPS2 = 9.81;

export function pixelsToMeters(value) {
  return value / PX_PER_METER;
}

export function metersToPixels(value) {
  return value * PX_PER_METER;
}

export function densityPerPixelSquaredToPerMeterSquared(value) {
  return value * PX_PER_METER * PX_PER_METER;
}

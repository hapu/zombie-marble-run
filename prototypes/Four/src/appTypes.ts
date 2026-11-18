import type { HighlightEvent } from './types';

export type CameraMode = 'follow' | 'half_pack' | 'leader' | 'overview';
export type MapPower = 'emp' | 'barricade' | 'airdrop';

export interface FocusAnimState {
  x: number;
  y: number;
  color: string;
  text: string;
  elapsed: number;
  duration: number;
}

export interface ReplayPlaybackState {
  clips: Array<{ event: HighlightEvent; startT: number; endT: number }>;
  clipIndex: number;
  curT: number;
}

import type { MapPower, ReplayPlaybackState } from '../appTypes';
import React, { useEffect } from 'react';

export interface useKeyboardShortcutsParams {
  activateTargetedPower: (kind: 'boost' | 'shield' | 'heal') => void;
  empCooldownRef: React.RefObject<number>;
  setSelectedPower: React.Dispatch<React.SetStateAction<MapPower | null>>;
  barricadeCooldownRef: React.RefObject<number>;
  airdropCooldownRef: React.RefObject<number>;
  cycleFollowMarble: (delta: number) => void;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLabyrinthMap: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDebugHud: React.Dispatch<React.SetStateAction<boolean>>;
  replayStateRef: React.RefObject<ReplayPlaybackState | null>;
  stopHighlightReplay: () => void;
}

/** Global keyboard shortcuts: 1-3 targeted powers, 4-6 map powers, [ ] follow cycle, Space pause, M map, D debug, Esc cancel. */
export function useKeyboardShortcuts({
  activateTargetedPower,
  empCooldownRef,
  setSelectedPower,
  barricadeCooldownRef,
  airdropCooldownRef,
  cycleFollowMarble,
  setIsPaused,
  setShowLabyrinthMap,
  setShowDebugHud,
  replayStateRef,
  stopHighlightReplay,
}: useKeyboardShortcutsParams) {
  // Keyboard Shortcuts: 1..3 Targeted, 4..6 Map Powers, [ / ] Follow Cycle, Space Pause, M Map, D Debug, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '1') activateTargetedPower('boost');
      else if (e.key === '2') activateTargetedPower('shield');
      else if (e.key === '3') activateTargetedPower('heal');
      else if (e.key === '4') {
        if (empCooldownRef.current <= 0) setSelectedPower((p) => (p === 'emp' ? null : 'emp'));
      } else if (e.key === '5') {
        if (barricadeCooldownRef.current <= 0) setSelectedPower((p) => (p === 'barricade' ? null : 'barricade'));
      } else if (e.key === '6') {
        if (airdropCooldownRef.current <= 0) setSelectedPower((p) => (p === 'airdrop' ? null : 'airdrop'));
      } else if (e.key === '[') {
        cycleFollowMarble(-1);
      } else if (e.key === ']') {
        cycleFollowMarble(1);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key.toLowerCase() === 'm') {
        setShowLabyrinthMap((v) => !v);
      } else if (e.key.toLowerCase() === 'd') {
        setShowDebugHud((v) => !v);
      } else if (e.key === 'Escape') {
        setSelectedPower(null);
        setShowLabyrinthMap(false);
        if (replayStateRef.current) stopHighlightReplay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activateTargetedPower, cycleFollowMarble, stopHighlightReplay]);
}

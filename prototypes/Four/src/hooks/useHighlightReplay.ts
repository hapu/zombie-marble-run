import type { ReplayPlaybackState } from '../appTypes';
import { SimulationEngine } from '../simulation';
import { HighlightEvent, Marble } from '../types';
import React, { useCallback } from 'react';

export interface useHighlightReplayParams {
  simulationRef: React.RefObject<SimulationEngine>;
  flashToast: (msg: string, ms?: number) => void;
  setWinnerModal: React.Dispatch<React.SetStateAction<Marble | null>>;
  setSummaryDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  summaryDismissedRef: React.RefObject<boolean>;
  replayStateRef: React.RefObject<ReplayPlaybackState | null>;
  setIsReplaying: React.Dispatch<React.SetStateAction<boolean>>;
  setReplayHudText: React.Dispatch<React.SetStateAction<string>>;
}

/** Post-race highlight reel: builds clips from highlight events and starts/stops replay playback. */
export function useHighlightReplay({
  simulationRef,
  flashToast,
  setWinnerModal,
  setSummaryDismissed,
  summaryDismissedRef,
  replayStateRef,
  setIsReplaying,
  setReplayHudText,
}: useHighlightReplayParams) {
  // Launch Post-Race Highlight Reel
  const startHighlightReplay = useCallback(() => {
    const sim = simulationRef.current;
    const frames = sim.getReplayFrames();
    const events = [...sim.getHighlightEvents()].sort((a, b) => b.weight - a.weight);
    if (frames.length < 4 || events.length === 0) {
      flashToast('SIN MOMENTOS DESTACADOS GRABADOS');
      return;
    }

    const chosen: Array<{ event: HighlightEvent; startT: number; endT: number }> = [];
    for (const ev of events) {
      if (chosen.length >= 5) break;
      const overlaps = chosen.some((c) => Math.abs(c.event.t - ev.t) < 2.2);
      if (!overlaps) {
        chosen.push({
          event: ev,
          startT: Math.max(0, ev.t - 1.4),
          endT: ev.t + 1.0,
        });
      }
    }
    chosen.sort((a, b) => a.event.t - b.event.t);

    setWinnerModal(null);
    setSummaryDismissed(true);
    summaryDismissedRef.current = true;
    replayStateRef.current = {
      clips: chosen,
      clipIndex: 0,
      curT: chosen[0].startT,
    };
    setIsReplaying(true);
    setReplayHudText(`1/${chosen.length} · ${chosen[0].event.text}`);
  }, [flashToast]);

  const stopHighlightReplay = useCallback(() => {
    const sim = simulationRef.current;
    replayStateRef.current = null;
    setIsReplaying(false);
    const w = sim.getWinner() || sim.getLeader();
    if (w) {
      setSummaryDismissed(false);
      summaryDismissedRef.current = false;
      setWinnerModal(w);
    }
  }, []);

  return { startHighlightReplay, stopHighlightReplay };
}

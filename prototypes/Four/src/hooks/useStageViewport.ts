import React, { useCallback, useEffect } from 'react';

export interface useStageViewportParams {
  stageWrapperRef: React.RefObject<HTMLDivElement | null>;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  setIsPortrait: React.Dispatch<React.SetStateAction<boolean>>;
}

/** Fullscreen toggle/sync and the adaptive 16:9 / 9:16 canvas sizing. */
export function useStageViewport({
  stageWrapperRef,
  setIsFullscreen,
  canvasContainerRef,
  canvasRef,
  setIsPortrait,
}: useStageViewportParams) {
  // Fullscreen sync
  const handleToggleFullscreen = useCallback(() => {
    if (!stageWrapperRef.current) return;
    if (!document.fullscreenElement) {
      stageWrapperRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Viewport Aspect Ratio (16:9 or 9:16)
  const updateAspect = useCallback(() => {
    if (!stageWrapperRef.current || !canvasContainerRef.current || !canvasRef.current) return;
    const containerW = stageWrapperRef.current.clientWidth;
    const containerH = stageWrapperRef.current.clientHeight;
    const portrait = containerW < containerH;
    setIsPortrait(portrait);

    const targetRatio = portrait ? 9 / 16 : 16 / 9;
    const virtualW = portrait ? 720 : 1280;
    const virtualH = portrait ? 1280 : 720;

    let finalW: number;
    let finalH: number;
    if (containerW / containerH > targetRatio) {
      finalH = containerH;
      finalW = finalH * targetRatio;
    } else {
      finalW = containerW;
      finalH = finalW / targetRatio;
    }

    canvasContainerRef.current.style.width = `${Math.floor(finalW)}px`;
    canvasContainerRef.current.style.height = `${Math.floor(finalH)}px`;
    canvasRef.current.width = virtualW;
    canvasRef.current.height = virtualH;
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateAspect);
    updateAspect();
    return () => window.removeEventListener('resize', updateAspect);
  }, [updateAspect]);

  return { handleToggleFullscreen, updateAspect };
}

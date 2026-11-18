interface StageBannerProps {
  isReplaying: boolean;
  bannerVisible: boolean;
  stageBanner: string;
}

/** Animated Stage Announcement Banner */
export function StageBanner({ isReplaying, bannerVisible, stageBanner }: StageBannerProps) {
  if (isReplaying) return null;

  return (
    <div
      className={`absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-950/90 text-amber-300 font-bold px-5 py-1.5 rounded-full border border-amber-500/40 shadow-xl backdrop-blur-md text-xs tracking-wide pointer-events-none transition-all duration-300 whitespace-nowrap ${
        bannerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {stageBanner}
    </div>
  );
}

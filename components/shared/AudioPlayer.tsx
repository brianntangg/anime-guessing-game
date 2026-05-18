'use client';

import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  src: string;
  startSec?: number;
  durationSec?: number;
  autoPlay?: boolean;
}

export function AudioPlayer({ src, startSec = 0, durationSec, autoPlay = true }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    el.currentTime = startSec;

    if (autoPlay) {
      el.play().catch(() => {
        // Browser autoplay policy may block — user interaction needed
      });
    }

    if (durationSec) {
      const stop = setTimeout(() => el.pause(), durationSec * 1000);
      return () => clearTimeout(stop);
    }
  }, [src, startSec, durationSec, autoPlay]);

  return <audio ref={audioRef} src={src} className="hidden" />;
}

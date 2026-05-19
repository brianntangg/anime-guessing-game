'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  src: string;
  startSec?: number;
  durationSec?: number;
  autoPlay?: boolean;
}

export function AudioPlayer({ src, startSec = 0, durationSec, autoPlay = true }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    setBlocked(false);
    el.currentTime = startSec;

    if (autoPlay) {
      el.play().catch(() => setBlocked(true));
    }

    if (durationSec) {
      const stop = setTimeout(() => el.pause(), durationSec * 1000);
      return () => clearTimeout(stop);
    }
  }, [src, startSec, durationSec, autoPlay]);

  const handleUnblock = () => {
    audioRef.current?.play().catch(() => {});
    setBlocked(false);
  };

  return (
    <>
      <audio ref={audioRef} src={src} className="hidden" />
      {blocked && (
        <button
          onClick={handleUnblock}
          className="mt-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl border border-white/40 transition-colors"
        >
          ▶ Click to play audio
        </button>
      )}
    </>
  );
}

/** Call this inside a user-gesture handler (e.g. button click) to pre-unlock
 *  the browser's audio autoplay policy before the first AudioPlayer mounts. */
export function unlockAudio(): void {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    void ctx.resume();
  } catch {
    // Not all browsers expose AudioContext — safe to ignore
  }
}

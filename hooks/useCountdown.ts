'use client';

import { useState, useEffect, useRef } from 'react';

export function useCountdown(durationMs: number, startedAt: number | null) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (startedAt === null) {
      setRemainingMs(durationMs);
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, durationMs - elapsed);
      setRemainingMs(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [startedAt, durationMs]);

  return remainingMs;
}

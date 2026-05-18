'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '../socket/client';
import type { ServerToClientEvents } from '../lib/types';

type EventMap = ServerToClientEvents;
type EventKey = keyof EventMap;

export function useSocketEvent<K extends EventKey>(
  event: K,
  handler: EventMap[K]
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();
    const stable = (...args: Parameters<EventMap[K]>) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (handlerRef.current as (...a: any[]) => void)(...args);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on(event as any, stable as any);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.off(event as any, stable as any);
    };
  }, [event]);
}

export function useSocket() {
  return getSocket();
}

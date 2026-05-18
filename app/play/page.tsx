'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '../../hooks/useSocket';
import { useGameStore } from '../../hooks/useGameState';
import type { RoomSnapshot } from '../../lib/types';

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const socket = useSocket();
  const [roomCode, setRoomCode] = useState(searchParams.get('code') ?? '');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    function onAck(snapshot: RoomSnapshot) {
      const myId = socket.id ?? '';
      useGameStore.getState().setFromSnapshot(snapshot, myId);
      // Persist nickname for reconnect after page refresh
      const me = snapshot.players.find(p => p.id === myId);
      if (me) sessionStorage.setItem('anime-game-nickname', me.nickname);
      router.push(`/play/${snapshot.code}`);
    }
    function onError({ message }: { message: string }) {
      setError(message);
      setJoining(false);
    }
    socket.on('player:joined-ack', onAck);
    socket.on('room:error', onError);
    return () => {
      socket.off('player:joined-ack', onAck);
      socket.off('room:error', onError);
    };
  }, [socket, router]);

  const handleJoin = () => {
    const code = roomCode.trim().toUpperCase();
    const name = nickname.trim();
    if (!code || code.length !== 4) return setError('Enter a 4-letter room code');
    if (!name) return setError('Enter a nickname');
    setError('');
    setJoining(true);
    socket.emit('player:join', { roomCode: code, nickname: name });
  };

  return (
    <div
      className="min-h-full flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d0a5c 50%, #0f0f3d 100%)' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-5">
        <h1 className="text-3xl font-black text-white text-center">🎌 Join Game</h1>

        <input
          type="text"
          placeholder="ROOM"
          value={roomCode}
          onChange={e => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
          maxLength={4}
          className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/20 text-3xl text-center font-black tracking-[0.6em] uppercase focus:outline-none focus:border-white/60"
        />

        <input
          type="text"
          placeholder="Your nickname"
          value={nickname}
          onChange={e => setNickname(e.target.value.slice(0, 16))}
          maxLength={16}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/40 text-lg focus:outline-none focus:border-white/60"
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={handleJoin}
          disabled={joining}
          className="py-4 bg-white text-purple-700 font-black text-xl rounded-2xl hover:scale-105 transition-transform disabled:opacity-40"
        >
          {joining ? 'Joining...' : 'Join →'}
        </button>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}

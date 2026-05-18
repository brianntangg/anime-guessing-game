'use client';

import { QRCodeSVG } from 'qrcode.react';
import { PlayerAvatar } from '../shared/PlayerAvatar';
import type { Player } from '../../lib/types';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  packName: string;
  onStart: () => void;
}

export function Lobby({ roomCode, players, packName, onStart }: LobbyProps) {
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/play?code=${roomCode}`
    : `/play?code=${roomCode}`;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
      <div className="text-center">
        <p className="text-white/60 text-lg uppercase tracking-widest mb-1">Join the game</p>
        <div className="text-8xl font-black text-white tracking-[0.3em] drop-shadow-lg">
          {roomCode}
        </div>
        <p className="text-white/50 mt-2 text-sm">or scan below</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-2xl">
        <QRCodeSVG value={joinUrl} size={160} />
      </div>

      <div className="text-center">
        <p className="text-white/60 text-sm mb-1">Pack</p>
        <p className="text-white font-semibold text-lg">{packName}</p>
      </div>

      <div className="w-full max-w-2xl">
        <p className="text-white/60 text-sm text-center mb-3">
          {players.length === 0 ? 'Waiting for players...' : `${players.length} player${players.length !== 1 ? 's' : ''} joined`}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {players.map(p => (
            <PlayerAvatar key={p.id} avatarIndex={p.avatarIndex} nickname={p.nickname} size="md" />
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={players.length === 0}
        className="px-12 py-4 bg-white text-purple-700 font-black text-2xl rounded-2xl shadow-xl hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Start Game
      </button>
    </div>
  );
}

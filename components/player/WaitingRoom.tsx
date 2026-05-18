'use client';

import { PlayerAvatar } from '../shared/PlayerAvatar';
import type { Player } from '../../lib/types';

interface WaitingRoomProps {
  players: Player[];
  myPlayerId: string | null;
  packName: string | null;
}

export function WaitingRoom({ players, myPlayerId, packName }: WaitingRoomProps) {
  const me = players.find(p => p.id === myPlayerId);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
      {me && (
        <PlayerAvatar avatarIndex={me.avatarIndex} nickname={me.nickname} size="lg" showName={false} />
      )}
      <div>
        <h2 className="text-2xl font-black text-white">{me?.nickname ?? 'You'}</h2>
        {packName && <p className="text-white/50 text-sm mt-1">{packName}</p>}
      </div>

      <div className="animate-pulse">
        <p className="text-white/70 text-lg">Waiting for host to start...</p>
      </div>

      <div className="w-full">
        <p className="text-white/40 text-xs mb-2">{players.length} player{players.length !== 1 ? 's' : ''} in lobby</p>
        <div className="flex flex-wrap justify-center gap-2">
          {players.map(p => (
            <span key={p.id} className={`text-xs px-2 py-1 rounded-full ${p.id === myPlayerId ? 'bg-white text-purple-700 font-bold' : 'bg-white/20 text-white'}`}>
              {p.nickname}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

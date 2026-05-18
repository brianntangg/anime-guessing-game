'use client';

import { PlayerAvatar } from '../shared/PlayerAvatar';
import type { Player, RoundResult } from '../../lib/types';

interface RevealAnswerProps {
  roundResult: RoundResult;
  players: Player[];
  onNext: () => void;
}

export function RevealAnswer({ roundResult, players, onNext }: RevealAnswerProps) {
  return (
    <div className="flex flex-col h-full p-8 gap-6">
      <div className="text-center">
        <p className="text-white/60 uppercase tracking-widest text-sm mb-2">The answer was</p>
        <h2 className="text-5xl font-black text-white drop-shadow-lg">
          {roundResult.animeTitle}
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 content-start overflow-y-auto">
        {players.map(player => {
          const answer = roundResult.playerAnswers[player.id];
          const correct = answer?.correct;
          return (
            <div
              key={player.id}
              className={`rounded-xl p-3 flex flex-col items-center gap-2 ${
                correct === true ? 'bg-green-500/30 border border-green-400' :
                correct === false ? 'bg-red-500/30 border border-red-400' :
                'bg-white/10 border border-white/20'
              }`}
            >
              <PlayerAvatar avatarIndex={player.avatarIndex} nickname={player.nickname} size="sm" />
              <span className="text-2xl">{correct === true ? '✓' : correct === false ? '✗' : '—'}</span>
              {answer && (
                <span className="text-white/80 text-xs">+{answer.pointsEarned}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="px-10 py-4 bg-white text-purple-700 font-black text-xl rounded-2xl shadow-xl hover:scale-105 transition-transform"
        >
          Leaderboard →
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerAvatar } from '../shared/PlayerAvatar';
import type { Player, GameState } from '../../lib/types';

const RANK_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

interface LeaderboardProps {
  players: Player[];
  gameState: GameState;
  onNext: () => void;
  onRestart: () => void;
}

export function Leaderboard({ players, gameState, onNext, onRestart }: LeaderboardProps) {
  const isFinished = gameState.phase === 'finished';

  useEffect(() => {
    if (!isFinished) return;
    const burst = () =>
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
    burst();
    const t1 = setTimeout(burst, 600);
    const t2 = setTimeout(burst, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isFinished]);

  return (
    <div className="flex flex-col h-full p-8 gap-6">
      <div className="text-center">
        <h2 className="text-4xl font-black text-white">
          {isFinished ? '🏆 Final Scores' : 'Leaderboard'}
        </h2>
        {!isFinished && (
          <p className="text-white/50 text-sm mt-1">
            Question {gameState.currentQuestionIndex + 1} of {gameState.totalQuestions}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {players.map((player, i) => (
          <div
            key={player.id}
            className="flex items-center gap-4 bg-white/10 rounded-xl px-6 py-3 backdrop-blur-sm"
          >
            <span className={`text-2xl font-black w-8 text-center ${RANK_COLORS[i] ?? 'text-white/60'}`}>
              {RANK_EMOJIS[i] ?? `#${i + 1}`}
            </span>
            <PlayerAvatar avatarIndex={player.avatarIndex} nickname={player.nickname} size="sm" showName={false} />
            <span className="text-white font-semibold flex-1">{player.nickname}</span>
            <span className="text-white font-black text-xl tabular-nums">{player.score.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        {isFinished ? (
          <button
            onClick={onRestart}
            className="px-10 py-4 bg-white text-purple-700 font-black text-xl rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            🔄 Play Again
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-10 py-4 bg-white text-purple-700 font-black text-xl rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}

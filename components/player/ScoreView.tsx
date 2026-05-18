'use client';

import type { Player, RoundResult, GameState } from '../../lib/types';

interface ScoreViewProps {
  player: Player | undefined;
  players: Player[];
  lastRoundResult: RoundResult | null;
  gameState: GameState;
}

export function ScoreView({ player, players, lastRoundResult, gameState }: ScoreViewProps) {
  const myAnswer = player ? lastRoundResult?.playerAnswers[player.id] : null;
  const myRank = player ? players.findIndex(p => p.id === player.id) + 1 : null;
  const isFinished = gameState.phase === 'finished';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
      {lastRoundResult && myAnswer !== undefined && (
        <div className={`text-6xl ${myAnswer?.correct ? 'text-green-400' : 'text-red-400'}`}>
          {myAnswer?.correct ? '✓' : myAnswer ? '✗' : '—'}
        </div>
      )}

      {myAnswer?.correct && (
        <div>
          <p className="text-white/60 text-sm">Points earned</p>
          <p className="text-yellow-400 font-black text-4xl">+{myAnswer.pointsEarned}</p>
        </div>
      )}

      {!myAnswer?.correct && myAnswer && (
        <div>
          <p className="text-white/60 text-sm">Correct answer was</p>
          <p className="text-white font-bold text-xl">{lastRoundResult?.animeTitle}</p>
        </div>
      )}

      <div className="bg-white/10 rounded-2xl px-8 py-4">
        <p className="text-white/60 text-sm">{isFinished ? 'Final score' : 'Total score'}</p>
        <p className="text-white font-black text-3xl tabular-nums">{player?.score.toLocaleString() ?? 0}</p>
        {myRank && (
          <p className="text-white/60 text-sm mt-1">#{myRank} of {players.length}</p>
        )}
      </div>

      <p className="text-white/40 text-sm">
        {isFinished ? '🏆 Game over!' : 'Waiting for host...'}
      </p>
    </div>
  );
}

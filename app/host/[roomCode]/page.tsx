'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket, useSocketEvent } from '../../../hooks/useSocket';
import { useGameStore } from '../../../hooks/useGameState';
import { Lobby } from '../../../components/host/Lobby';
import { QuestionDisplay } from '../../../components/host/QuestionDisplay';
import { RevealAnswer } from '../../../components/host/RevealAnswer';
import { Leaderboard } from '../../../components/host/Leaderboard';
import type { Player, SafeQuestion, GameState, RoundResult, RoomSnapshot } from '../../../lib/types';

export default function HostScreen() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const socket = useSocket();
  const store = useGameStore();
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Register as host and receive initial room snapshot
  useEffect(() => {
    socket.emit('host:register', { roomCode });
  }, [roomCode, socket]);

  useSocketEvent('host:registered-ack', (snapshot: RoomSnapshot) => {
    // Host uses setFromSnapshot with a dummy ID — host is not a player
    const gs = useGameStore.getState();
    gs.setFromSnapshot(snapshot, '__host__');
    setTotalCount(snapshot.players.filter(p => p.connected).length);
  });

  useSocketEvent('room:player-joined', (player: Player) => {
    useGameStore.getState().addPlayer(player);
    setTotalCount(t => t + 1);
  });

  useSocketEvent('room:player-left', ({ playerId }: { playerId: string }) => {
    useGameStore.getState().removePlayer(playerId);
    setTotalCount(t => Math.max(0, t - 1));
  });

  useSocketEvent('game:started', ({ gameState, question }: { gameState: GameState; question: SafeQuestion }) => {
    useGameStore.getState().setQuestion(question, gameState);
    setAnsweredCount(0);
    setTotalCount(useGameStore.getState().players.filter(p => p.connected).length);
  });

  useSocketEvent('game:question', ({ question, gameState }: { question: SafeQuestion; gameState: GameState }) => {
    useGameStore.getState().setQuestion(question, gameState);
    setAnsweredCount(0);
    setTotalCount(useGameStore.getState().players.filter(p => p.connected).length);
  });

  useSocketEvent('game:answer-received', ({ answeredCount: ac, totalCount: tc }: { answeredCount: number; totalCount: number }) => {
    setAnsweredCount(ac);
    setTotalCount(tc);
  });

  useSocketEvent('game:reveal', ({ roundResult, players, gameState }: { roundResult: RoundResult; players: Player[]; gameState: GameState }) => {
    useGameStore.getState().setReveal(roundResult, players, gameState);
  });

  useSocketEvent('game:leaderboard', ({ players, gameState }: { players: Player[]; gameState: GameState }) => {
    useGameStore.getState().setLeaderboard(players, gameState);
  });

  useSocketEvent('game:finished', ({ players }: { players: Player[] }) => {
    useGameStore.getState().setFinished(players);
  });

  const phase = store.gameState?.phase ?? 'lobby';

  const handleStart = () => socket.emit('host:start-game', { roomCode });
  const handleNext = () => socket.emit('host:next-question', { roomCode });

  return (
    <div
      className="h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d0a5c 60%, #0f0f3d 100%)' }}
    >
      {phase === 'lobby' && (
        <Lobby
          roomCode={roomCode}
          players={store.players}
          packName={store.packName ?? ''}
          onStart={handleStart}
        />
      )}

      {phase === 'question' && store.currentQuestion && store.gameState && (
        <QuestionDisplay
          question={store.currentQuestion}
          gameState={store.gameState}
          answeredCount={answeredCount}
          totalCount={totalCount}
        />
      )}

      {phase === 'reveal' && store.lastRoundResult && (
        <RevealAnswer
          roundResult={store.lastRoundResult}
          players={store.players}
          onNext={handleNext}
        />
      )}

      {(phase === 'leaderboard' || phase === 'finished') && store.gameState && (
        <Leaderboard
          players={store.players}
          gameState={store.gameState}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

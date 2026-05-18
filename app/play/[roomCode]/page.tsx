'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSocket, useSocketEvent } from '../../../hooks/useSocket';
import { useGameStore } from '../../../hooks/useGameState';
import { WaitingRoom } from '../../../components/player/WaitingRoom';
import { AnswerPad } from '../../../components/player/AnswerPad';
import { ScoreView } from '../../../components/player/ScoreView';
import type { Player, SafeQuestion, GameState, RoundResult, RoomSnapshot } from '../../../lib/types';

const SESSION_KEY = 'anime-game-nickname';

export default function PlayerScreen() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const socket = useSocket();
  const store = useGameStore();

  // On mount: if store has no state (page refresh), attempt rejoin using sessionStorage nickname
  useEffect(() => {
    if (store.gameState) return; // already have state from join flow
    const savedNickname = sessionStorage.getItem(SESSION_KEY);
    if (savedNickname) {
      socket.emit('player:rejoin', { roomCode, nickname: savedNickname });
    }
  }, [roomCode, socket, store.gameState]);

  useSocketEvent('player:joined-ack', (snapshot: RoomSnapshot) => {
    const myId = socket.id ?? '';
    useGameStore.getState().setFromSnapshot(snapshot, myId);
    // Persist nickname for reconnect
    const me = snapshot.players.find(p => p.id === myId);
    if (me) sessionStorage.setItem(SESSION_KEY, me.nickname);
  });

  useSocketEvent('room:player-joined', (player: Player) => {
    useGameStore.getState().addPlayer(player);
  });

  useSocketEvent('room:player-left', ({ playerId }: { playerId: string }) => {
    useGameStore.getState().removePlayer(playerId);
  });

  useSocketEvent('game:started', ({ gameState, question }: { gameState: GameState; question: SafeQuestion }) => {
    useGameStore.getState().setQuestion(question, gameState);
  });

  useSocketEvent('game:question', ({ question, gameState }: { question: SafeQuestion; gameState: GameState }) => {
    useGameStore.getState().setQuestion(question, gameState);
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

  useSocketEvent('player:kicked', () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = '/play';
  });

  const phase = store.gameState?.phase ?? 'lobby';

  // Resolve current player: prefer stored myPlayerId, then match by socket.id
  const myId = store.myPlayerId ?? socket.id ?? '';
  const me = store.players.find(p => p.id === myId);

  const handleAnswer = (choice?: 'A' | 'B' | 'C' | 'D', text?: string) => {
    socket.emit('player:submit-answer', { roomCode, choice, text });
  };

  return (
    <div
      className="h-dvh flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d0a5c 60%, #0f0f3d 100%)' }}
    >
      {phase === 'lobby' && (
        <WaitingRoom
          players={store.players}
          myPlayerId={myId}
          packName={store.packName}
        />
      )}

      {phase === 'question' && store.currentQuestion && store.gameState && (
        <AnswerPad
          question={store.currentQuestion}
          gameState={store.gameState}
          onAnswer={handleAnswer}
        />
      )}

      {(phase === 'reveal' || phase === 'leaderboard' || phase === 'finished') && store.gameState && (
        <ScoreView
          player={me}
          players={store.players}
          lastRoundResult={store.lastRoundResult}
          gameState={store.gameState}
        />
      )}
    </div>
  );
}

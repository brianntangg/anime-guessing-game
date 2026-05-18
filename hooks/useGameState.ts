'use client';

import { create } from 'zustand';
import type { GameState, Player, SafeQuestion, RoundResult, RoomSnapshot } from '../lib/types';

interface GameStore {
  roomCode: string | null;
  players: Player[];
  gameState: GameState | null;
  currentQuestion: SafeQuestion | null;
  lastRoundResult: RoundResult | null;
  myPlayerId: string | null;
  myNickname: string | null;
  packName: string | null;

  setFromSnapshot: (snapshot: RoomSnapshot, myId: string) => void;
  setQuestion: (question: SafeQuestion, gameState: GameState) => void;
  setReveal: (roundResult: RoundResult, players: Player[], gameState: GameState) => void;
  setLeaderboard: (players: Player[], gameState: GameState) => void;
  setFinished: (players: Player[]) => void;
  updatePlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setMyPlayerId: (id: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  roomCode: null,
  players: [],
  gameState: null,
  currentQuestion: null,
  lastRoundResult: null,
  myPlayerId: null,
  myNickname: null,
  packName: null,

  setFromSnapshot: (snapshot, myId) => {
    const me = snapshot.players.find(p => p.id === myId);
    set({
      roomCode: snapshot.code,
      players: snapshot.players,
      gameState: snapshot.gameState,
      currentQuestion: snapshot.currentQuestion,
      packName: snapshot.packName,
      myPlayerId: myId,
      myNickname: me?.nickname ?? null,
    });
  },

  setQuestion: (question, gameState) =>
    set({ currentQuestion: question, gameState, lastRoundResult: null }),

  setReveal: (roundResult, players, gameState) =>
    set({ lastRoundResult: roundResult, players, gameState }),

  setLeaderboard: (players, gameState) =>
    set({ players, gameState }),

  setFinished: (players) =>
    set(state => ({
      players,
      gameState: state.gameState
        ? { ...state.gameState, phase: 'finished' }
        : null,
    })),

  updatePlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set(state => ({
      players: [...state.players.filter(p => p.id !== player.id), player],
    })),

  removePlayer: (playerId) =>
    set(state => ({
      players: state.players.filter(p => p.id !== playerId),
    })),

  setMyPlayerId: (id) => set({ myPlayerId: id }),
}));

import type { Player, QuestionPack, GameState, RoomSnapshot, Question, SafeQuestion } from './types';
import { generateRoomCode } from './utils';

export interface Room {
  code: string;
  hostSocketId: string;
  players: Map<string, Player>;
  pack: QuestionPack;
  selectedQuestions: Question[];
  gameState: GameState;
  questionTimer: ReturnType<typeof setTimeout> | null;
  tickInterval: ReturnType<typeof setInterval> | null;
}

// Use globalThis so API routes (separate Next.js module context) share the same Map
// as the Socket.io server handlers running in the main Node.js context.
declare global {
  // eslint-disable-next-line no-var
  var __animeRooms: Map<string, Room> | undefined;
}
const rooms: Map<string, Room> = globalThis.__animeRooms ?? (globalThis.__animeRooms = new Map());

export function createRoom(
  hostSocketId: string,
  pack: QuestionPack,
  questionCount: number,
  questionDurationMs = 20000
): Room {
  let code: string;
  do { code = generateRoomCode(); } while (rooms.has(code));

  const selected = [...pack.questions]
    .sort(() => Math.random() - 0.5)
    .slice(0, questionCount);

  const room: Room = {
    code,
    hostSocketId,
    players: new Map(),
    pack,
    selectedQuestions: selected,
    gameState: {
      phase: 'lobby',
      currentQuestionIndex: 0,
      totalQuestions: selected.length,
      questionStartedAt: null,
      questionDurationMs,
      roundResults: [],
    },
    questionTimer: null,
    tickInterval: null,
  };

  rooms.set(code, room);
  scheduleCleanup(code);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function getAllRooms(): Map<string, Room> {
  return rooms;
}

export function deleteRoom(code: string): void {
  const room = rooms.get(code);
  if (room) {
    clearTimers(room);
    rooms.delete(code);
  }
}

export function clearTimers(room: Room): void {
  if (room.questionTimer) clearTimeout(room.questionTimer);
  if (room.tickInterval) clearInterval(room.tickInterval);
  room.questionTimer = null;
  room.tickInterval = null;
}

export function toSnapshot(room: Room): RoomSnapshot {
  const { gameState, selectedQuestions } = room;
  let currentQuestion: SafeQuestion | null = null;
  if (gameState.phase === 'question') {
    const q = selectedQuestions[gameState.currentQuestionIndex];
    if (q) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { correctChoice, ...safe } = q;
      currentQuestion = safe;
    }
  }

  return {
    code: room.code,
    players: Array.from(room.players.values()),
    packName: room.pack.name,
    gameState,
    currentQuestion,
  };
}

// Garbage-collect rooms idle for > 2 hours
function scheduleCleanup(code: string): void {
  setTimeout(
    () => {
      const room = rooms.get(code);
      if (room && room.gameState.phase !== 'question') {
        deleteRoom(code);
      }
    },
    2 * 60 * 60 * 1000
  );
}

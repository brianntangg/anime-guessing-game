import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, Question, SafeQuestion } from '../lib/types';
import {
  getRoom,
  getAllRooms,
  clearTimers,
  toSnapshot,
} from '../lib/room-store';
import { getAllPacks } from '../data/packs';
import {
  startGame,
  advanceToReveal,
  advanceToLeaderboard,
  advanceToNextQuestion,
  advanceToFinished,
  isLastQuestion,
  processAnswer,
  getCurrentRoundResult,
  allConnectedPlayersAnswered,
  getSortedPlayers,
} from '../lib/game-engine';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(io: AppServer): void {
  io.on('connection', (socket: AppSocket) => {

    // ── Host events ──────────────────────────────────────────────────────────

    socket.on('host:register', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) return socket.emit('room:error', { message: 'Room not found' });
      room.hostSocketId = socket.id;
      socket.join(roomCode);
      socket.emit('host:registered-ack', toSnapshot(room));
    });

    socket.on('host:start-game', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) return socket.emit('room:error', { message: 'Room not found' });
      if (room.hostSocketId !== socket.id) return;
      if (room.players.size === 0) {
        return socket.emit('room:error', { message: 'Need at least one player to start' });
      }

      startGame(room);
      const question = room.selectedQuestions[0];
      io.to(roomCode).emit('game:started', { gameState: room.gameState, question: sanitize(question) });
      startQuestionTimer(io, roomCode);
    });

    socket.on('host:next-question', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostSocketId !== socket.id) return;

      if (room.gameState.phase === 'reveal') {
        advanceToLeaderboard(room);
        io.to(roomCode).emit('game:leaderboard', {
          players: getSortedPlayers(room),
          gameState: room.gameState,
        });
        return;
      }

      if (room.gameState.phase === 'leaderboard') {
        if (isLastQuestion(room)) {
          advanceToFinished(room);
          io.to(roomCode).emit('game:finished', {
            players: getSortedPlayers(room),
            roundResults: room.gameState.roundResults,
          });
        } else {
          advanceToNextQuestion(room);
          const question = room.selectedQuestions[room.gameState.currentQuestionIndex];
          io.to(roomCode).emit('game:question', { question: sanitize(question), gameState: room.gameState });
          startQuestionTimer(io, roomCode);
        }
      }
    });

    socket.on('host:skip-question', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostSocketId !== socket.id) return;
      if (room.gameState.phase !== 'question') return;
      triggerReveal(io, roomCode);
    });

    socket.on('host:restart-game', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostSocketId !== socket.id) return;

      clearTimers(room);

      // Reset all player scores
      for (const player of room.players.values()) {
        player.score = 0;
        player.lastAnswerCorrect = null;
        player.lastPointsEarned = null;
        player.connected = true;
      }

      // Re-shuffle questions
      const total = room.gameState.totalQuestions;
      room.selectedQuestions = [...room.pack.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, total);

      // Reset game state to lobby
      room.gameState = {
        phase: 'lobby',
        currentQuestionIndex: 0,
        totalQuestions: total,
        questionStartedAt: null,
        questionDurationMs: room.gameState.questionDurationMs,
        roundResults: [],
      };

      io.to(roomCode).emit('game:restarted', toSnapshot(room));
    });

    socket.on('host:kick-player', ({ roomCode, playerId }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostSocketId !== socket.id) return;
      room.players.delete(playerId);
      io.to(playerId).emit('player:kicked');
      io.to(roomCode).emit('room:player-left', { playerId });
    });

    // ── Player events ────────────────────────────────────────────────────────

    socket.on('player:join', ({ roomCode, nickname }) => {
      const room = getRoom(roomCode);
      if (!room) return socket.emit('room:error', { message: 'Room not found' });
      if (room.gameState.phase !== 'lobby') {
        return socket.emit('room:error', { message: 'Game already in progress' });
      }
      if (room.players.size >= 30) {
        return socket.emit('room:error', { message: 'Room is full (max 30 players)' });
      }

      const trimmed = nickname.trim().slice(0, 16);
      if (!trimmed) return socket.emit('room:error', { message: 'Nickname required' });

      const player = {
        id: socket.id,
        nickname: trimmed,
        avatarIndex: room.players.size % 8,
        score: 0,
        lastAnswerCorrect: null,
        lastPointsEarned: null,
        connected: true,
      };

      room.players.set(socket.id, player);
      socket.join(roomCode);
      socket.emit('player:joined-ack', toSnapshot(room));
      socket.to(roomCode).emit('room:player-joined', player);
    });

    socket.on('player:rejoin', ({ roomCode, nickname }) => {
      const room = getRoom(roomCode);
      if (!room) return socket.emit('room:error', { message: 'Room not found' });

      const existing = Array.from(room.players.values()).find(
        p => p.nickname === nickname.trim()
      );
      if (!existing) {
        return socket.emit('room:error', { message: 'Player not found — join as new player' });
      }

      room.players.delete(existing.id);
      existing.id = socket.id;
      existing.connected = true;
      room.players.set(socket.id, existing);
      socket.join(roomCode);
      socket.emit('player:joined-ack', toSnapshot(room));
      socket.to(roomCode).emit('room:player-joined', existing);
    });

    socket.on('player:submit-answer', ({ roomCode, choice, text }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      const answer = processAnswer(room, socket.id, choice, text);
      if (!answer) return;

      const roundResult = getCurrentRoundResult(room);
      const answeredCount = Object.keys(roundResult?.playerAnswers ?? {}).length;
      const connectedCount = Array.from(room.players.values()).filter(p => p.connected).length;

      io.to(room.hostSocketId).emit('game:answer-received', {
        answeredCount,
        totalCount: connectedCount,
      });

      if (allConnectedPlayersAnswered(room)) {
        triggerReveal(io, roomCode);
      }
    });

    // ── Disconnect ───────────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      for (const [code, room] of getAllRooms()) {
        if (room.hostSocketId === socket.id) {
          io.to(code).emit('room:error', { message: 'Host disconnected' });
          continue;
        }
        const player = room.players.get(socket.id);
        if (player) {
          player.connected = false;
          io.to(code).emit('room:player-left', { playerId: socket.id });
        }
      }
    });
  });
}

// Strip correctChoice so clients cannot read the answer from WebSocket traffic
function sanitize(q: Question): SafeQuestion {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { correctChoice, ...safe } = q;
  return safe;
}

// ── Timer helpers ─────────────────────────────────────────────────────────────

function startQuestionTimer(io: AppServer, roomCode: string): void {
  const room = getRoom(roomCode);
  if (!room) return;

  clearTimers(room);

  const durationMs = room.gameState.questionDurationMs;
  const startedAt = room.gameState.questionStartedAt!;

  room.tickInterval = setInterval(() => {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, durationMs - elapsed);
    io.to(roomCode).emit('game:timer-tick', { remainingMs: remaining });
    if (remaining <= 0) clearTimers(room);
  }, 1000);

  room.questionTimer = setTimeout(() => {
    clearTimers(room);
    triggerReveal(io, roomCode);
  }, durationMs);
}

function triggerReveal(io: AppServer, roomCode: string): void {
  const room = getRoom(roomCode);
  if (!room || room.gameState.phase !== 'question') return;

  clearTimers(room);
  advanceToReveal(room);

  const q = room.selectedQuestions[room.gameState.currentQuestionIndex];
  const roundResult = getCurrentRoundResult(room) ?? {
    questionId: q?.id ?? '',
    correctChoice: q?.correctChoice ?? 'A',
    animeTitle: q?.animeTitle ?? '',
    playerAnswers: {},
  };

  io.to(roomCode).emit('game:reveal', {
    roundResult,
    players: getSortedPlayers(room),
    gameState: room.gameState,
  });
}

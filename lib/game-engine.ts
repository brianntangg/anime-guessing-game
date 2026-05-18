import Fuse from 'fuse.js';
import type { Room } from './room-store';
import type { GameState, PlayerAnswer, RoundResult } from './types';
import { calculatePoints, normalizeAnswerText } from './utils';

// ─── Phase transitions ────────────────────────────────────────────────────────

export function startGame(room: Room): void {
  room.gameState.phase = 'question';
  room.gameState.currentQuestionIndex = 0;
  room.gameState.questionStartedAt = Date.now();
}

export function advanceToReveal(room: Room): void {
  room.gameState.phase = 'reveal';
  room.gameState.questionStartedAt = null;
}

export function advanceToLeaderboard(room: Room): void {
  room.gameState.phase = 'leaderboard';
}

export function advanceToNextQuestion(room: Room): void {
  room.gameState.currentQuestionIndex += 1;
  room.gameState.phase = 'question';
  room.gameState.questionStartedAt = Date.now();
}

export function advanceToFinished(room: Room): void {
  room.gameState.phase = 'finished';
}

export function isLastQuestion(room: Room): boolean {
  return (
    room.gameState.currentQuestionIndex >=
    room.gameState.totalQuestions - 1
  );
}

// ─── Answer processing ────────────────────────────────────────────────────────

export function processAnswer(
  room: Room,
  playerId: string,
  choice?: 'A' | 'B' | 'C' | 'D',
  text?: string
): PlayerAnswer | null {
  const { gameState, selectedQuestions, players } = room;
  if (gameState.phase !== 'question') return null;

  const player = players.get(playerId);
  if (!player) return null;

  const question = selectedQuestions[gameState.currentQuestionIndex];
  const answerTimeMs = Date.now() - (gameState.questionStartedAt ?? Date.now());

  // Prevent double-submission
  const currentResult = getCurrentRoundResult(room);
  if (currentResult?.playerAnswers[playerId]) return null;

  let correct = false;

  if (question.answerMode === 'multiple-choice' && choice) {
    correct = choice === question.correctChoice;
  } else if (question.answerMode === 'free-text' && text) {
    correct = checkFreeTextAnswer(text, question.animeTitle, question.aliases ?? []);
  }

  const pointsEarned = calculatePoints(correct, answerTimeMs, gameState.questionDurationMs);

  const answer: PlayerAnswer = {
    choice,
    text,
    correct,
    pointsEarned,
    answerTimeMs,
  };

  // Record into current round result
  ensureCurrentRoundResult(room);
  getCurrentRoundResult(room)!.playerAnswers[playerId] = answer;

  // Update player score
  player.score += pointsEarned;
  player.lastAnswerCorrect = correct;
  player.lastPointsEarned = pointsEarned;

  return answer;
}

function checkFreeTextAnswer(input: string, title: string, aliases: string[]): boolean {
  const candidates = [title, ...aliases].map(normalizeAnswerText);
  const normalized = normalizeAnswerText(input);

  // Exact match first
  if (candidates.includes(normalized)) return true;

  // Fuzzy match
  const fuse = new Fuse(candidates, { threshold: 0.35, includeScore: true });
  const results = fuse.search(normalized);
  return results.length > 0 && (results[0].score ?? 1) < 0.35;
}

// ─── Round result helpers ─────────────────────────────────────────────────────

function ensureCurrentRoundResult(room: Room): void {
  const { gameState, selectedQuestions } = room;
  const q = selectedQuestions[gameState.currentQuestionIndex];
  const existing = room.gameState.roundResults.find(r => r.questionId === q.id);
  if (!existing) {
    room.gameState.roundResults.push({
      questionId: q.id,
      correctChoice: q.correctChoice ?? 'A',
      animeTitle: q.animeTitle,
      playerAnswers: {},
    });
  }
}

export function getCurrentRoundResult(room: Room): RoundResult | undefined {
  const q = room.selectedQuestions[room.gameState.currentQuestionIndex];
  return room.gameState.roundResults.find(r => r.questionId === q?.id);
}

export function allConnectedPlayersAnswered(room: Room): boolean {
  const result = getCurrentRoundResult(room);
  if (!result) return false;
  const connected = Array.from(room.players.values()).filter(p => p.connected);
  return connected.every(p => result.playerAnswers[p.id] !== undefined);
}

export function getSortedPlayers(room: Room) {
  return Array.from(room.players.values()).sort((a, b) => b.score - a.score);
}

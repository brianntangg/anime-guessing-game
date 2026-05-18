// ─── Question ────────────────────────────────────────────────────────────────

export type QuestionType = 'audio-op-ed' | 'audio-ost' | 'image';
export type AnswerMode = 'multiple-choice' | 'free-text';

export interface Choice {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  answerMode: AnswerMode;
  mediaUrl: string;
  clipStartSec?: number;
  clipDurationSec?: number;
  choices: Choice[];           // required for multiple-choice; empty [] for free-text
  correctChoice?: 'A' | 'B' | 'C' | 'D'; // omit for free-text questions
  animeTitle: string;          // canonical answer; used for free-text matching and reveal display
  aliases?: string[];          // alternate titles ("Attack on Titan" ↔ "Shingeki no Kyojin")
  hint?: string;
}

export interface QuestionPack {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

// Sent to clients during the question phase — correctChoice is withheld until reveal
export type SafeQuestion = Omit<Question, 'correctChoice'>;

// ─── Player ──────────────────────────────────────────────────────────────────

export interface Player {
  id: string;               // socket.id
  nickname: string;
  avatarIndex: number;      // 0–7
  score: number;
  lastAnswerCorrect: boolean | null;
  lastPointsEarned: number | null;
  connected: boolean;
}

// ─── Game State ───────────────────────────────────────────────────────────────

export type GamePhase =
  | 'lobby'
  | 'question'
  | 'reveal'
  | 'leaderboard'
  | 'finished';

export interface PlayerAnswer {
  choice?: 'A' | 'B' | 'C' | 'D';  // multiple-choice
  text?: string;                      // free-text (raw submission)
  correct: boolean;
  pointsEarned: number;
  answerTimeMs: number;
}

export interface RoundResult {
  questionId: string;
  correctChoice: 'A' | 'B' | 'C' | 'D';
  animeTitle: string;
  playerAnswers: Record<string, PlayerAnswer>; // keyed by player.id
}

export interface GameState {
  phase: GamePhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  questionStartedAt: number | null;    // Date.now() on server
  questionDurationMs: number;
  roundResults: RoundResult[];
}

// ─── Room (server-only; serialized for snapshots) ────────────────────────────

export interface RoomSnapshot {
  code: string;
  players: Player[];
  packName: string;
  gameState: GameState;
  currentQuestion: SafeQuestion | null; // correctChoice withheld during question phase
}

// ─── Socket Events ────────────────────────────────────────────────────────────
//
// Convention: ClientToServerEvents = what clients emit
//             ServerToClientEvents = what server emits
//             Use socket.emit(event, payload) / socket.on(event, handler)

export interface ClientToServerEvents {
  // Host events
  'host:register': (payload: { roomCode: string }) => void;
  'host:start-game': (payload: { roomCode: string }) => void;
  'host:next-question': (payload: { roomCode: string }) => void;
  'host:skip-question': (payload: { roomCode: string }) => void;
  'host:kick-player': (payload: { roomCode: string; playerId: string }) => void;

  // Player events
  'player:join': (payload: { roomCode: string; nickname: string }) => void;
  'player:submit-answer': (payload: {
    roomCode: string;
    choice?: 'A' | 'B' | 'C' | 'D';
    text?: string;
  }) => void;
  'player:rejoin': (payload: { roomCode: string; nickname: string }) => void;
}

export interface ServerToClientEvents {
  'room:player-joined': (player: Player) => void;
  'room:player-left': (payload: { playerId: string }) => void;
  'room:error': (payload: { message: string }) => void;

  'host:registered-ack': (snapshot: RoomSnapshot) => void;
  'player:joined-ack': (snapshot: RoomSnapshot) => void;
  'player:kicked': () => void;

  'game:started': (payload: { gameState: GameState; question: SafeQuestion }) => void;
  'game:question': (payload: { question: SafeQuestion; gameState: GameState }) => void;
  'game:timer-tick': (payload: { remainingMs: number }) => void;
  'game:answer-received': (payload: { answeredCount: number; totalCount: number }) => void;
  'game:reveal': (payload: { roundResult: RoundResult; players: Player[]; gameState: GameState }) => void;
  'game:leaderboard': (payload: { players: Player[]; gameState: GameState }) => void;
  'game:finished': (payload: { players: Player[]; roundResults: RoundResult[] }) => void;
}

'use client';

import { Timer } from '../shared/Timer';
import { AudioPlayer } from '../shared/AudioPlayer';
import { useCountdown } from '../../hooks/useCountdown';
import { getMediaUrl } from '../../lib/media';
import type { SafeQuestion, GameState } from '../../lib/types';

const CHOICE_COLORS = {
  A: 'bg-red-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-green-500',
};

interface QuestionDisplayProps {
  question: SafeQuestion;
  gameState: GameState;
  answeredCount: number;
  totalCount: number;
  onSkip: () => void;
}

export function QuestionDisplay({ question, gameState, answeredCount, totalCount, onSkip }: QuestionDisplayProps) {
  const remainingMs = useCountdown(gameState.questionDurationMs, gameState.questionStartedAt);

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-sm uppercase tracking-widest">
          Question {gameState.currentQuestionIndex + 1} / {gameState.totalQuestions}
        </span>
        <Timer remainingMs={remainingMs} totalMs={gameState.questionDurationMs} size="lg" />
        <div className="flex flex-col items-end gap-1">
          <span className="text-white/60 text-sm">{answeredCount} / {totalCount} answered</span>
          <button
            onClick={onSkip}
            className="text-white/40 hover:text-white/80 text-xs underline transition-colors"
          >
            Skip →
          </button>
        </div>
      </div>

      {/* Media area */}
      <div className="flex-1 flex items-center justify-center">
        {question.type === 'image' ? (
          // Use plain <img> so no Next.js remotePatterns config is needed for R2
          <img
            src={getMediaUrl(question.mediaUrl)}
            alt="Guess this anime"
            className="max-h-64 max-w-full object-contain rounded-xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getMediaUrl('/media/images/placeholder.jpg');
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-8xl animate-pulse">🎵</div>
            <p className="text-white/60 text-lg">Listen carefully...</p>
            <AudioPlayer
              src={getMediaUrl(question.mediaUrl)}
              startSec={question.clipStartSec}
              durationSec={question.clipDurationSec}
              autoPlay
            />
          </div>
        )}
      </div>

      {question.hint && (
        <p className="text-center text-white/40 text-sm italic">Hint: {question.hint}</p>
      )}

      {/* Answer choices (multiple-choice only) */}
      {question.answerMode === 'multiple-choice' && (
        <div className="grid grid-cols-2 gap-3">
          {question.choices.map(c => (
            <div
              key={c.id}
              className={`${CHOICE_COLORS[c.id]} rounded-xl p-4 flex items-center gap-3`}
            >
              <span className="text-white font-black text-xl w-8">{c.id}</span>
              <span className="text-white font-semibold text-lg">{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {question.answerMode === 'free-text' && (
        <div className="text-center">
          <p className="text-white/60 text-lg">Type your answer on your device</p>
        </div>
      )}
    </div>
  );
}

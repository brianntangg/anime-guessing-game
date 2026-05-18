'use client';

import { useState } from 'react';
import { Timer } from '../shared/Timer';
import { useCountdown } from '../../hooks/useCountdown';
import type { SafeQuestion, GameState } from '../../lib/types';

const CHOICE_COLORS: Record<string, string> = {
  A: 'bg-red-500 active:bg-red-600',
  B: 'bg-blue-500 active:bg-blue-600',
  C: 'bg-yellow-500 active:bg-yellow-600',
  D: 'bg-green-500 active:bg-green-600',
};

interface AnswerPadProps {
  question: SafeQuestion;
  gameState: GameState;
  onAnswer: (choice?: 'A' | 'B' | 'C' | 'D', text?: string) => void;
}

export function AnswerPad({ question, gameState, onAnswer }: AnswerPadProps) {
  const [submitted, setSubmitted] = useState(false);
  const [freeText, setFreeText] = useState('');
  const remainingMs = useCountdown(gameState.questionDurationMs, gameState.questionStartedAt);

  const handleChoice = (choice: 'A' | 'B' | 'C' | 'D') => {
    if (submitted) return;
    setSubmitted(true);
    onAnswer(choice);
  };

  const handleTextSubmit = () => {
    if (submitted || !freeText.trim()) return;
    setSubmitted(true);
    onAnswer(undefined, freeText.trim());
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <div className="text-6xl animate-bounce">✓</div>
        <p className="text-white font-bold text-xl">Answer submitted!</p>
        <p className="text-white/50 text-sm">Waiting for others...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <Timer remainingMs={remainingMs} totalMs={gameState.questionDurationMs} size="sm" />

      <p className="text-white/60 text-center text-sm">
        Q{gameState.currentQuestionIndex + 1} of {gameState.totalQuestions}
      </p>

      {question.answerMode === 'multiple-choice' ? (
        <div className="flex-1 grid grid-cols-2 gap-3 content-center">
          {question.choices.map(c => (
            <button
              key={c.id}
              onClick={() => handleChoice(c.id)}
              className={`${CHOICE_COLORS[c.id]} rounded-2xl p-4 flex flex-col items-center gap-1 shadow-lg hover:scale-105 transition-transform active:scale-95`}
            >
              <span className="text-white font-black text-2xl">{c.id}</span>
              <span className="text-white font-medium text-sm text-center leading-tight">{c.text}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center gap-4">
          <p className="text-white text-center font-semibold">Type the anime name:</p>
          <input
            type="text"
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
            placeholder="Anime title..."
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/40 text-lg focus:outline-none focus:border-white/60"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!freeText.trim()}
            className="py-3 bg-white text-purple-700 font-black text-lg rounded-xl disabled:opacity-40 hover:scale-105 transition-transform"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

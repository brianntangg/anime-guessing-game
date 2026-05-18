// Avoids visually ambiguous chars: 0/O, 1/I/L
const ROOM_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

export function calculatePoints(
  correct: boolean,
  answerTimeMs: number,
  questionDurationMs: number
): number {
  if (!correct) return 0;
  const base = 1000;
  const speedBonus = Math.round(
    500 * Math.max(0, 1 - answerTimeMs / questionDurationMs)
  );
  return base + speedBonus;
}

export function normalizeAnswerText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

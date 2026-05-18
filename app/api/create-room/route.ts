import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '../../../lib/room-store';
import { getPack } from '../../../data/packs';

// Simple in-memory rate limiter: max 10 rooms per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many rooms created. Try again in a minute.' },
      { status: 429 }
    );
  }

  const body = await req.json() as {
    packId?: string;
    questionCount?: number;
    questionDurationMs?: number;
  };

  const {
    packId = 'classics',
    questionCount = 10,
    questionDurationMs = 20_000,
  } = body;

  const pack = getPack(String(packId));
  if (!pack) {
    return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
  }

  const count = Math.min(Math.max(1, Number(questionCount) || 1), pack.questions.length);
  const duration = Math.min(Math.max(10_000, Number(questionDurationMs) || 20_000), 120_000);

  const room = createRoom('pending', pack, count, duration);
  return NextResponse.json({ roomCode: room.code });
}

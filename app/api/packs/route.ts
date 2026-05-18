import { NextResponse } from 'next/server';
import { getAllPacks } from '../../../data/packs';

export async function GET() {
  const packs = getAllPacks().map(({ id, name, description, questions }) => ({
    id,
    name,
    description,
    questionCount: questions.length,
  }));
  return NextResponse.json({ packs });
}

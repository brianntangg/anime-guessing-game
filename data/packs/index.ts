import type { QuestionPack } from '../../lib/types';
import classics from './classics';
import modern from './modern';
import shonen from './shonen';
import isekai from './isekai';
import romance from './romance';

const packs: QuestionPack[] = [classics, modern, shonen, isekai, romance];

export function getPack(id: string): QuestionPack | undefined {
  return packs.find(p => p.id === id);
}

export function getAllPacks(): QuestionPack[] {
  return packs;
}

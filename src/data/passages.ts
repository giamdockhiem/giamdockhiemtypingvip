import passagesRaw from './passages.json';
import { VIETNAMESE_PASSAGES } from './vietnamesePassages';

export interface Passage {
  id: number;
  title: string;
  category: 'History' | 'Science & Space' | 'Philosophy' | 'Literature' | 'Technology' | 'Arts & Architecture' | 'Earth & Oceans';
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  summary: string;
  text: string;
  wordCount: number;
  lang?: 'en' | 'vi';
}

export const ENGLISH_PASSAGES: Passage[] = (passagesRaw as Passage[]).map(p => ({ ...p, lang: 'en' as const }));
export const ALL_VIETNAMESE_PASSAGES: Passage[] = VIETNAMESE_PASSAGES.map(p => ({ ...p, lang: 'vi' as const }));

export const PASSAGES: Passage[] = [...ENGLISH_PASSAGES, ...ALL_VIETNAMESE_PASSAGES];

export const PASSAGE_CATEGORIES = [
  'All',
  'History',
  'Science & Space',
  'Philosophy',
  'Literature',
  'Technology',
  'Arts & Architecture',
  'Earth & Oceans'
] as const;

export type PassageCategory = typeof PASSAGE_CATEGORIES[number];

export function getPassagesByLanguage(lang: 'en' | 'vi'): Passage[] {
  return lang === 'vi' ? ALL_VIETNAMESE_PASSAGES : ENGLISH_PASSAGES;
}

export function getPassageById(id: number): Passage {
  const found = PASSAGES.find(p => p.id === id);
  return found || ENGLISH_PASSAGES[0];
}

export function getRandomPassage(lang: 'en' | 'vi' = 'en', excludeId?: number): Passage {
  const pool = (lang === 'vi' ? ALL_VIETNAMESE_PASSAGES : ENGLISH_PASSAGES).filter(p => p.id !== excludeId);
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || PASSAGES[0];
}

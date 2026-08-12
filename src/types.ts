export interface IndicatorItem {
  id: string;
  name: string;
  detail: string;
}

export interface Criterion {
  id: string;
  category: 'ALL' | 'QCC-Rising' | 'QCC-Leading' | 'SS';
  title: string;
  weight: string;
  description: string;
  indicators: IndicatorItem[];
}

export type LevelCategory = 'Rising' | 'Leading' | 'SS';
export type StreamCategory = 'QCC' | 'SS';

export interface Participant {
  id: string;
  name: string;
  projectTitle: string;
  levelCategory: LevelCategory;
  stream: StreamCategory;
  photoUrl?: string;
  createdAt?: string;
}

export interface ScoreCriteria {
  inovasiDampak: number; // Inovasi & Dampak Bisnis (Bobot 30%)
  solusiTeknis: number; // Solusi & Kualitas Teknis (Bobot 30%)
  presentasiExecution: number; // Presentasi & Eksekusi (Bobot 20%)
  keberlanjutanReplikasi: number; // Keberlanjutan & Potensi Replikasi (Bobot 20%)
}

export interface JudgeScore {
  id: string;
  participantId: string;
  judgeId: 1 | 2 | 3;
  criteriaScores: ScoreCriteria;
  totalScore: number;
  notes: string;
  submittedAt: string;
}

export interface ContestSettings {
  juri3Revealed: boolean;
  juri3RevealedCategories?: {
    'QCC-Rising'?: boolean;
    'QCC-Leading'?: boolean;
    'SS'?: boolean;
  };
  eventName: string;
  activeCategory: string;
  updatedAt?: string;
}

export interface LeaderboardEntry {
  participant: Participant;
  juri1Score: number | null;
  juri2Score: number | null;
  juri3Score: number | null;
  calculatedTotal: number;
  evaluatedCount: number;
  hasJuri1: boolean;
  hasJuri2: boolean;
  hasJuri3: boolean;
  rank: number;
}

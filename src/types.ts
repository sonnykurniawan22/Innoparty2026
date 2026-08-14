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
  teamCode?: string; // ID Tim khusus dari Google Sheets
  projectTitle: string;
  levelCategory: LevelCategory;
  stream: StreamCategory;
  preliminaryScore?: number; // Nilai Penyisihan (0-100), Bobot 90%
  photoUrl?: string;
  createdAt?: string;
}

export interface ScoreCriteria {
  performance: number;       // Performance Juri (1-100), Bobot 4%
  perbaikanMateri: number;   // Perbaikan Materi Juri (1-100), Bobot 4%
}

export interface JudgeScore {
  id: string;
  participantId: string;
  judgeId: 1 | 2 | 3;
  judgeName?: string;
  criteriaScores: ScoreCriteria;
  totalScore: number;
  notes: string;
  submittedAt: string;
}

export interface PublicVote {
  id: string;
  participantId: string;
  category: string; // 'QCC-Rising', 'QCC-Leading', 'SS'
  voterToken: string;
  voterGroup?: string; // 'Kelompok 1' .. 'Kelompok 11'
  score?: number;
  comment?: string;
  votedAt: string;
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
  
  // Google Sheets Integration Settings
  qccSpreadsheetId?: string;
  ssSpreadsheetId?: string;
  qccJuri1SheetName?: string;
  qccJuri2SheetName?: string;
  qccJuri3SheetName?: string;
  ssJuri1SheetName?: string;
  ssJuri2SheetName?: string;
  ssJuri3SheetName?: string;

  // Custom Column Mapping (Contoh: "A", "B", "D", "E")
  colTeamCode?: string;         // default: "A"
  colTeamName?: string;         // default: "B"
  colPerbaikanMateri?: string;  // default: "D"
  colPerformance?: string;      // default: "E"

  // Custom Column Mapping QCC
  colQccTeamCode?: string;         // default: "A"
  colQccTeamName?: string;         // default: "B"
  colQccPreliminary?: string;      // default: "D"
  colQccPerbaikanMateri?: string;  // default: "E"
  colQccPerformance?: string;      // default: "F"

  // Custom Column Mapping SS
  colSsTeamCode?: string;         // default: "A"
  colSsTeamName?: string;         // default: "B"
  colSsPreliminary?: string;      // default: "D"
  colSsPerbaikanMateri?: string;  // default: "E"
  colSsPerformance?: string;      // default: "F"
}

export interface LeaderboardEntry {
  participant: Participant;
  preliminaryScore: number;       // Nilai Penyisihan (0-100)
  preliminaryScoreContrib: number; // 90% x preliminaryScore
  
  avgPerformance: number | null;  // Rata-rata 1-100
  performanceContrib: number;     // 4% x avgPerformance
  
  avgPerbaikanMateri: number | null; // Rata-rata 1-100
  perbaikanMateriContrib: number;    // 4% x avgPerbaikanMateri
  
  publicVoteCount: number;        // Jumlah suara masuk
  totalCategoryVotes: number;     // Total suara di kategori tersebut
  publicVoteContrib: number;      // 2% x (publicVoteCount / totalCategoryVotes * 100)
  
  calculatedTotal: number;        // Total Skor Akhir (0 - 100)
  evaluatedCount: number;
  hasJuri1: boolean;
  hasJuri2: boolean;
  hasJuri3: boolean;
  juri1Score?: number | null;
  juri2Score?: number | null;
  juri3Score?: number | null;
  rank: number;
}


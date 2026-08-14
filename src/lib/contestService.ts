import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Participant,
  JudgeScore,
  ContestSettings,
  LeaderboardEntry,
  ScoreCriteria,
  Criterion,
  PublicVote
} from '../types';
import { INITIAL_PARTICIPANTS } from './mockSeed';

const PARTICIPANTS_COL = 'participants';
const SCORES_COL = 'scores';
const PUBLIC_VOTES_COL = 'publicVotes';
const SETTINGS_COL = 'contestSettings';
const CRITERIA_COL = 'masterCriteria';
const SETTINGS_DOC_ID = 'global';

export const DEFAULT_CRITERIA: Criterion[] = [
  {
    id: 'crit-performance',
    category: 'ALL',
    title: 'Performance (Penilaian Juri)',
    weight: '4%',
    description: 'Menilai penampilan, pemaparan materi, kekompakan tim, dan penguasaan panggung/materi saat presentasi.',
    indicators: [
      { id: 'ind-perf-1', name: 'Penampilan & Kekompakan', detail: 'Kerapihan, kejelasan bicara, dan kerjasama tim.' },
      { id: 'ind-perf-2', name: 'Penguasaan Materi & QnA', detail: 'Kemampuan menjawab pertanyaan juri dengan lugas dan tepat.' }
    ]
  },
  {
    id: 'crit-materi',
    category: 'ALL',
    title: 'Perbaikan Materi (Penilaian Juri)',
    weight: '4%',
    description: 'Menilai kualitas perbaikan riset, kelengkapan data, kedalaman analisa, dan hasil konkrit dari perbaikan materi.',
    indicators: [
      { id: 'ind-mat-1', name: 'Kelengkapan & Kedalaman Data', detail: 'Akurasi data pendukung dan metode perbaikan yang diterapkan.' },
      { id: 'ind-mat-2', name: 'Standardisasi & Dampak Hasil', detail: 'Bukti perbaikan dan keberlanjutan hasil karya inovasi.' }
    ]
  }
];

export function calculateSingleJudgeTotal(criteria: ScoreCriteria): number {
  const perf = criteria.performance || 0;
  const mat = criteria.perbaikanMateri || 0;
  // Average scale 0-100
  const score = (perf + mat) / 2;
  return Number(score.toFixed(2));
}

export function subscribePublicVotes(callback: (votes: PublicVote[]) => void) {
  const q = query(collection(db, PUBLIC_VOTES_COL));
  return onSnapshot(q, (snapshot) => {
    const list: PublicVote[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as PublicVote);
    });
    callback(list);
  }, (err) => {
    console.warn("Notice: subscribing to public votes offline/retry:", err.message || err);
  });
}

export async function submitPublicVote(
  participantId: string, 
  category: string, 
  voterGroup: string,
  voterToken: string,
  score?: number,
  comment?: string
) {
  const cleanGroup = voterGroup.trim();
  // Gunakan voterToken sebagai bagian dari ID dokumen agar satu perangkat hanya bisa memiliki 1 suara per kategori
  const docId = `${category}_${voterToken}`;
  const voteDocRef = doc(db, PUBLIC_VOTES_COL, docId);

  const voteData: PublicVote = {
    id: docId,
    participantId,
    category,
    voterToken,
    voterGroup: cleanGroup,
    score: score || 85,
    comment: comment || '',
    votedAt: new Date().toISOString()
  };

  await setDoc(voteDocRef, voteData);
}

export async function clearAllPublicVotes() {
  try {
    const snapshot = await getDocs(collection(db, PUBLIC_VOTES_COL));
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, PUBLIC_VOTES_COL, docSnap.id));
    }
  } catch (err) {
    console.warn("Notice: clearAllPublicVotes error:", err);
  }
}


export async function clearAllScores() {
  try {
    const snapshot = await getDocs(collection(db, SCORES_COL));
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, SCORES_COL, docSnap.id));
    }
  } catch (err) {
    console.warn("Notice: clearAllScores error:", err);
  }
}

export function subscribeSettings(callback: (settings: ContestSettings) => void) {
  const docRef = doc(db, SETTINGS_COL, SETTINGS_DOC_ID);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as ContestSettings);
    } else {
      const defaultSettings: ContestSettings = {
        juri3Revealed: false,
        eventName: 'INNOPARTY 2026 - FOOTBALL INNOVATION CHAMPIONSHIP',
        activeCategory: 'ALL'
      };
      callback(defaultSettings);
      setDoc(docRef, defaultSettings).catch((err) => console.warn("Notice: writing default settings:", err));
    }
  }, (err) => {
    console.warn("Notice: subscribing to settings:", err);
  });
}

export async function updateContestSettings(settings: Partial<ContestSettings>) {
  const docRef = doc(db, SETTINGS_COL, SETTINGS_DOC_ID);
  await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
}

export function subscribeParticipants(callback: (participants: Participant[]) => void) {
  const q = query(collection(db, PARTICIPANTS_COL));
  return onSnapshot(q, async (snapshot) => {
    const list: Participant[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Participant);
    });
    // Cache locally for zero-latency instant startup
    try {
      localStorage.setItem('cached_participants_v1', JSON.stringify(list));
    } catch (e) {}
    callback(list);
  }, (err) => {
    console.warn("Notice: subscribing to participants offline/retry:", err.message || err);
  });
}

export function subscribeScores(callback: (scores: JudgeScore[]) => void) {
  const q = query(collection(db, SCORES_COL));
  return onSnapshot(q, (snapshot) => {
    const list: JudgeScore[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as JudgeScore);
    });
    callback(list);
  }, (err) => {
    console.warn("Notice: subscribing to scores offline/retry:", err.message || err);
  });
}

export async function saveJudgeScore(
  participantId: string,
  judgeId: 1 | 2 | 3,
  criteriaScores: ScoreCriteria,
  notes: string,
  judgeName?: string
) {
  const docId = `${participantId}_juri${judgeId}`;
  const totalScore = calculateSingleJudgeTotal(criteriaScores);
  const scoreData: JudgeScore = {
    id: docId,
    participantId,
    judgeId,
    judgeName: judgeName?.trim() || `Juri ${judgeId}`,
    criteriaScores,
    totalScore,
    notes,
    submittedAt: new Date().toISOString()
  };

  await setDoc(doc(db, SCORES_COL, docId), scoreData);
}

export async function deleteJudgeScore(
  participantId: string,
  judgeId: 1 | 2 | 3
) {
  const docId = `${participantId}_juri${judgeId}`;
  try {
    await deleteDoc(doc(db, SCORES_COL, docId));
  } catch (err) {
    console.warn("Notice: deleteJudgeScore error:", err);
  }
}

export async function addParticipant(p: Omit<Participant, 'id'>) {
  const ref = await addDoc(collection(db, PARTICIPANTS_COL), {
    ...p,
    createdAt: new Date().toISOString()
  });
  return ref.id;
}

export async function updateParticipant(id: string, p: Partial<Participant>) {
  await setDoc(doc(db, PARTICIPANTS_COL, id), p, { merge: true });
}

export async function deleteParticipant(id: string) {
  await deleteDoc(doc(db, PARTICIPANTS_COL, id));
}

export async function seedInitialDataIfEmpty() {
  try {
    const snapshot = await getDocs(collection(db, PARTICIPANTS_COL));
    if (snapshot.empty) {
      for (const item of INITIAL_PARTICIPANTS) {
        await addParticipant(item);
      }
    }
  } catch (err) {
    console.warn("Notice: seedInitialDataIfEmpty skipped or offline:", err);
  }
}

export function subscribeMasterCriteria(callback: (criteria: Criterion[]) => void) {
  const q = query(collection(db, CRITERIA_COL));
  return onSnapshot(q, async (snapshot) => {
    const list: Criterion[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Criterion);
    });
    // Sort by id or fallback order
    list.sort((a, b) => a.id.localeCompare(b.id));
    callback(list);
  }, (err) => {
    console.warn("Notice: subscribing to master criteria offline/retry:", err.message || err);
  });
}

export async function saveMasterCriterion(criterion: Criterion) {
  const { id, ...data } = criterion;
  if (id && id.trim()) {
    await setDoc(doc(db, CRITERIA_COL, id), data, { merge: true });
  } else {
    const docRef = await addDoc(collection(db, CRITERIA_COL), data);
    await setDoc(docRef, { id: docRef.id }, { merge: true });
  }
}

export async function deleteMasterCriterion(id: string) {
  await deleteDoc(doc(db, CRITERIA_COL, id));
}

export async function seedCriteriaIfEmpty() {
  const snapshot = await getDocs(collection(db, CRITERIA_COL));
  if (snapshot.empty) {
    for (const item of DEFAULT_CRITERIA) {
      await setDoc(doc(db, CRITERIA_COL, item.id), item);
    }
  }
}

export async function resetMasterCriteriaToDefault() {
  const snapshot = await getDocs(collection(db, CRITERIA_COL));
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, CRITERIA_COL, docSnap.id));
  }
  for (const item of DEFAULT_CRITERIA) {
    await setDoc(doc(db, CRITERIA_COL, item.id), item);
  }
}

export function getParticipantCategoryKey(p: { stream: string; levelCategory: string }): 'QCC-Rising' | 'QCC-Leading' | 'SS' {
  if (p.stream === 'SS') return 'SS';
  if (p.levelCategory === 'Leading') return 'QCC-Leading';
  return 'QCC-Rising';
}

export function isJuri3RevealedForCategory(_categoryKey?: string, _settings?: ContestSettings | boolean): boolean {
  return true;
}

export function computeLeaderboard(
  participants: Participant[],
  scores: JudgeScore[],
  publicVotes: PublicVote[] = [],
  _settings?: ContestSettings | boolean
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = participants.map((participant) => {
    const pCat = getParticipantCategoryKey(participant);

    // 1. Preliminary Score (90%)
    const preliminaryScore = participant.preliminaryScore || 0;
    const preliminaryScoreContrib = Number((preliminaryScore * 0.90).toFixed(2));

    // 2. Judge Scores (Performance 4% & Perbaikan Materi 4%)
    const pScores = scores.filter((s) => s.participantId === participant.id);

    const isScoreValid = (s?: JudgeScore | null) => {
      if (!s) return false;
      const perf = s.criteriaScores?.performance || 0;
      const mat = s.criteriaScores?.perbaikanMateri || 0;
      return perf > 0 || mat > 0;
    };

    const j1 = pScores.find((s) => Number(s.judgeId) === 1);
    const j2 = pScores.find((s) => Number(s.judgeId) === 2);
    const j3 = pScores.find((s) => Number(s.judgeId) === 3);

    const j1Valid = isScoreValid(j1) ? j1 : null;
    const j2Valid = isScoreValid(j2) ? j2 : null;
    const j3Valid = isScoreValid(j3) ? j3 : null;

    const juri1Score = j1Valid ? calculateSingleJudgeTotal(j1Valid.criteriaScores) : null;
    const juri2Score = j2Valid ? calculateSingleJudgeTotal(j2Valid.criteriaScores) : null;
    const juri3Score = j3Valid ? calculateSingleJudgeTotal(j3Valid.criteriaScores) : null;

    const activeJudges: JudgeScore[] = [];
    if (j1Valid) activeJudges.push(j1Valid);
    if (j2Valid) activeJudges.push(j2Valid);
    if (j3Valid) activeJudges.push(j3Valid);

    // Fallback if slot matching didn't catch pScores items, filter valid ones only
    if (activeJudges.length === 0 && pScores.length > 0) {
      activeJudges.push(...pScores.filter(isScoreValid));
    }

    let avgPerformance: number | null = null;
    let performanceContrib = 0;
    let avgPerbaikanMateri: number | null = null;
    let perbaikanMateriContrib = 0;

    if (activeJudges.length > 0) {
      const totalPerf = activeJudges.reduce((acc, s) => acc + (s.criteriaScores?.performance || 0), 0);
      avgPerformance = Number((totalPerf / activeJudges.length).toFixed(2));
      performanceContrib = Number((avgPerformance * 0.04).toFixed(2));

      const totalMat = activeJudges.reduce((acc, s) => acc + (s.criteriaScores?.perbaikanMateri || 0), 0);
      avgPerbaikanMateri = Number((totalMat / activeJudges.length).toFixed(2));
      perbaikanMateriContrib = Number((avgPerbaikanMateri * 0.04).toFixed(2));
    }

    // 3. Public Votes (2%)
    const MAX_CATEGORY_VOTES = 11;
    const catVotes = publicVotes.filter((v) => v.category === pCat);
    const totalCategoryVotes = catVotes.length; // For informational purposes
    const publicVoteCount = catVotes.filter((v) => v.participantId === participant.id).length;
    
    // Formula: (participant_votes / MAX_CATEGORY_VOTES) * 2
    // If somehow they get more than 11 votes, it caps at 11 (2% max)
    const cappedPublicVoteCount = Math.min(publicVoteCount, MAX_CATEGORY_VOTES);
    const publicVoteContrib = Number(((cappedPublicVoteCount / MAX_CATEGORY_VOTES) * 2).toFixed(2));

    // Total Score
    const calculatedTotal = Number((preliminaryScoreContrib + performanceContrib + perbaikanMateriContrib + publicVoteContrib).toFixed(2));

    return {
      participant,
      preliminaryScore,
      preliminaryScoreContrib,
      avgPerformance,
      performanceContrib,
      avgPerbaikanMateri,
      perbaikanMateriContrib,
      publicVoteCount,
      totalCategoryVotes,
      publicVoteContrib,
      calculatedTotal,
      evaluatedCount: activeJudges.length,
      hasJuri1: !!j1,
      hasJuri2: !!j2,
      hasJuri3: !!j3,
      juri1Score,
      juri2Score,
      juri3Score,
      rank: 0
    };
  });

  // Sort descending by calculatedTotal
  entries.sort((a, b) => b.calculatedTotal - a.calculatedTotal);

  // Assign rank
  entries.forEach((item, index) => {
    item.rank = index + 1;
  });

  return entries;
}

export function getProxyImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}


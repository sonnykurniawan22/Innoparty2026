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
  Criterion
} from '../types';
import { INITIAL_PARTICIPANTS } from './mockSeed';

const PARTICIPANTS_COL = 'participants';
const SCORES_COL = 'scores';
const SETTINGS_COL = 'contestSettings';
const CRITERIA_COL = 'masterCriteria';
const SETTINGS_DOC_ID = 'global';

export const DEFAULT_CRITERIA: Criterion[] = [
  {
    id: 'crit-1',
    category: 'ALL',
    title: 'Inovasi & Dampak Bisnis',
    weight: '30%',
    description: 'Menilai kebaruan ide, efisiensi biaya yang dihasilkan, serta dampak kuantitatif terhadap performa bisnis dan operasional.',
    indicators: [
      { id: 'ind-1-1', name: 'Kebaruan Ide (Originality)', detail: 'Tingkat keunikan ide inovasi dan terobosan pemikiran dibanding metode eksisting.' },
      { id: 'ind-1-2', name: 'Dampak Kuantitatif & Biaya', detail: 'Penghematan biaya (cost saving), efisiensi jam kerja, atau peningkatan output produksi.' },
      { id: 'ind-1-3', name: 'Peningkatan SQDCM', detail: 'Dampak positif terhadap Safety, Quality, Delivery, Cost, Morale, & Environment.' }
    ]
  },
  {
    id: 'crit-2',
    category: 'ALL',
    title: 'Solusi & Kualitas Teknis',
    weight: '30%',
    description: 'Menilai kerapihan analisis akar masalah, kompleksitas rekayasa teknis, serta keandalan uji coba solusi.',
    indicators: [
      { id: 'ind-2-1', name: 'Metodologi Analisis Masalah', detail: 'Kedalaman penggunaan alat analisis (Fishbone Diagram, 5-Why Analysis, PDCA / 8-Steps).' },
      { id: 'ind-2-2', name: 'Kompleksitas & Kualitas Teknis', detail: 'Tingkat kesulitan teknis solusi dan tingkat keandalan rekayasa yang diterapkan.' },
      { id: 'ind-2-3', name: 'Validasi & Standardisasi SOP', detail: 'Bukti hasil trial/praktek langsung dan pembentukan SOP / instruksi kerja baru.' }
    ]
  },
  {
    id: 'crit-3',
    category: 'ALL',
    title: 'Presentasi & Keterlibatan Tim',
    weight: '20%',
    description: 'Menilai kekompakan tim, keaktifan setiap anggota, kualitas penyampaian presentasi, alat peraga, dan jawaban Q&A.',
    indicators: [
      { id: 'ind-3-1', name: 'Keterlibatan & Kekompakan Tim', detail: 'Partisipasi aktif seluruh anggota tim QCC/SS saat mempresentasikan dan menjawab pertanyaan juri.' },
      { id: 'ind-3-2', name: 'Kejelasan & Alat Peraga (Props)', detail: 'Ketersediaan prototype/alat peraga, animasi/slide visual yang komunikatif dan menarik.' },
      { id: 'ind-3-3', name: 'Ketepatan Waktu & Sesi Tanya Jawab', detail: 'Disiplin alokasi waktu presentasi serta ketepatan dan keyakinan dalam memberikan jawaban.' }
    ]
  },
  {
    id: 'crit-4',
    category: 'ALL',
    title: 'Keberlanjutan & Potensi Replikasi',
    weight: '20%',
    description: 'Menilai kemudahan replikasi inovasi di lini/pabrik lain serta sistem pemeliharaan pasca-kegiatan.',
    indicators: [
      { id: 'ind-4-1', name: 'Potensi Replikasi Area Lain', detail: 'Tingkat kemudahan ide untuk diterapkan di departemen, mesin, atau cabang lain.' },
      { id: 'ind-4-2', name: 'Kemudahan Maintenance System', detail: 'Kemudahan perawatan perangkat/sistem baru oleh tim operasional harian.' },
      { id: 'ind-4-3', name: 'Dampak Jangka Panjang', detail: 'Komitmen manajemen dan potensi kontribusi berkelanjutan bagi ekosistem perusahaan.' }
    ]
  }
];

export function calculateSingleJudgeTotal(criteria: ScoreCriteria): number {
  const score = 
    (criteria.inovasiDampak * 0.30) +
    (criteria.solusiTeknis * 0.30) +
    (criteria.presentasiExecution * 0.20) +
    (criteria.keberlanjutanReplikasi * 0.20);
  return Number(score.toFixed(2));
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
      setDoc(docRef, defaultSettings).then(() => callback(defaultSettings));
    }
  }, (err) => {
    console.error("Error subscribing to settings:", err);
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
    console.error("Error subscribing to participants:", err);
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
    console.error("Error subscribing to scores:", err);
  });
}

export async function saveJudgeScore(
  participantId: string,
  judgeId: 1 | 2 | 3,
  criteriaScores: ScoreCriteria,
  notes: string
) {
  const docId = `${participantId}_juri${judgeId}`;
  const totalScore = calculateSingleJudgeTotal(criteriaScores);
  const scoreData: JudgeScore = {
    id: docId,
    participantId,
    judgeId,
    criteriaScores,
    totalScore,
    notes,
    submittedAt: new Date().toISOString()
  };

  await setDoc(doc(db, SCORES_COL, docId), scoreData);
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
  const snapshot = await getDocs(collection(db, PARTICIPANTS_COL));
  if (snapshot.empty) {
    for (const item of INITIAL_PARTICIPANTS) {
      await addParticipant(item);
    }
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
    console.error("Error subscribing to master criteria:", err);
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

export function isJuri3RevealedForCategory(categoryKey: string, settings?: ContestSettings | boolean): boolean {
  if (typeof settings === 'boolean') return settings;
  if (!settings) return false;
  if (settings.juri3RevealedCategories) {
    if (categoryKey === 'QCC-Rising' || categoryKey === 'Rising') {
      return !!settings.juri3RevealedCategories['QCC-Rising'];
    }
    if (categoryKey === 'QCC-Leading' || categoryKey === 'Leading') {
      return !!settings.juri3RevealedCategories['QCC-Leading'];
    }
    if (categoryKey === 'SS') {
      return !!settings.juri3RevealedCategories['SS'];
    }
  }
  return !!settings.juri3Revealed;
}

export function computeLeaderboard(
  participants: Participant[],
  scores: JudgeScore[],
  settings: ContestSettings | boolean
): LeaderboardEntry[] {
  const settingsObj: ContestSettings = typeof settings === 'boolean'
    ? { juri3Revealed: settings, eventName: '', activeCategory: 'ALL' }
    : settings;

  const entries: LeaderboardEntry[] = participants.map((participant) => {
    const pCat = getParticipantCategoryKey(participant);
    const juri3Revealed = isJuri3RevealedForCategory(pCat, settingsObj);

    const pScores = scores.filter((s) => s.participantId === participant.id);

    const j1 = pScores.find((s) => s.judgeId === 1);
    const j2 = pScores.find((s) => s.judgeId === 2);
    const j3 = pScores.find((s) => s.judgeId === 3);

    const juri1Score = j1 ? j1.totalScore : null;
    const juri2Score = j2 ? j2.totalScore : null;
    const juri3Score = j3 ? j3.totalScore : null;

    const availableScores: number[] = [];
    if (juri1Score !== null) availableScores.push(juri1Score);
    if (juri2Score !== null) availableScores.push(juri2Score);

    // Only include Juri 3 score if juri3Revealed is TRUE for this participant's category
    if (juri3Revealed && juri3Score !== null) {
      availableScores.push(juri3Score);
    }

    let calculatedTotal = 0;
    if (availableScores.length > 0) {
      const sum = availableScores.reduce((acc, curr) => acc + curr, 0);
      calculatedTotal = Number((sum / availableScores.length).toFixed(2));
    }

    return {
      participant,
      juri1Score,
      juri2Score,
      juri3Score,
      calculatedTotal,
      evaluatedCount: availableScores.length,
      hasJuri1: juri1Score !== null,
      hasJuri2: juri2Score !== null,
      hasJuri3: juri3Score !== null,
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

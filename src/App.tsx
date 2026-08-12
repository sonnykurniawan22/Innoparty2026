import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Participant, JudgeScore, ContestSettings, LeaderboardEntry } from './types';
import {
  subscribeParticipants,
  subscribeScores,
  subscribeSettings,
  computeLeaderboard
} from './lib/contestService';
import { INITIAL_PARTICIPANTS } from './lib/mockSeed';

import { Navbar } from './components/Navbar';
import { LivePodium } from './components/LivePodium';
import { ScoringForm } from './components/ScoringForm';
import { MasterParticipants } from './components/MasterParticipants';
import { MasterScores } from './components/MasterScores';
import { JudgeQRModal } from './components/JudgeQRModal';
import { AdminSettings } from './components/AdminSettings';

import { Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'podium' | 'scoring' | 'master' | 'masterScores' | 'qr' | 'admin'>('podium');
  
  // Real-time Firestore State (Instant load with cached or initial seed fallback)
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const cached = localStorage.getItem('cached_participants_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_PARTICIPANTS;
  });

  const [scores, setScores] = useState<JudgeScore[]>([]);
  const [settings, setSettings] = useState<ContestSettings>({
    juri3Revealed: false,
    eventName: 'INNOPARTY 2026 - FOOTBALL INNOVATION CHAMPIONSHIP',
    activeCategory: 'ALL'
  });

  const [activeJudgeId, setActiveJudgeId] = useState<number | null>(null);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  
  // Jika diakses via QR Juri (ada activeJudgeId), itu adalah mode umum/khusus juri tanpa login.
  // Selain itu, wajib login untuk mengakses semua menu (termasuk podium & form penilaian manual).
  const isJudgeMode = !!activeJudgeId;
  const showAdminLogin = !isJudgeMode && !isAdminLoggedIn;

  // Parse URL Parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const juriParam = params.get('juri');
    const viewParam = params.get('view');
    const categoryParam = params.get('category');
    const participantParam = params.get('participant');
    if (participantParam) {
      setActiveParticipantId(participantParam);
    }

    if (juriParam && ['1', '2', '3'].includes(juriParam)) {
      const jId = parseInt(juriParam, 10);
      setActiveJudgeId(jId);
      setActiveTab('scoring');
    } else if (viewParam === 'podium') {
      setActiveTab('podium');
    }

    if (categoryParam) {
      if (['Rising', 'Leading', 'QCC-Rising', 'QCC-Leading', 'SS', 'ALL'].includes(categoryParam)) {
        setActiveCategoryFilter(categoryParam);
      }
    }
  }, []);

  // Subscribe to real-time Firestore collections
  useEffect(() => {
    const unsubscribeParticipants = subscribeParticipants((data) => {
      setParticipants(data);
    });

    const unsubscribeScores = subscribeScores((data) => {
      setScores(data);
    });

    const unsubscribeSettings = subscribeSettings((data) => {
      setSettings(data);
    });

    return () => {
      unsubscribeParticipants();
      unsubscribeScores();
      unsubscribeSettings();
    };
  }, []);

  // Compute live leaderboard with real-time score updates & Juri 3 VAR visibility rule
  const leaderboard: LeaderboardEntry[] = computeLeaderboard(
    participants,
    scores,
    settings
  );

  // ----------------------------------------------------------------------
  // PORTAL LOGIN TUNGGAL (Jika belum login & bukan Juri)
  // ----------------------------------------------------------------------
  if (showAdminLogin) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4">
        <motion.div
          key="adminLogin"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 text-center uppercase tracking-tight">Login Admin</h2>
          <p className="text-slate-500 text-center mb-6 text-sm font-medium">Masukkan kata sandi administrator untuk mengakses sistem.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (adminPasswordInput === 'admin123') {
              setIsAdminLoggedIn(true);
              setAdminPasswordInput('');
            } else {
              alert('Password salah!');
            }
          }} className="space-y-4">
            <input
              type="password"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              placeholder="Password..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-slate-900"
            />
            <button type="submit" className="w-full py-3 rounded-xl bg-slate-900 text-white font-black uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-md">
              Masuk
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // TAMPILAN UTAMA APLIKASI
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50  text-slate-900  font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeJudgeId={activeJudgeId}
        juri3Revealed={settings.juri3Revealed}
        onExitJudgeMode={() => {
          setActiveJudgeId(null);
          setActiveTab('podium');
          // Clean URL param
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: LIVE PODIUM SCOREBOARD */}
          {activeTab === 'podium' && (
            <motion.div
              key="podium"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <LivePodium
                leaderboard={leaderboard}
                juri3Revealed={settings.juri3Revealed}
                settings={settings}
                activeCategoryFilter={activeCategoryFilter}
                setActiveCategoryFilter={setActiveCategoryFilter}
                podiumAvatars={settings.podiumAvatars}
              />
            </motion.div>
          )}

          {/* TAB 2: FORM PENILAIAN JURI */}
          {activeTab === 'scoring' && (
            <motion.div
              key="scoring"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <ScoringForm
                participants={participants}
                scores={scores}
                initialJudgeId={activeJudgeId}
                initialParticipantId={activeParticipantId}
                onScoreSubmitted={() => {
                  // Option to switch to podium after score submit
                }}
              />
            </motion.div>
          )}

          {/* TAB 3: MASTER PESERTA */}
          {activeTab === 'master' && (
            <motion.div
              key="master"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <MasterParticipants participants={participants} />
            </motion.div>
          )}

          {/* TAB 4: MASTER PENILAIAN */}
          {activeTab === 'masterScores' && (
            <motion.div
              key="masterScores"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <MasterScores />
            </motion.div>
          )}

          {/* TAB 5: BARCODE & LINK JURI */}
          {activeTab === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <JudgeQRModal participants={participants} />
            </motion.div>
          )}

          {/* TAB 6: PANEL KONTROL VAR JURI 3 */}
          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <AdminSettings settings={settings} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Matchday Branding */}
      <footer className="border-t border-slate-200  bg-white  py-6 mt-12 text-center text-xs text-slate-500 ">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-slate-800  flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Innoparty 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

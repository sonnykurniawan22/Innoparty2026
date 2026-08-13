import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Participant, JudgeScore, ContestSettings, LeaderboardEntry, PublicVote } from './types';
import {
  subscribeParticipants,
  subscribeScores,
  subscribeSettings,
  subscribePublicVotes,
  computeLeaderboard
} from './lib/contestService';

import { Navbar } from './components/Navbar';
import { LivePodium } from './components/LivePodium';
import { ScoringForm } from './components/ScoringForm';
import { MasterParticipants } from './components/MasterParticipants';
import { JudgeQRModal } from './components/JudgeQRModal';
import { AdminSettings } from './components/AdminSettings';
import { PublicVoteView } from './components/PublicVoteView';

import { Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'podium' | 'scoring' | 'master' | 'qr' | 'admin' | 'vote'>('podium');
  
  // Real-time Firestore State (Instant load with cached or initial seed fallback)
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const cached = localStorage.getItem('cached_participants_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [scores, setScores] = useState<JudgeScore[]>([]);
  const [publicVotes, setPublicVotes] = useState<PublicVote[]>([]);
  const [settings, setSettings] = useState<ContestSettings>({
    juri3Revealed: false,
    eventName: 'INNOPARTY 2026 - FOOTBALL INNOVATION CHAMPIONSHIP',
    activeCategory: 'ALL'
  });

  const [activeJudgeId, setActiveJudgeId] = useState<number | null>(null);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('QCC-Rising');
  
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('innoparty_admin_logged_in') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isDirectJudgeOrVote, setIsDirectJudgeOrVote] = useState(false);

  // Parse URL Parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const juriParam = params.get('juri') || params.get('judgeId');
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
      setIsDirectJudgeOrVote(true);
    } else if (tabParam === 'vote' || viewParam === 'vote') {
      setActiveTab('vote');
      setIsDirectJudgeOrVote(true);
    } else if (tabParam === 'scoring' || viewParam === 'scoring') {
      setActiveTab('scoring');
    } else if (tabParam === 'podium' || viewParam === 'podium') {
      setActiveTab('podium');
    } else if (tabParam === 'master' || viewParam === 'master') {
      setActiveTab('master');
    } else if (tabParam === 'qr' || viewParam === 'qr') {
      setActiveTab('qr');
    } else if (tabParam === 'admin' || viewParam === 'admin') {
      setActiveTab('admin');
    }

    if (categoryParam) {
      if (['Rising', 'Leading', 'QCC-Rising', 'QCC-Leading', 'SS', 'ALL'].includes(categoryParam)) {
        setActiveCategoryFilter(categoryParam);
      }
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin123') {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem('innoparty_admin_logged_in', 'true');
      } catch (e) {}
      setAdminPasswordInput('');
      setLoginError(null);
    } else {
      setLoginError('Kata sandi administrator salah. Silakan coba lagi.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem('innoparty_admin_logged_in');
    } catch (e) {}
  };

  // Session login required to unlock all system menus unless accessing via direct Judge or Public links
  const showAdminLogin = !isDirectJudgeOrVote && !isAdminLoggedIn;

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

    const unsubscribeVotes = subscribePublicVotes((data) => {
      setPublicVotes(data);
    });

    return () => {
      unsubscribeParticipants();
      unsubscribeScores();
      unsubscribeSettings();
      unsubscribeVotes();
    };
  }, []);

  // Compute live leaderboard with real-time score updates & Juri 3 VAR visibility rule
  const leaderboard: LeaderboardEntry[] = computeLeaderboard(
    participants,
    scores,
    publicVotes,
    settings
  );

  // ----------------------------------------------------------------------
  // MANDATORY ADMIN PORTAL LOGIN GATEWAY
  // ----------------------------------------------------------------------
  if (showAdminLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 font-sans flex items-center justify-center p-4">
        <motion.div
          key="adminLogin"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-100 text-slate-900 relative overflow-hidden"
        >
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-red-500 to-amber-500" />

          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 bg-red-100 border border-red-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200">
              INNOPARTY 2026 • PORTAL UTAMA
            </span>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              LOGIN ADMINISTRATOR
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              Masukkan kata sandi Administrator untuk membuka seluruh akses sistem, penilaian, dan kontrol VAR.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Kata Sandi Admin / Panitia
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold text-slate-900 text-sm shadow-inner"
                autoFocus
              />
            </div>

            {loginError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 active:scale-98"
            >
              MASUK
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-500 selection:text-white">
      
      {/* Navbar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeJudgeId={activeJudgeId}
        juri3Revealed={settings.juri3Revealed}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
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

          {/* TAB 7: PUBLIC VOTE */}
          {activeTab === 'vote' && (
            <motion.div
              key="vote"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <PublicVoteView 
                participants={participants} 
                publicVotes={publicVotes} 
                initialCategoryFilter={activeCategoryFilter} 
              />
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
              <AdminSettings settings={settings} participants={participants} scores={scores} publicVotes={publicVotes} />
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

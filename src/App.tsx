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
    } catch (e) { }
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

  // Parse URL Parameters & Pathname on initial load for QR Code Public & Juri links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname.toLowerCase();

    const tabParam = params.get('tab');
    const juriParam = params.get('juri') || params.get('judgeId');
    const viewParam = params.get('view');
    const categoryParam = params.get('category') || params.get('cat');
    const participantParam = params.get('participant') || params.get('team') || params.get('code') || params.get('id');

    if (participantParam) {
      setActiveParticipantId(participantParam);
      setIsDirectJudgeOrVote(true);
    }

    if (categoryParam) {
      if (['Rising', 'Leading', 'QCC-Rising', 'QCC-Leading', 'SS', 'ALL'].includes(categoryParam)) {
        setActiveCategoryFilter(categoryParam);
      }
    }

    // Direct route detection for Public QR & Juri links
    if (juriParam && ['1', '2', '3'].includes(juriParam)) {
      const jId = parseInt(juriParam, 10);
      setActiveJudgeId(jId);
      setActiveTab('scoring');
      setIsDirectJudgeOrVote(true);
    } else if (pathname.includes('/vote') || tabParam === 'vote' || viewParam === 'vote' || categoryParam) {
      setActiveTab('vote');
      setIsDirectJudgeOrVote(true);
    } else if (pathname.includes('/scoring') || pathname.includes('/juri') || pathname.includes('/judge') || tabParam === 'scoring' || viewParam === 'scoring') {
      setActiveTab('scoring');
      setIsDirectJudgeOrVote(true);
    } else if (participantParam) {
      setActiveTab('vote');
      setIsDirectJudgeOrVote(true);
    } else if (tabParam === 'podium' || viewParam === 'podium') {
      setActiveTab('podium');
    } else if (tabParam === 'master' || viewParam === 'master') {
      setActiveTab('master');
    } else if (tabParam === 'qr' || viewParam === 'qr') {
      setActiveTab('qr');
    } else if (tabParam === 'admin' || viewParam === 'admin') {
      setActiveTab('admin');
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin123') {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem('innoparty_admin_logged_in', 'true');
      } catch (e) { }
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
    } catch (e) { }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-stone-900 font-sans flex items-center justify-center p-4">
        <motion.div
          key="adminLogin"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-100 text-slate-900 relative overflow-hidden"
        >
          {/* Decorative Top Gold Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 wc-gold-line" />

          <div className="text-center space-y-3 mb-8">
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <img src="/mascot-hero.png" alt="Innoparty Mascot" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-[#EFF6FF] text-[#1E40AF] px-3 py-1 rounded-full border border-[#BFDBFE]">
              INNOPARTY 2026 • PORTAL UTAMA
            </span>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-display">
              LOGIN ADMINISTRATOR
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              Masukkan kata sandi Administrator untuk membuka seluruh akses sistem, penilaian, dan kontrol VAR.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                Kata Sandi Admin / Panitia
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2563EB] outline-none transition-all font-bold text-slate-900 text-sm shadow-inner"
                autoFocus
              />
            </div>

            {loginError && (
              <p className="text-xs font-bold text-[#D80001] bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-slate-900/20 active:scale-98"
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#2563EB] selection:text-white relative overflow-x-hidden">

      {/* Official World Cup 2026 Vibrant Gradient & Pattern Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-50">

        {/* The Host Nations & Banner Vibrant Ambient Glows */}
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-[#0B47A4]/40 rounded-full blur-[150px]" /> {/* Deep Royal Blue */}
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#39FF14]/25 rounded-full blur-[140px]" /> {/* Neon Green */}
        <div className="absolute -bottom-20 left-1/4 w-[600px] h-[600px] bg-[#FF0055]/25 rounded-full blur-[140px]" /> {/* Vibrant Red/Magenta */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8B5CF6]/20 rounded-full blur-[160px]" /> {/* Deep Purple */}

        {/* Official Geometric Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.15] bg-repeat bg-center mix-blend-multiply"
          style={{ backgroundImage: "url('/worldcup-pattern.png')", backgroundSize: '400px auto' }}
        />

        {/* Soft Fade Mask at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/70" />
      </div>

      {/* Navbar Navigation */}
      {!isDirectJudgeOrVote && (
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
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 relative z-10">
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

      {/* Footer with Elegant Gold Accent */}
      <footer className="border-t border-slate-200/60 bg-white/90 backdrop-blur py-6 mt-16 text-center text-xs text-slate-500 relative z-10">
        <div className="absolute top-0 left-0 right-0 h-[2px] wc-gold-line" />
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <span className="font-display tracking-tight">Innoparty 2026 • Idea Innovation Impact</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Innoparty 2026™ Edition
          </div>
        </div>
      </footer>

    </div>
  );
}

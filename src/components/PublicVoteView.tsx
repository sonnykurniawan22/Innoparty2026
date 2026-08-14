import React, { useState, useEffect } from 'react';
import { Participant, PublicVote, OFFICIAL_VOTER_GROUPS } from '../types';
import { submitPublicVote, getProxyImageUrl } from '../lib/contestService';
import { CheckCircle2, Award, Send, Users, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PublicVoteViewProps {
  participants: Participant[];
  publicVotes: PublicVote[];
  initialCategoryFilter?: string;
}

export const PublicVoteView: React.FC<PublicVoteViewProps> = ({
  participants,
  publicVotes,
  initialCategoryFilter
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'QCC-Rising' | 'QCC-Leading' | 'SS'>('QCC-Rising');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [voterToken, setVoterToken] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [voteSuccessMsg, setVoteSuccessMsg] = useState<string | null>(null);

  // Auto-detect category & pre-selected participant from URL query parameters or props
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    const partParam = params.get('participant');

    let detectedCat: 'QCC-Rising' | 'QCC-Leading' | 'SS' | null = null;

    if (partParam && participants.length > 0) {
      const found = participants.find(p => p.id === partParam);
      if (found) {
        if (found.stream === 'SS') detectedCat = 'SS';
        else if (found.levelCategory === 'Leading') detectedCat = 'QCC-Leading';
        else detectedCat = 'QCC-Rising';

        setSelectedParticipantId(found.id);
      }
    }

    if (!detectedCat && catParam) {
      if (catParam === 'SS') detectedCat = 'SS';
      else if (['QCC-Leading', 'Leading'].includes(catParam)) detectedCat = 'QCC-Leading';
      else if (['QCC-Rising', 'Rising'].includes(catParam)) detectedCat = 'QCC-Rising';
    }

    if (!detectedCat && initialCategoryFilter) {
      if (initialCategoryFilter === 'SS') detectedCat = 'SS';
      else if (['QCC-Leading', 'Leading'].includes(initialCategoryFilter)) detectedCat = 'QCC-Leading';
      else if (['QCC-Rising', 'Rising'].includes(initialCategoryFilter)) detectedCat = 'QCC-Rising';
    }

    if (detectedCat) {
      setActiveCategoryFilter(detectedCat);
    }
  }, [participants, initialCategoryFilter]);

  // Generate device token if needed
  useEffect(() => {
    let token = localStorage.getItem('innoparty_voter_token');
    if (!token) {
      token = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('innoparty_voter_token', token);
    }
    setVoterToken(token);
  }, []);

  // Filter participants for active category
  const categoryParticipants = participants.filter((p) => {
    if (activeCategoryFilter === 'SS') return p.stream === 'SS';
    if (activeCategoryFilter === 'QCC-Leading') return p.stream === 'QCC' && p.levelCategory === 'Leading';
    return p.stream === 'QCC' && p.levelCategory === 'Rising';
  });

  // Reset selected participant when active category changes if current is not in category
  useEffect(() => {
    if (categoryParticipants.length > 0) {
      const isCurrentInCategory = categoryParticipants.some(p => p.id === selectedParticipantId);
      if (!isCurrentInCategory) {
        setSelectedParticipantId(categoryParticipants[0].id);
      }
    } else {
      setSelectedParticipantId('');
    }
  }, [activeCategoryFilter, categoryParticipants]);

  // All votes cast in the active category
  const categoryVotes = publicVotes.filter((v) => v.category === activeCategoryFilter);

  // Set of groups that have already voted in this category (Real-time Firestore)
  const votedGroupsSet = new Set(categoryVotes.map((v) => v.voterGroup));

  // Check if current device has already voted in active category
  const myVote = categoryVotes.find((v) => v.voterToken === voterToken);

  // Check if all groups have voted
  const allGroupsVoted = OFFICIAL_VOTER_GROUPS.every(g => votedGroupsSet.has(g));

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) {
      alert('Silakan pilih nama kelompok pemilih Anda terlebih dahulu.');
      return;
    }

    if (votedGroupsSet.has(selectedGroup)) {
      alert(`Kelompok "${selectedGroup}" sudah tercatat memberikan suara untuk kategori ${activeCategoryFilter}.`);
      return;
    }
    
    if (!selectedParticipantId) {
      alert('Silakan pilih 1 tim inovasi yang ingin Anda dukung.');
      return;
    }

    const selectedParticipant = participants.find(p => p.id === selectedParticipantId);
    if (!selectedParticipant) return;

    try {
      setSubmitting(true);
      await submitPublicVote(
        selectedParticipantId, 
        activeCategoryFilter, 
        selectedGroup, 
        voterToken, 
        85, 
        comment
      );

      setSubmitting(false);
      setComment('');
      setVoteSuccessMsg(`Suara dari "${selectedGroup}" untuk "${selectedParticipant.name}" (Kategori ${activeCategoryFilter}) berhasil tercatat dan dikunci!`);
      setSelectedGroup('');

      setTimeout(() => setVoteSuccessMsg(null), 6000);
    } catch (err: any) {
      setSubmitting(false);
      alert(err.message || 'Gagal mengirim suara.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {voteSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg text-sm flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{voteSuccessMsg}</span>
            </div>
            <button 
              onClick={() => setVoteSuccessMsg(null)}
              className="text-xs bg-white/20 px-2.5 py-1 rounded-lg hover:bg-white/30 font-bold cursor-pointer"
            >
              Tutup
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-detected Category Banner */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block">
              KATEGORI PENILAIAN PUBLIC VOTE
            </span>
            <h3 className="font-black text-sm sm:text-base uppercase tracking-wider text-white">
              {activeCategoryFilter === 'QCC-Rising' && 'QCC RISING CLASS'}
              {activeCategoryFilter === 'QCC-Leading' && 'QCC LEADING CLASS'}
              {activeCategoryFilter === 'SS' && 'SUGGESTION SYSTEM (SS)'}
            </h3>
          </div>
        </div>

        {/* Real-time Vote Progress */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Partisipasi Kelompok</span>
          <span className="text-sm font-black text-emerald-400">
            {votedGroupsSet.size} / {OFFICIAL_VOTER_GROUPS.length} Suara Masuk
          </span>
        </div>
      </div>

      {/* MAIN FORM */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Banner jika perangkat ini sudah vote */}
        {myVote && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <div className="mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-tight">
                Suara dari Kelompok "{myVote.voterGroup}" Telah Terkunci
              </h4>
              <p className="text-xs text-emerald-700 mt-1">
                Kelompok <strong>{myVote.voterGroup}</strong> telah memberikan dukungan kepada tim <strong className="font-black text-emerald-900">{participants.find(p => p.id === myVote.participantId)?.name || 'Peserta'}</strong> pada kategori ini.
              </p>
            </div>
          </div>
        )}

        {/* Banner jika semua 11 kelompok sudah memilih */}
        {allGroupsVoted && !myVote && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <div className="mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">
                Voting Kategori Ini Selesai
              </h4>
              <p className="text-xs text-amber-700 mt-1">
                Seluruh 11 kelompok pemilih telah selesai memberikan suaranya untuk kategori ini.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleVoteSubmit} className="space-y-6">

          {/* 1. SELECTION KELOMPOK PEMILIH (Anti-Duplikasi & Anti-Incognito) */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <label className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-800">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                <span>Pilih Kelompok Pemilih Anda</span>
                <span className="text-red-600 font-black text-sm">*</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {votedGroupsSet.size} dari {OFFICIAL_VOTER_GROUPS.length} Kelompok Telah Memilih
              </span>
            </label>

            {/* Dropdown Selection */}
            <div className="relative">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={allGroupsVoted}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 bg-white font-bold text-slate-900 text-sm focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none transition-all shadow-sm cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
                required
              >
                <option value="">-- Pilih Kelompok Resmi (11 Kelompok) --</option>
                {OFFICIAL_VOTER_GROUPS.map((grp) => {
                  const isVoted = votedGroupsSet.has(grp);
                  return (
                    <option 
                      key={grp} 
                      value={grp} 
                      disabled={isVoted}
                      className={isVoted ? 'text-slate-400 font-normal bg-slate-100' : 'text-slate-900 font-bold'}
                    >
                      {grp} {isVoted ? '(✓ Sudah Memilih)' : '(Tersedia)'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Quick Grid Badges for Visual Overview */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Status 11 Kelompok Pemilih ({activeCategoryFilter}):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OFFICIAL_VOTER_GROUPS.map((grp) => {
                  const isVoted = votedGroupsSet.has(grp);
                  const isSelected = selectedGroup === grp;
                  return (
                    <button
                      type="button"
                      key={grp}
                      disabled={isVoted || allGroupsVoted}
                      onClick={() => !isVoted && setSelectedGroup(grp)}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs font-bold flex items-center justify-between gap-1.5 ${
                        isVoted
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-red-50 border-red-500 text-red-700 shadow-sm ring-1 ring-red-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <span className="truncate">{grp}</span>
                      {isVoted ? (
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-semibold shrink-0">
                          Sudah
                        </span>
                      ) : isSelected ? (
                        <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Tersedia" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* 2. PILIH TIM INOVASI */}
          <div className="space-y-3">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Pilih 1 Tim Inovasi yang Didukung ({categoryParticipants.length} Tim Tersedia)
            </span>

            {categoryParticipants.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
                Belum ada peserta terdaftar pada kategori {activeCategoryFilter}.
              </p>
            ) : (
              <div className="space-y-2.5">
                {categoryParticipants.map((p) => {
                  const isTeamSelected = selectedParticipantId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedParticipantId(p.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        isTeamSelected
                          ? 'border-red-600 bg-red-50/50 shadow-sm ring-1 ring-red-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 border ${
                          isTeamSelected ? 'bg-red-600 text-white border-red-600' : 'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {p.photoUrl ? (
                            <img src={getProxyImageUrl(p.photoUrl)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            p.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {p.teamCode && (
                              <span className="px-1.5 py-0.5 bg-slate-800 text-white font-mono font-bold text-[10px] rounded">
                                {p.teamCode}
                              </span>
                            )}
                            <h4 className="font-black text-slate-900 text-sm">{p.name}</h4>
                          </div>
                          <p className="text-xs text-slate-600 font-medium italic truncate max-w-[220px] sm:max-w-md mt-0.5">
                            "{p.projectTitle}"
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isTeamSelected ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isTeamSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting || !selectedParticipantId || !selectedGroup || votedGroupsSet.has(selectedGroup) || allGroupsVoted}
            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {submitting 
                ? 'MENGIRIM & MENGUNCI SUARA...' 
                : selectedGroup 
                ? `KIRIM SUARA DARI ${selectedGroup.toUpperCase()}` 
                : 'PILIH KELOMPOK UNTUK MENGIRIM SUARA'}
            </span>
          </button>

        </form>

      </div>

    </div>
  );
};


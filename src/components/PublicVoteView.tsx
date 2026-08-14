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
      <div className="bg-white p-4 sm:p-5 rounded-3xl flex items-center justify-between border-b-4 border-[#E51426] shadow-xl relative overflow-hidden mb-6">
        {/* Subtle Background Pattern/Gradient */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center space-x-4 sm:space-x-6 relative z-10">
          <div className="w-16 sm:w-20 h-16 sm:h-20 shrink-0 relative flex items-center justify-center">
            <img src="/mascot-kick.png" alt="Mascot" className="w-full h-full object-contain drop-shadow-lg scale-125 origin-bottom" />
          </div>
          <div className="pt-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#E51426] block mb-1">
              KATEGORI PENILAIAN PUBLIC VOTE
            </span>
            <h3 className="font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#0B47A4] leading-none" style={{ fontFamily: '"Outfit", sans-serif' }}>
              {activeCategoryFilter === 'QCC-Rising' && 'QCC RISING CLASS'}
              {activeCategoryFilter === 'QCC-Leading' && 'QCC LEADING CLASS'}
              {activeCategoryFilter === 'SS' && 'SUGGESTION SYSTEM (SS)'}
            </h3>
          </div>
        </div>
      </div>

      {/* MAIN FORM */}
      <div className="bg-white border-t-4 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6" style={{ borderTopColor: '#0B3D9B' }}>
        


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
            <label className="flex items-center text-xs font-black uppercase tracking-wider" style={{ color: '#0A1F5C' }}>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: '#0B3D9B' }} />
                <span>Pilih Kelompok Pemilih Anda</span>
                <span className="font-black text-sm" style={{ color: '#E51426' }}>*</span>
              </span>
            </label>

            {/* Dropdown Selection */}
            <div className="relative">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={allGroupsVoted}
                className="w-full px-4 py-3.5 rounded-2xl border-2 bg-white font-bold text-slate-900 text-sm outline-none transition-all shadow-sm cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed" style={{ borderColor: '#00AEEF' }}
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
                          ? 'text-white shadow-md'
                          : 'bg-white text-slate-700 cursor-pointer hover:border-[#00AEEF]'
                      }`}
                      style={isSelected && !isVoted ? { background: '#0B3D9B', borderColor: '#0B3D9B' } : isVoted ? {} : { borderColor: '#E2E8F0' }}
                    >
                      <span className="truncate">{grp}</span>
                      {isVoted ? (
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-semibold shrink-0">
                          Sudah
                        </span>
                      ) : isSelected ? (
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
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
            <span className="text-xs font-black uppercase tracking-wider block" style={{ color: '#0B3D9B' }}>
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
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        isTeamSelected
                          ? 'shadow-lg'
                          : 'border-slate-200 bg-white hover:border-[#00AEEF] hover:bg-[#F0FAFF]'
                      }`}
                      style={isTeamSelected ? { borderColor: '#E51426', background: '#FFF5F5' } : {}}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 border-2 overflow-hidden ${
                          isTeamSelected ? '' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        style={isTeamSelected ? { borderColor: '#E51426', background: '#FFF0F0', color: '#E51426' } : {}}>
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
                          isTeamSelected ? '' : 'border-slate-300 bg-white'
                        }`}
                        style={isTeamSelected ? { borderColor: '#E51426', background: '#E51426', color: '#FFFFFF' } : {}}>
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
            className="w-full py-4 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer disabled:opacity-40"
            style={{ background: '#E51426' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#C41121'; }}
            onMouseLeave={e => (e.currentTarget.style.background = '#E51426')}
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


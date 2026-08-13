import React, { useState } from 'react';
import { ContestSettings, Participant, JudgeScore, PublicVote } from '../types';
import { updateContestSettings, computeLeaderboard, getParticipantCategoryKey, clearAllScores, clearAllPublicVotes } from '../lib/contestService';
import { 
  Settings, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  BarChart3, 
  Search, 
  UserCheck, 
  Vote, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Users, 
  Award, 
  Clock,
  Layers,
  Star
} from 'lucide-react';

interface AdminSettingsProps {
  settings: ContestSettings;
  participants: Participant[];
  scores: JudgeScore[];
  publicVotes?: PublicVote[];
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ 
  settings, 
  participants, 
  scores, 
  publicVotes = [] 
}) => {
  const [eventName, setEventName] = useState(settings.eventName || 'INNOPARTY 2026 - FOOTBALL INNOVATION CHAMPIONSHIP');
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'details' | 'config'>('summary');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);

  // Compute leaderboard with full breakdown
  const leaderboard = computeLeaderboard(participants, scores, publicVotes);

  // Categories list
  const uniqueCategories = ['QCC-Rising', 'QCC-Leading', 'SS'];

  // Filter leaderboard for Summary view
  const filteredLeaderboard = leaderboard.filter(item => {
    const cat = getParticipantCategoryKey(item.participant);
    const matchesCat = filterCategory === 'ALL' || cat === filterCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      item.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.participant.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSaveEventName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await updateContestSettings({ eventName });
      setIsUpdating(false);
      setSuccessMsg('Nama Event Berhasil Diperbarui!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error updating event name:", err);
      setIsUpdating(false);
    }
  };

  const handleResetAllScores = async () => {
    if (window.confirm("PERINGATAN BAHAYA!\nApakah Anda yakin ingin MENGHAPUS SEMUA DATA PENILAIAN JURI dan PUBLIC VOTE?\nTindakan ini tidak dapat dibatalkan!")) {
      try {
        setIsUpdating(true);
        await clearAllScores();
        await clearAllPublicVotes();
        setIsUpdating(false);
        setSuccessMsg('Semua data penilaian berhasil di-reset!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err) {
        console.error("Error resetting scores:", err);
        setIsUpdating(false);
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedParticipantId(prev => prev === id ? null : id);
  };

  // Stats calculation for Filtered Leaderboard
  const filteredParticipantIds = new Set(filteredLeaderboard.map(item => item.participant.id));
  const filteredParticipantsCount = filteredLeaderboard.length;
  const filteredJudgeSubmissions = scores.filter(s => filteredParticipantIds.has(s.participantId)).length;
  const filteredVotesCount = publicVotes.filter(v => filteredParticipantIds.has(v.participantId)).length;
  const filteredTopTeam = filteredLeaderboard.length > 0 ? filteredLeaderboard[0].participant.name : '-';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl text-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
            PANEL KONTROL VAR & REKAPITULASI PENILAIAN
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight uppercase text-slate-900">
            KONTROL VAR, SUMMARY & DETAIL PENILAIAN
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
            Pantau ringkasan rekapitulasi nilai akhir, rincian skor per penilai (juri & public vote), serta pengaturan event.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('summary')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeSubTab === 'summary'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Summary Nilai</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab('details')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeSubTab === 'details'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Detail Penilai</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('config')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeSubTab === 'config'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Event Config</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SUB TAB 1: SUMMARY PENILAIAN (REKAPITULASI MATRIKS) */}
      {activeSubTab === 'summary' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-600" />
                <span>SUMMARY REKAPITULASI PENILAIAN AKHIR</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Formulasi: Penyisihan (90%) + Rata-rata Juri (8%) [Perf 4% + Mat 4%] + Public Vote (2%)
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari tim / inovasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">Semua Kategori</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* STATS OVERVIEW CARDS (Moved inside Summary) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-blue-100/50 text-blue-600 rounded-xl shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Peserta</span>
                <span className="text-lg sm:text-xl font-black text-slate-900">{filteredParticipantsCount} Tim</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-amber-100/50 text-amber-600 rounded-xl shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Form Juri Terisi</span>
                <span className="text-lg sm:text-xl font-black text-slate-900">{filteredJudgeSubmissions} Lembar</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-xl shrink-0">
                <Vote className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Public Vote</span>
                <span className="text-lg sm:text-xl font-black text-slate-900">{filteredVotesCount} Suara</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-red-100/50 text-red-600 rounded-xl shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Leader</span>
                <span className="text-sm font-black text-slate-900 truncate block">{filteredTopTeam}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12">POS</th>
                  <th className="py-3 px-4">TIM / PESERTA INOVASI</th>
                  <th className="py-3 px-3 text-center">KATEGORI</th>
                  <th className="py-3 px-3 text-center">PENYISIHAN (90%)</th>
                  <th className="py-3 px-3 text-center">JURI (8%)</th>
                  <th className="py-3 px-3 text-center">PUBLIC VOTE (2%)</th>
                  <th className="py-3 px-4 text-center bg-red-50 text-red-900 font-black">NILAI AKHIR</th>
                  <th className="py-3 px-3 text-center">STATUS JURI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredLeaderboard.map((item) => {
                  const pScores = scores.filter(s => s.participantId === item.participant.id);
                  const pCatKey = getParticipantCategoryKey(item.participant);

                  return (
                    <tr key={item.participant.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 text-center">
                        <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center mx-auto ${
                          item.rank === 1 ? 'bg-amber-400 text-slate-950' :
                          item.rank === 2 ? 'bg-slate-300 text-slate-900' :
                          item.rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {item.rank}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{item.participant.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                          "{item.participant.projectTitle}"
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[10px] font-black uppercase">
                          {pCatKey}
                        </span>
                      </td>

                      {/* Penyisihan */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        <span className="font-bold text-slate-900">{item.preliminaryScore}</span>
                        <span className="text-[10px] text-indigo-600 block font-semibold">
                          ({item.preliminaryScoreContrib.toFixed(2)} pts)
                        </span>
                      </td>

                      {/* Juri */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        {item.evaluatedCount > 0 ? (
                          <>
                            <span className="font-bold text-slate-900">
                              {(( (item.avgPerformance || 0) + (item.avgPerbaikanMateri || 0) ) / 2).toFixed(1)}
                            </span>
                            <span className="text-[10px] text-emerald-600 block font-semibold">
                              (+{(item.performanceContrib + item.perbaikanMateriContrib).toFixed(2)} pts)
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Public Vote */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        <span className="font-bold text-slate-900">{item.publicVoteCount} Suara</span>
                        <span className="text-[10px] text-amber-600 block font-semibold">
                          (+{item.publicVoteContrib.toFixed(2)} pts)
                        </span>
                      </td>

                      {/* Nilai Akhir */}
                      <td className="py-3.5 px-4 text-center bg-red-50/50 font-black text-sm text-red-700 font-mono">
                        {item.calculatedTotal}
                      </td>

                      {/* Status Juri */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.evaluatedCount === 3
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : item.evaluatedCount > 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {item.evaluatedCount} / 3 Juri
                        </span>
                        {pScores.length > 0 && (
                          <div className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[120px] mx-auto">
                            {pScores.map(s => s.judgeName || `Juri ${s.judgeId}`).join(', ')}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredLeaderboard.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500 text-xs font-medium">
                      Tidak ada data peserta yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 2: DETAIL PENILAIAN PER PENILAI */}
      {activeSubTab === 'details' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  <span>RINCIAN DETAILED EVALUASI NAMA PENILAI JURI & PUBLIC VOTE</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik peserta di bawah untuk membuka lembar breakdown skor dari setiap nama Juri & suara Public Vote.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari tim / nama juri..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="ALL">Semua Kategori</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Accordion / Card List for Each Participant */}
            <div className="space-y-4 pt-2">
              {filteredLeaderboard.map((item) => {
                const p = item.participant;
                const pScores = scores.filter(s => s.participantId === p.id);
                const pVotes = publicVotes.filter(v => v.participantId === p.id);
                const pCatKey = getParticipantCategoryKey(p);
                const isExpanded = expandedParticipantId === p.id;

                return (
                  <div 
                    key={p.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs transition-all"
                  >
                    {/* Header bar */}
                    <div 
                      onClick={() => toggleExpand(p.id)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          item.rank === 1 ? 'bg-amber-400 text-slate-950 shadow-xs' :
                          item.rank === 2 ? 'bg-slate-300 text-slate-900' :
                          item.rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          #{item.rank}
                        </span>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-slate-900 text-base">{p.name}</h4>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black uppercase">
                              {pCatKey}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">"{p.projectTitle}"</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Skor Akhir</span>
                          <span className="text-lg font-black text-red-600 font-mono">{item.calculatedTotal} pts</span>
                        </div>

                        <div className="p-2 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-50">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Body Breakdown when Expanded */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 p-5 sm:p-6 bg-slate-50/50 space-y-6 text-xs">
                        
                        {/* SECTION 1: NILAI PENYISIHAN (90%) */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-black uppercase text-indigo-900 flex items-center gap-1.5">
                              <Star className="w-4 h-4 text-indigo-600" />
                              <span>1. NILAI PENYISIHAN (BOBOT 90%)</span>
                            </span>
                            <span className="font-mono font-bold text-indigo-700">
                              {item.preliminaryScore} / 100
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Kontribusi Poin Ke Nilai Akhir (90%):</span>
                            <span className="font-mono font-black text-slate-900">
                              {item.preliminaryScoreContrib.toFixed(2)} pts
                            </span>
                          </div>
                        </div>

                        {/* SECTION 2: RINCIAN MAP PENILAI JURI (BOBOT 8%) */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-black uppercase text-emerald-900 flex items-center gap-1.5">
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                              <span>2. RINCIAN PENILAIAN DARI MASING-MASING JURI (BOBOT 8%)</span>
                            </span>
                            <span className="font-mono font-bold text-emerald-700">
                              {(item.performanceContrib + item.perbaikanMateriContrib).toFixed(2)} pts
                            </span>
                          </div>

                          {pScores.length === 0 ? (
                            <div className="p-4 bg-slate-100 rounded-xl text-center text-slate-500 font-medium italic">
                              Belum ada juri yang memasukkan form penilaian untuk peserta ini.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {pScores.map((score) => (
                                <div key={score.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                    <div>
                                      <span className="font-black text-slate-900 block text-xs">
                                        {score.judgeName || `Juri ${score.judgeId}`}
                                      </span>
                                      <span className="text-[10px] font-semibold text-slate-400 block">
                                        Slot: Juri {score.judgeId}
                                      </span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black font-mono">
                                      Total: {score.totalScore}
                                    </span>
                                  </div>

                                  <div className="space-y-1 text-[11px] text-slate-600">
                                    <div className="flex justify-between">
                                      <span>Performance (Presentasi):</span>
                                      <span className="font-bold text-slate-900 font-mono">
                                        {score.criteriaScores?.performance ?? '-'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Perbaikan Materi:</span>
                                      <span className="font-bold text-slate-900 font-mono">
                                        {score.criteriaScores?.perbaikanMateri ?? '-'}
                                      </span>
                                    </div>
                                  </div>

                                  {score.notes && (
                                    <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-600 italic flex items-start gap-1">
                                      <MessageSquare className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                                      <span>"{score.notes}"</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Summary Juri Calc */}
                          {pScores.length > 0 && (
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 flex flex-wrap items-center justify-between gap-2 font-medium">
                              <div>
                                Rata-rata Performance: <span className="font-bold font-mono">{item.avgPerformance}</span> (4% = {item.performanceContrib} pts)
                              </div>
                              <div>
                                Rata-rata Perbaikan Materi: <span className="font-bold font-mono">{item.avgPerbaikanMateri}</span> (4% = {item.perbaikanMateriContrib} pts)
                              </div>
                            </div>
                          )}
                        </div>

                        {/* SECTION 3: PUBLIC VOTE (2%) */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-black uppercase text-amber-900 flex items-center gap-1.5">
                              <Vote className="w-4 h-4 text-amber-600" />
                              <span>3. RINCIAN PUBLIC VOTE (BOBOT 2%)</span>
                            </span>
                            <span className="font-mono font-bold text-amber-700">
                              +{item.publicVoteContrib.toFixed(2)} pts
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-700">
                            <span>Perolehan Suara Kategori ({pCatKey}):</span>
                            <span className="font-bold font-mono text-slate-900">
                              {item.publicVoteCount} suara / maks 11 suara
                            </span>
                          </div>

                          {pVotes.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Rincian Pemilih Public Vote:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {pVotes.map((v, idx) => (
                                  <span 
                                    key={v.id || idx}
                                    className="px-2 py-1 bg-amber-50 border border-amber-200 rounded-md text-[10px] font-bold text-amber-900 flex items-center gap-1"
                                  >
                                    <span>{v.voterGroup || `Pemilih #${idx+1}`}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* SECTION 4: FORMULA AKHIR */}
                        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                          <div className="text-xs">
                            <span className="text-slate-400 block font-sans uppercase font-bold text-[10px]">Formulasi Skor Akhir:</span>
                            <span>Penyisihan ({item.preliminaryScoreContrib}) + Juri ({ (item.performanceContrib + item.perbaikanMateriContrib).toFixed(2) }) + Public ({item.publicVoteContrib})</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-slate-400 block font-sans uppercase font-bold text-[10px]">Total Skor Akhir</span>
                            <span className="text-xl font-black text-amber-400">{item.calculatedTotal} PTS</span>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}

              {filteredLeaderboard.length === 0 && (
                <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
                  Tidak ditemukan data peserta untuk kriteria pencarian ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: CONFIG EVENT */}
      {activeSubTab === 'config' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="w-5 h-5 text-red-600" />
              <span>INFORMASI ACARA / LOMBA INOVASI</span>
            </h3>

            <form onSubmit={handleSaveEventName} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lomba / Event Kontes:
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer"
              >
                Simpan Nama Event
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-black text-red-900 uppercase tracking-tight flex items-center gap-2 border-b border-red-200/50 pb-3">
              <span>DANGER ZONE (ZONA BERBAHAYA)</span>
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Reset Semua Data Penilaian</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Tindakan ini akan menghapus permanen seluruh nilai dari Juri dan seluruh perolehan Public Vote.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAllScores}
                disabled={isUpdating}
                className="shrink-0 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer"
              >
                Reset Semua Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

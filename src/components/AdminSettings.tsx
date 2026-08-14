import React, { useState } from 'react';
import { ContestSettings, Participant, JudgeScore, PublicVote } from '../types';
import { updateContestSettings, computeLeaderboard, getParticipantCategoryKey, clearAllScores, clearAllPublicVotes, saveJudgeScore, deleteJudgeScore, updateParticipant } from '../lib/contestService';
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

  const [qccSpreadsheetId, setQccSpreadsheetId] = useState(settings.qccSpreadsheetId || '');
  const [ssSpreadsheetId, setSsSpreadsheetId] = useState(settings.ssSpreadsheetId || '');
  const [qccJuri1, setQccJuri1] = useState(settings.qccJuri1SheetName ?? 'Juri 1');
  const [qccJuri2, setQccJuri2] = useState(settings.qccJuri2SheetName ?? 'Juri 2');
  const [qccJuri3, setQccJuri3] = useState(settings.qccJuri3SheetName ?? 'Juri 3');
  const [ssJuri1, setSsJuri1] = useState(settings.ssJuri1SheetName ?? 'Juri 1');
  const [ssJuri2, setSsJuri2] = useState(settings.ssJuri2SheetName ?? 'Juri 2');
  const [ssJuri3, setSsJuri3] = useState(settings.ssJuri3SheetName ?? 'Juri 3');

  // Custom Column Configuration QCC
  const [colQccTeamCode, setColQccTeamCode] = useState(settings.colQccTeamCode || settings.colTeamCode || 'B');
  const [colQccTeamName, setColQccTeamName] = useState(settings.colQccTeamName || settings.colTeamName || 'C');
  const [colQccPerbaikanMateri, setColQccPerbaikanMateri] = useState(settings.colQccPerbaikanMateri || settings.colPerbaikanMateri || 'E');
  const [colQccPerformance, setColQccPerformance] = useState(settings.colQccPerformance || settings.colPerformance || 'F');

  // Custom Column Configuration SS
  const [colSsTeamCode, setColSsTeamCode] = useState(settings.colSsTeamCode || settings.colTeamCode || 'B');
  const [colSsTeamName, setColSsTeamName] = useState(settings.colSsTeamName || settings.colTeamName || 'C');
  const [colSsPerbaikanMateri, setColSsPerbaikanMateri] = useState(settings.colSsPerbaikanMateri || settings.colPerbaikanMateri || 'E');
  const [colSsPerformance, setColSsPerformance] = useState(settings.colSsPerformance || settings.colPerformance || 'F');

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'details' | 'config'>('summary');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);

  // Compute leaderboard with full breakdown
  const leaderboard = computeLeaderboard(participants, scores, publicVotes);

  const getJudgeDisplayName = (stream: string | undefined, score: { judgeId: number; judgeName?: string }) => {
    let name = score.judgeName;
    if (!name || name === 'Juri Spreadsheet' || name === 'Juri') {
      const jId = Number(score.judgeId);
      if (stream === 'SS') {
        if (jId === 1) name = ssJuri1;
        else if (jId === 2) name = ssJuri2;
        else if (jId === 3) name = ssJuri3;
      } else {
        if (jId === 1) name = qccJuri1;
        else if (jId === 2) name = qccJuri2;
        else if (jId === 3) name = qccJuri3;
      }
    }
    return name || `Juri ${score.judgeId}`;
  };

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

  
  const extractSpreadsheetId = (input: string) => {
    if (!input) return '';
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input.trim();
  };

  
  // Keep local states synced with Firestore settings when settings prop updates
  React.useEffect(() => {
    if (settings) {
      if (settings.qccSpreadsheetId !== undefined) setQccSpreadsheetId(settings.qccSpreadsheetId);
      if (settings.ssSpreadsheetId !== undefined) setSsSpreadsheetId(settings.ssSpreadsheetId);
      if (settings.qccJuri1SheetName !== undefined) setQccJuri1(settings.qccJuri1SheetName);
      if (settings.qccJuri2SheetName !== undefined) setQccJuri2(settings.qccJuri2SheetName);
      if (settings.qccJuri3SheetName !== undefined) setQccJuri3(settings.qccJuri3SheetName);
      if (settings.ssJuri1SheetName !== undefined) setSsJuri1(settings.ssJuri1SheetName);
      if (settings.ssJuri2SheetName !== undefined) setSsJuri2(settings.ssJuri2SheetName);
      if (settings.ssJuri3SheetName !== undefined) setSsJuri3(settings.ssJuri3SheetName);

      if (settings.colQccTeamCode || settings.colTeamCode) setColQccTeamCode(settings.colQccTeamCode || settings.colTeamCode || 'A');
      if (settings.colQccTeamName || settings.colTeamName) setColQccTeamName(settings.colQccTeamName || settings.colTeamName || 'B');
      if (settings.colQccPerbaikanMateri || settings.colPerbaikanMateri) setColQccPerbaikanMateri(settings.colQccPerbaikanMateri || settings.colPerbaikanMateri || 'D');
      if (settings.colQccPerformance || settings.colPerformance) setColQccPerformance(settings.colQccPerformance || settings.colPerformance || 'E');

      if (settings.colSsTeamCode || settings.colTeamCode) setColSsTeamCode(settings.colSsTeamCode || settings.colTeamCode || 'A');
      if (settings.colSsTeamName || settings.colTeamName) setColSsTeamName(settings.colSsTeamName || settings.colTeamName || 'B');
      if (settings.colSsPerbaikanMateri || settings.colPerbaikanMateri) setColSsPerbaikanMateri(settings.colSsPerbaikanMateri || settings.colPerbaikanMateri || 'D');
      if (settings.colSsPerformance || settings.colPerformance) setColSsPerformance(settings.colSsPerformance || settings.colPerformance || 'E');
    }
  }, [settings]);

  const [isAutoSync, setIsAutoSync] = useState(false);
  const syncIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isAutoSync) {
      // Run once immediately, then every 10 seconds
      handleSyncScores();
      syncIntervalRef.current = setInterval(() => {
        handleSyncScores();
      }, 10000);
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    }
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [isAutoSync]);

  const handleSaveSpreadsheetConfig = async () => {
    try {
      setIsUpdating(true);
      await updateContestSettings({
        qccSpreadsheetId,
        ssSpreadsheetId,
        qccJuri1SheetName: qccJuri1,
        qccJuri2SheetName: qccJuri2,
        qccJuri3SheetName: qccJuri3,
        ssJuri1SheetName: ssJuri1,
        ssJuri2SheetName: ssJuri2,
        ssJuri3SheetName: ssJuri3,
        colQccTeamCode: colQccTeamCode.trim().toUpperCase(),
        colQccTeamName: colQccTeamName.trim().toUpperCase(),
        colQccPerbaikanMateri: colQccPerbaikanMateri.trim().toUpperCase(),
        colQccPerformance: colQccPerformance.trim().toUpperCase(),
        colSsTeamCode: colSsTeamCode.trim().toUpperCase(),
        colSsTeamName: colSsTeamName.trim().toUpperCase(),
        colSsPerbaikanMateri: colSsPerbaikanMateri.trim().toUpperCase(),
        colSsPerformance: colSsPerformance.trim().toUpperCase()
      });
      setIsUpdating(false);
      setSuccessMsg('Konfigurasi Google Sheets & Pemetaan Kolom Berhasil Disimpan!');
      setTimeout(() => setSuccessMsg(''), 3000);

      // Auto sync using updated column mapping
      handleSyncScores();
    } catch (err) {
      console.error("Error updating sheet config:", err);
      setIsUpdating(false);
    }
  };

  const importSheetsToFirestore = async (sheetData: Record<string, any[]>, stream: string, judgeMapping: Record<string, number>) => {
    const batchPromises = [];
    let syncedScores = 0;
    let updatedPrelims = 0;
    
    for (const [sheetName, rows] of Object.entries(sheetData)) {
      let judgeId = judgeMapping[sheetName];
      if (!judgeId) {
        const found = Object.entries(judgeMapping).find(
          ([k]) => k.trim().toLowerCase() === sheetName.trim().toLowerCase()
        );
        if (found) judgeId = found[1];
      }
      if (!judgeId) {
        const lower = sheetName.toLowerCase();
        if (lower.includes('2')) judgeId = 2;
        else if (lower.includes('3')) judgeId = 3;
        else judgeId = 1;
      }
      
      for (const row of rows) {
        const normalize = (s: string) => s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        const rowCodeNorm = normalize(row.teamCode);
        const rowNameNorm = normalize(row.teamName);

        // 1. Try finding participant within matching stream
        let p = participants.find(part => {
          if (part.stream !== stream) return false;
          if (part.teamCode && rowCodeNorm && normalize(part.teamCode) === rowCodeNorm) return true;
          if (part.name && rowNameNorm && normalize(part.name) === rowNameNorm) return true;
          return false;
        });

        // 2. Fallback: match across all participants regardless of stream
        if (!p) {
          p = participants.find(part => {
            if (part.teamCode && rowCodeNorm && normalize(part.teamCode) === rowCodeNorm) return true;
            if (part.name && rowNameNorm && normalize(part.name) === rowNameNorm) return true;
            if (part.name && rowNameNorm) {
              const pNorm = normalize(part.name);
              if (pNorm.length > 3 && rowNameNorm.length > 3 && (pNorm.includes(rowNameNorm) || rowNameNorm.includes(pNorm))) {
                return true;
              }
            }
            return false;
          });
        }
        
        if (p) {
          const perf = Number(row.performance) || 0;
          const mat = Number(row.perbaikanMateri) || 0;

          if (perf > 0 || mat > 0) {
            syncedScores++;
            batchPromises.push(saveJudgeScore(
              p.id,
              judgeId as 1 | 2 | 3,
              { performance: perf, perbaikanMateri: mat },
              "Disinkronisasi dari Google Sheets",
              sheetName
            ));
          } else {
            // Jika nilai perbaikan materi & performance di Google Sheets kosong / 0,
            // hapus skor juri agar statusnya kembali belum dinilai (null)
            batchPromises.push(deleteJudgeScore(p.id, judgeId as 1 | 2 | 3));
          }

          if (typeof row.preliminaryScore === 'number' && row.preliminaryScore > 0 && row.preliminaryScore !== p.preliminaryScore) {
            updatedPrelims++;
            batchPromises.push(updateParticipant(p.id, { preliminaryScore: row.preliminaryScore }));
          }
        }
      }
    }
    
    await Promise.all(batchPromises);
    return { syncedScores, updatedPrelims };
  };

  const handleSyncScores = async () => {
    setIsSyncing(true);
    setSyncStatus('Sedang menarik data dari Google Sheets...');
    
    try {
      let totalSyncedScores = 0;
      let totalUpdatedPrelims = 0;

      const fetchSheets = async (url: string, id: string, sheets: string[], stream: string, judgeMapping: Record<string, number>, colConfig: Record<string, string>) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            spreadsheetId: extractSpreadsheetId(id), 
            sheetNames: sheets,
            columns: colConfig
          })
        });
        const data = await res.json();
        if (data.success) {
          setSyncStatus(`Menyimpan data ${stream} ke database...`);
          const result = await importSheetsToFirestore(data.data, stream, judgeMapping);
          totalSyncedScores += result.syncedScores;
          totalUpdatedPrelims += result.updatedPrelims;
        } else {
          throw new Error(data.error || 'Failed to fetch');
        }
      };

      if (qccSpreadsheetId) {
        const qccArr = [qccJuri1, qccJuri2, qccJuri3].filter(Boolean);
        const qccMapping: Record<string, number> = {};
        if (qccJuri1) qccMapping[qccJuri1] = 1;
        if (qccJuri2) qccMapping[qccJuri2] = 2;
        if (qccJuri3) qccMapping[qccJuri3] = 3;
        
        setSyncStatus('Menarik data QCC...');
        await fetchSheets('/api/read-sheets', qccSpreadsheetId, qccArr, 'QCC', qccMapping, {
          colTeamCode: colQccTeamCode.trim().toUpperCase(),
          colTeamName: colQccTeamName.trim().toUpperCase(),
          colPerbaikanMateri: colQccPerbaikanMateri.trim().toUpperCase(),
          colPerformance: colQccPerformance.trim().toUpperCase()
        });
      }
      
      if (ssSpreadsheetId) {
        const ssArr = [ssJuri1, ssJuri2, ssJuri3].filter(Boolean);
        const ssMapping: Record<string, number> = {};
        if (ssJuri1) ssMapping[ssJuri1] = 1;
        if (ssJuri2) ssMapping[ssJuri2] = 2;
        if (ssJuri3) ssMapping[ssJuri3] = 3;

        setSyncStatus('Menarik data SS...');
        await fetchSheets('/api/read-sheets', ssSpreadsheetId, ssArr, 'SS', ssMapping, {
          colTeamCode: colSsTeamCode.trim().toUpperCase(),
          colTeamName: colSsTeamName.trim().toUpperCase(),
          colPerbaikanMateri: colSsPerbaikanMateri.trim().toUpperCase(),
          colPerformance: colSsPerformance.trim().toUpperCase()
        });
      }

      setSyncStatus(`Sinkronisasi selesai! (Tersimpan: ${totalSyncedScores} data nilai juri, ${totalUpdatedPrelims} nilai penyisihan)`);
      setTimeout(() => setSyncStatus(''), 4000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Gagal: ${err.message}`);
    }
    setIsSyncing(false);
  };

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

          {/* VAR CONTROL - GOOGLE SHEETS */}
          <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 text-white mb-6 mt-4">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-4 text-emerald-400">
              <Sparkles className="w-5 h-5" />
              KONTROL VAR: SINKRONISASI GOOGLE SHEETS JURI
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Masukkan Link atau ID Spreadsheet untuk QCC dan SS. Klik tombol Tarik Data untuk memperbarui skor Juri secara Live.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Spreadsheet ID / Link (QCC)</label>
                <input 
                  type="text" 
                  value={qccSpreadsheetId} 
                  onChange={(e) => setQccSpreadsheetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="ID / Link Spreadsheet QCC"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Spreadsheet ID / Link (SS)</label>
                <input 
                  type="text" 
                  value={ssSpreadsheetId} 
                  onChange={(e) => setSsSpreadsheetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="ID / Link Spreadsheet SS"
                />
              </div>
            </div>

            {/* Juri QCC Sheets & Kolom QCC */}
            <div className="mb-4 p-5 bg-slate-800 rounded-2xl border border-blue-500/40 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-700/80 pb-2">
                <h4 className="text-xs font-black text-blue-400 uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse inline-block"></span>
                  KONFIGURASI STREAM QCC (SHEETS & KOLOM)
                </h4>
                <span className="text-[10px] bg-blue-500/10 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-500/20">STREAM QCC</span>
              </div>
              
              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-300 block mb-2">Nama Sheet Juri QCC:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Sheet Juri 1 (QCC)</label>
                    <input 
                      type="text" 
                      value={qccJuri1} 
                      onChange={(e) => setQccJuri1(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Sheet Juri 2 (QCC)</label>
                    <input 
                      type="text" 
                      value={qccJuri2} 
                      onChange={(e) => setQccJuri2(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Sheet Juri 3 (QCC)</label>
                    <input 
                      type="text" 
                      value={qccJuri3} 
                      onChange={(e) => setQccJuri3(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* QCC Columns */}
              <div className="pt-3 border-t border-slate-700/80">
                <span className="text-[11px] font-bold text-slate-300 block mb-2">Pemetaan Kolom Spreadsheet QCC (Huruf Kolom):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Kolom ID / Kode</label>
                    <input 
                      type="text" 
                      value={colQccTeamCode} 
                      onChange={(e) => setColQccTeamCode(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-center font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500 uppercase"
                      placeholder="A"
                      maxLength={3}
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5 text-center font-mono">Def: A</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Kolom Nama Tim</label>
                    <input 
                      type="text" 
                      value={colQccTeamName} 
                      onChange={(e) => setColQccTeamName(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-center font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500 uppercase"
                      placeholder="B"
                      maxLength={3}
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5 text-center font-mono">Def: B</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Perbaikan (4%)</label>
                    <input 
                      type="text" 
                      value={colQccPerbaikanMateri} 
                      onChange={(e) => setColQccPerbaikanMateri(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-center font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500 uppercase"
                      placeholder="D"
                      maxLength={3}
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5 text-center font-mono">Def: D</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Performance (4%)</label>
                    <input 
                      type="text" 
                      value={colQccPerformance} 
                      onChange={(e) => setColQccPerformance(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-center font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500 uppercase"
                      placeholder="E"
                      maxLength={3}
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5 text-center font-mono">Def: E</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Juri SS Sheets & Kolom SS */}
            <div className="mb-6 p-5 bg-slate-800 rounded-2xl border border-emerald-500/40 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-700/80 pb-2">
                <h4 className="text-xs font-black text-emerald-400 uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                  KONFIGURASI STREAM SS (SHEETS & KOLOM)
                </h4>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/20">STREAM SS</span>
              </div>

              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-300 block mb-2">Nama Sheet Juri SS:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Sheet Juri 1 (SS)</label>
                    <input 
                      type="text" 
                      value={ssJuri1} 
                      onChange={(e) => setSsJuri1(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Sheet Juri 2 (SS)</label>
                    <input 
                      type="text" 
                      value={ssJuri2} 
                      onChange={(e) => setSsJuri2(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Sheet Juri 3 (SS)</label>
                    <input 
                      type="text" 
                      value={ssJuri3} 
                      onChange={(e) => setSsJuri3(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SS Columns */}
              <div className="pt-3 border-t border-slate-700/80">
                <span className="text-[11px] font-bold text-slate-300 block mb-2">Pemetaan Kolom Spreadsheet SS (Huruf Kolom):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Kolom ID / Kode</label>
                    <input 
                      type="text" 
                      value={colSsTeamCode} 
                      onChange={(e) => setColSsTeamCode(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-center font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 uppercase"
                      placeholder="A"
                      maxLength={3}
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5 text-center font-mono">Def: A</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Kolom Nama Tim</label>
                    <input 
                      type="text" 
                      value={colSsTeamName} 
                      onChange={(e) => setColSsTeamName(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-center font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 uppercase"
                      placeholder="B"
                      maxLength={3}
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5 text-center font-mono">Def: B</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Perbaikan (4%)</label>
                    <input 
                      type="text" 
                      value={colSsPerbaikanMateri} 
                      onChange={(e) => setColSsPerbaikanMateri(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-center font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 uppercase"
                      placeholder="D"
                      maxLength={3}
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5 text-center font-mono">Def: D</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Performance (4%)</label>
                    <input 
                      type="text" 
                      value={colSsPerformance} 
                      onChange={(e) => setColSsPerformance(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-center font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 uppercase"
                      placeholder="E"
                      maxLength={3}
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5 text-center font-mono">Def: E</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveSpreadsheetConfig}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-slate-700"
              >
                Simpan Konfigurasi
              </button>
              <button
                onClick={handleSyncScores}
                disabled={isSyncing || isAutoSync}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 disabled:opacity-50"
              >
                {isSyncing ? 'Menarik Data...' : 'Tarik Data (Manual)'}
              </button>
              <button
                onClick={() => setIsAutoSync(!isAutoSync)}
                className={`flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isAutoSync 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/50 animate-pulse' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50'
                }`}
              >
                {isAutoSync ? 'Hentikan Auto-Sync' : 'Aktifkan Auto-Sync (Realtime)'}
              </button>
            </div>
            
            {syncStatus && (
              <div className="mt-4 p-3 bg-slate-800 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">{syncStatus}</span>
              </div>
            )}
          </div>

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

          {/* SIMULATION NOTE */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm text-sm text-blue-900">
            <h4 className="font-bold flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Informasi Perhitungan Nilai Akhir
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-xs">
                <p><strong>Penyisihan (Bobot 90%):</strong> Diambil dari skor penyisihan di master data dikalikan 90%.</p>
                <p><strong>Juri (Bobot 8%):</strong> Diambil dari rata-rata nilai Juri (Skala 100) dikalikan 8%.</p>
                <p><strong>Public Vote (Bobot 2%):</strong> (Jumlah Suara Tim / 11 Maks Suara) × 2 Poin Penuh.</p>
              </div>
              <div className="bg-white/60 p-3 rounded-xl border border-blue-100 text-xs font-mono">
                <div className="font-bold text-[10px] uppercase tracking-wider text-blue-500 mb-1">Contoh Simulasi Tim A</div>
                <div>Penyisihan (90%) : 85 × 90% = 76.50 Poin</div>
                <div>Juri (8%)       : 80 × 8%  =  6.40 Poin</div>
                <div>Public Vote (2%): (11/11) × 2 =  2.00 Poin +</div>
                <div className="border-t border-blue-200 mt-1 pt-1 font-bold">Total Nilai Akhir = 84.90</div>
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
                        <span className="font-bold text-slate-900">{typeof item.preliminaryScore === 'number' ? item.preliminaryScore.toFixed(2) : item.preliminaryScore}</span>
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
                            {pScores.map(s => {
                              const rawName = getJudgeDisplayName(item.participant.stream, s);
                              return rawName.startsWith('Penilaian') ? rawName : `Penilaian ${rawName}`;
                            }).join(', ')}
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
                              {typeof item.preliminaryScore === 'number' ? item.preliminaryScore.toFixed(2) : item.preliminaryScore} / 100
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
                              {pScores.map((score) => {
                                const rawName = getJudgeDisplayName(p.stream, score);
                                const titleName = rawName.startsWith('Penilaian') ? rawName : `Penilaian ${rawName}`;
                                const sheetLabel = rawName.replace(/^Penilaian\s+/, '');
                                return (
                                <div key={score.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                    <div>
                                      <span className="font-black text-slate-900 block text-xs">
                                        {titleName}
                                      </span>
                                      <span className="text-[10px] font-semibold text-slate-400 block">
                                        Sheet: {sheetLabel} (Slot {score.judgeId})
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
                              );
                              })}
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

import React, { useState } from 'react';
import { ContestSettings, Participant, JudgeScore } from '../types';
import { updateContestSettings } from '../lib/contestService';
import { Settings, Lock, Unlock, ShieldAlert, Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Image, Trophy, Medal, Award, FileText } from 'lucide-react';

interface AdminSettingsProps {
  settings: ContestSettings;
  participants: Participant[];
  scores: JudgeScore[];
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, participants, scores }) => {
  const [eventName, setEventName] = useState(settings.eventName || 'INNOPARTY 2026 - FOOTBALL INNOVATION CHAMPIONSHIP');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const uniqueCategories = Array.from(
    new Set(participants.map(p => p.stream === 'SS' ? 'SS' : `QCC ${p.levelCategory}`))
  ).sort();

  const filteredParticipants = filterCategory === 'ALL'
    ? participants
    : participants.filter(p => (p.stream === 'SS' ? 'SS' : `QCC ${p.levelCategory}`) === filterCategory);

  const getCategoryStatus = (catKey: 'QCC-Rising' | 'QCC-Leading' | 'SS'): boolean => {
    if (settings.juri3RevealedCategories && settings.juri3RevealedCategories[catKey] !== undefined) {
      return !!settings.juri3RevealedCategories[catKey];
    }
    return !!settings.juri3Revealed;
  };

  const handleSetCategoryReveal = async (catKey: 'QCC-Rising' | 'QCC-Leading' | 'SS', isRevealed: boolean) => {
    try {
      setIsUpdating(true);
      const updatedCategories = {
        'QCC-Rising': getCategoryStatus('QCC-Rising'),
        'QCC-Leading': getCategoryStatus('QCC-Leading'),
        'SS': getCategoryStatus('SS'),
        [catKey]: isRevealed
      };
      const anyRevealed = Object.values(updatedCategories).some(Boolean);
      await updateContestSettings({
        juri3RevealedCategories: updatedCategories,
        juri3Revealed: anyRevealed
      });
      setIsUpdating(false);
      setSuccessMsg(`Status VAR REVEAL Kategori ${catKey} berhasil diubah ke ${isRevealed ? 'OPEN / UNLOCKED' : 'LOCKED / TERKUNCI'}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error setting category VAR reveal:", err);
      setIsUpdating(false);
    }
  };

  const handleSetAllCategories = async (isRevealed: boolean) => {
    try {
      setIsUpdating(true);
      const updatedCategories = {
        'QCC-Rising': isRevealed,
        'QCC-Leading': isRevealed,
        'SS': isRevealed
      };
      await updateContestSettings({
        juri3RevealedCategories: updatedCategories,
        juri3Revealed: isRevealed
      });
      setIsUpdating(false);
      setSuccessMsg(isRevealed ? 'Semua Kategori VAR REVEAL Berhasil DIBUKA!' : 'Semua Kategori VAR REVEAL Berhasil DIKUNCI!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error setting all categories VAR reveal:", err);
      setIsUpdating(false);
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl text-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-100 bg-red-900/80 px-3 py-1 rounded-full border border-red-500/30">
            PANEL KONTROL KONTES INOVASI (VAR)
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight uppercase">
            PENGATURAN VAR, EVENT & MASTER AVATAR PODIUM
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
            Atur visibilitas Juri 3, nama event, serta foto/avatar resmi setiap juara podium.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* FEATURE 1: JURI 3 REVEAL VAR TOGGLE CARD PER CATEGORY */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 text-red-700 rounded-2xl shrink-0">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                VISIBILITAS NILAI JURI 3 (VAR REVEAL PER KATEGORI)
              </h3>
              <p className="text-xs text-slate-500">
                Atur dan buka/kunci visibilitas nilai Juri 3 (VAR) secara khusus untuk masing-masing kategori lomba.
              </p>
            </div>
          </div>

          {/* Master Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSetAllCategories(false)}
              disabled={isUpdating}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Kunci Semua</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetAllCategories(true)}
              disabled={isUpdating}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Buka Semua</span>
            </button>
          </div>
        </div>

        {/* Radio Toggle Cards for Each Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { id: 'QCC-Rising' as const, label: 'QCC - Rising Class', desc: 'Kategori Tingkat Pemula / Rising' },
            { id: 'QCC-Leading' as const, label: 'QCC - Leading Class', desc: 'Kategori Tingkat Lanjut / Leading' },
            { id: 'SS' as const, label: 'SS (Sumbangan Saran)', desc: 'Kategori Inovasi Sumbangan Saran' },
          ].map((cat) => {
            const isUnlocked = getCategoryStatus(cat.id);
            return (
              <div 
                key={cat.id} 
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  isUnlocked 
                    ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' 
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase block">{cat.label}</span>
                    <span className="text-[10px] text-slate-500 font-medium block">{cat.desc}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isUnlocked ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Pilih Status VAR Reveal:
                  </span>

                  {/* Radio Option 1: Terkunci (Locked) */}
                  <label className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    !isUnlocked
                      ? 'bg-amber-100/70 border-amber-400 text-slate-950 font-black shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name={`var-radio-${cat.id}`}
                      checked={!isUnlocked}
                      onChange={() => handleSetCategoryReveal(cat.id, false)}
                      disabled={isUpdating}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Kunci Nilai Juri 3 (Locked)</span>
                    </div>
                  </label>

                  {/* Radio Option 2: Buka Nilai VAR (Unlocked) */}
                  <label className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isUnlocked
                      ? 'bg-emerald-100/70 border-emerald-400 text-slate-950 font-black shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name={`var-radio-${cat.id}`}
                      checked={isUnlocked}
                      onChange={() => handleSetCategoryReveal(cat.id, true)}
                      disabled={isUpdating}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Buka Nilai Juri 3 (Unlocked)</span>
                    </div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-600 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            Catatan: Apabila status Kategori diatur ke <strong>Unlocked</strong>, nilai dari Juri 3 untuk peserta di kategori tersebut akan langsung dihitung secara otomatis pada Klasemen & Podium Live.
          </span>
        </div>

      </div>

      {/* EVENT CONFIG CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings className="w-5 h-5 text-emerald-600" />
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
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all"
          >
            Simpan Nama Event
          </button>
        </form>
      </div>

      {/* FEATURE 3: DETAIL PENILAIAN PESERTA (TABEL) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>DETAIL PENILAIAN PESERTA & KATEGORI</span>
          </h3>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Kategori</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-200 text-slate-700 text-xs uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Nama Tim / Peserta</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Juri 1</th>
                <th className="py-3 px-4 text-center">Juri 2</th>
                <th className="py-3 px-4 text-center">Juri 3</th>
                <th className="py-3 px-4 text-center text-indigo-700">Total Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredParticipants.map(p => {
                const j1 = scores.find(s => s.participantId === p.id && s.judgeId === 1);
                const j2 = scores.find(s => s.participantId === p.id && s.judgeId === 2);
                const j3 = scores.find(s => s.participantId === p.id && s.judgeId === 3);
                const total = (j1?.totalScore || 0) + (j2?.totalScore || 0) + (j3?.totalScore || 0);

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                        {p.stream === 'SS' ? 'SS' : `QCC ${p.levelCategory}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{j1 ? j1.totalScore : '-'}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{j2 ? j2.totalScore : '-'}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{j3 ? j3.totalScore : '-'}</td>
                    <td className="py-3 px-4 text-center font-black text-indigo-700 bg-indigo-50/50">{total > 0 ? total : '-'}</td>
                  </tr>
                );
              })}
              {filteredParticipants.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 text-xs font-medium">Belum ada data peserta.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};


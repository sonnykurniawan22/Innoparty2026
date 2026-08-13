import React, { useState } from 'react';
import { Participant, LevelCategory, StreamCategory } from '../types';
import { addParticipant, updateParticipant, deleteParticipant, seedInitialDataIfEmpty, getProxyImageUrl } from '../lib/contestService';
import { UserPlus, Users, Trash2, Edit3, Search, Sparkles, Check, X, Star, Flame, RefreshCw, CloudCheck } from 'lucide-react';

interface MasterParticipantsProps {
  participants: Participant[];
}

export const MasterParticipants: React.FC<MasterParticipantsProps> = ({ participants }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');

  // Form State for Adding/Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [preliminaryScore, setPreliminaryScore] = useState<number | string>(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [categorySelection, setCategorySelection] = useState<'QCC-Rising' | 'QCC-Leading' | 'SS'>('QCC-Rising');

  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setTeamCode('');
    setProjectTitle('');
    setPreliminaryScore(0);
    setPhotoUrl('');
    setCategorySelection('QCC-Rising');
  };

  const handleStartEdit = (p: Participant) => {
    setEditingId(p.id);
    setName(p.name);
    setTeamCode(p.teamCode || '');
    setProjectTitle(p.projectTitle);
    setPreliminaryScore(p.preliminaryScore || 0);
    setPhotoUrl(p.photoUrl || '');
    if (p.stream === 'SS') {
      setCategorySelection('SS');
    } else if (p.levelCategory === 'Leading') {
      setCategorySelection('QCC-Leading');
    } else {
      setCategorySelection('QCC-Rising');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectTitle.trim() || !teamCode.trim()) { alert('Nama, Kode Tim, dan Judul wajib diisi'); return; }

    let levelCategory: LevelCategory = 'Rising';
    let stream: StreamCategory = 'QCC';

    if (categorySelection === 'QCC-Leading') {
      levelCategory = 'Leading';
      stream = 'QCC';
    } else if (categorySelection === 'SS') {
      levelCategory = 'SS';
      stream = 'SS';
    } else {
      levelCategory = 'Rising';
      stream = 'QCC';
    }

    try {
      setIsSaving(true);
      if (editingId) {
        await updateParticipant(editingId, {
          name,
          teamCode,
          projectTitle,
          preliminaryScore: Number(preliminaryScore) || 0,
          levelCategory,
          stream,
          photoUrl
        });
      } else {
        await addParticipant({
          name,
          teamCode,
          projectTitle,
          preliminaryScore: Number(preliminaryScore) || 0,
          levelCategory,
          stream,
          photoUrl
        });
      }
      setIsSaving(false);
      resetForm();
    } catch (err) {
      console.error("Error saving participant:", err);
      setIsSaving(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data peserta inovasi ini?")) {
      try {
        await deleteParticipant(id);
      } catch (err) {
        console.error("Error deleting participant:", err);
      }
    }
  };

  const handleSeedData = async () => {
    if (confirm("Tambahkan sampel data peserta kontes inovasi?")) {
      try {
        await seedInitialDataIfEmpty();
      } catch (err) {
        console.error("Error seeding data:", err);
      }
    }
  };

  // Filtered List
  const filteredList = participants.filter((p) => {
    let matchesCategory = true;
    if (selectedLevelFilter === 'QCC-Rising') {
      matchesCategory = p.stream === 'QCC' && p.levelCategory === 'Rising';
    } else if (selectedLevelFilter === 'QCC-Leading') {
      matchesCategory = p.stream === 'QCC' && p.levelCategory === 'Leading';
    } else if (selectedLevelFilter === 'SS') {
      matchesCategory = p.stream === 'SS';
    }

    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Auto-convert Google Drive viewer links to direct image links
    const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view.*/;
    const match = val.match(driveRegex);
    if (match && match[1]) {
      val = `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    setPhotoUrl(val);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl text-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200 inline-flex items-center gap-1.5">
            <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>MASTER DATA PESERTA • FIRESTORE SYNC</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight uppercase">
            KELOLA TIM & KATEGORI KELAS
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
            Atur data peserta dan pengelompokan level Rising Star & Leading Class
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD / EDIT FORM CARD */}
        <div className="bg-white  border border-slate-200/80  rounded-3xl p-6 shadow-sm space-y-5 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100  pb-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900  uppercase tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600 " />
              <span>{editingId ? 'EDIT DATA PESERTA' : 'TAMBAH PESERTA BARU'}</span>
            </h3>
            {editingId && (
              <button onClick={resetForm} className="text-slate-500 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            
            <div>
              <label className="block text-xs font-bold text-slate-700  mb-1">
                Nama Tim / Peserta:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: FC Striker Inovasi / Budi Santoso"
                className="w-full bg-slate-50  border border-slate-200  rounded-xl p-3 font-medium text-slate-900  focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode Tim (Diambil dari Excel):
              </label>
              <input
                type="text"
                required
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="Misal: R-01 atau E1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700  mb-1">
                Judul Project Inovasi:
              </label>
              <textarea
                rows={2}
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Contoh: Pengurangan Downtime Mesin dengan AI Sensor"
                className="w-full bg-slate-50  border border-slate-200  rounded-xl p-3 text-xs font-medium text-slate-900  focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nilai Penyisihan (Skala 0 - 100):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                value={preliminaryScore}
                onChange={(e) => setPreliminaryScore(e.target.value)}
                placeholder="Contoh: 85.50 (Bobot 90%)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                *Nilai rekap penyisihan awal (berkontribusi 90% ke nilai total)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Foto Profil Peserta (URL):
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={handlePhotoUrlChange}
                placeholder="https://example.com/photo.jpg (Opsional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Peserta Inovasi:
              </label>
              <select
                value={categorySelection}
                onChange={(e) => setCategorySelection(e.target.value as 'QCC-Rising' | 'QCC-Leading' | 'SS')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
              >
                <option value="QCC-Rising">QCC - Rising Class</option>
                <option value="QCC-Leading">QCC - Leading Class</option>
                <option value="SS">SS</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm uppercase rounded-xl shadow-sm transition-all min-h-[44px]"
              >
                {isSaving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Peserta'}
              </button>
            </div>

          </form>
        </div>

        {/* LIST & FILTER TABLE */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>DAFTAR PESERTA ({participants.length})</span>
            </h3>

            {/* Level Filter Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSelectedLevelFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all min-h-[36px] ${selectedLevelFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedLevelFilter('QCC-Rising')}
                className={`px-3 py-1.5 rounded-lg transition-all min-h-[36px] ${selectedLevelFilter === 'QCC-Rising' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                QCC Rising
              </button>
              <button
                type="button"
                onClick={() => setSelectedLevelFilter('QCC-Leading')}
                className={`px-3 py-1.5 rounded-lg transition-all min-h-[36px] ${selectedLevelFilter === 'QCC-Leading' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                QCC Leading
              </button>
              <button
                type="button"
                onClick={() => setSelectedLevelFilter('SS')}
                className={`px-3 py-1.5 rounded-lg transition-all min-h-[36px] ${selectedLevelFilter === 'SS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                SS
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama, tim, atau judul project..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-3">NAMA TIM / PESERTA</th>
                  <th className="py-3 px-3">KODE TIM</th>
                  <th className="py-3 px-3">JUDUL INOVASI</th>
                  <th className="py-3 px-3 text-center">NILAI PENYISIHAN</th>
                  <th className="py-3 px-3 text-center">KATEGORI</th>
                  <th className="py-3 px-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        {p.photoUrl ? (
                          <img src={getProxyImageUrl(p.photoUrl)} alt={p.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300">
                            <Users className="w-4 h-4 text-slate-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {p.teamCode || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">
                      {p.projectTitle}
                    </td>
                    <td className="py-3.5 px-3 text-center font-extrabold text-indigo-700 bg-indigo-50/50">
                      {p.preliminaryScore !== undefined ? p.preliminaryScore : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${
                        p.stream === 'SS'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : p.levelCategory === 'Leading'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {p.stream === 'SS' ? 'SS' : `QCC • ${p.levelCategory} Class`}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-2 bg-slate-100  hover:bg-indigo-100 :bg-indigo-900/40 text-slate-600  hover:text-indigo-600 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 bg-slate-100  hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      Tidak ada peserta ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};

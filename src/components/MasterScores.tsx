import React, { useState, useEffect } from 'react';
import { Criterion, IndicatorItem } from '../types';
import { 
  subscribeMasterCriteria, 
  saveMasterCriterion, 
  deleteMasterCriterion, 
  seedCriteriaIfEmpty, 
  resetMasterCriteriaToDefault 
} from '../lib/contestService';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  RotateCcw,
  CloudCheck
} from 'lucide-react';

export const MasterScores: React.FC = () => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Criterion | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Subscribe to real-time Firestore masterCriteria
  useEffect(() => {
    seedCriteriaIfEmpty();
    const unsubscribe = subscribeMasterCriteria((data) => {
      setCriteria(data);
    });
    return () => unsubscribe();
  }, []);

  // Filter criteria list by selected category
  const filteredCriteria = criteria.filter((item) => {
    if (selectedCategoryFilter === 'ALL') return true;
    return item.category === 'ALL' || item.category === selectedCategoryFilter;
  });

  const handleStartEdit = (item: Criterion) => {
    setEditingCriterionId(item.id);
    setEditForm(JSON.parse(JSON.stringify(item)));
  };

  const handleCancelEdit = () => {
    setEditingCriterionId(null);
    setEditForm(null);
    setIsAddingNew(false);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      setIsSaving(true);
      await saveMasterCriterion(editForm);
      setIsSaving(false);
      setEditingCriterionId(null);
      setEditForm(null);
      setIsAddingNew(false);
    } catch (err) {
      console.error("Error saving master criterion to Firestore:", err);
      setIsSaving(false);
    }
  };

  const handleDeleteCriterion = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus poin kriteria ini?')) {
      try {
        await deleteMasterCriterion(id);
      } catch (err) {
        console.error("Error deleting criterion from Firestore:", err);
      }
    }
  };

  const handleResetDefault = async () => {
    if (window.confirm('Reset seluruh listing kriteria di Database Firestore ke susunan standar awal?')) {
      try {
        setIsSaving(true);
        await resetMasterCriteriaToDefault();
        setIsSaving(false);
      } catch (err) {
        console.error("Error resetting criteria in Firestore:", err);
        setIsSaving(false);
      }
    }
  };

  const handleStartAdd = () => {
    const newId = `crit-${Date.now()}`;
    const newCriterion: Criterion = {
      id: newId,
      category: selectedCategoryFilter === 'ALL' ? 'ALL' : (selectedCategoryFilter as any),
      title: 'Poin Kriteria Baru',
      weight: '20%',
      description: 'Deskripsi kriteria penilaian yang harus dipenuhi peserta.',
      indicators: [
        { id: `ind-${Date.now()}-1`, name: 'Indikator Utama', detail: 'Penjelasan rincian kriteria penilaian.' }
      ]
    };
    setEditForm(newCriterion);
    setEditingCriterionId(newId);
    setIsAddingNew(true);
  };

  // Helper for adding indicator line inside editForm
  const handleAddIndicator = () => {
    if (!editForm) return;
    const newInd: IndicatorItem = {
      id: `ind-${Date.now()}`,
      name: 'Indikator Baru',
      detail: 'Rincian aspek pendukung penilaian.'
    };
    setEditForm({
      ...editForm,
      indicators: [...editForm.indicators, newInd]
    });
  };

  const handleRemoveIndicator = (indId: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      indicators: editForm.indicators.filter((ind) => ind.id !== indId)
    });
  };

  const handleIndicatorChange = (indId: string, field: 'name' | 'detail', value: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      indicators: editForm.indicators.map((ind) => 
        ind.id === indId ? { ...ind, [field]: value } : ind
      )
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl text-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200 inline-flex items-center gap-1.5">
            <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>MASTER LISTING PENILAIAN • FIRESTORE SYNC</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight uppercase flex items-center gap-2">
            <FileText className="w-7 h-7 text-red-600" />
            <span>LISTING KRITERIA & PARAMETER PENILAIAN</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
            Atur dan sesuaikan listing parameter kriteria penilaian per kategori kompetisi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartAdd}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kriteria Baru</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Reset ke Standar Awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Kategori (Global)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('QCC-Rising')}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedCategoryFilter === 'QCC-Rising'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            QCC Rising Class
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('QCC-Leading')}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedCategoryFilter === 'QCC-Leading'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            QCC Leading Class
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('SS')}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedCategoryFilter === 'SS'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SS
          </button>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Menampilkan <strong className="text-slate-900">{filteredCriteria.length}</strong> Poin Kriteria
        </div>
      </div>

      {/* FORM MODAL / INLINE EDIT WHEN ADDING OR EDITING */}
      {editingCriterionId && editForm && (
        <div className="bg-red-50/50 border-2 border-red-200 p-6 sm:p-8 rounded-3xl shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-red-200 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase">
              <Edit3 className="w-5 h-5 text-red-600" />
              <span>{isAddingNew ? 'Tambah Kriteria Penilaian Baru' : 'Edit Listing Kriteria'}</span>
            </h3>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Kategori Spesifik
              </label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">Semua Kategori (Global)</option>
                <option value="QCC-Rising">QCC Rising Class</option>
                <option value="QCC-Leading">QCC Leading Class</option>
                <option value="SS">SS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Judul Kriteria
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
                placeholder="Contoh: Keterlibatan Tim & Presentasi"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Deskripsi Panduan Penilaian
            </label>
            <textarea
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-500"
              placeholder="Jelaskan aspek utama yang harus dinilai oleh juri..."
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-red-200">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      )}

      {/* MASTER LISTING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCriteria.map((item, index) => (
          <div 
            key={item.id} 
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.category === 'ALL' 
                      ? 'bg-slate-100 text-slate-700' 
                      : item.category === 'SS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {item.category === 'ALL' ? 'Semua Kategori' : item.category === 'SS' ? 'SS' : `QCC ${item.category.replace('QCC-', '')}`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-xl transition-all"
                    title="Edit Kriteria"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCriterion(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Hapus Kriteria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {index + 1}. {item.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-bold flex justify-between items-center">
              <span>Skala Nilai: 0 - 100</span>
              <span className="text-slate-600">Akumulasi Rata-Rata 3 Juri</span>
            </div>
          </div>
        ))}

        {filteredCriteria.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-3">
            <p className="text-sm font-bold text-slate-600">Belum ada kriteria penilaian untuk kategori ini.</p>
            <button
              type="button"
              onClick={handleStartAdd}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
            >
              Tambah Kriteria Sekarang
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Participant, JudgeScore, ScoreCriteria } from '../types';
import { saveJudgeScore, calculateSingleJudgeTotal } from '../lib/contestService';
import { Award, ShieldCheck, CheckCircle2, Sliders, AlertCircle, Sparkles, Send, UserCheck, Flame, Star } from 'lucide-react';

interface ScoringFormProps {
  participants: Participant[];
  scores: JudgeScore[];
  initialJudgeId?: number | null;
  initialParticipantId?: string | null;
  onScoreSubmitted?: () => void;
}

export const ScoringForm: React.FC<ScoringFormProps> = ({
  participants,
  scores,
  initialJudgeId = null,
  initialParticipantId = null,
  onScoreSubmitted
}) => {
  const [selectedJudgeId, setSelectedJudgeId] = useState<1 | 2 | 3>((initialJudgeId as 1 | 2 | 3) || 1);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  // Criteria Scores (0 to 100)
  const [criteria, setCriteria] = useState<ScoreCriteria>({
    inovasiDampak: 80,
    solusiTeknis: 80,
    presentasiExecution: 80,
    keberlanjutanReplikasi: 80
  });

  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const isLockedJudge = !!initialJudgeId;

  // Update selected judge if passed via prop
  useEffect(() => {
    if (initialJudgeId && [1, 2, 3].includes(initialJudgeId)) {
      setSelectedJudgeId(initialJudgeId as 1 | 2 | 3);
    }
  }, [initialJudgeId]);

  useEffect(() => {
    if (initialParticipantId) {
      setSelectedParticipantId(initialParticipantId);
    }
  }, [initialParticipantId]);

  // Filtered Participants based on class level filter
  const filteredParticipants = participants.filter((p) => {
    if (filterLevel === 'ALL') return true;
    return p.levelCategory === filterLevel;
  });

  // Set default selected participant when list or filter changes
  useEffect(() => {
    if (filteredParticipants.length > 0 && !selectedParticipantId) {
      setSelectedParticipantId(filteredParticipants[0].id);
    }
  }, [filteredParticipants, selectedParticipantId]);

  // If selecting a participant or judge that already has a score, prefill!
  useEffect(() => {
    if (selectedParticipantId && selectedJudgeId) {
      const existing = scores.find(
        (s) => s.participantId === selectedParticipantId && s.judgeId === selectedJudgeId
      );
      if (existing) {
        setCriteria(existing.criteriaScores);
        setNotes(existing.notes || '');
      } else {
        setCriteria({
          inovasiDampak: 80,
          solusiTeknis: 80,
          presentasiExecution: 80,
          keberlanjutanReplikasi: 80
        });
        setNotes('');
      }
    }
  }, [selectedParticipantId, selectedJudgeId, scores]);

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId);

  // Check if current participant already has a score from current judge
  const existingScore = scores.find(
    (s) => s.participantId === selectedParticipantId && s.judgeId === selectedJudgeId
  );

  const calculatedScore = calculateSingleJudgeTotal(criteria);

  const handleScoreChange = (key: keyof ScoreCriteria, val: number) => {
    setCriteria((prev) => ({
      ...prev,
      [key]: Math.min(100, Math.max(0, val))
    }));
  };

  const handleQuickPreset = (val: number) => {
    setCriteria({
      inovasiDampak: val,
      solusiTeknis: val,
      presentasiExecution: val,
      keberlanjutanReplikasi: val
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipantId) return;

    try {
      setIsSubmitting(true);
      await saveJudgeScore(selectedParticipantId, selectedJudgeId, criteria, notes);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      if (onScoreSubmitted) onScoreSubmitted();
    } catch (err) {
      console.error("Error saving judge score:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl text-slate-900 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
              LEMBAR PENILAIAN JURI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight uppercase">
              FORM EVALUASI JURI MATCHDAY
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
              Masukkan skor berdasarkan 4 parameter utama kriteria penilaian inovasi
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-8">
        
        {/* Step 1: Selection Juri & Peserta */}
        <div className="space-y-6">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5 text-red-600" />
            <span>1. IDENTITAS JURI & PESERTA</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Juri Selection */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                ROLE / POSISI JURI
              </label>
              {isLockedJudge ? (
                <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl font-black text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>JURI {selectedJudgeId} (AKSES TERKUNCI)</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((jId) => (
                    <button
                      key={jId}
                      type="button"
                      onClick={() => setSelectedJudgeId(jId as 1 | 2 | 3)}
                      className={`py-2.5 rounded-xl font-black text-xs uppercase transition-all ${
                        selectedJudgeId === jId
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Juri {jId}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Category & Participant Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                PILIH TIM PESERTA
              </label>
              {initialParticipantId && selectedParticipant ? (
                <div className="flex flex-col justify-center bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-slate-900 font-bold text-sm min-h-[46px]">
                  <span>{selectedParticipant.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">Terkunci via QR Code</span>
                </div>
              ) : (
                <select
                  value={selectedParticipantId}
                  onChange={(e) => setSelectedParticipantId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white font-bold text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {participants.length === 0 ? (
                    <option value="">Memuat peserta...</option>
                  ) : (
                    participants.map((p) => {
                      const scoredByThisJudge = scores.some(
                        (s) => s.participantId === p.id && s.judgeId === selectedJudgeId
                      );
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.stream === 'SS' ? 'SS' : `${p.levelCategory}`}) {scoredByThisJudge ? '✓ [Sudah Dinilai]' : ''}
                        </option>
                      );
                    })
                  )}
                </select>
              )}
            </div>

          </div>

          {/* Active Participant Preview Card */}
          {selectedParticipant && (
            <div className="bg-gradient-to-r from-red-50 to-slate-50 border border-red-200 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full">
                      {selectedParticipant.stream === 'SS' ? 'SS' : `QCC • ${selectedParticipant.levelCategory} Class`}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900">{selectedParticipant.name}</h4>
                  <p className="text-xs font-bold text-slate-600 mt-0.5 italic">"{selectedParticipant.projectTitle}"</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {existingScore ? (
                    <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>SUDAH DINILAI (SKOR: {existingScore.totalScore})</span>
                    </div>
                  ) : (
                    <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-600" />
                      <span>BELUM DINILAI</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

          {/* Step 2: Criteria Sliders */}
        <div className="space-y-6">
          <h3 className="text-base font-black text-slate-900  uppercase tracking-tight flex items-center gap-2 border-b border-slate-100  pb-3">
            <Sliders className="w-5 h-5 text-red-600" />
            <span>2. PARAMETER KRITERIA PENILAIAN (0 - 100)</span>
          </h3>

          {/* Parameter 1: Inovasi & Dampak Bisnis (30%) */}
          <div className="bg-slate-50  p-4 sm:p-5 rounded-2xl border border-slate-200  space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-emerald-700  uppercase tracking-widest bg-emerald-100  px-2 py-0.5 rounded">
                  BOBOT 30%
                </span>
                <h4 className="text-sm font-bold text-slate-900  mt-1">
                  1. Inovasi & Dampak Bisnis
                </h4>
                <p className="text-xs text-slate-500">Kebaruan ide, efisiensi biaya, nilai tambah & dampak kuantitatif</p>
              </div>

              {/* Touch Numeric Input with +/- Buttons for Mobile */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleScoreChange('inovasiDampak', criteria.inovasiDampak - 5)}
                  className="w-10 h-10 rounded-xl bg-slate-200  text-slate-800  font-black text-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={criteria.inovasiDampak}
                  onChange={(e) => handleScoreChange('inovasiDampak', Number(e.target.value))}
                  className="w-16 bg-white  border-2 border-emerald-600 rounded-xl p-2 font-black text-base text-center text-slate-900 "
                />
                <button
                  type="button"
                  onClick={() => handleScoreChange('inovasiDampak', criteria.inovasiDampak + 5)}
                  className="w-10 h-10 rounded-xl bg-slate-200  text-slate-800  font-black text-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={criteria.inovasiDampak}
              onChange={(e) => handleScoreChange('inovasiDampak', Number(e.target.value))}
              className="w-full accent-emerald-600 h-2.5 bg-slate-200  rounded-lg cursor-pointer"
            />
          </div>

          {/* Parameter 2: Solusi & Kualitas Teknis (30%) */}
          <div className="bg-slate-50  p-4 sm:p-5 rounded-2xl border border-slate-200  space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-emerald-700  uppercase tracking-widest bg-emerald-100  px-2 py-0.5 rounded">
                  BOBOT 30%
                </span>
                <h4 className="text-sm font-bold text-slate-900  mt-1">
                  2. Solusi & Kualitas Teknis
                </h4>
                <p className="text-xs text-slate-500">Metodologi analisis masalah, kompleksitas solusi & keandalan teknis</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleScoreChange('solusiTeknis', criteria.solusiTeknis - 5)}
                  className="w-10 h-10 rounded-xl bg-slate-200  text-slate-800  font-black text-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={criteria.solusiTeknis}
                  onChange={(e) => handleScoreChange('solusiTeknis', Number(e.target.value))}
                  className="w-16 bg-white  border-2 border-emerald-600 rounded-xl p-2 font-black text-base text-center text-slate-900 "
                />
                <button
                  type="button"
                  onClick={() => handleScoreChange('solusiTeknis', criteria.solusiTeknis + 5)}
                  className="w-10 h-10 rounded-xl bg-slate-200  text-slate-800  font-black text-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={criteria.solusiTeknis}
              onChange={(e) => handleScoreChange('solusiTeknis', Number(e.target.value))}
              className="w-full accent-emerald-600 h-2.5 bg-slate-200  rounded-lg cursor-pointer"
            />
          </div>

          {/* Parameter 3: Presentasi & Eksekusi (20%) */}
          <div className="bg-slate-50  p-4 sm:p-5 rounded-2xl border border-slate-200  space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-emerald-700  uppercase tracking-widest bg-emerald-100  px-2 py-0.5 rounded">
                  BOBOT 20%
                </span>
                <h4 className="text-sm font-bold text-slate-900  mt-1">
                  3. Presentasi & Keterlibatan Tim
                </h4>
                <p className="text-xs text-slate-500">Penyampaian materi, kekompakan & keterlibatan aktif tim, alat peraga, serta jawaban Q&A</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleScoreChange('presentasiExecution', criteria.presentasiExecution - 5)}
                  className="w-10 h-10 rounded-xl bg-slate-200  text-slate-800  font-black text-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={criteria.presentasiExecution}
                  onChange={(e) => handleScoreChange('presentasiExecution', Number(e.target.value))}
                  className="w-16 bg-white  border-2 border-emerald-600 rounded-xl p-2 font-black text-base text-center text-slate-900 "
                />
                <button
                  type="button"
                  onClick={() => handleScoreChange('presentasiExecution', criteria.presentasiExecution + 5)}
                  className="w-10 h-10 rounded-xl bg-slate-200  text-slate-800  font-black text-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={criteria.presentasiExecution}
              onChange={(e) => handleScoreChange('presentasiExecution', Number(e.target.value))}
              className="w-full accent-emerald-600 h-2.5 bg-slate-200  rounded-lg cursor-pointer"
            />
          </div>

          {/* Parameter 4: Keberlanjutan & Potensi Replikasi (20%) */}
          <div className="bg-slate-50  p-4 sm:p-5 rounded-2xl border border-slate-200  space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-emerald-700  uppercase tracking-widest bg-emerald-100  px-2 py-0.5 rounded">
                  BOBOT 20%
                </span>
                <h4 className="text-sm font-bold text-slate-900  mt-1">
                  4. Keberlanjutan & Potensi Replikasi
                </h4>
                <p className="text-xs text-slate-500">Kemudahan standar operasional, standarisasi & penerapan di unit kerja lain</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleScoreChange('keberlanjutanReplikasi', criteria.keberlanjutanReplikasi - 5)}
                  className="w-10 h-10 rounded-xl bg-slate-200  text-slate-800  font-black text-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={criteria.keberlanjutanReplikasi}
                  onChange={(e) => handleScoreChange('keberlanjutanReplikasi', Number(e.target.value))}
                  className="w-16 bg-white  border-2 border-emerald-600 rounded-xl p-2 font-black text-base text-center text-slate-900 "
                />
                <button
                  type="button"
                  onClick={() => handleScoreChange('keberlanjutanReplikasi', criteria.keberlanjutanReplikasi + 5)}
                  className="w-10 h-10 rounded-xl bg-slate-200  text-slate-800  font-black text-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={criteria.keberlanjutanReplikasi}
              onChange={(e) => handleScoreChange('keberlanjutanReplikasi', Number(e.target.value))}
              className="w-full accent-emerald-600 h-2.5 bg-slate-200  rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Calculated Score & Feedback Notes */}
        <div className="pt-4 border-t border-slate-200">
          <div className="space-y-2 mb-24 md:mb-0">
            <label className="block text-xs font-bold uppercase text-slate-700 ">
              Catatan & Masukan Konstruktif Juri (Opsional):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Berikan masukan atau apresiasi singkat untuk tim..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Action - Floating on mobile */}
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:relative md:bg-transparent md:border-t-0 md:p-0 md:shadow-none z-30">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto shrink-0 bg-red-50 border border-red-200 p-3 sm:p-5 rounded-2xl text-center flex flex-row sm:flex-col justify-between items-center sm:justify-center shadow-sm">
              <div className="text-left sm:text-center">
                <div className="text-[10px] sm:text-xs font-black text-red-800 uppercase tracking-widest">
                  NILAI AKHIR
                </div>
                <div className="text-[8px] sm:text-[10px] text-red-600 uppercase mt-0.5">
                  Berdasarkan Bobot
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-red-600 sm:my-1">
                {calculatedScore}
              </div>
            </div>

            <div className="w-full flex-1">
              {submitSuccess && (
                <div className="mb-2 sm:mb-4 p-2 sm:p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  <span className="text-center">Penilaian Berhasil Disimpan!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !selectedParticipantId}
                className="w-full py-3.5 sm:py-4 bg-red-600 hover:bg-red-500 text-white font-black text-base sm:text-lg uppercase tracking-wider rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? 'MENYIMPAN...' : `KIRIM PENILAIAN JURI ${selectedJudgeId}`}</span>
              </button>
            </div>
          </div>
        </div>

      
        </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { Participant } from '../types';
import { Copy, Check, Maximize2, Minimize2, Download, ShieldCheck, Heart, Users } from 'lucide-react';

export const JudgeQRModal: React.FC<{ participants: Participant[] }> = ({ participants }) => {
  const [activeTab, setActiveTab] = useState<'juri' | 'public'>('juri');

  // State for Juri QR (Requires Category & Participant)
  const [juriCategory, setJuriCategory] = useState<string>('ALL');
  const [juriParticipantId, setJuriParticipantId] = useState<string>('');
  const [juriQrData, setJuriQrData] = useState<string>('');

  // State for Public QR (Requires Category Only)
  const [publicCategory, setPublicCategory] = useState<string>('ALL');
  const [publicQrData, setPublicQrData] = useState<string>('');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [fullscreenQR, setFullscreenQR] = useState<{ label: string; url: string; dataUrl: string } | null>(null);

  const origin = window.location.origin;

  // Filter participants for Juri
  const juriFilteredParticipants = participants.filter((p) => {
    if (juriCategory === 'ALL') return true;
    if (juriCategory === 'SS') return p.stream === 'SS';
    if (juriCategory === 'QCC-Rising') return p.stream === 'QCC' && p.levelCategory === 'Rising';
    if (juriCategory === 'QCC-Leading') return p.stream === 'QCC' && p.levelCategory === 'Leading';
    return true;
  });

  // Auto-select first participant for Juri when list changes
  useEffect(() => {
    if (juriFilteredParticipants.length > 0) {
      if (!juriParticipantId || !juriFilteredParticipants.some(p => p.id === juriParticipantId)) {
        setJuriParticipantId(juriFilteredParticipants[0].id);
      }
    } else {
      setJuriParticipantId('');
    }
  }, [juriCategory, juriFilteredParticipants, juriParticipantId]);

  // Compute Juri URL
  let juriEffectiveCategory = juriCategory !== 'ALL' ? juriCategory : '';
  if (juriParticipantId) {
    const p = participants.find(x => x.id === juriParticipantId);
    if (p) {
      if (p.stream === 'SS') juriEffectiveCategory = 'SS';
      else if (p.levelCategory === 'Leading') juriEffectiveCategory = 'QCC-Leading';
      else juriEffectiveCategory = 'QCC-Rising';
    }
  }
  const juriCatParam = juriEffectiveCategory ? `&category=${juriEffectiveCategory}` : '';
  const juriPartParam = juriParticipantId ? `&participant=${juriParticipantId}` : '';
  const juriUrl = `${origin}/?tab=scoring${juriCatParam}${juriPartParam}`;

  // Compute Public URL (Per Category only)
  const publicCatParam = publicCategory !== 'ALL' ? `&category=${publicCategory}` : '';
  const publicUrl = `${origin}/?tab=vote${publicCatParam}`;

  // Generate Juri QR
  useEffect(() => {
    QRCode.toDataURL(juriUrl, { width: 512, margin: 3 })
      .then(url => setJuriQrData(url))
      .catch(err => console.error('Error generating Juri QR:', err));
  }, [juriUrl]);

  // Generate Public QR
  useEffect(() => {
    QRCode.toDataURL(publicUrl, { width: 512, margin: 3 })
      .then(url => setPublicQrData(url))
      .catch(err => console.error('Error generating Public QR:', err));
  }, [publicUrl]);

  const handleCopy = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadQR = (label: string, dataUrl: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR-Innoparty-${label.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const selectedJuriParticipant = participants.find(p => p.id === juriParticipantId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Mode Selector Tabs */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl gap-2 shadow-inner max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('juri')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'juri'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>QR Code Juri (Per Peserta)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('public')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'public'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
          }`}
        >
          <Heart className="w-4 h-4 text-red-400" />
          <span>QR Code Public (Per Kategori)</span>
        </button>
      </div>

      {/* TAB 1: QR CODE JURI */}
      {activeTab === 'juri' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl text-slate-900 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
              BARCODE KHUSUS DEWAN JURI
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight uppercase">
              QR CODE PENILAIAN JURI
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
              Filter berdasarkan kategori dan pilih peserta spesifik untuk langsung membuka Form Penilaian Juri peserta tersebut.
            </p>
          </div>

          {/* Filter Controls for Juri */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                1. Filter Kategori Lomba
              </label>
              <select
                value={juriCategory}
                onChange={(e) => setJuriCategory(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="ALL">Semua Kategori (Global)</option>
                <option value="QCC-Rising">QCC Rising Class</option>
                <option value="QCC-Leading">QCC Leading Class</option>
                <option value="SS">SS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                2. Pilih Peserta ({juriFilteredParticipants.length} Peserta)
              </label>
              <select
                value={juriParticipantId}
                onChange={(e) => setJuriParticipantId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {juriFilteredParticipants.length === 0 ? (
                  <option value="">Tidak ada peserta pada kategori ini</option>
                ) : (
                  juriFilteredParticipants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.stream === 'SS' ? 'SS' : `QCC ${p.levelCategory}`})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* QR Display Card for Juri */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-red-600 text-white inline-block">
                BARCODE JURI AKURAT
              </span>
              <h3 className="font-black text-slate-900 text-lg uppercase">
                {selectedJuriParticipant ? selectedJuriParticipant.name : 'SEMUA PESERTA'}
              </h3>
              {selectedJuriParticipant && (
                <p className="text-xs text-slate-600 font-medium">
                  "{selectedJuriParticipant.projectTitle}" • Category: <strong className="text-red-600">{juriEffectiveCategory || 'All'}</strong>
                </p>
              )}
            </div>

            {/* QR Image */}
            <div
              className="bg-white p-4 border-4 border-black inline-block rounded-none shadow-md cursor-pointer hover:scale-105 transition-transform"
              onClick={() => juriQrData && setFullscreenQR({ label: `JURI: ${selectedJuriParticipant?.name || 'ALL'}`, url: juriUrl, dataUrl: juriQrData })}
              title="Klik untuk Perbesar"
            >
              {juriQrData ? (
                <img src={juriQrData} alt="QR Juri" className="w-64 h-64 mx-auto object-contain" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-xs text-slate-500 font-bold">
                  Memuat QR...
                </div>
              )}
            </div>

            {/* Direct URL */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left space-y-1 max-w-md mx-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                LINK DIRECT JURI
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 truncate">
                {juriUrl}
              </p>
            </div>

            {/* Actions */}
            <div className="max-w-md mx-auto space-y-2.5">
              <button
                type="button"
                onClick={() => juriQrData && setFullscreenQR({ label: `JURI: ${selectedJuriParticipant?.name || 'ALL'}`, url: juriUrl, dataUrl: juriQrData })}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Zoom / Layar Penuh</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy('juri', juriUrl)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200 active:scale-95"
                >
                  {copiedKey === 'juri' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => juriQrData && downloadQR(`JURI_${selectedJuriParticipant?.name || 'ALL'}`, juriQrData)}
                  className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 border border-red-200 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QR CODE PUBLIC */}
      {activeTab === 'public' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl text-slate-900 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              BARCODE KHUSUS PENONTON / PUBLIC
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight uppercase">
              QR CODE VOTING PUBLIC
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
              Filter berdasarkan kategori lomba. Penonton cukup memindai QR Code ini untuk membuka halaman voting kategori tersebut.
            </p>
          </div>

          {/* Filter Controls for Public */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Filter Kategori Lomba Voting
            </label>
            <select
              value={publicCategory}
              onChange={(e) => setPublicCategory(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
            >
              <option value="ALL">Semua Kategori (Global)</option>
              <option value="QCC-Rising">QCC Rising Class</option>
              <option value="QCC-Leading">QCC Leading Class</option>
              <option value="SS">SS</option>
            </select>
          </div>

          {/* QR Display Card for Public */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-slate-900 text-white inline-block">
                BARCODE VOTING PUBLIC
              </span>
              <h3 className="font-black text-slate-900 text-lg uppercase">
                KATEGORI: {publicCategory === 'ALL' ? 'SEMUA KATEGORI' : publicCategory}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Pemilih / Penonton mengisi nama secara langsung di halaman voting
              </p>
            </div>

            {/* QR Image */}
            <div
              className="bg-white p-4 border-4 border-black inline-block rounded-none shadow-md cursor-pointer hover:scale-105 transition-transform"
              onClick={() => publicQrData && setFullscreenQR({ label: `PUBLIC: ${publicCategory}`, url: publicUrl, dataUrl: publicQrData })}
              title="Klik untuk Perbesar"
            >
              {publicQrData ? (
                <img src={publicQrData} alt="QR Public" className="w-64 h-64 mx-auto object-contain" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-xs text-slate-500 font-bold">
                  Memuat QR...
                </div>
              )}
            </div>

            {/* Direct URL */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left space-y-1 max-w-md mx-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                LINK DIRECT PUBLIC VOTING
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 truncate">
                {publicUrl}
              </p>
            </div>

            {/* Actions */}
            <div className="max-w-md mx-auto space-y-2.5">
              <button
                type="button"
                onClick={() => publicQrData && setFullscreenQR({ label: `PUBLIC: ${publicCategory}`, url: publicUrl, dataUrl: publicQrData })}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Zoom / Layar Penuh</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy('public', publicUrl)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200 active:scale-95"
                >
                  {copiedKey === 'public' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => publicQrData && downloadQR(`PUBLIC_${publicCategory}`, publicQrData)}
                  className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 border border-red-200 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Giant Zoom QR Modal */}
      <AnimatePresence>
        {fullscreenQR && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-[100] overflow-hidden select-none">
            <div 
              className="absolute inset-0 cursor-zoom-out" 
              onClick={() => setFullscreenQR(null)} 
            />

            <button 
              type="button"
              onClick={() => setFullscreenQR(null)}
              className="absolute top-6 right-6 p-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-full transition-all border border-slate-200 shadow-xl z-10"
              title="Keluar Layar Penuh"
            >
              <Minimize2 className="w-6 h-6" />
            </button>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl w-full"
            >
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase">
                PINDAI QR CODE BARCODE
              </h2>

              <div className="px-5 py-2 text-sm md:text-base font-black bg-red-600 text-white rounded-full shadow-lg font-mono uppercase">
                {fullscreenQR.label}
              </div>

              <div 
                className="bg-white p-4 md:p-6 border-8 border-black shadow-2xl inline-block rounded-none cursor-zoom-out"
                onClick={() => setFullscreenQR(null)}
              >
                <img 
                  src={fullscreenQR.dataUrl} 
                  alt={`QR Code ${fullscreenQR.label}`}
                  className="w-[60vmin] h-[60vmin] min-w-[280px] min-h-[280px] max-w-[500px] max-h-[500px] rounded-none bg-white object-contain"
                />
              </div>

              <p className="text-[11px] md:text-xs text-slate-800 break-all max-w-md bg-white p-3 rounded-xl border border-slate-200 font-mono select-all font-bold">
                {fullscreenQR.url}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => downloadQR(fullscreenQR.label, fullscreenQR.dataUrl)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFullscreenQR(null)}
                  className="px-6 py-3 bg-white text-slate-900 font-bold hover:bg-slate-100 rounded-xl transition-colors text-xs uppercase border border-slate-200 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};


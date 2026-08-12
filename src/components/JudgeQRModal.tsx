import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { Participant } from '../types';
import { QrCode, Copy, Check, Maximize2, Minimize2, Download, ShieldCheck, Trophy, X, ExternalLink } from 'lucide-react';

export const JudgeQRModal: React.FC<{ participants: Participant[] }> = ({ participants }) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [qrMap, setQrMap] = useState<{ [key: string]: string }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [fullscreenQR, setFullscreenQR] = useState<{ label: string; url: string; dataUrl: string } | null>(null);

  const origin = window.location.origin;

  // Filter participants by selected category
  const filteredParticipants = participants.filter((p) => {
    if (selectedCategoryFilter === 'ALL') return true;
    if (selectedCategoryFilter === 'SS') return p.stream === 'SS';
    if (selectedCategoryFilter === 'QCC-Rising') return p.stream === 'QCC' && p.levelCategory === 'Rising';
    if (selectedCategoryFilter === 'QCC-Leading') return p.stream === 'QCC' && p.levelCategory === 'Leading';
    return true;
  });

  // Auto-select first participant if none selected
  useEffect(() => {
    if (!selectedParticipantId && filteredParticipants.length > 0) {
      setSelectedParticipantId(filteredParticipants[0].id);
    }
  }, [filteredParticipants, selectedParticipantId]);

  const participantParam = selectedParticipantId ? `&participant=${selectedParticipantId}` : '';

  const links = [
    { key: 'juri1', label: 'JURI 1', url: `${origin}/?juri=1${participantParam}`, desc: 'Akses Khusus Form Penilaian Juri 1', badgeColor: 'bg-emerald-600' },
    { key: 'juri2', label: 'JURI 2', url: `${origin}/?juri=2${participantParam}`, desc: 'Akses Khusus Form Penilaian Juri 2', badgeColor: 'bg-blue-600' },
    { key: 'juri3', label: 'JURI 3', url: `${origin}/?juri=3${participantParam}`, desc: 'Akses Khusus Form Penilaian Juri 3', badgeColor: 'bg-amber-600' },
  ];

  useEffect(() => {
    async function generateAllQRs() {
      const newMap: { [key: string]: string } = {};
      for (const item of links) {
        try {
          const dataUrl = await QRCode.toDataURL(item.url, {
            width: 512,
            margin: 3,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          newMap[item.key] = dataUrl;
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      }
      setQrMap(newMap);
    }
    generateAllQRs();
  }, [selectedParticipantId, origin]);

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl text-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
            BARCODE & LINK AKSES AKURAT
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight uppercase">
            QR CODE JURI & LIVE STADIUM
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
            Pindai QR Code untuk langsung masuk ke Form Penilaian Juri Masing-masing tanpa login
          </p>
        </div>
      </div>

      {/* Category Filter & Participant Selector Box */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Filter Kategori Lomba
            </label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                const newCat = e.target.value;
                setSelectedCategoryFilter(newCat);
                const updatedList = participants.filter((p) => {
                  if (newCat === 'ALL') return true;
                  if (newCat === 'SS') return p.stream === 'SS';
                  if (newCat === 'QCC-Rising') return p.stream === 'QCC' && p.levelCategory === 'Rising';
                  if (newCat === 'QCC-Leading') return p.stream === 'QCC' && p.levelCategory === 'Leading';
                  return true;
                });
                if (selectedParticipantId && !updatedList.some((p) => p.id === selectedParticipantId)) {
                  setSelectedParticipantId('');
                }
              }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Semua Kategori (Global)</option>
              <option value="QCC-Rising">QCC Rising Class</option>
              <option value="QCC-Leading">QCC Leading Class</option>
              <option value="SS">SS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Pilih Peserta Inovasi ({filteredParticipants.length} Peserta)
            </label>
            <select 
              value={selectedParticipantId}
              onChange={(e) => setSelectedParticipantId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">-- Pilih Peserta --</option>
              {filteredParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stream === 'SS' ? 'SS' : `QCC ${p.levelCategory}`})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of 4 QR Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {links.map((item) => {
          const dataUrl = qrMap[item.key];
          return (
            <div 
              key={item.key} 
              className="bg-white  border border-slate-200  rounded-3xl p-5 shadow-xl flex flex-col justify-between text-center relative overflow-hidden group hover:border-emerald-500/50 transition-all"
            >
              <div>
                <span className={`inline-block text-[10px] font-black uppercase text-slate-900 px-3 py-1 rounded-full ${item.badgeColor} mb-3 shadow`}>
                  {item.label}
                </span>

                {/* QR Code Container with Solid Black Border as requested */}
                <div 
                  className="bg-white p-2 border-4 border-black my-2 inline-block rounded-none shadow-md cursor-pointer group-hover:scale-105 transition-transform"
                  onClick={() => dataUrl && setFullscreenQR({ label: item.label, url: item.url, dataUrl })}
                  title="Klik untuk Perbesar / Layar Penuh"
                >
                  {dataUrl ? (
                    <img 
                      src={dataUrl} 
                      alt={`QR Code ${item.label}`}
                      className="w-40 h-40 mx-auto rounded-none bg-white object-contain"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-500">
                      Memuat QR...
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500  mb-4 px-2">
                  {item.desc}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 ">
                <button
                  onClick={() => dataUrl && setFullscreenQR({ label: item.label, url: item.url, dataUrl })}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Zoom / Layar Penuh</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(item.key, item.url)}
                    className="flex-1 py-2 bg-slate-100  hover:bg-slate-200 text-slate-700  font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                    title="Salin Link"
                  >
                    {copiedKey === item.key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === item.key ? 'Tersalin' : 'Salin'}</span>
                  </button>

                  <button
                    onClick={() => dataUrl && downloadQR(item.label, dataUrl)}
                    className="flex-1 py-2 bg-emerald-50  hover:bg-emerald-100 text-emerald-700  font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 border border-emerald-200 "
                    title="Unduh QR"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Fullscreen Giant Zoom Out QR Modal */}
      <AnimatePresence>
        {fullscreenQR && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-[100] overflow-hidden select-none">
            <div 
              className="absolute inset-0 cursor-zoom-out" 
              onClick={() => setFullscreenQR(null)} 
            />

            <button 
              onClick={() => setFullscreenQR(null)}
              className="absolute top-6 right-6 p-3.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-full transition-all border border-slate-200 shadow-xl z-10"
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
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-widest uppercase">
                PINDAI QR CODE JURI / MATCHDAY
              </h2>

              <div className="px-5 py-2 text-sm md:text-base font-bold bg-red-600 text-white rounded-full shadow-lg font-mono uppercase">
                {fullscreenQR.label}
              </div>

              {/* Giant high-contrast QR with solid thick black border */}
              <div 
                className="bg-white p-4 md:p-6 border-8 border-black shadow-2xl inline-block rounded-none cursor-zoom-out"
                onClick={() => setFullscreenQR(null)}
              >
                <img 
                  src={fullscreenQR.dataUrl} 
                  alt={`QR Code ${fullscreenQR.label}`}
                  className="w-[60vmin] h-[60vmin] min-w-[280px] min-h-[280px] max-w-[550px] max-h-[550px] rounded-none bg-white object-contain"
                />
              </div>

              <p className="text-[11px] md:text-xs text-slate-500 break-all max-w-md bg-white p-3 rounded-xl border border-slate-200 font-mono select-all">
                {fullscreenQR.url}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => downloadQR(fullscreenQR.label, fullscreenQR.dataUrl)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar QR</span>
                </button>
                <button
                  onClick={() => setFullscreenQR(null)}
                  className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium rounded-xl transition-colors text-sm border border-slate-200"
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

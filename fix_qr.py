with open('src/components/JudgeQRModal.tsx', 'r') as f:
    content = f.read()

import re

# We will completely rewrite JudgeQRModal.tsx to be clean.
clean_modal = """import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { Participant } from '../types';
import { Copy, Check, Maximize2, Minimize2, Download, Heart, Users } from 'lucide-react';

export const JudgeQRModal: React.FC<{ participants: Participant[] }> = ({ participants }) => {
  const [publicCategory, setPublicCategory] = useState<string>('ALL');
  const [publicQrData, setPublicQrData] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [fullscreenQR, setFullscreenQR] = useState<{ label: string; url: string; dataUrl: string } | null>(null);
  const origin = window.location.origin;

  const publicUrl = `${origin}/vote?cat=${publicCategory}`;

  useEffect(() => {
    QRCode.toDataURL(publicUrl, { width: 512, margin: 3 })
      .then(url => setPublicQrData(url))
      .catch(err => console.error('Error generating Public QR:', err));
  }, [publicUrl]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
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
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-8">
        {/* Left Side: Controls */}
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-amber-500" />
              QR CODE VOTING PUBLIC
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Filter berdasarkan kategori lomba. Penonton cukup memindai QR Code ini untuk membuka halaman voting.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">Filter Kategori Vote:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['ALL', 'QCC-Rising', 'QCC-Leading', 'SS'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPublicCategory(cat)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    publicCategory === cat
                      ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: QR Display */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block text-center">
              SCAN UNTUK VOTING ({publicCategory})
            </span>
            
            <button 
              onClick={() => publicQrData && setFullscreenQR({ label: `PUBLIC: ${publicCategory}`, url: publicUrl, dataUrl: publicQrData })}
              className="relative group bg-white p-2 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all mb-4"
            >
              {publicQrData ? (
                <img src={publicQrData} alt="QR Public" className="w-48 h-48 mx-auto object-contain" />
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Memuat QR...
                </div>
              )}
              
              <div className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                <div className="bg-white/90 text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Maximize2 className="w-3 h-3" /> Perbesar
                </div>
              </div>
            </button>

            <div className="w-full flex items-center gap-2 mb-3">
              <input 
                type="text" 
                readOnly 
                value={publicUrl} 
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-[10px] text-slate-600 truncate font-mono focus:outline-none focus:border-amber-300"
              />
              <button
                onClick={() => copyToClipboard(publicUrl, 'pub')}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors shrink-0"
                title="Salin Link"
              >
                {copiedKey === 'pub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={() => publicQrData && downloadQR(`PUBLIC_${publicCategory}`, publicQrData)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Simpan Gambar QR
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Giant Zoom QR Modal */}
      <AnimatePresence>
        {fullscreenQR && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm"
            onClick={() => setFullscreenQR(null)} 
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-[2rem] p-8 md:p-12 max-w-xl w-full shadow-2xl relative flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setFullscreenQR(null)}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-full transition-colors"
              >
                <Minimize2 className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100 mb-3 inline-block">
                  PINDAI QR CODE INI
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  {fullscreenQR.label}
                </h2>
              </div>

              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-8 cursor-zoom-out"
                   onClick={() => setFullscreenQR(null)}>
                <img 
                  src={fullscreenQR.dataUrl} 
                  alt={`QR Code ${fullscreenQR.label}`}
                  className="w-64 h-64 md:w-96 md:h-96 object-contain"
                />
              </div>

              <div className="text-center bg-slate-100 px-4 py-2 rounded-xl mb-6 truncate max-w-full font-mono text-sm text-slate-600">
                {fullscreenQR.url}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => downloadQR(fullscreenQR.label, fullscreenQR.dataUrl)}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar QR</span>
                </button>
                <button
                  onClick={() => setFullscreenQR(null)}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-sm font-bold shadow-sm transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
"""

with open('src/components/JudgeQRModal.tsx', 'w') as f:
    f.write(clean_modal)

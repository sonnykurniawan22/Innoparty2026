import { BrowserRouter, Routes, Route, Link, useSearchParams, useNavigate } from 'react-router';
import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CheckCircle2, ChevronRight, Loader2, Trophy, Settings, Brain, Lightbulb, Bot, Copy, Check, Lock, QrCode, Download, X } from 'lucide-react';
import QRCode from 'qrcode';

const QUIZ_BANK = [
  { question: "Negara mana yang memenangkan Piala Dunia 2022?", options: ["Prancis", "Argentina", "Brasil", "Kroasia"], answer: 1 },
  { question: "Siapakah pemain yang mendapat julukan 'La Pulga'?", options: ["Cristiano Ronaldo", "Neymar Jr", "Lionel Messi", "Kylian Mbappe"], answer: 2 },
  { question: "Negara mana yang paling banyak memenangkan gelar Piala Dunia?", options: ["Jerman", "Italia", "Brasil", "Argentina"], answer: 2 },
  { question: "Siapakah pencetak gol terbanyak sepanjang masa di Piala Dunia?", options: ["Pele", "Miroslav Klose", "Ronaldo Nazario", "Lionel Messi"], answer: 1 },
  { question: "Pada tahun berapa Piala Dunia pertama kali diadakan?", options: ["1920", "1926", "1930", "1934"], answer: 2 },
  { question: "Negara mana yang menjadi tuan rumah Piala Dunia 2018?", options: ["Rusia", "Qatar", "Brasil", "Afrika Selatan"], answer: 0 },
  { question: "Apa nama trofi Piala Dunia sebelum diganti menjadi FIFA World Cup Trophy?", options: ["Jules Rimet Trophy", "Stanley Cup", "Vince Lombardi Trophy", "Webb Ellis Cup"], answer: 0 },
  { question: "Negara mana yang menjadi juara Piala Dunia 2014?", options: ["Argentina", "Belanda", "Jerman", "Brasil"], answer: 2 },
  { question: "Siapa pemain termuda yang mencetak gol di final Piala Dunia?", options: ["Kylian Mbappe", "Pele", "Lionel Messi", "Diego Maradona"], answer: 1 },
  { question: "Negara manakah yang menjadi tuan rumah Piala Dunia pertama pada tahun 1930?", options: ["Uruguay", "Argentina", "Italia", "Brasil"], answer: 0 },
  { question: "Hewan apa yang menjadi maskot Piala Dunia 2010 di Afrika Selatan?", options: ["Singa", "Gajah", "Macan Tutul (Zakumi)", "Badak"], answer: 2 },
  { question: "Di negara manakah Piala Dunia 2002 diselenggarakan secara bersama-sama?", options: ["Jerman & Prancis", "Korea Selatan & Jepang", "AS & Meksiko", "Spanyol & Portugal"], answer: 1 },
  { question: "Siapa pelatih yang membawa Argentina juara Piala Dunia 2022?", options: ["Diego Maradona", "Jorge Sampaoli", "Lionel Scaloni", "Alejandro Sabella"], answer: 2 },
  { question: "Negara Asia mana yang pertama kali menembus semifinal Piala Dunia?", options: ["Jepang", "Arab Saudi", "Korea Selatan", "Iran"], answer: 2 },
  { question: "Tim mana yang mengalahkan Brasil 7-1 di semifinal Piala Dunia 2014?", options: ["Jerman", "Belanda", "Argentina", "Kolombia"], answer: 0 },
];

function PublicForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlCategory = searchParams.get('category');
  const initialCategory = urlCategory === 'SS' ? 'SS' : (urlCategory === 'QCC' ? 'QCC' : 'QCC');
  
  const [step, setStep] = useState<'quiz' | 'camera' | 'submitting' | 'success'>('quiz');
  const [quizQuestion, setQuizQuestion] = useState(() => QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)]);
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [nip, setNip] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "Inn0party2025!!!!!!!!") {
      navigate('/admin');
    } else {
      setAdminLoginError("Password salah!");
    }
  };

  const handleAnswer = (selectedIndex: number) => {
    if (selectedIndex === quizQuestion.answer) {
      setScore(1);
    } else {
      setScore(0);
    }
    setStep('camera');
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 400;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              setImageBlob(blob);
            }
          }, 'image/jpeg', 0.65);
        }
      };
    }
  }, [webcamRef]);

  const retakePhoto = () => {
    setImageBlob(null);
  };

  const submitData = async () => {
    if (!name || !imageBlob) return;
    
    setStep('submitting');
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('department', department);
      formData.append('nip', nip);
      formData.append('category', category);
      formData.append('image', imageBlob, 'selfie.jpg');
      
      const res = await fetch('/api/submit-attendance', {
        method: 'POST',
        body: formData,
      });
      
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(text.includes('not be found') || text.includes('404')
          ? 'API Backend tidak ditemukan. Jika di deploy ke Vercel, pastikan Express server sudah dikonfigurasi sebagai Serverless Function.'
          : 'Server mengembalikan respons yang tidak valid.');
      }

      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
      
      setStep('success');
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Gagal menyimpan data.');
      setStep('camera');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[600px] relative z-10">
        
        <div className="absolute top-4 right-4 z-20">
          <button onClick={() => { setShowAdminLogin(!showAdminLogin); setAdminLoginError(''); setAdminPassword(''); }} className="text-slate-400 hover:text-red-500 transition" title="Admin Login">
            <Lock className="w-5 h-5" />
          </button>
        </div>

        {showAdminLogin && (
          <div className="absolute top-14 right-4 z-30 bg-white shadow-xl border border-slate-100 rounded-xl p-4 w-64 animate-in fade-in slide-in-from-top-2">
            <form onSubmit={handleAdminLoginSubmit}>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Password Admin</label>
              <input 
                type="password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="********"
                autoFocus
              />
              {adminLoginError && <p className="text-xs text-red-500 mb-2">{adminLoginError}</p>}
              <button type="submit" className="w-full bg-red-600 text-white font-medium rounded-lg text-sm py-2 hover:bg-red-700 transition">
                Login
              </button>
            </form>
          </div>
        )}

        <div className="px-6 py-6 border-b border-slate-100 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
            <Brain className="w-8 h-8 text-blue-500" />
            <Bot className="w-8 h-8 text-red-600 ml-2" />
          </div>
          <h1 className="text-2xl font-display font-black text-red-700 tracking-tight uppercase">
            Innoparty 2026
          </h1>
        </div>

        <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'quiz' && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col h-full"
              >
                <div className="mb-8">
                  <div className="flex justify-between text-sm font-medium text-slate-600 mb-3">
                    <span className="uppercase tracking-wider text-xs font-semibold text-red-600">Trivia</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-full transition-all duration-300 w-1/2 shadow-[0_0_10px_rgba(220,38,38,0.3)]" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-display font-semibold mb-8 flex-1 leading-relaxed text-slate-900">
                  {quizQuestion.question}
                </h3>

                <div className="space-y-3">
                  {quizQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className="w-full text-left px-5 py-4 rounded-2xl border border-slate-200 bg-white hover:border-red-500/50 hover:bg-slate-50 transition-all font-medium text-slate-700 hover:text-slate-900 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative z-10">{opt}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'camera' && (
              <motion.div 
                key="camera"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col h-full"
              >
                <div className="text-center mb-6">
                  {score === 1 ? (
                    <p className="text-green-600 bg-green-50 px-3 py-2 rounded-xl inline-flex items-center justify-center gap-1.5 font-medium border border-green-200 shadow-sm mx-auto">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Jawaban Benar!</span>
                    </p>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 shadow-sm flex flex-col items-center gap-1 max-w-sm mx-auto">
                      <span className="text-xs font-semibold uppercase tracking-wider text-red-500">Jawaban Kurang Tepat</span>
                      <p className="text-xs font-medium">
                        Jawaban yang benar: <span className="font-bold underline text-red-800">{quizQuestion.options[quizQuestion.answer]}</span>
                      </p>
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-900/30 text-red-400 text-sm rounded-xl border border-red-900/50 text-center">
                    {submitError}
                  </div>
                )}

                <div className="space-y-5 flex-1 flex flex-col">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2 uppercase tracking-wider text-xs">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama kamu..."
                      className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2 uppercase tracking-wider text-xs">Department</label>
                    <input 
                      type="text" 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Masukkan department kamu..."
                      className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2 uppercase tracking-wider text-xs">NIP</label>
                    <input 
                      type="text" 
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      placeholder="Masukkan NIP kamu..."
                      className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                    />
                  </div>



                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-slate-600 mb-2 uppercase tracking-wider text-xs">Foto Selfie (Live Camera)</label>
                    <div className="flex-1 relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center min-h-[280px] shadow-inner">
                      {!imageBlob ? (
                        <>
                          {/* @ts-ignore */}
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            screenshotQuality={0.5}
                            videoConstraints={{ width: 320, height: 240, facingMode: "user" }}
                            onUserMedia={() => setIsCameraReady(true)}
                            onUserMediaError={(err: any) => setCameraError(err.message || 'Gagal mengakses kamera')}
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                          />
                          {cameraError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 p-6 text-center z-10 backdrop-blur-sm">
                              <Camera className="w-10 h-10 text-red-400 mb-3" />
                              <p className="text-sm text-red-300 font-medium">{cameraError}</p>
                              <p className="text-xs text-slate-600 mt-2">Kamera diperlukan untuk absensi ini. Pastikan memberikan izin kamera pada browser Anda.</p>
                            </div>
                          ) : !isCameraReady ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                          ) : (
                            <button 
                              onClick={capturePhoto}
                              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-red-600 text-white rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105 hover:bg-red-500 transition-all flex items-center justify-center z-20"
                            >
                              <Camera className="w-7 h-7" />
                            </button>
                          )}
                          
                          {/* Camera overlay UI */}
                          {isCameraReady && (
                            <div className="absolute inset-0 pointer-events-none border-[3px] border-white/10 rounded-2xl m-4" />
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 w-full h-full relative group">
                          <img src={URL.createObjectURL(imageBlob)} alt="Selfie" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <button 
                              onClick={retakePhoto}
                              className="bg-white/10 border border-white/20 text-slate-900 px-5 py-2.5 rounded-full text-sm font-medium shadow-lg hover:bg-white/20 transition-all"
                            >
                              Ulangi Foto
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={submitData}
                  disabled={!name || !department || !nip || !imageBlob}
                  className="mt-6 w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  Kirim Absensi <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 'submitting' && (
              <motion.div 
                key="submitting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl animate-pulse" />
                  <Loader2 className="w-16 h-16 text-red-600 animate-spin relative z-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Menyimpan Data...</h3>
                  <p className="text-sm text-slate-600">Mengunggah absensi ke Google Sheets</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center relative z-10 shadow-xl shadow-green-500/30">
                    <CheckCircle2 className="w-12 h-12 text-slate-900" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-4xl font-display font-bold text-slate-900 mb-2 tracking-tight">Sukses!</h3>
                  <p className="text-slate-700">Terima kasih <span className="text-red-600 font-semibold">{name}</span></p>
                  <p className="text-slate-600 text-sm mt-1">Data absensimu telah tercatat.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AdminPanel() {
  const [copiedQCC, setCopiedQCC] = useState(false);
  const [copiedSS, setCopiedSS] = useState(false);
  const [copiedGeneral, setCopiedGeneral] = useState(false);

  const [activeQR, setActiveQR] = useState<{ url: string; label: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const copyLink = (category: string) => {
    const link = category === 'Umum' ? window.location.origin : `${window.location.origin}/?category=${category}`;
    navigator.clipboard.writeText(link);
    if (category === 'QCC') {
      setCopiedQCC(true);
      setTimeout(() => setCopiedQCC(false), 2000);
    } else if (category === 'SS') {
      setCopiedSS(true);
      setTimeout(() => setCopiedSS(false), 2000);
    } else {
      setCopiedGeneral(true);
      setTimeout(() => setCopiedGeneral(false), 2000);
    }
  };

  const showQR = async (label: string, url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrDataUrl(dataUrl);
      setActiveQR({ url, label });
    } catch (err) {
      console.error('Error generating QR Code:', err);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl || !activeQR) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Absensi-Innoparty-${activeQR.label}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
        <h2 className="text-3xl font-display font-bold mb-6 text-slate-900 tracking-tight">Pengaturan Admin</h2>
        
        <div className="text-left bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-slate-600 space-y-4 mb-8 shadow-inner">
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Link & QR Absensi</h3>
            <div className="space-y-3">
              {/* QCC */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="font-medium text-slate-900">Kategori: QCC</div>
                  <div className="text-xs text-slate-500 font-mono truncate">{window.location.origin}/?category=QCC</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button 
                    onClick={() => copyLink('QCC')}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Salin Link QCC"
                  >
                    {copiedQCC ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  </button>
                  <button 
                    onClick={() => showQR('QCC', `${window.location.origin}/?category=QCC`)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
                    title="Tampilkan QR Code QCC"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SS */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="font-medium text-slate-900">Kategori: SS</div>
                  <div className="text-xs text-slate-500 font-mono truncate">{window.location.origin}/?category=SS</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button 
                    onClick={() => copyLink('SS')}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Salin Link SS"
                  >
                    {copiedSS ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  </button>
                  <button 
                    onClick={() => showQR('SS', `${window.location.origin}/?category=SS`)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
                    title="Tampilkan QR Code SS"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Umum */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="font-medium text-slate-900">Link Umum (Pilih Sendiri)</div>
                  <div className="text-xs text-slate-500 font-mono truncate">{window.location.origin}</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button 
                    onClick={() => copyLink('Umum')}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Salin Link Umum"
                  >
                    {copiedGeneral ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  </button>
                  <button 
                    onClick={() => showQR('Umum', window.location.origin)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
                    title="Tampilkan QR Code Umum"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Bagikan link atau QR Code di atas untuk mengarahkan pengguna ke form absensi. Penggunaan link kategori terkunci meminimalisir kesalahan input kategori.
            </p>
          </div>
        </div>

        <div className="text-left bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-slate-600 space-y-3 mb-8 shadow-inner overflow-y-auto max-h-[25vh]">
          <p>Aplikasi menggunakan <strong>Google Cloud Service Account</strong> untuk menyimpan data.</p>
          <div className="mt-4">
            <p className="font-semibold text-slate-700 mb-2">1. Isi Secrets di Settings:</p>
            <ul className="space-y-2 font-mono text-xs text-red-600 bg-white p-4 rounded-xl border border-slate-100">
              <li>GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
              <li>GOOGLE_PRIVATE_KEY</li>
              <li>GOOGLE_SPREADSHEET_ID</li>
              <li className="text-slate-500">GOOGLE_DRIVE_FOLDER_ID (opsional)</li>
            </ul>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <p className="font-semibold text-slate-700 text-sm">2. Wajib dilakukan di Google Cloud Console:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Aktifkan <strong>Google Sheets API</strong> dan <strong>Google Drive API</strong>.</li>
            </ul>
            <p className="font-semibold text-slate-700 text-sm mt-3">3. Wajib dilakukan di Google Sheets & Drive:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Buka file Spreadsheet kamu.</li>
              <li>Klik tombol <strong>Share (Bagikan)</strong>.</li>
              <li>Masukkan email <strong>Service Account</strong> kamu (contoh: xxx@yyy.iam.gserviceaccount.com) dan berikan akses sebagai <strong>Editor</strong>.</li>
            </ul>
          </div>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 font-medium transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Kembali ke Form Absensi
        </Link>
      </div>

      {/* QR Code Preview Modal */}
      <AnimatePresence>
        {activeQR && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-slate-100 relative text-center"
            >
              <button 
                onClick={() => setActiveQR(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-1">QR Code Absensi</h3>
              <span className="px-3 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-full border border-red-100 inline-block mb-4">
                Kategori: {activeQR.label}
              </span>

              <div className="bg-white p-2 border-4 border-black mb-4 inline-block rounded-none shadow-md">
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code Absensi ${activeQR.label}`}
                  className="w-48 h-48 mx-auto rounded-none bg-white"
                />
              </div>

              <p className="text-xs text-slate-500 break-all mb-5 font-mono max-w-[280px] mx-auto bg-slate-50 p-2 rounded-lg border border-slate-100">
                {activeQR.url}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveQR(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm"
                >
                  Tutup
                </button>
                <button
                  onClick={downloadQR}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-all shadow-md shadow-red-200 hover:shadow-lg inline-flex items-center justify-center gap-1.5 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh QR</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicForm />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

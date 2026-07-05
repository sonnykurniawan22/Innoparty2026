import { BrowserRouter, Routes, Route, Link } from 'react-router';
import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CheckCircle2, ChevronRight, Loader2, Trophy, Settings } from 'lucide-react';

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
  const [step, setStep] = useState<'quiz' | 'camera' | 'submitting' | 'success'>('quiz');
  const [quizQuestion, setQuizQuestion] = useState(() => QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)]);
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [nip, setNip] = useState('');
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => setImageBlob(blob));
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
      formData.append('score', `${score} / 1`);
      formData.append('image', imageBlob, 'selfie.jpg');
      
      const res = await fetch('/api/submit-attendance', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
      
      setStep('success');
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Gagal menyimpan data.');
      setStep('camera');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[600px] relative z-10">
        <div className="absolute top-4 right-4 z-20">
          <Link to="/admin" className="text-slate-500 hover:text-yellow-400 transition">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
        
        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h1 className="text-xl font-display font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent tracking-tight">
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
                  <div className="flex justify-between text-sm font-medium text-slate-400 mb-3">
                    <span className="uppercase tracking-wider text-xs font-semibold text-yellow-500">Trivia</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full transition-all duration-300 w-1/2 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-display font-semibold mb-8 flex-1 leading-relaxed text-slate-200">
                  {quizQuestion.question}
                </h3>

                <div className="space-y-3">
                  {quizQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className="w-full text-left px-5 py-4 rounded-2xl border border-slate-700 bg-slate-800/50 hover:border-yellow-500/50 hover:bg-slate-800 transition-all font-medium text-slate-300 hover:text-white group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  <h3 className="text-3xl font-display font-bold mb-2 text-white tracking-tight">Isi Data Diri</h3>
                  <p className="text-slate-400 text-sm">
                    {score === 1 ? (
                      <span className="text-green-400 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Jawaban Benar!</span>
                    ) : (
                      <span className="text-slate-400">Trivia Selesai</span>
                    )}
                  </p>
                </div>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-900/30 text-red-400 text-sm rounded-xl border border-red-900/50 text-center">
                    {submitError}
                  </div>
                )}

                <div className="space-y-5 flex-1 flex flex-col">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider text-xs">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama kamu..."
                      className="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider text-xs">Department</label>
                    <input 
                      type="text" 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Masukkan department kamu..."
                      className="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider text-xs">NIP</label>
                    <input 
                      type="text" 
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      placeholder="Masukkan NIP kamu..."
                      className="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider text-xs">Foto Selfie (Live Camera)</label>
                    <div className="flex-1 relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center min-h-[280px] shadow-inner">
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-6 text-center z-10 backdrop-blur-sm">
                              <Camera className="w-10 h-10 text-red-400 mb-3" />
                              <p className="text-sm text-red-300 font-medium">{cameraError}</p>
                              <p className="text-xs text-slate-400 mt-2">Kamera diperlukan untuk absensi ini. Pastikan memberikan izin kamera pada browser Anda.</p>
                            </div>
                          ) : !isCameraReady ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                            </div>
                          ) : (
                            <button 
                              onClick={capturePhoto}
                              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-yellow-400 text-slate-900 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:scale-105 hover:bg-yellow-300 transition-all flex items-center justify-center z-20"
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
                              className="bg-white/10 border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg hover:bg-white/20 transition-all"
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
                  className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-900 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 disabled:shadow-none flex items-center justify-center gap-2"
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
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
                  <Loader2 className="w-16 h-16 text-yellow-400 animate-spin relative z-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Menyimpan Data...</h3>
                  <p className="text-sm text-slate-400">Mengunggah absensi ke Google Sheets</p>
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
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Sukses!</h3>
                  <p className="text-slate-300">Terima kasih <span className="text-yellow-400 font-semibold">{name}</span></p>
                  <p className="text-slate-400 text-sm mt-1">Data absensimu telah tercatat.</p>
                </div>
                
                <button 
                  onClick={() => {
                    setStep('quiz');
                    setQuizQuestion(QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)]);
                    setName('');
                    setImageBlob(null);
                    setScore(0);
                  }}
                  className="mt-8 px-8 py-3 border border-slate-700 rounded-2xl text-slate-300 font-medium hover:bg-slate-800 hover:text-white transition-all"
                >
                  Kembali
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AdminPanel() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
        <h2 className="text-3xl font-display font-bold mb-6 text-white tracking-tight">Pengaturan Admin</h2>
        <div className="text-left bg-slate-950 p-5 rounded-2xl border border-slate-800 text-sm text-slate-400 space-y-3 mb-8 shadow-inner overflow-y-auto max-h-[60vh]">
          <p>Aplikasi menggunakan <strong>Google Cloud Service Account</strong> untuk menyimpan data.</p>
          <div className="mt-4">
            <p className="font-semibold text-slate-300 mb-2">1. Isi Secrets di Settings:</p>
            <ul className="space-y-2 font-mono text-xs text-yellow-400 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <li>GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
              <li>GOOGLE_PRIVATE_KEY</li>
              <li>GOOGLE_SPREADSHEET_ID</li>
              <li className="text-slate-500">GOOGLE_DRIVE_FOLDER_ID (opsional)</li>
            </ul>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <p className="font-semibold text-slate-300 text-sm">2. Wajib dilakukan di Google Cloud Console:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Aktifkan <strong>Google Sheets API</strong> dan <strong>Google Drive API</strong>.</li>
            </ul>
            <p className="font-semibold text-slate-300 text-sm mt-3">3. Wajib dilakukan di Google Sheets & Drive:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Buka file Spreadsheet kamu.</li>
              <li>Klik tombol <strong>Share (Bagikan)</strong>.</li>
              <li>Masukkan email <strong>Service Account</strong> kamu (contoh: xxx@yyy.iam.gserviceaccount.com) dan berikan akses sebagai <strong>Editor</strong>.</li>
            </ul>
          </div>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Kembali ke Form Absensi
        </Link>
      </div>
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

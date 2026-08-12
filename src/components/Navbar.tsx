import React from 'react';
import { Trophy, Award, Users, QrCode, Settings, ShieldCheck, FileText } from 'lucide-react';

interface NavbarProps {
  activeTab: 'podium' | 'scoring' | 'master' | 'masterScores' | 'qr' | 'admin';
  setActiveTab: (tab: 'podium' | 'scoring' | 'master' | 'masterScores' | 'qr' | 'admin') => void;
  activeJudgeId: number | null;
  juri3Revealed: boolean;
  onExitJudgeMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeJudgeId,
  juri3Revealed,
  onExitJudgeMode
}) => {
  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group py-2" 
            onClick={() => {
              if (!activeJudgeId) setActiveTab('podium');
            }}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-200 group-hover:scale-105 transition-transform overflow-hidden p-1">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                  Innoparty 2026
                </span>
                {activeJudgeId && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded flex items-center gap-1 font-extrabold animate-pulse">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    MODE JURI {activeJudgeId} (RESTRICTED)
                  </span>
                )}
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 mt-0.5">
                IDEA INNOVATION IMPACT
              </h1>
            </div>
          </div>

          {/* If Active Judge Mode -> Hide Navigation Menu completely */}
          {activeJudgeId ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>Form Penilaian Khusus Juri {activeJudgeId}</span>
              </div>
              {onExitJudgeMode && (
                <button
                  type="button"
                  onClick={onExitJudgeMode}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
                  title="Kembali ke tampilan utama"
                >
                  Mode Publik
                </button>
              )}
            </div>
          ) : (
            /* Standard Admin / Committee Navigation Tabs */
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              <button
                onClick={() => setActiveTab('podium')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  activeTab === 'podium'
                    ? 'bg-red-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Klasemen & Podium</span>
              </button>

              <button
                onClick={() => setActiveTab('scoring')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  activeTab === 'scoring'
                    ? 'bg-red-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Form Penilaian</span>
              </button>

              <button
                onClick={() => setActiveTab('master')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  activeTab === 'master'
                    ? 'bg-red-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Master Peserta</span>
              </button>

              <button
                onClick={() => setActiveTab('masterScores')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  activeTab === 'masterScores'
                    ? 'bg-red-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Master Penilaian</span>
              </button>

              <button
                onClick={() => setActiveTab('qr')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  activeTab === 'qr'
                    ? 'bg-red-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Link Juri</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  activeTab === 'admin'
                    ? 'bg-red-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Kontrol VAR</span>
                {juri3Revealed && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            </nav>
          )}

        </div>

        {/* Mobile Navigation Tabs (Hidden when activeJudgeId is present) */}
        {!activeJudgeId && (
          <div className="flex md:hidden overflow-x-auto py-2.5 space-x-2 border-t border-slate-200 no-scrollbar -mx-4 px-4 bg-white/95 backdrop-blur">
            <button
              onClick={() => setActiveTab('podium')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] active:scale-95 transition-transform ${
                activeTab === 'podium' ? 'bg-red-600 text-white font-black' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span>Klasemen</span>
            </button>
            <button
              onClick={() => setActiveTab('scoring')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] active:scale-95 transition-transform ${
                activeTab === 'scoring' ? 'bg-red-600 text-white font-black' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>Penilaian</span>
            </button>
            <button
              onClick={() => setActiveTab('master')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] active:scale-95 transition-transform ${
                activeTab === 'master' ? 'bg-red-600 text-white font-black' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Peserta</span>
            </button>
            <button
              onClick={() => setActiveTab('masterScores')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] active:scale-95 transition-transform ${
                activeTab === 'masterScores' ? 'bg-red-600 text-white font-black' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Rekap Skor</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] active:scale-95 transition-transform ${
                activeTab === 'qr' ? 'bg-red-600 text-white font-black' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>QR Code</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] active:scale-95 transition-transform ${
                activeTab === 'admin' ? 'bg-red-600 text-white font-black' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>VAR</span>
              {juri3Revealed && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>
        )}

      </div>
    </header>
  );
};


import React from 'react';
import { Trophy, Award, Users, QrCode, Settings, ShieldCheck, LogOut, Heart } from 'lucide-react';

interface NavbarProps {
  activeTab: 'podium' | 'scoring' | 'master' | 'qr' | 'admin' | 'vote';
  setActiveTab: (tab: 'podium' | 'scoring' | 'master' | 'qr' | 'admin' | 'vote') => void;
  activeJudgeId: number | null;
  juri3Revealed: boolean;
  isAdminLoggedIn?: boolean;
  onAdminLogout?: () => void;
  onExitJudgeMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeJudgeId,
  juri3Revealed,
  isAdminLoggedIn,
  onAdminLogout,
  onExitJudgeMode
}) => {
  return (
    <header className="bg-white/98 backdrop-blur-md text-slate-900 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo & Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group py-2"
            onClick={() => {
              if (!activeJudgeId) setActiveTab('podium');
            }}
          >
            <div className="h-12 sm:h-14 shrink-0 group-hover:scale-105 transition-transform origin-left">
              <img src="/logo-idea-v3.png" alt="Idea Innovation Impact" className="h-full w-auto object-contain mix-blend-multiply" />
            </div>
            <div className="flex flex-col justify-center ml-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1E40AF] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE] font-mono shadow-sm hidden sm:inline-block">
                  Innoparty 2026
                </span>
                {activeJudgeId && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1E40AF] bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-extrabold animate-pulse shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span className="hidden sm:inline">MODE JURI</span> {activeJudgeId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* If Active Judge Mode -> Hide Navigation Menu completely */}
          {activeJudgeId ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#EFF6FF] text-[#1E40AF] rounded-xl border border-[#BFDBFE] text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping shrink-0" />
                <span>Form Penilaian Khusus Juri {activeJudgeId}</span>
              </div>
            </div>
          ) : (
            /* Standard Admin / Committee Navigation Tabs */
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              <button
                onClick={() => setActiveTab('podium')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${activeTab === 'podium'
                  ? 'bg-slate-900 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Klasemen & Podium</span>
              </button>

              <button
                onClick={() => setActiveTab('master')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${activeTab === 'master'
                  ? 'bg-slate-900 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Users className="w-4 h-4" />
                <span>Master Peserta</span>
              </button>

              <button
                onClick={() => setActiveTab('qr')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${activeTab === 'qr'
                  ? 'bg-slate-900 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code Public</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Settings className="w-4 h-4" />
                <span>Kontrol VAR</span>
                {juri3Revealed && (
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                )}
              </button>

              {isAdminLoggedIn && onAdminLogout && (
                <button
                  onClick={onAdminLogout}
                  title="Keluar dari Portal Admin"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#DC2626] hover:bg-red-50 hover:text-red-700 transition-colors ml-2 border border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Keluar</span>
                </button>
              )}
            </nav>
          )}

        </div>

        {/* Mobile Navigation Tabs (Hidden when activeJudgeId is present) */}
        {!activeJudgeId && (
          <div className="flex md:hidden overflow-x-auto py-2.5 space-x-2 border-t border-slate-200 no-scrollbar -mx-4 px-4 bg-white/95 backdrop-blur">
            <button
              onClick={() => setActiveTab('podium')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] active:scale-95 transition-transform ${activeTab === 'podium' ? 'bg-slate-900 text-white font-black' : 'bg-slate-100 text-slate-500'
                }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span>Klasemen</span>
            </button>
            <button
              onClick={() => setActiveTab('master')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] active:scale-95 transition-transform ${activeTab === 'master' ? 'bg-slate-900 text-white font-black' : 'bg-slate-100 text-slate-500'
                }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Peserta</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] active:scale-95 transition-transform ${activeTab === 'qr' ? 'bg-slate-900 text-white font-black' : 'bg-slate-100 text-slate-500'
                }`}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>QR Code Public</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] active:scale-95 transition-transform ${activeTab === 'admin' ? 'bg-slate-900 text-white font-black' : 'bg-slate-100 text-slate-500'
                }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>VAR</span>
              {juri3Revealed && (
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              )}
            </button>

            {isAdminLoggedIn && onAdminLogout && (
              <button
                onClick={onAdminLogout}
                className="whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[40px] bg-red-50 text-[#DC2626] border border-red-200 active:scale-95 transition-transform"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* Elegant Gold Gradient Accent Line */}
      <div className="w-full h-[3px] wc-gold-line" />
    </header>
  );
};


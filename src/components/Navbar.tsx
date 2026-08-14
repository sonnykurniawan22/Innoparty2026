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
    <header className="sticky top-0 z-40 shadow-xl" style={{ background: 'linear-gradient(135deg, #0A1F5C 0%, #0B3D9B 60%, #0A2A7A 100%)' }}>

      {/* Logo + Nav row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group py-2"
            onClick={() => {
              if (!activeJudgeId) setActiveTab('podium');
            }}
          >
            {/* Idea Innovation Impact logo (Transparent & Large) */}
            <div className="h-12 sm:h-14 md:h-16 shrink-0 group-hover:scale-105 transition-transform origin-left flex items-center">
              <img
                src="/logo-idea-clean.png"
                alt="Idea Innovation Impact"
                className="h-full w-auto object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
              />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-12 shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }} />

            {/* INNOPARTY 2026 — FIFA26 White on Navy */}
            <div
              className="hidden sm:flex flex-col items-center justify-center select-none"
              style={{ fontFamily: 'FIFA26, sans-serif' }}
            >
              {/* INNOPARTY — single impactful word */}
              <span
                style={{
                  fontSize: '28px',
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  textShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  lineHeight: 1
                }}
              >
                INNOPARTY
              </span>
              {/* 2026 premium red badge row */}
              <div className="flex items-center gap-2 mt-0.5 w-full">
                <div className="flex-1 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #E8D48B)' }} />
                <span
                  className="px-2.5 py-0.5 rounded shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #E51426, #B30F1D)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    lineHeight: 1.1,
                  }}
                >
                  2026
                </span>
                <div className="flex-1 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #E8D48B, transparent)' }} />
              </div>
            </div>

            {/* Mobile compact */}
            <div
              className="flex sm:hidden flex-col items-start justify-center select-none"
              style={{ fontFamily: 'FIFA26, sans-serif', lineHeight: 1 }}
            >
              <span style={{ fontSize: '20px', color: '#FFFFFF' }}>INNOPARTY</span>
              <span style={{ fontSize: '9px', color: '#E8D48B', letterSpacing: '0.1em' }}>2026</span>
            </div>

            {activeJudgeId && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 font-extrabold animate-pulse shadow-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">MODE JURI</span> {activeJudgeId}
              </span>
            )}
          </div>

          {/* If Active Judge Mode → Hide Navigation Menu completely */}
          {activeJudgeId ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold font-mono" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)' }}>
                <span className="w-2 h-2 rounded-full animate-ping shrink-0" style={{ background: '#8DC63F' }} />
                <span>Form Penilaian Khusus Juri {activeJudgeId}</span>
              </div>
            </div>
          ) : (
            /* Standard Admin / Committee Navigation Tabs */
            <nav className="hidden md:flex items-center space-x-1 p-1.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <button
                onClick={() => setActiveTab('podium')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${activeTab === 'podium'
                  ? 'text-white shadow-md font-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                style={activeTab === 'podium' ? { background: '#E51426', boxShadow: '0 4px 12px rgba(229,20,38,0.35)' } : {}}
              >
                <Trophy className="w-4 h-4" />
                <span>Klasemen &amp; Podium</span>
              </button>

              <button
                onClick={() => setActiveTab('master')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${activeTab === 'master'
                  ? 'text-white shadow-md font-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                style={activeTab === 'master' ? { background: '#E51426', boxShadow: '0 4px 12px rgba(229,20,38,0.35)' } : {}}
              >
                <Users className="w-4 h-4" />
                <span>Master Peserta</span>
              </button>

              <button
                onClick={() => setActiveTab('qr')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${activeTab === 'qr'
                  ? 'text-white shadow-md font-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                style={activeTab === 'qr' ? { background: '#E51426', boxShadow: '0 4px 12px rgba(229,20,38,0.35)' } : {}}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code Public</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${activeTab === 'admin'
                  ? 'text-white shadow-md font-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                style={activeTab === 'admin' ? { background: '#E51426', boxShadow: '0 4px 12px rgba(229,20,38,0.35)' } : {}}
              >
                <Settings className="w-4 h-4" />
                <span>Kontrol VAR</span>
                {juri3Revealed && (
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#8DC63F' }} />
                )}
              </button>

              {isAdminLoggedIn && onAdminLogout && (
                <button
                  onClick={onAdminLogout}
                  title="Keluar dari Portal Admin"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ml-2"
                  style={{ color: '#FCA5A5', border: '1px solid rgba(252,165,165,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(229,20,38,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Keluar</span>
                </button>
              )}
            </nav>
          )}

        </div>

        {/* Mobile Navigation Tabs */}
        {!activeJudgeId && (
          <div className="flex md:hidden overflow-x-auto py-2 space-x-2 no-scrollbar -mx-4 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setActiveTab('podium')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[38px] active:scale-95 transition-all ${activeTab === 'podium'
                ? 'text-white font-black shadow-md'
                : 'text-white/60'
                }`}
              style={activeTab === 'podium' ? { background: '#E51426', boxShadow: '0 4px 10px rgba(229,20,38,0.4)' } : { background: 'rgba(255,255,255,0.08)' }}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span>Klasemen</span>
            </button>
            <button
              onClick={() => setActiveTab('master')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[38px] active:scale-95 transition-all ${activeTab === 'master'
                ? 'text-white font-black shadow-md'
                : 'text-white/60'
                }`}
              style={activeTab === 'master' ? { background: '#E51426', boxShadow: '0 4px 10px rgba(229,20,38,0.4)' } : { background: 'rgba(255,255,255,0.08)' }}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Peserta</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[38px] active:scale-95 transition-all ${activeTab === 'qr'
                ? 'text-white font-black shadow-md'
                : 'text-white/60'
                }`}
              style={activeTab === 'qr' ? { background: '#E51426', boxShadow: '0 4px 10px rgba(229,20,38,0.4)' } : { background: 'rgba(255,255,255,0.08)' }}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>QR Code</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[38px] active:scale-95 transition-all ${activeTab === 'admin'
                ? 'text-white font-black shadow-md'
                : 'text-white/60'
                }`}
              style={activeTab === 'admin' ? { background: '#E51426', boxShadow: '0 4px 10px rgba(229,20,38,0.4)' } : { background: 'rgba(255,255,255,0.08)' }}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>VAR</span>
              {juri3Revealed && (
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#8DC63F' }} />
              )}
            </button>

            {isAdminLoggedIn && onAdminLogout && (
              <button
                onClick={onAdminLogout}
                className="whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 min-h-[38px] active:scale-95 transition-transform"
                style={{ background: 'rgba(229,20,38,0.15)', color: '#FCA5A5', border: '1px solid rgba(229,20,38,0.25)' }}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* WC 4-colour stripe at very bottom of header */}
      <div className="navbar-wc-stripe w-full" />
    </header>
  );
};

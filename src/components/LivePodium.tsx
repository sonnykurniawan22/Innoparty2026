import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LeaderboardEntry, LevelCategory, ContestSettings } from '../types';
import { isJuri3RevealedForCategory, getParticipantCategoryKey, getProxyImageUrl } from '../lib/contestService';
import { Trophy, Medal, Lock, Unlock, ShieldAlert, Sparkles, Star, Flame, Eye, EyeOff, Layers } from 'lucide-react';
import Confetti from './Confetti';

interface LivePodiumProps {
  leaderboard: LeaderboardEntry[];
  juri3Revealed: boolean;
  settings?: ContestSettings;
  activeCategoryFilter: string;
  setActiveCategoryFilter: (cat: string) => void;
}

export const LivePodium: React.FC<LivePodiumProps> = ({
  leaderboard,
  juri3Revealed,
  settings,
  activeCategoryFilter,
  setActiveCategoryFilter,
}) => {
  // Filter leaderboard based on category filter
  const filteredLeaderboard = leaderboard.filter((item) => {
    if (activeCategoryFilter === 'ALL') {
      return true;
    }
    if (activeCategoryFilter === 'QCC-Leading' || activeCategoryFilter === 'Leading') {
      return item.participant.stream === 'QCC' && item.participant.levelCategory === 'Leading';
    }
    if (activeCategoryFilter === 'SS') {
      return item.participant.stream === 'SS';
    }
    // Default is QCC Rising
    return item.participant.stream === 'QCC' && item.participant.levelCategory === 'Rising';
  });

  const getCategoryTitle = (cat: string) => {
    if (cat === 'SS') return 'SS';
    if (cat === 'QCC-Leading' || cat === 'Leading') return 'QCC LEADING CLASS';
    return 'QCC RISING CLASS';
  };

  const getCategoryBadge = (p: { stream: string; levelCategory: string }) => {
    if (p.stream === 'SS') return 'SS';
    return `QCC • ${p.levelCategory} Class`;
  };

  // Re-rank after filtering
  const rankedData = filteredLeaderboard.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  const rank1 = rankedData[0];
  const rank2 = rankedData[1];
  const rank3 = rankedData[2];

  return (

    <div className="space-y-6 pb-12 w-full">
      
      {/* Unified Competition Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header Section with Integrated Mascot Branding */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50/60 to-white">
          <div className="flex items-center gap-3.5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF] text-[9px] font-black uppercase tracking-widest font-mono border border-[#BFDBFE]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                  Innoparty 2026 • Live Standings
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
                <span>Top 3 Podium Champions</span>
                <span className="text-xs font-bold text-[#1E40AF] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#BFDBFE] font-mono">
                  {getCategoryTitle(activeCategoryFilter)}
                </span>
              </h2>
            </div>
          </div>

          {/* Level Class Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 flex-wrap gap-1">
            <button
              onClick={() => setActiveCategoryFilter('QCC-Rising')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeCategoryFilter === 'QCC-Rising' || activeCategoryFilter === 'Rising'
                  ? 'bg-slate-900 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>QCC Rising</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('QCC-Leading')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeCategoryFilter === 'QCC-Leading' || activeCategoryFilter === 'Leading'
                  ? 'bg-slate-900 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>QCC Leading</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('SS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeCategoryFilter === 'SS'
                  ? 'bg-slate-900 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>SS</span>
            </button>
          </div>
        </div>

        {/* Podium Section */}
        {rankedData.length > 0 && (
          <div className="p-6 md:p-10 relative overflow-hidden bg-gradient-to-b from-white via-[#FDFBF5] to-white">
            {/* Subtle Warm Gold Decorative Blurs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#2563EB]/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#BFDBFE]/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
            
            {/* Confetti Effect */}
            <Confetti />

            {/* Left Mascot (Framing the Podium - Top) */}
            <div className="hidden lg:block absolute top-4 left-6 w-36 h-36 z-30 pointer-events-none drop-shadow-xl hover:scale-110 transition-transform duration-500 origin-top">
              <img src="/mascot-kick.png" alt="Mascot Wave" className="w-full h-full object-contain animate-mascot-wave" />
            </div>

            {/* Right Mascot (Framing the Podium - Top) */}
            <div className="hidden lg:block absolute top-4 right-6 w-36 h-36 z-30 pointer-events-none drop-shadow-xl hover:scale-110 transition-transform duration-500 origin-top">
              <img src="/mascot-kick.png" alt="Mascot Champion" className="w-full h-full object-contain animate-mascot-float -scale-x-100" />
            </div>

            <div className="flex flex-col md:flex-row justify-center items-end gap-12 md:gap-8 h-auto md:h-[480px] pt-16 md:pt-24 pb-8 relative z-20">
              
              {/* Runner Up (Juara 2 - Silver) */}
              <div className="podium-card w-full md:w-[30%] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center relative pb-6 pt-14 order-2 md:order-1 h-auto md:h-[85%] z-10 mt-12 md:mt-0 hover:border-slate-300 hover:shadow-md">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                  <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white flex items-center justify-center shadow-md relative overflow-hidden ring-2 ring-slate-200">
                    <img className="w-full h-full object-cover" src={getProxyImageUrl(rank2?.participant.photoUrl || "https://drive.google.com/uc?export=view&id=1Ul03BhQkZaAwqEsCbO1UmQ_xmcXp5B8i")} referrerPolicy="no-referrer" alt="Juara 2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="absolute -bottom-2 w-7 h-7 bg-[#94A3B8] border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[11px] font-black text-white font-mono">2</span>
                  </div>
                </div>
                
                {rank2 ? (
                  <>
                    <div className="px-4 text-center mt-4 flex flex-col items-center w-full">
                      <div className="bg-slate-100 text-slate-600 px-3.5 py-1 rounded-full text-[10px] font-black mb-2 uppercase tracking-widest border border-slate-200 font-mono">
                        RUNNER UP (JUARA 2)
                      </div>
                      <span className="inline-block px-2.5 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-md mb-2 tracking-wider uppercase border border-slate-200 font-mono">{getCategoryBadge(rank2.participant)}</span>
                      <h3 className="text-headline-md font-bold text-slate-900 mt-1 mb-4 text-center font-display">{rank2.participant.name}</h3>
                    </div>
                    <div className="w-full mt-auto pt-5 border-t border-slate-100 text-center bg-slate-50/60 rounded-b-2xl flex flex-col justify-center min-h-[80px]">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Total Skor</p>
                      <p className="text-headline-xl font-black text-slate-800 font-display">{rank2.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400 mt-6 font-medium">Belum Ada Juara 2</div>
                )}
              </div>

              {/* Champion (Juara 1 - Championship Gold 🏆) */}
              <div className="podium-card champion-card w-full md:w-[35%] bg-white rounded-2xl border-2 border-[#2563EB] ring-4 ring-[#2563EB]/15 flex flex-col items-center relative pb-6 pt-16 order-1 md:order-2 h-auto md:h-full z-20 mt-16 md:mt-0">
                
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                  <div className="w-28 h-28 rounded-full bg-[#EFF6FF] border-4 border-white flex items-center justify-center shadow-lg relative overflow-hidden ring-4 ring-[#2563EB]/30">
                    <img className="w-full h-full object-cover scale-110" src={getProxyImageUrl(rank1?.participant.photoUrl || "https://drive.google.com/uc?export=view&id=1Nqk3jCqgImxHr2HfZb4NvWqofBO7N0AK")} referrerPolicy="no-referrer" alt="Juara 1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="absolute bottom-0 -right-2 w-9 h-9 bg-[#2563EB] border-2 border-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-sm font-black text-white font-mono">1</span>
                  </div>
                </div>

                {rank1 ? (
                  <>
                    <div className="px-4 text-center mt-4 flex flex-col items-center w-full">
                      <div className="bg-[#2563EB] text-white px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 mb-2 shadow-sm uppercase tracking-widest font-mono">
                        <Trophy className="w-4 h-4 fill-current" />
                        <span>CHAMPION (JUARA 1)</span>
                      </div>
                      <span className="inline-block px-3 py-0.5 bg-[#EFF6FF] text-[#1E40AF] text-[11px] font-bold rounded-full mb-3 tracking-wider shadow-sm uppercase border border-[#BFDBFE] font-mono">{getCategoryBadge(rank1.participant)}</span>
                      <h3 className="text-headline-lg font-bold text-slate-900 mb-4 text-center font-display">{rank1.participant.name}</h3>
                    </div>
                    <div className="w-full mt-auto pt-6 border-t border-[#BFDBFE]/60 bg-[#EFF6FF]/70 text-center rounded-b-2xl flex flex-col justify-center min-h-[100px]">
                      <p className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-widest mb-1 font-mono">Total Skor</p>
                      <p className="text-[42px] font-black text-slate-900 leading-none font-display">{rank1.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400 mt-10 font-medium">Belum Ada Juara 1</div>
                )}
              </div>

              {/* 3rd Place (Juara 3 - Bronze) */}
              <div className="podium-card w-full md:w-[30%] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center relative pb-6 pt-14 order-3 h-auto md:h-[80%] z-10 mt-12 md:mt-0 hover:border-[#CD7F32]/40 hover:shadow-md">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                  <div className="w-20 h-20 rounded-full bg-orange-50 border-4 border-white flex items-center justify-center shadow-md relative overflow-hidden ring-2 ring-[#CD7F32]/20">
                    <img className="w-full h-full object-cover" src={getProxyImageUrl(rank3?.participant.photoUrl || "https://drive.google.com/uc?export=view&id=1HQ2l_Uy0ymzlbfNCYZojRqLmmZLUXXZM")} referrerPolicy="no-referrer" alt="Juara 3" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="absolute -bottom-2 w-7 h-7 bg-[#CD7F32] border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[11px] font-black text-white font-mono">3</span>
                  </div>
                </div>

                {rank3 ? (
                  <>
                    <div className="px-4 text-center mt-4 flex flex-col items-center w-full">
                      <div className="bg-orange-50 text-[#CD7F32] px-3.5 py-1 rounded-full text-[10px] font-black mb-2 uppercase tracking-widest border border-orange-200 font-mono">
                        3RD PLACE (JUARA 3)
                      </div>
                      <span className="inline-block px-2.5 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-md mb-2 tracking-wider border border-slate-200 uppercase font-mono">{getCategoryBadge(rank3.participant)}</span>
                      <h3 className="text-headline-md font-bold text-slate-900 mt-1 mb-4 text-center font-display">{rank3.participant.name}</h3>
                    </div>
                    <div className="w-full mt-auto pt-5 border-t border-slate-100 text-center bg-slate-50/60 rounded-b-2xl flex flex-col justify-center min-h-[80px]">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Total Skor</p>
                      <p className="text-headline-xl font-black text-slate-800 font-display">{rank3.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400 mt-6 font-medium">Belum Ada Juara 3</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Standings Table Section (Integrated - Only shown if more than 3 participants) */}
        {rankedData.length > 3 && (
          <div className="border-t border-slate-100">
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 font-mono">
                  <tr>
                    <th className="py-3.5 px-4 w-16 text-center">POS</th>
                    <th className="py-3.5 px-6">NAMA TIM / PESERTA</th>
                    <th className="py-3.5 px-4 text-center w-32">KATEGORI</th>
                    <th className="py-3.5 px-6 text-center w-40 bg-slate-900 text-white font-black">TOTAL SKOR</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-800 divide-y divide-slate-100">
                  {rankedData.slice(3).map((item, index) => {
                    return (
                      <tr 
                        key={item.participant.id || `row-${index}`} 
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-4 px-4 text-center">
                          <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200 mx-auto font-mono text-xs">
                            {item.rank}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{item.participant.name}</div>
                          <div className="text-xs text-slate-400 line-clamp-1">"{item.participant.projectTitle}"</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border font-mono ${
                            item.participant.levelCategory === 'Leading'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
                          }`}>
                            {item.participant.levelCategory || item.participant.category || item.participant.stream}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center bg-slate-50 font-black text-base text-slate-900 font-mono">
                          {typeof item.calculatedTotal === 'number' ? item.calculatedTotal : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="block md:hidden divide-y divide-slate-100 border-t border-slate-100">
              {rankedData.slice(3).map((item, index) => {
                return (
                  <div 
                    key={item.participant.id || `card-${index}`}
                    className="p-4 space-y-3 bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200 shrink-0 text-xs font-mono">
                          {item.rank}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight font-display">
                            {item.participant.name}
                          </h4>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0 font-mono ${
                        item.participant.levelCategory === 'Leading'
                          ? 'bg-slate-900 text-white'
                          : 'bg-[#EFF6FF] text-[#1E40AF]'
                      }`}>
                        {item.participant.levelCategory || item.participant.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{item.participant.projectTitle}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Skor</span>
                      <span className="text-xl font-bold text-slate-900 font-mono">
                        {typeof item.calculatedTotal === 'number' ? item.calculatedTotal : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

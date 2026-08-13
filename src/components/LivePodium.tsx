import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LeaderboardEntry, LevelCategory, ContestSettings } from '../types';
import { isJuri3RevealedForCategory, getParticipantCategoryKey, getProxyImageUrl } from '../lib/contestService';
import { Trophy, Medal, Lock, Unlock, ShieldAlert, Sparkles, Star, Flame, Eye, EyeOff, Layers } from 'lucide-react';

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
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-container text-on-error-container">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="text-label-sm uppercase font-bold">Top 3 Podium Champions</span>
          </div>

          {/* Level Class Filter Buttons */}
          <div className="flex items-center bg-surface-container p-1.5 rounded-2xl border border-outline-variant shadow-inner flex-wrap gap-1">
            <button
              onClick={() => setActiveCategoryFilter('QCC-Rising')}
              className={`px-3 py-2 rounded-xl text-label-md font-bold transition-all flex items-center space-x-1.5 ${
                activeCategoryFilter === 'QCC-Rising' || activeCategoryFilter === 'Rising'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>QCC Rising</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('QCC-Leading')}
              className={`px-3 py-2 rounded-xl text-label-md font-bold transition-all flex items-center space-x-1.5 ${
                activeCategoryFilter === 'QCC-Leading' || activeCategoryFilter === 'Leading'
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>QCC Leading</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('SS')}
              className={`px-3 py-2 rounded-xl text-label-md font-bold transition-all flex items-center space-x-1.5 ${
                activeCategoryFilter === 'SS'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>SS</span>
            </button>
          </div>
        </div>

        {/* Podium Section (Integrated) */}
        {rankedData.length > 0 && (
          <div className="p-6 md:p-10 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-center items-end gap-12 md:gap-8 h-auto md:h-[480px] pt-16 md:pt-24 pb-8">
              
              {/* Runner Up */}
              <div className="podium-card w-full md:w-[30%] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col items-center relative pb-6 pt-14 order-2 md:order-1 h-auto md:h-[85%] z-10 mt-12 md:mt-0">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                  <div className="w-20 h-20 rounded-full bg-surface-variant border-4 border-surface-container-lowest flex items-center justify-center shadow-sm relative overflow-hidden">
                    <img className="w-full h-full object-cover" src={getProxyImageUrl(rank2?.participant.photoUrl || "https://drive.google.com/uc?export=view&id=1Ul03BhQkZaAwqEsCbO1UmQ_xmcXp5B8i")} referrerPolicy="no-referrer" alt="Juara 2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="absolute -bottom-2 w-6 h-6 bg-surface-variant border-2 border-surface-container-lowest rounded-full flex items-center justify-center">
                    <span className="text-label-sm font-bold text-on-surface-variant">2</span>
                  </div>
                </div>
                
                
                
                {rank2 ? (
                  <>
                    <div className="px-4 text-center mt-4 flex flex-col items-center w-full">
                      <div className="bg-slate-200 text-slate-800 px-3.5 py-1 rounded-full text-[10px] font-black mb-2 uppercase tracking-widest shadow-sm border border-slate-300">
                        RUNNER UP (JUARA 2)
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-surface-variant text-on-surface-variant text-[10px] font-bold rounded mb-2 tracking-wider uppercase">{getCategoryBadge(rank2.participant)}</span>
                      <h3 className="text-headline-md font-bold text-on-surface mt-1 mb-4 text-center">{rank2.participant.name}</h3>
                    </div>
                    <div className="w-full mt-auto pt-5 border-t border-outline-variant text-center bg-surface-bright rounded-b-xl flex flex-col justify-center min-h-[80px]">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Skor</p>
                      <p className="text-headline-xl font-bold text-on-surface">{rank2.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-on-surface-variant mt-6 font-medium">Belum Ada Juara 2</div>
                )}
              </div>

              {/* Champion */}
              <div className="podium-card champion-card w-full md:w-[35%] bg-surface-container-lowest rounded-xl border-2 border-primary-container flex flex-col items-center relative pb-6 pt-16 order-1 md:order-2 h-auto md:h-full z-20 mt-16 md:mt-0">
                
                
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                  <div className="w-28 h-28 rounded-full bg-primary-container border-4 border-surface-container-lowest flex items-center justify-center shadow-lg relative overflow-hidden">
                    <img className="w-full h-full object-cover scale-110" src={getProxyImageUrl(rank1?.participant.photoUrl || "https://drive.google.com/uc?export=view&id=1Nqk3jCqgImxHr2HfZb4NvWqofBO7N0AK")} referrerPolicy="no-referrer" alt="Juara 1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="absolute bottom-0 -right-2 w-8 h-8 bg-primary border-2 border-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-label-md font-bold text-on-primary">1</span>
                  </div>
                </div>

                {rank1 ? (
                  <>
                    <div className="px-4 text-center mt-4 flex flex-col items-center w-full">
                      <div className="bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 mb-2 shadow-sm uppercase tracking-widest border border-amber-300">
                        <Trophy className="w-4 h-4 fill-current text-amber-950" />
                        <span>CHAMPION (JUARA 1)</span>
                      </div>
                      <span className="inline-block px-3 py-0.5 bg-primary-container text-on-primary-container text-[11px] font-bold rounded-full mb-3 tracking-wider shadow-sm uppercase">{getCategoryBadge(rank1.participant)}</span>
                      <h3 className="text-headline-lg font-bold text-on-surface mb-4 text-center">{rank1.participant.name}</h3>
                    </div>
                    <div className="w-full mt-auto pt-6 border-t border-primary-fixed bg-primary-fixed-dim/10 text-center rounded-b-xl border-x-4 border-b-4 border-primary-container flex flex-col justify-center min-h-[100px]">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Total Skor</p>
                      <p className="text-headline-xl font-black text-primary-container text-[40px] leading-none drop-shadow-sm">{rank1.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-primary mt-10 font-medium">Belum Ada Juara 1</div>
                )}
              </div>

              {/* 3rd Place */}
              <div className="podium-card w-full md:w-[30%] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col items-center relative pb-6 pt-14 order-3 h-auto md:h-[80%] z-10 mt-12 md:mt-0">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                  <div className="w-20 h-20 rounded-full bg-surface-variant border-4 border-surface-container-lowest flex items-center justify-center shadow-sm relative overflow-hidden">
                    <img className="w-full h-full object-cover" src={getProxyImageUrl(rank3?.participant.photoUrl || "https://drive.google.com/uc?export=view&id=1HQ2l_Uy0ymzlbfNCYZojRqLmmZLUXXZM")} referrerPolicy="no-referrer" alt="Juara 3" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="absolute -bottom-2 w-6 h-6 bg-[#CD7F32] border-2 border-surface-container-lowest rounded-full flex items-center justify-center">
                    <span className="text-label-sm font-bold text-white">3</span>
                  </div>
                </div>

                
                
                {rank3 ? (
                  <>
                    <div className="px-4 text-center mt-4 flex flex-col items-center w-full">
                      <div className="bg-[#CD7F32] text-white px-3.5 py-1 rounded-full text-[10px] font-black mb-2 uppercase tracking-widest shadow-sm">
                        3RD PLACE (JUARA 3)
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-surface-variant text-on-surface-variant text-[10px] font-bold rounded mb-2 tracking-wider border border-outline-variant/30 uppercase">{getCategoryBadge(rank3.participant)}</span>
                      <h3 className="text-headline-md font-bold text-on-surface mt-1 mb-4 text-center">{rank3.participant.name}</h3>
                    </div>
                    <div className="w-full mt-auto pt-5 border-t border-outline-variant text-center bg-surface-bright rounded-b-xl flex flex-col justify-center min-h-[80px]">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Skor</p>
                      <p className="text-headline-xl font-bold text-[#CD7F32]">{rank3.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-on-surface-variant mt-6 font-medium">Belum Ada Juara 3</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Standings Table Section (Integrated - Only shown if more than 3 participants) */}
        {rankedData.length > 3 && (
          <div className="border-t border-outline-variant/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-outline-variant">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">POS</th>
                    <th className="py-3 px-4">NAMA TIM / PESERTA</th>
                    <th className="py-3 px-4 text-center">PENYISIHAN (90%)</th>
                    <th className="py-3 px-3 text-center">JURI 1</th>
                    <th className="py-3 px-3 text-center">JURI 2</th>
                    <th className="py-3 px-3 text-center">JURI 3</th>
                    <th className="py-3 px-4 text-center">PUBLIC VOTE (2%)</th>
                    <th className="py-3 px-6 text-center bg-primary-container/20 text-primary font-black">NILAI AKHIR</th>
                    <th className="py-3 px-4 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm text-on-surface divide-y divide-outline-variant">
                  {rankedData.slice(3).map((item, index) => {
                    return (
                      <tr 
                        key={item.participant.id || `row-${index}`} 
                        className="hover:bg-surface-container-low transition-colors group"
                      >
                        <td className="py-4 px-4 text-center">
                          <div className="w-8 h-8 rounded bg-surface text-on-surface-variant font-bold flex items-center justify-center border border-outline-variant mx-auto">
                            {item.rank}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-on-surface text-body-md">{item.participant.name}</div>
                          <div className="text-xs text-on-surface-variant line-clamp-1">"{item.participant.projectTitle}"</div>
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-indigo-700 bg-indigo-50/40 font-mono">
                          {item.participant.preliminaryScore !== undefined ? item.participant.preliminaryScore.toFixed(2) : '-'}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {item.hasJuri1 ? (
                            <span className="text-on-surface-variant font-mono">{item.juri1Score}</span>
                          ) : (
                            <span className="text-on-surface-variant">-</span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {item.hasJuri2 ? (
                            <span className="text-on-surface-variant font-mono">{item.juri2Score}</span>
                          ) : (
                            <span className="text-on-surface-variant">-</span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {item.hasJuri3 ? (
                            <span className="text-on-surface-variant font-mono">{item.juri3Score}</span>
                          ) : (
                            <span className="text-on-surface-variant">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-emerald-700 font-mono">
                          {item.publicVoteCount} Suara
                        </td>
                        <td className="py-4 px-6 text-center bg-surface-bright font-black text-body-md text-red-600 font-mono">
                          {item.calculatedTotal > 0 ? item.calculatedTotal : '—'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-xs font-medium text-secondary">
                            Peserta Final
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>


            {/* MOBILE CARDS VIEW */}
            <div className="block md:hidden divide-y divide-outline-variant border-t border-outline-variant">
              {rankedData.slice(3).map((item, index) => {
                return (
                  <div 
                    key={item.participant.id || `card-${index}`}
                    className="p-4 space-y-3 bg-surface-container-lowest"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded bg-surface text-on-surface-variant font-bold flex items-center justify-center border border-outline-variant shrink-0">
                          {item.rank}
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface text-body-md leading-tight">
                            {item.participant.name}
                          </h4>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0 ${
                        item.participant.levelCategory === 'Leading'
                          ? 'bg-[#F3E8FF] text-[#6B21A8]'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.participant.levelCategory}
                      </span>
                    </div>

                    <p className="text-body-sm text-on-surface-variant bg-surface p-2.5 rounded-lg border border-outline-variant">
                      "{item.participant.projectTitle}"
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-surface p-2 rounded-lg border border-outline-variant">
                        <span className="text-[9px] uppercase font-bold text-on-surface-variant block">JURI 1</span>
                        <span className="text-body-sm font-bold text-on-surface">{item.hasJuri1 ? item.juri1Score : '-'}</span>
                      </div>
                      <div className="bg-surface p-2 rounded-lg border border-outline-variant">
                        <span className="text-[9px] uppercase font-bold text-on-surface-variant block">JURI 2</span>
                        <span className="text-body-sm font-bold text-on-surface">{item.hasJuri2 ? item.juri2Score : '-'}</span>
                      </div>
                      <div className="bg-surface p-2 rounded-lg border border-outline-variant">
                        <span className="text-[9px] uppercase font-bold text-on-surface-variant block">JURI 3</span>
                        <span className="text-body-sm font-bold text-on-surface">{item.hasJuri3 ? item.juri3Score : '-'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Skor</span>
                      <span className="text-headline-md font-bold text-primary font-mono">
                        {item.calculatedTotal > 0 ? item.calculatedTotal : '—'}
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

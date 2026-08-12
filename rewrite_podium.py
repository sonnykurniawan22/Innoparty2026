import re

with open('src/components/LivePodium.tsx', 'r') as f:
    content = f.read()

match = re.search(r'(.*?)return \((.*)\);?\s*\};\s*$', content, re.DOTALL)
if match:
    prelude = match.group(1)
    body = match.group(2)
else:
    print("Could not match the structure")
    exit(1)

new_body = """
    <div className="space-y-6 pb-12 w-full">
      
      {/* Unified Competition Container */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 md:p-10 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-container text-on-error-container mb-3">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span className="text-label-sm uppercase font-bold">Top 3 Podium Champions</span>
            </div>
            <h2 className="text-headline-xl font-bold text-on-surface mb-2 tracking-tight uppercase">
              PANGGUNG JUARA KELAS {activeCategoryFilter}
            </h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">
              Perolehan sementara kompetisi inovasi kelas {activeCategoryFilter}. Posisi panggung berdasarkan evaluasi juri secara real-time.
            </p>
          </div>

          {/* Level Class Filter Buttons */}
          <div className="flex items-center bg-surface-container p-1.5 rounded-2xl border border-outline-variant shadow-inner">
            <button
              onClick={() => setActiveCategoryFilter('Rising')}
              className={`px-4 py-2 rounded-xl text-label-md font-bold transition-all flex items-center space-x-1.5 ${
                activeCategoryFilter === 'Rising'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Rising Star</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('Leading')}
              className={`px-4 py-2 rounded-xl text-label-md font-bold transition-all flex items-center space-x-1.5 ${
                activeCategoryFilter === 'Leading'
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Leading Class</span>
            </button>
          </div>
        </div>

        {/* Podium Section (Integrated) */}
        {rankedData.length > 0 && (
          <div className="p-6 md:p-10 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-8 h-auto md:h-[450px] pt-12 md:pt-20">
              
              {/* Runner Up */}
              <div className="podium-card w-full md:w-[30%] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col items-center relative pb-6 pt-12 order-2 md:order-1 h-auto md:h-[85%] z-10">
                <div className="absolute -top-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-surface-variant border-4 border-surface-container-lowest flex items-center justify-center shadow-sm relative overflow-hidden">
                    <img className="w-full h-full object-cover" src="/robot_2.png" alt="Juara 2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-surface-variant border-2 border-surface-container-lowest rounded-full flex items-center justify-center">
                      <span className="text-label-sm font-bold text-on-surface-variant">2</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 bg-surface-variant text-on-surface-variant px-3 py-1 rounded-bl-lg rounded-tr-xl text-label-sm font-bold">RUNNER UP (2)</div>
                {rank2 ? (
                  <>
                    <div className="px-4 text-center mt-6">
                      <span className="inline-block px-2 py-1 bg-surface-variant text-on-surface-variant text-[10px] font-bold rounded mb-2 tracking-wider uppercase">{rank2.participant.levelCategory} • {rank2.participant.stream}</span>
                      <h3 className="text-headline-md font-bold text-on-surface">{rank2.participant.name}</h3>
                      <p className="text-label-md text-secondary font-medium mb-3">{rank2.participant.teamName}</p>
                    </div>
                    <div className="w-full mt-auto pt-6 border-t border-outline-variant text-center bg-surface-bright rounded-b-xl">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Skor</p>
                      <p className="text-headline-xl font-bold text-on-surface mb-2">{rank2.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-on-surface-variant mt-6 font-medium">Belum Ada Juara 2</div>
                )}
              </div>

              {/* Champion */}
              <div className="podium-card champion-card w-full md:w-[35%] bg-surface-container-lowest rounded-xl border-2 border-primary-container flex flex-col items-center relative pb-6 pt-16 order-1 md:order-2 h-auto md:h-full z-20">
                <div className="absolute top-0 left-0 w-full bg-primary-container text-on-primary-container text-center py-2 rounded-t-lg font-bold text-label-md flex items-center justify-center gap-2 shadow-sm">
                  <Trophy className="w-[18px] h-[18px] fill-current" /> CHAMPION (1)
                </div>
                <div className="absolute -top-14 flex flex-col items-center mt-10">
                  <div className="w-28 h-28 rounded-full bg-primary-container border-4 border-surface-container-lowest flex items-center justify-center shadow-lg relative overflow-hidden">
                    <img className="w-full h-full object-cover scale-110" src="/robot_1.png" alt="Juara 1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary border-2 border-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-label-md font-bold text-on-primary">1</span>
                    </div>
                  </div>
                </div>
                {rank1 ? (
                  <>
                    <div className="px-4 text-center mt-10">
                      <span className="inline-block px-3 py-1 bg-primary-container text-on-primary-container text-[11px] font-bold rounded-full mb-3 tracking-wider shadow-sm uppercase">{rank1.participant.levelCategory} • {rank1.participant.stream}</span>
                      <h3 className="text-headline-lg font-bold text-on-surface mb-1">{rank1.participant.name}</h3>
                      <p className="text-label-lg text-primary font-bold mb-4">{rank1.participant.teamName}</p>
                    </div>
                    <div className="w-full mt-auto pt-6 border-t border-primary-fixed bg-primary-fixed-dim/10 text-center rounded-b-xl border-x-4 border-b-4 border-primary-container">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Rata-rata Skor</p>
                      <p className="text-headline-xl font-black text-primary-container text-[40px] leading-none mb-4 drop-shadow-sm">{rank1.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-primary mt-10 font-medium">Belum Ada Juara 1</div>
                )}
              </div>

              {/* 3rd Place */}
              <div className="podium-card w-full md:w-[30%] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col items-center relative pb-6 pt-12 order-3 h-auto md:h-[80%] z-10">
                <div className="absolute -top-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-surface-variant border-4 border-surface-container-lowest flex items-center justify-center shadow-sm relative overflow-hidden">
                    <img className="w-full h-full object-cover" src="/robot_3.png" alt="Juara 3" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#CD7F32] border-2 border-surface-container-lowest rounded-full flex items-center justify-center">
                      <span className="text-label-sm font-bold text-white">3</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 bg-[#CD7F32] text-white px-3 py-1 rounded-bl-lg rounded-tr-xl text-label-sm font-bold">3RD PLACE (3)</div>
                {rank3 ? (
                  <>
                    <div className="px-4 text-center mt-6">
                      <span className="inline-block px-2 py-1 bg-surface-variant text-on-surface-variant text-[10px] font-bold rounded mb-2 tracking-wider border border-outline-variant/30 uppercase">{rank3.participant.levelCategory} • {rank3.participant.stream}</span>
                      <h3 className="text-headline-md font-bold text-on-surface">{rank3.participant.name}</h3>
                      <p className="text-label-md text-secondary font-medium mb-3">{rank3.participant.teamName}</p>
                    </div>
                    <div className="w-full mt-auto pt-6 border-t border-outline-variant text-center bg-surface-bright rounded-b-xl">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Skor</p>
                      <p className="text-headline-xl font-bold text-[#CD7F32] mb-2">{rank3.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-on-surface-variant mt-6 font-medium">Belum Ada Juara 3</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Standings Table Section (Integrated) */}
        <div className="border-t border-outline-variant/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <tbody className="text-body-sm text-on-surface divide-y divide-outline-variant">
                {rankedData.map((item, index) => {
                  return (
                    <tr 
                      key={item.participant.id} 
                      className="hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="py-4 px-6 w-16">
                        <div className="w-8 h-8 rounded bg-surface text-on-surface-variant font-bold flex items-center justify-center border border-outline-variant">
                          {item.rank}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-on-surface text-body-md">{item.participant.name}</div>
                        <div className="text-[#10B981] font-medium text-[11px]">{item.participant.teamName}</div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        <div className="line-clamp-2 max-w-sm">
                          "{item.participant.projectTitle}"
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.participant.levelCategory === 'Leading'
                            ? 'bg-[#F3E8FF] text-[#6B21A8]'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {item.participant.levelCategory} • {item.participant.stream}
                        </span>
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
                        {!juri3Revealed ? (
                          <span className="text-on-surface-variant font-bold text-[10px]">LOCKED</span>
                        ) : item.hasJuri3 ? (
                          <span className="text-on-surface-variant font-mono">{item.juri3Score}</span>
                        ) : (
                          <span className="text-on-surface-variant">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center bg-surface-bright font-bold text-body-md group-hover:bg-surface-variant transition-colors font-mono">
                        {item.calculatedTotal > 0 ? item.calculatedTotal : '—'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-center font-medium text-secondary">
                          {item.rank <= 3 ? 'Qualified Podium' : 'Peserta Matchday'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rankedData.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-on-surface-variant font-medium">
                      Belum ada data peserta untuk kategori kelas {activeCategoryFilter}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="block md:hidden divide-y divide-outline-variant border-t border-outline-variant">
            {rankedData.map((item) => {
              return (
                <div 
                  key={item.participant.id}
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
                        <p className="text-[11px] font-medium text-[#10B981] mt-0.5">
                          {item.participant.teamName}
                        </p>
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
                      {!juri3Revealed ? (
                        <span className="text-[9px] font-bold text-primary">LOCKED</span>
                      ) : (
                        <span className="text-body-sm font-bold text-on-surface">{item.hasJuri3 ? item.juri3Score : '-'}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Rata-rata</span>
                    <span className="text-headline-md font-bold text-primary font-mono">
                      {item.calculatedTotal > 0 ? item.calculatedTotal : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
"""

new_content = prelude + "return (\n" + new_body + "\n  );\n};\n"
with open('src/components/LivePodium.tsx', 'w') as f:
    f.write(new_content)

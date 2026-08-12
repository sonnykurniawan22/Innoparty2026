import re

with open('src/components/LivePodium.tsx', 'r') as f:
    content = f.read()

replacement = """
          <div className="p-6 md:p-10 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-300/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-8 h-auto md:h-[450px] pt-12 md:pt-20">
              
              {/* Runner Up */}
              <div className="w-full md:w-[30%] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center relative pb-6 pt-12 order-2 md:order-1 h-auto md:h-[85%] z-10 transition-transform hover:-translate-y-1">
                <div className="absolute -top-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center shadow-sm relative overflow-hidden">
                    <img className="w-full h-full object-cover" src="/robot_2.png" alt="Juara 2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-slate-200 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-500">2</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 bg-slate-100 text-slate-600 px-3 py-1 rounded-bl-lg rounded-tr-xl text-[10px] font-bold">RUNNER UP (2)</div>
                {rank2 ? (
                  <>
                    <div className="px-4 text-center mt-6">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded mb-2 tracking-wider">{rank2.participant.levelCategory} • {rank2.participant.stream}</span>
                      <h3 className="text-xl font-bold text-slate-900">{rank2.participant.name}</h3>
                      <p className="text-xs font-medium text-slate-500 mb-3">{rank2.participant.teamName}</p>
                    </div>
                    <div className="w-full mt-auto pt-6 border-t border-slate-200 text-center bg-slate-50 rounded-b-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Skor</p>
                      <p className="text-3xl font-bold text-slate-900 mb-2">{rank2.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400 mt-6">Belum Ada Juara 2</div>
                )}
              </div>

              {/* Champion */}
              <div className="w-full md:w-[35%] bg-white rounded-xl border-2 border-amber-400 flex flex-col items-center relative pb-6 pt-16 order-1 md:order-2 h-auto md:h-full z-20 transition-transform hover:-translate-y-1 shadow-[0_12px_30px_rgba(255,193,7,0.15)]">
                <div className="absolute top-0 left-0 w-full bg-amber-400 text-amber-900 text-center py-2 rounded-t-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm">
                  <Trophy className="w-4 h-4 fill-current" /> CHAMPION (1)
                </div>
                <div className="absolute -top-14 flex flex-col items-center mt-10">
                  <div className="w-28 h-28 rounded-full bg-amber-400 border-4 border-white flex items-center justify-center shadow-lg relative overflow-hidden">
                    <img className="w-full h-full object-cover scale-110" src="/robot_1.png" alt="Juara 1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-amber-600 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-white">1</span>
                    </div>
                  </div>
                </div>
                {rank1 ? (
                  <>
                    <div className="px-4 text-center mt-10">
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full mb-3 tracking-wider shadow-sm">{rank1.participant.levelCategory} • {rank1.participant.stream}</span>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{rank1.participant.name}</h3>
                      <p className="text-sm font-bold text-amber-600 mb-4">{rank1.participant.teamName}</p>
                    </div>
                    <div className="w-full mt-auto pt-6 border-t border-amber-300 bg-amber-50/50 text-center rounded-b-xl border-x-4 border-b-4 border-amber-400">
                      <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mb-1">Rata-rata Skor</p>
                      <p className="text-[40px] font-black text-amber-500 leading-none mb-4 drop-shadow-sm">{rank1.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-amber-600 mt-10">Belum Ada Juara 1</div>
                )}
              </div>

              {/* 3rd Place */}
              <div className="w-full md:w-[30%] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center relative pb-6 pt-12 order-3 h-auto md:h-[80%] z-10 transition-transform hover:-translate-y-1">
                <div className="absolute -top-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center shadow-sm relative overflow-hidden">
                    <img className="w-full h-full object-cover" src="/robot_3.png" alt="Juara 3" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#CD7F32] border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">3</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 bg-[#CD7F32] text-white px-3 py-1 rounded-bl-lg rounded-tr-xl text-[10px] font-bold">3RD PLACE (3)</div>
                {rank3 ? (
                  <>
                    <div className="px-4 text-center mt-6">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded mb-2 tracking-wider border border-slate-200">{rank3.participant.levelCategory} • {rank3.participant.stream}</span>
                      <h3 className="text-xl font-bold text-slate-900">{rank3.participant.name}</h3>
                      <p className="text-xs font-medium text-slate-500 mb-3">{rank3.participant.teamName}</p>
                    </div>
                    <div className="w-full mt-auto pt-6 border-t border-slate-200 text-center bg-slate-50 rounded-b-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Skor</p>
                      <p className="text-3xl font-bold text-[#CD7F32] mb-2">{rank3.calculatedTotal}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400 mt-6">Belum Ada Juara 3</div>
                )}
              </div>
            </div>
          </div>
"""

pattern = re.compile(r'\s*<div className="relative pt-[^>]+>.*?\{/\* OFFICIAL STANDINGS TABLE \*/\}', re.DOTALL)
new_content = pattern.sub('\n' + replacement + '\n\n      {/* OFFICIAL STANDINGS TABLE */}', content)

with open('src/components/LivePodium.tsx', 'w') as f:
    f.write(new_content)


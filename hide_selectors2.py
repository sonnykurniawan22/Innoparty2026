import re

with open('src/components/ScoringForm.tsx', 'r') as f:
    content = f.read()

# 1. Hide the Judge ID Selector Badge
old_judge_selector = """          {/* Judge ID Selector Badge */}
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-red-200 shrink-0">
            <div className="text-[10px] uppercase font-black tracking-wider text-slate-500 text-center mb-1.5">
              AKSES ANONYMOUS JURI:
            </div>
            <div className="flex items-center space-x-1.5">
              {([1, 2, 3] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedJudgeId(id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                    selectedJudgeId === id
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>JURI {id}</span>
                </button>
              ))}
            </div>
          </div>"""

new_judge_selector = """          {/* Judge ID Selector Badge */}
          {!isLockedMode && (
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-red-200 shrink-0">
            <div className="text-[10px] uppercase font-black tracking-wider text-slate-500 text-center mb-1.5">
              AKSES ANONYMOUS JURI:
            </div>
            <div className="flex items-center space-x-1.5">
              {([1, 2, 3] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedJudgeId(id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                    selectedJudgeId === id
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>JURI {id}</span>
                </button>
              ))}
            </div>
          </div>
          )}"""
content = content.replace(old_judge_selector, new_judge_selector)

# 2. Update state definitions
content = content.replace(
    "const [submitSuccess, setSubmitSuccess] = useState(false);\n  const isLockedMode = !!(initialJudgeId && initialParticipantId);",
    "const [submitSuccess, setSubmitSuccess] = useState(false);\n  const isLockedMode = !!(initialJudgeId && initialParticipantId);"
)

# 3. Replace Step 1 Block completely
old_step1_regex = r'\{\/\* Step 1: Filter & Select Participant \*\/\}[\s\S]*?\{\/\* Quick Presets \*\/\}'
old_step1_match = re.search(old_step1_regex, content)
if old_step1_match:
    old_step1 = old_step1_match.group(0)
    
    new_step1 = """{/* Step 1: Select Participant / Locked Display */}
        {isLockedMode ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-24 h-24 text-emerald-900" />
            </div>
            <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> AKSES JURI KHUSUS
            </div>
            {selectedParticipant ? (
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-black uppercase text-emerald-800">
                    {selectedParticipant.teamName}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                    {selectedParticipant.levelCategory} • {selectedParticipant.stream}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{selectedParticipant.name}</h3>
                <p className="text-sm font-bold text-slate-700 mt-1 italic">"{selectedParticipant.projectTitle}"</p>
                {existingScore && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-black border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Telah Dinilai (Skor: {existingScore.totalScore})
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium">Memuat data peserta...</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <label className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>1. PILIH PESERTA / INOVATOR</span>
              </label>

              {/* Level Category Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterLevel('Rising')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${filterLevel === 'Rising' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 '}`}
                >
                  <Star className="w-3 h-3" /> Rising
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLevel('Leading')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${filterLevel === 'Leading' ? 'bg-yellow-500 text-slate-900 shadow' : 'text-slate-600 '}`}
                >
                  <Flame className="w-3 h-3" /> Leading
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full">
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Daftar Peserta Inovasi:
                </label>
                {filteredParticipants.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-500 text-sm text-center">
                    Tidak ada peserta dalam kategori ini
                  </div>
                ) : (
                  <div className="flex overflow-x-auto pb-4 -mx-2 px-2 space-x-3 snap-x no-scrollbar">
                    {filteredParticipants.map((p) => {
                      const isSelected = p.id === selectedParticipantId;
                      const hasScored = scores.some(s => s.participantId === p.id && s.judgeId === selectedJudgeId);
                      
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedParticipantId(p.id)}
                          className={`shrink-0 snap-center w-64 p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                            isSelected 
                              ? 'bg-red-50 border-red-500 shadow-md ring-2 ring-red-500/20' 
                              : 'bg-white border-slate-200 hover:border-red-300 hover:bg-slate-50'
                          }`}
                        >
                          {hasScored && (
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white p-1 rounded-bl-lg">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {p.levelCategory}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-red-700' : 'text-slate-500'}`}>
                              {p.stream}
                            </span>
                          </div>
                          <h4 className={`text-sm font-black truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                            {p.teamName}
                          </h4>
                          <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-red-800 font-medium' : 'text-slate-500'}`}>
                            {p.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Participant Details Card */}
              {selectedParticipant ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black uppercase text-red-800">
                        {selectedParticipant.teamName}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-200">
                        {selectedParticipant.levelCategory} • {selectedParticipant.stream}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900">
                      {selectedParticipant.name}
                    </h4>
                    <p className="text-xs text-slate-600 italic mt-1">
                      "{selectedParticipant.projectTitle}"
                    </p>
                  </div>

                  {existingScore && (
                    <div className="shrink-0 flex flex-col items-end border-t sm:border-t-0 sm:border-l border-red-200 pt-3 sm:pt-0 sm:pl-4">
                      <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Telah Dinilai Juri {selectedJudgeId}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-black border border-emerald-200">
                        Skor: {existingScore.totalScore}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-100 rounded-2xl p-4 text-slate-500 text-sm flex items-center justify-center">
                  Pilih peserta untuk memulai penilaian
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Presets */}"""
    content = content.replace(old_step1, new_step1)
else:
    print("Failed to find Step 1 section with regex")

with open('src/components/ScoringForm.tsx', 'w') as f:
    f.write(content)

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

# 2. Add selectedParticipant lookup
content = content.replace(
    "const [isLockedMode, setIsLockedMode] = useState(false);",
    "" # Cleanup from earlier thought process just in case
)

content = content.replace(
    "const isLockedMode = !!(initialJudgeId && initialParticipantId);",
    """const isLockedMode = !!(initialJudgeId && initialParticipantId);
  const activeParticipant = participants.find(p => p.id === selectedParticipantId);"""
)

# 3. Replace the entire Step 1 section
old_step1_regex = r'\{\/\* Step 1: Filter & Select Participant \*\/\}.*?\{\/\* Step 2: Scoring Criteria \*\/\}'
old_step1_match = re.search(old_step1_regex, content, re.DOTALL)
if old_step1_match:
    old_step1 = old_step1_match.group(0)
    
    new_step1 = """{/* Step 1: Select Participant (or display locked participant) */}
        {isLockedMode ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6">
            <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">
              DATA PESERTA INOVASI
            </div>
            {activeParticipant ? (
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase">{activeParticipant.name}</h3>
                <p className="text-sm font-bold text-slate-600 mt-1">{activeParticipant.teamName}</p>
                <div className="inline-block px-3 py-1 mt-3 bg-white border border-slate-200 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider text-slate-700">
                  {activeParticipant.levelCategory} • {activeParticipant.stream}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Memuat data peserta...</p>
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
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${filterLevel === 'Rising' ? 'bg-blue-600 text-white shadow' : 'text-slate-600'}`}
                >
                  <Star className="w-3 h-3" /> Rising
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLevel('Leading')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${filterLevel === 'Leading' ? 'bg-yellow-500 text-slate-900 shadow' : 'text-slate-600'}`}
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
                          className={`snap-center shrink-0 w-64 text-left p-4 rounded-2xl border-2 transition-all relative ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                              : hasScored 
                                ? 'border-slate-200 bg-slate-50 opacity-60' 
                                : 'border-slate-200 bg-white hover:border-emerald-300'
                          }`}
                        >
                          {hasScored && (
                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase shadow">
                              Dinilai
                            </div>
                          )}
                          <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {p.levelCategory} • {p.stream}
                          </div>
                          <div className={`font-black text-sm truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                            {p.name}
                          </div>
                          <div className={`text-xs font-medium truncate mt-1 ${isSelected ? 'text-slate-700' : 'text-slate-500'}`}>
                            {p.teamName}
                          </div>
                          
                          {isSelected && (
                            <div className="absolute top-4 right-4 text-emerald-600">
                              <CheckCircle2 className="w-5 h-5 fill-current text-emerald-100" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Scoring Criteria */}"""
    content = content.replace(old_step1, new_step1)
else:
    print("Failed to find Step 1 section")

with open('src/components/ScoringForm.tsx', 'w') as f:
    f.write(content)

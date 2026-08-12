import re

with open('src/components/ScoringForm.tsx', 'r') as f:
    content = f.read()

# Always treat as locked mode, remove selector
content = content.replace(
    "const isLockedMode = !!(initialJudgeId && initialParticipantId);",
    "const isLockedMode = !!(initialJudgeId && initialParticipantId);"
)

# Remove Judge ID selector completely
judge_selector_regex = r'\{\/\* Judge ID Selector Badge \*\/\}.*?\{\/\* Step 1: Select Participant \/ Locked Display \*\/\}'
judge_selector_match = re.search(judge_selector_regex, content, re.DOTALL)
if judge_selector_match:
    content = content.replace(judge_selector_match.group(0), '{/* Step 1: Select Participant / Locked Display */}')

# Replace the entire condition for isLockedMode
step1_regex = r'\{\/\* Step 1: Select Participant \/ Locked Display \*\/\}[\s\S]*?\{\/\* Step 2: Scoring Criteria \*\/\}'
step1_match = re.search(step1_regex, content)
if step1_match:
    new_step1 = """{/* Step 1: Select Participant / Locked Display */}
        {!isLockedMode ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-red-900 uppercase mb-2">AKSES DITOLAK</h3>
            <p className="text-red-700 font-medium">Harap scan QR Code yang disediakan oleh panitia untuk mengakses form penilaian ini.</p>
          </div>
        ) : (
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
                
                {/* Juri Badge */}
                <div className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-md">
                   <ShieldCheck className="w-4 h-4" /> JURI {initialJudgeId}
                </div>
                
                {existingScore && (
                  <div className="mt-4 ml-2 inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-black border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Telah Dinilai (Skor: {existingScore.totalScore})
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium">Memuat data peserta...</p>
            )}
          </div>
        )}

        {/* Step 2: Scoring Criteria */}"""
    content = content.replace(step1_match.group(0), new_step1)
else:
    print("Could not find step 1 match")

# Hide Step 2 & Step 3 if not locked mode
step2_regex = r'\{\/\* Step 2: Scoring Criteria \*\/\}[\s\S]*'
step2_match = re.search(step2_regex, content)
if step2_match:
    old_step2_and_rest = step2_match.group(0)
    # We want to wrap the remainder inside a conditional.
    # It ends with </form> closing tag.
    
    # We'll just replace the JSX to only show it if isLockedMode
    new_rest = "{isLockedMode && (\n          <>\n        " + old_step2_and_rest.replace("</form>", "</>\n        )}\n      </form>")
    content = content.replace(old_step2_and_rest, new_rest)

with open('src/components/ScoringForm.tsx', 'w') as f:
    f.write(content)

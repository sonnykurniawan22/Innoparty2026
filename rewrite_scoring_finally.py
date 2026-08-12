import re

with open('src/components/ScoringForm.tsx', 'r') as f:
    content = f.read()

# Let's extract everything BEFORE the `return (`
before_return_idx = content.find('  return (')
if before_return_idx != -1:
    before_return = content[:before_return_idx]
else:
    print("Could not find return")
    exit(1)

new_return = """  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl text-slate-900 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
              LEMBAR PENILAIAN ANONYMOUS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight uppercase">
              FORM EVALUASI JURI MATCHDAY
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
              Masukkan skor berdasarkan 4 parameter utama kriteria penilaian inovasi
            </p>
          </div>
        </div>
      </div>

      {!isLockedMode ? (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-12 text-center max-w-lg mx-auto mt-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-red-900 uppercase mb-2">AKSES DITOLAK</h3>
          <p className="text-red-700 font-medium">Harap scan QR Code yang disediakan oleh panitia untuk mengakses form penilaian ini.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-8">
          {/* Step 1: Locked Display */}
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
"""

# Extract everything from `<div className="space-y-6">` up to the end of the form
form_content_start = content.find('{/* Step 2: Criteria Sliders */}')
if form_content_start != -1:
    # Find the end of the form, which is the last `</form>`
    last_form_end = content.rfind('</form>')
    rest_of_form = content[form_content_start:last_form_end]
else:
    print("Could not find step 2 start")
    exit(1)

with open('src/components/ScoringForm.tsx', 'w') as f:
    f.write(before_return + new_return + "\n          " + rest_of_form + "\n        </form>\n      )}\n    </div>\n  );\n};\n")

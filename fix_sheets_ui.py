import re

with open('src/components/AdminSettings.tsx', 'r') as f:
    content = f.read()

# Make sure we don't duplicate the functions if they somehow exist
if "handleSaveSpreadsheetConfig" not in content:
    update_logic_to_add = """
  const extractSpreadsheetId = (input: string) => {
    if (!input) return '';
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input.trim();
  };

  const handleSaveSpreadsheetConfig = async () => {
    try {
      setIsUpdating(true);
      await updateContestSettings({
        qccSpreadsheetId,
        ssSpreadsheetId,
        juri1SheetName,
        juri2SheetName,
        juri3SheetName
      });
      setIsUpdating(false);
      setSuccessMsg('Konfigurasi Google Sheets Berhasil Disimpan!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error updating sheet config:", err);
      setIsUpdating(false);
    }
  };

  const importSheetsToFirestore = async (sheetData: Record<string, any[]>, stream: string) => {
    const judgeMapping: Record<string, number> = {
      [juri1SheetName]: 1,
      [juri2SheetName]: 2,
      [juri3SheetName]: 3
    };

    const batchPromises = [];
    
    for (const [sheetName, rows] of Object.entries(sheetData)) {
      const judgeId = judgeMapping[sheetName];
      if (!judgeId) continue;
      
      for (const row of rows) {
        const p = participants.find(part => 
          part.stream === stream && 
          part.name.toLowerCase().trim() === row.teamName.toLowerCase().trim()
        );
        
        if (p) {
          batchPromises.push(saveJudgeScore(
            p.id,
            judgeId as 1 | 2 | 3,
            { performance: row.performance, perbaikanMateri: row.perbaikanMateri },
            "Disinkronisasi dari Google Sheets",
            "Juri Spreadsheet"
          ));
        }
      }
    }
    
    await Promise.all(batchPromises);
  };

  const handleSyncScores = async () => {
    setIsSyncing(true);
    setSyncStatus('Sedang menarik data dari Google Sheets...');
    
    try {
      const fetchSheets = async (url: string, id: string, sheets: string[], stream: string) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spreadsheetId: extractSpreadsheetId(id), sheetNames: sheets })
        });
        const data = await res.json();
        if (data.success) {
          setSyncStatus(`Menyimpan data ${stream} ke database...`);
          await importSheetsToFirestore(data.data, stream);
        } else {
          throw new Error(data.error || 'Failed to fetch');
        }
      };

      const sheetsArr = [juri1SheetName, juri2SheetName, juri3SheetName].filter(Boolean);

      if (qccSpreadsheetId) {
        setSyncStatus('Menarik data QCC...');
        await fetchSheets('/api/read-sheets', qccSpreadsheetId, sheetsArr, 'QCC');
      }
      
      if (ssSpreadsheetId) {
        setSyncStatus('Menarik data SS...');
        await fetchSheets('/api/read-sheets', ssSpreadsheetId, sheetsArr, 'SS');
      }

      setSyncStatus('Sinkronisasi selesai!');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Gagal: ${err.message}`);
    }
    setIsSyncing(false);
  };
"""
    content = content.replace("const handleSaveEventName = async (e: React.FormEvent) => {", update_logic_to_add + "\n  const handleSaveEventName = async (e: React.FormEvent) => {")

ui_to_add = """
          {/* VAR CONTROL - GOOGLE SHEETS */}
          <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 text-white mb-6 mt-4">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-4 text-emerald-400">
              <Sparkles className="w-5 h-5" />
              KONTROL VAR: SINKRONISASI GOOGLE SHEETS JURI
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Masukkan Link atau ID Spreadsheet untuk QCC dan SS. Klik tombol Tarik Data untuk memperbarui skor Juri secara Live.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Spreadsheet ID / Link (QCC)</label>
                <input 
                  type="text" 
                  value={qccSpreadsheetId} 
                  onChange={(e) => setQccSpreadsheetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="ID / Link Spreadsheet QCC"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Spreadsheet ID / Link (SS)</label>
                <input 
                  type="text" 
                  value={ssSpreadsheetId} 
                  onChange={(e) => setSsSpreadsheetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="ID / Link Spreadsheet SS"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Sheet Juri 1</label>
                <input 
                  type="text" 
                  value={juri1SheetName} 
                  onChange={(e) => setJuri1SheetName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Sheet Juri 2</label>
                <input 
                  type="text" 
                  value={juri2SheetName} 
                  onChange={(e) => setJuri2SheetName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Sheet Juri 3</label>
                <input 
                  type="text" 
                  value={juri3SheetName} 
                  onChange={(e) => setJuri3SheetName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveSpreadsheetConfig}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-slate-700"
              >
                Simpan Konfigurasi
              </button>
              <button
                onClick={handleSyncScores}
                disabled={isSyncing}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50"
              >
                {isSyncing ? 'Menarik Data...' : 'Tarik Data dari Spreadsheet'}
              </button>
            </div>
            
            {syncStatus && (
              <div className="mt-4 p-3 bg-slate-800 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">{syncStatus}</span>
              </div>
            )}
          </div>
"""

summary_marker = """      {/* SUB TAB 1: SUMMARY PENILAIAN (REKAPITULASI MATRIKS) */}
      {activeSubTab === 'summary' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">"""

if summary_marker in content and "VAR CONTROL - GOOGLE SHEETS" not in content:
    content = content.replace(summary_marker, summary_marker + "\n" + ui_to_add)

with open('src/components/AdminSettings.tsx', 'w') as f:
    f.write(content)


import re

with open('src/components/AdminSettings.tsx', 'r') as f:
    content = f.read()

# Replace states
new_states = """  const [qccJuri1, setQccJuri1] = useState(settings.qccJuri1SheetName || 'Juri 1');
  const [qccJuri2, setQccJuri2] = useState(settings.qccJuri2SheetName || 'Juri 2');
  const [qccJuri3, setQccJuri3] = useState(settings.qccJuri3SheetName || 'Juri 3');
  const [ssJuri1, setSsJuri1] = useState(settings.ssJuri1SheetName || 'Juri 1');
  const [ssJuri2, setSsJuri2] = useState(settings.ssJuri2SheetName || 'Juri 2');
  const [ssJuri3, setSsJuri3] = useState(settings.ssJuri3SheetName || 'Juri 3');"""

content = re.sub(r"  const \[juri1SheetName.*?\n.*?juri2SheetName.*?\n.*?juri3SheetName.*?;\n", new_states + "\n", content)

# Replace updateContestSettings payload
new_payload = """        qccSpreadsheetId,
        ssSpreadsheetId,
        qccJuri1SheetName: qccJuri1,
        qccJuri2SheetName: qccJuri2,
        qccJuri3SheetName: qccJuri3,
        ssJuri1SheetName: ssJuri1,
        ssJuri2SheetName: ssJuri2,
        ssJuri3SheetName: ssJuri3"""

content = re.sub(r"        qccSpreadsheetId,\n        ssSpreadsheetId,\n        juri1SheetName,\n        juri2SheetName,\n        juri3SheetName", new_payload, content)

# Replace importSheetsToFirestore and handleSyncScores
old_sync_logic = """  const importSheetsToFirestore = async (sheetData: Record<string, any[]>, stream: string) => {
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
  };"""

new_sync_logic = """  const importSheetsToFirestore = async (sheetData: Record<string, any[]>, stream: string, judgeMapping: Record<string, number>) => {
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
      const fetchSheets = async (url: string, id: string, sheets: string[], stream: string, judgeMapping: Record<string, number>) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spreadsheetId: extractSpreadsheetId(id), sheetNames: sheets })
        });
        const data = await res.json();
        if (data.success) {
          setSyncStatus(`Menyimpan data ${stream} ke database...`);
          await importSheetsToFirestore(data.data, stream, judgeMapping);
        } else {
          throw new Error(data.error || 'Failed to fetch');
        }
      };

      if (qccSpreadsheetId) {
        const qccArr = [qccJuri1, qccJuri2, qccJuri3].filter(Boolean);
        const qccMapping: Record<string, number> = {};
        if (qccJuri1) qccMapping[qccJuri1] = 1;
        if (qccJuri2) qccMapping[qccJuri2] = 2;
        if (qccJuri3) qccMapping[qccJuri3] = 3;
        
        setSyncStatus('Menarik data QCC...');
        await fetchSheets('/api/read-sheets', qccSpreadsheetId, qccArr, 'QCC', qccMapping);
      }
      
      if (ssSpreadsheetId) {
        const ssArr = [ssJuri1, ssJuri2, ssJuri3].filter(Boolean);
        const ssMapping: Record<string, number> = {};
        if (ssJuri1) ssMapping[ssJuri1] = 1;
        if (ssJuri2) ssMapping[ssJuri2] = 2;
        if (ssJuri3) ssMapping[ssJuri3] = 3;

        setSyncStatus('Menarik data SS...');
        await fetchSheets('/api/read-sheets', ssSpreadsheetId, ssArr, 'SS', ssMapping);
      }

      setSyncStatus('Sinkronisasi selesai!');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Gagal: ${err.message}`);
    }
    setIsSyncing(false);
  };"""

content = content.replace(old_sync_logic, new_sync_logic)

# Replace UI
old_ui_names = """            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            </div>"""

new_ui_names = """            {/* Juri QCC Sheets */}
            <div className="mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
              <h4 className="text-xs font-bold text-emerald-400 mb-3 uppercase">Nama Sheet Juri QCC</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Juri 1 (QCC)</label>
                  <input 
                    type="text" 
                    value={qccJuri1} 
                    onChange={(e) => setQccJuri1(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Juri 2 (QCC)</label>
                  <input 
                    type="text" 
                    value={qccJuri2} 
                    onChange={(e) => setQccJuri2(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Juri 3 (QCC)</label>
                  <input 
                    type="text" 
                    value={qccJuri3} 
                    onChange={(e) => setQccJuri3(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Juri SS Sheets */}
            <div className="mb-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
              <h4 className="text-xs font-bold text-emerald-400 mb-3 uppercase">Nama Sheet Juri SS</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Juri 1 (SS)</label>
                  <input 
                    type="text" 
                    value={ssJuri1} 
                    onChange={(e) => setSsJuri1(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Juri 2 (SS)</label>
                  <input 
                    type="text" 
                    value={ssJuri2} 
                    onChange={(e) => setSsJuri2(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Juri 3 (SS)</label>
                  <input 
                    type="text" 
                    value={ssJuri3} 
                    onChange={(e) => setSsJuri3(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>"""

content = content.replace(old_ui_names, new_ui_names)

with open('src/components/AdminSettings.tsx', 'w') as f:
    f.write(content)

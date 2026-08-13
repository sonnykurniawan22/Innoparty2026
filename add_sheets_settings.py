import re

with open('src/components/AdminSettings.tsx', 'r') as f:
    content = f.read()

# Add states for spreadsheet config
states_to_add = """
  const [qccSpreadsheetId, setQccSpreadsheetId] = useState(settings.qccSpreadsheetId || '');
  const [ssSpreadsheetId, setSsSpreadsheetId] = useState(settings.ssSpreadsheetId || '');
  const [juri1SheetName, setJuri1SheetName] = useState(settings.juri1SheetName || 'Juri 1');
  const [juri2SheetName, setJuri2SheetName] = useState(settings.juri2SheetName || 'Juri 2');
  const [juri3SheetName, setJuri3SheetName] = useState(settings.juri3SheetName || 'Juri 3');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
"""

content = content.replace("const [eventName, setEventName] = useState(settings.eventName);", "const [eventName, setEventName] = useState(settings.eventName);" + states_to_add)

# Add update logic
update_logic_to_add = """
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

  const handleSyncScores = async () => {
    setIsSyncing(true);
    setSyncStatus('Sedang menarik data dari Google Sheets...');
    
    try {
      // 1. Sync QCC
      if (qccSpreadsheetId) {
        setSyncStatus('Menarik data QCC...');
        const res = await fetch('/api/read-sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spreadsheetId: qccSpreadsheetId,
            sheetNames: [juri1SheetName, juri2SheetName, juri3SheetName].filter(Boolean)
          })
        });
        const data = await res.json();
        if (data.success) {
          // Process updates
          setSyncStatus('Menyimpan data QCC ke database...');
          await importSheetsToFirestore(data.data, 'QCC');
        }
      }
      
      // 2. Sync SS
      if (ssSpreadsheetId) {
        setSyncStatus('Menarik data SS...');
        const res = await fetch('/api/read-sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spreadsheetId: ssSpreadsheetId,
            sheetNames: [juri1SheetName, juri2SheetName, juri3SheetName].filter(Boolean)
          })
        });
        const data = await res.json();
        if (data.success) {
          // Process updates
          setSyncStatus('Menyimpan data SS ke database...');
          await importSheetsToFirestore(data.data, 'SS');
        }
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

# add function to process to firestore
process_func = """
  // Helper to import scores
  const importSheetsToFirestore = async (sheetData: Record<string, any[]>, stream: string) => {
    // sheetData matches sheet name to array of { teamName, perbaikanMateri, performance }
    // We map sheet name to Judge ID
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
        // Find participant by name and stream
        const p = participants.find(part => 
          part.stream === stream && 
          part.name.toLowerCase().trim() === row.teamName.toLowerCase().trim()
        );
        
        if (p) {
          // Create/Update score for this participant and judge
          const existingScore = scores.find(s => s.participantId === p.id && s.judgeId === judgeId);
          if (existingScore) {
            batchPromises.push(updateScore(existingScore.id, {
              criteriaScores: { performance: row.performance, perbaikanMateri: row.perbaikanMateri },
              totalScore: row.performance + row.perbaikanMateri,
              submittedAt: new Date().toISOString()
            }));
          } else {
            batchPromises.push(addScore({
              participantId: p.id,
              judgeId: judgeId as 1 | 2 | 3,
              criteriaScores: { performance: row.performance, perbaikanMateri: row.perbaikanMateri },
              totalScore: row.performance + row.perbaikanMateri,
              notes: "Disinkronisasi dari Google Sheets",
              submittedAt: new Date().toISOString()
            }));
          }
        }
      }
    }
    
    await Promise.all(batchPromises);
  };
"""

content = content.replace("const handleUpdateEventName = async () => {", update_logic_to_add + "\n" + process_func + "\n  const handleUpdateEventName = async () => {")

# Add missing imports for updateScore and addScore
if "updateScore" not in content:
    content = content.replace("clearAllPublicVotes } from '../lib/contestService';", "clearAllPublicVotes, addScore, updateScore } from '../lib/contestService';")

# UI for Google Sheets config
ui_to_add = """
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-emerald-600" />
              Integrasi Google Sheets Penilaian Juri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Spreadsheet ID (QCC & Rising/Leading)</label>
                <input 
                  type="text" 
                  value={qccSpreadsheetId} 
                  onChange={(e) => setQccSpreadsheetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="ID Spreadsheet QCC"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Spreadsheet ID (SS)</label>
                <input 
                  type="text" 
                  value={ssSpreadsheetId} 
                  onChange={(e) => setSsSpreadsheetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="ID Spreadsheet SS"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Sheet Juri 1</label>
                <input 
                  type="text" 
                  value={juri1SheetName} 
                  onChange={(e) => setJuri1SheetName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="Misal: Juri 1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Sheet Juri 2</label>
                <input 
                  type="text" 
                  value={juri2SheetName} 
                  onChange={(e) => setJuri2SheetName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Sheet Juri 3</label>
                <input 
                  type="text" 
                  value={juri3SheetName} 
                  onChange={(e) => setJuri3SheetName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveSpreadsheetConfig}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Simpan Konfigurasi
              </button>
              <button
                onClick={handleSyncScores}
                disabled={isSyncing}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Tarik Data dari Spreadsheet
              </button>
            </div>
            
            {syncStatus && (
              <p className="mt-3 text-xs font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                {syncStatus}
              </p>
            )}
          </div>
"""

# Insert UI after event name settings block
event_name_block_end = "Nama Event Berhasil Diperbarui!</p>\n            )}\n          </div>"
if event_name_block_end in content:
    content = content.replace(event_name_block_end, event_name_block_end + "\n\n" + ui_to_add)

# Make sure we add RefreshCw import
if "RefreshCw" not in content:
    content = content.replace("import {", "import { RefreshCw,", 1)

with open('src/components/AdminSettings.tsx', 'w') as f:
    f.write(content)

import re

with open('src/components/AdminSettings.tsx', 'r') as f:
    content = f.read()

# Add states for auto sync
if "const [isAutoSync, setIsAutoSync]" not in content:
    auto_sync_state = """
  const [isAutoSync, setIsAutoSync] = useState(false);
  const syncIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isAutoSync) {
      // Run once immediately, then every 10 seconds
      handleSyncScores();
      syncIntervalRef.current = setInterval(() => {
        handleSyncScores();
      }, 10000);
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    }
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [isAutoSync]);
"""
    # Insert it right before handleSaveEventName or after other states
    content = content.replace("const handleSaveSpreadsheetConfig = async () => {", auto_sync_state + "\n  const handleSaveSpreadsheetConfig = async () => {")


# Modify UI to include auto sync toggle
ui_button_block = """            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveSpreadsheetConfig}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-slate-700"
              >
                Simpan Konfigurasi
              </button>
              <button
                onClick={handleSyncScores}
                disabled={isSyncing || isAutoSync}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 disabled:opacity-50"
              >
                {isSyncing ? 'Menarik Data...' : 'Tarik Data (Manual)'}
              </button>
              <button
                onClick={() => setIsAutoSync(!isAutoSync)}
                className={`flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isAutoSync 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/50 animate-pulse' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50'
                }`}
              >
                {isAutoSync ? 'Hentikan Auto-Sync' : 'Aktifkan Auto-Sync (Realtime)'}
              </button>
            </div>"""

old_ui_button_block = """            <div className="flex flex-col sm:flex-row gap-3">
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
            </div>"""

if old_ui_button_block in content:
    content = content.replace(old_ui_button_block, ui_button_block)

with open('src/components/AdminSettings.tsx', 'w') as f:
    f.write(content)

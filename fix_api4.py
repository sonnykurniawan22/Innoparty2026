import re

with open('api/index.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
in_read_sheets = False

for line in lines:
    if line.startswith('app.post("/api/read-sheets"'):
        in_read_sheets = True
        new_lines.append(line)
        new_lines.append("""  try {
    const { spreadsheetId, sheetNames } = req.body;
    if (!spreadsheetId || !sheetNames || !Array.isArray(sheetNames)) {
      return res.status(400).json({ error: "Missing spreadsheetId or sheetNames array" });
    }

    const authClient = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const results: Record<string, any[]> = {};

    for (const sheetName of sheetNames) {
      try {
        const getRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `'${sheetName}'!A:E`,
        });
        
        const rows = getRes.data.values || [];
        const parsedRows = rows.map(row => {
          // A = row[0] (Kode Tim)
          // B = row[1] (Nama Team)
          // D = row[3] (Perbaikan Materi)
          // E = row[4] (Performance)
          
          let perbaikanMateri = 0;
          let performance = 0;
          
          if (row[3]) {
            const val = row[3].toString().replace(',', '.');
            perbaikanMateri = parseFloat(val) || 0;
          }
          if (row[4]) {
            const val = row[4].toString().replace(',', '.');
            performance = parseFloat(val) || 0;
          }
          return {
            teamCode: row[0] ? row[0].toString().trim() : "",
            teamName: row[1] ? row[1].toString().trim() : "",
            perbaikanMateri,
            performance
          };
        }).filter(r => r.teamCode && r.teamCode.toLowerCase() !== 'kategori' && r.teamCode.toLowerCase() !== 'kode tim' && r.teamCode.toLowerCase() !== 'id'); 
        results[sheetName] = parsedRows;
      } catch (err: any) {
        console.error(`Error reading sheet ${sheetName}:`, err.message);
        results[sheetName] = []; 
      }
    }
    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error("Read sheets error:", error);
    res.status(500).json({ error: error.message || "Failed to read sheets" });
  }
});
""")
    elif in_read_sheets:
        if line.startswith('const handleAttendance'):
            in_read_sheets = False
            new_lines.append(line)
    else:
        new_lines.append(line)

with open('api/index.ts', 'w') as f:
    f.writelines(new_lines)

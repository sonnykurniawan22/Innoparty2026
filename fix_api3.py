import re

with open('api/index.ts', 'r') as f:
    content = f.read()

# Replace range
content = content.replace("range: `'${sheetName}'!B:E`,", "range: `'${sheetName}'!A:E`,")

old_str = """        const parsedRows = rows.map(row => {
          // B = row[0] (Nama Team)
          // D = row[2] (Perbaikan Materi)
          // E = row[3] (Performance)
                    
          let perbaikanMateri = 0;
          let performance = 0;
                    
          if (row[2]) {
            const val = row[2].toString().replace(',', '.');
            perbaikanMateri = parseFloat(val) || 0;
          }
          if (row[3]) {
            const val = row[3].toString().replace(',', '.');
            performance = parseFloat(val) || 0;
          }
          return {
            teamName: row[0] ? row[0].toString().trim() : "",
            perbaikanMateri,
            performance
          };
        }).filter(r => r.teamName && r.teamName.toLowerCase() !== 'nama team' && r.teamName.toLowerCase() !== 'teams');"""

new_str = """        const parsedRows = rows.map(row => {
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
        }).filter(r => r.teamCode && r.teamCode.toLowerCase() !== 'kode tim' && r.teamCode.toLowerCase() !== 'id' && r.teamCode.toLowerCase() !== 'kategori');"""

content = content.replace(old_str, new_str)

with open('api/index.ts', 'w') as f:
    f.write(content)

import re

with open('api/index.ts', 'r') as f:
    content = f.read()

# Replace column mapping
old_logic = """        const parsedRows = rows.map(row => {
          // B = row[0] (Nama Team)
          // U = row[19] (Perbaikan Materi)
          // V = row[20] (Performance)
                    
          let perbaikanMateri = 0;
          let performance = 0;
                    
          if (row[19]) {
            const val = row[19].toString().replace(',', '.');
            perbaikanMateri = parseFloat(val) || 0;
          }
          if (row[20]) {
            const val = row[20].toString().replace(',', '.');
            performance = parseFloat(val) || 0;
          }"""

new_logic = """        const parsedRows = rows.map(row => {
          // Range is B:V
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
          }"""

content = content.replace(old_logic, new_logic)

with open('api/index.ts', 'w') as f:
    f.write(content)

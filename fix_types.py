import re

with open('src/types.ts', 'r') as f:
    content = f.read()

new_fields = """  // Google Sheets Integration Settings
  qccSpreadsheetId?: string;
  ssSpreadsheetId?: string;
  qccJuri1SheetName?: string;
  qccJuri2SheetName?: string;
  qccJuri3SheetName?: string;
  ssJuri1SheetName?: string;
  ssJuri2SheetName?: string;
  ssJuri3SheetName?: string;"""

content = re.sub(r"  // Google Sheets Integration Settings[\s\S]*?juri3SheetName\?: string;", new_fields, content)

with open('src/types.ts', 'w') as f:
    f.write(content)

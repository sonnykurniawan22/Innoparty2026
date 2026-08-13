with open('src/components/AdminSettings.tsx', 'r') as f:
    content = f.read()

# Replace the direct pass with an ID extractor function
content = content.replace("const handleSyncScores = async () => {", """
  const extractSpreadsheetId = (input: string) => {
    if (!input) return '';
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input.trim();
  };

  const handleSyncScores = async () => {""")

content = content.replace("spreadsheetId: qccSpreadsheetId,", "spreadsheetId: extractSpreadsheetId(qccSpreadsheetId),")
content = content.replace("spreadsheetId: ssSpreadsheetId,", "spreadsheetId: extractSpreadsheetId(ssSpreadsheetId),")

with open('src/components/AdminSettings.tsx', 'w') as f:
    f.write(content)

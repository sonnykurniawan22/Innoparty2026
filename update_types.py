with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace("  projectTitle: string;", "  teamCode?: string; // ID Tim khusus dari Google Sheets\n  projectTitle: string;")

with open('src/types.ts', 'w') as f:
    f.write(content)

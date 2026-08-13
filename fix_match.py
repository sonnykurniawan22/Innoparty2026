import re

with open('src/components/AdminSettings.tsx', 'r') as f:
    content = f.read()

old_logic = """        const p = participants.find(part => 
          part.stream === stream && 
          part.name.toLowerCase().trim() === row.teamName.toLowerCase().trim()
        );"""

new_logic = """        const p = participants.find(part => {
          if (part.stream !== stream) return false;
          // Normalize names by removing spaces, dashes, and making lowercase
          const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normalize(part.name) === normalize(row.teamName);
        });"""

content = content.replace(old_logic, new_logic)

with open('src/components/AdminSettings.tsx', 'w') as f:
    f.write(content)

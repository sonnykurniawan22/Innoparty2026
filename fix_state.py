import re

with open('src/components/AdminSettings.tsx', 'r') as f:
    content = f.read()

content = content.replace("useState(settings.qccJuri1SheetName || 'Juri 1');", "useState(settings.qccJuri1SheetName ?? 'Juri 1');")
content = content.replace("useState(settings.qccJuri2SheetName || 'Juri 2');", "useState(settings.qccJuri2SheetName ?? 'Juri 2');")
content = content.replace("useState(settings.qccJuri3SheetName || 'Juri 3');", "useState(settings.qccJuri3SheetName ?? 'Juri 3');")
content = content.replace("useState(settings.ssJuri1SheetName || 'Juri 1');", "useState(settings.ssJuri1SheetName ?? 'Juri 1');")
content = content.replace("useState(settings.ssJuri2SheetName || 'Juri 2');", "useState(settings.ssJuri2SheetName ?? 'Juri 2');")
content = content.replace("useState(settings.ssJuri3SheetName || 'Juri 3');", "useState(settings.ssJuri3SheetName ?? 'Juri 3');")

with open('src/components/AdminSettings.tsx', 'w') as f:
    f.write(content)

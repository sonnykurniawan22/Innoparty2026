with open('src/components/JudgeQRModal.tsx', 'r') as f:
    content = f.read()

import re

# Remove tabs UI
content = re.sub(r'<div className="flex space-x-2 mb-6">.*?</div>', '', content, flags=re.DOTALL)

# Default activeTab to 'public' if it was 'juri'
content = content.replace("useState<'juri' | 'public'>('juri')", "useState<'juri' | 'public'>('public')")

with open('src/components/JudgeQRModal.tsx', 'w') as f:
    f.write(content)

with open('src/components/JudgeQRModal.tsx', 'r') as f:
    content = f.read()

import re

# Remove the whole juri logic
# We can just keep the public vote QR part since it's the only one used now.
content = re.sub(r'\{\/\* JURI QR TAB \*\/\}.*?\{\/\* PUBLIC VOTE QR TAB \*\/\}', '', content, flags=re.DOTALL)

# Let's just manually simplify it by doing regex substitution for the activeTab === 'juri' check
content = re.sub(r"\{activeTab === 'juri' && \(.*?\}\)", "", content, flags=re.DOTALL)
content = content.replace("{activeTab === 'public' && (", "")
# and remove the closing brace for that public block at the end (this is a bit tricky with regex)


with open('src/App.tsx', 'r') as f:
    content = f.read()

import re

# Remove import
content = re.sub(r"import \{ ScoringForm \} from '\./components/ScoringForm';\n", "", content)

# Remove the whole scoring tab block
scoring_tab_regex = r"\{\/\* TAB 2: FORM PENILAIAN JURI \*\/\}.*?<\/motion\.div>\n\s*\)\}"
content = re.sub(scoring_tab_regex, "", content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

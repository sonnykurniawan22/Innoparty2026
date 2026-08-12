import re

with open('src/components/ScoringForm.tsx', 'r') as f:
    content = f.read()

# Fix step 2 syntax error
bad_string = "{isLockedMode && (\n          <>\n        "
if bad_string in content:
    content = content.replace(bad_string, "")

bad_end = "</>\n        )}\n      </form>"
if bad_end in content:
    content = content.replace(bad_end, "</form>")

# In step 1, the old `{!isLockedMode ? (` block has mismatched tags? Let's fix that block altogether.

with open('src/components/ScoringForm.tsx', 'w') as f:
    f.write(content)

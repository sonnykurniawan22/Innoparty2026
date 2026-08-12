import re

with open('src/components/ScoringForm.tsx', 'r') as f:
    content = f.read()

# I will just write a new simplified ScoringForm that only accepts locked participants
# and doesn't even have the judge or participant selectors at all.

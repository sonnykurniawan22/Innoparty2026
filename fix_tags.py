with open('src/components/LivePodium.tsx', 'r') as f:
    content = f.read()

import re

# find the last "return (" in the file, then replace the end properly
last_return_idx = content.rfind('return (')

if last_return_idx != -1:
    pass


import re

with open('src/components/JudgeQRModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { motion, AnimatePresence } from 'motion/react';",
    "import { motion, AnimatePresence } from 'motion/react';\nimport { Participant } from '../types';"
)

with open('src/components/JudgeQRModal.tsx', 'w') as f:
    f.write(content)

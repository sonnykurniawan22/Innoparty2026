import re

with open('src/components/ScoringForm.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const [submitSuccess, setSubmitSuccess] = useState(false);",
    "const [submitSuccess, setSubmitSuccess] = useState(false);\n  const isLockedMode = !!(initialJudgeId && initialParticipantId);"
)

with open('src/components/ScoringForm.tsx', 'w') as f:
    f.write(content)

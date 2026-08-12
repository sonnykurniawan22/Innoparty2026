import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add activeParticipantId state
content = content.replace(
    "const [activeJudgeId, setActiveJudgeId] = useState<number | null>(null);",
    "const [activeJudgeId, setActiveJudgeId] = useState<number | null>(null);\n  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);"
)

# Parse participant parameter
content = content.replace(
    "const categoryParam = params.get('category');",
    "const categoryParam = params.get('category');\n    const participantParam = params.get('participant');\n    if (participantParam) {\n      setActiveParticipantId(participantParam);\n    }"
)

# Pass to ScoringForm
content = content.replace(
    "initialJudgeId={activeJudgeId}",
    "initialJudgeId={activeJudgeId}\n                initialParticipantId={activeParticipantId}"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

import re

with open('src/components/ScoringForm.tsx', 'r') as f:
    content = f.read()

# Add initialParticipantId to props
content = content.replace(
    "initialJudgeId?: number | null;",
    "initialJudgeId?: number | null;\n  initialParticipantId?: string | null;"
)

content = content.replace(
    "initialJudgeId = null,",
    "initialJudgeId = null,\n  initialParticipantId = null,"
)

# Set states based on initialParticipantId
content = content.replace(
    "const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');",
    "const [selectedParticipantId, setSelectedParticipantId] = useState<string>(initialParticipantId || '');"
)

# Determine if it's locked mode
content = content.replace(
    "const [submitSuccess, setSubmitSuccess] = useState(false);",
    "const [submitSuccess, setSubmitSuccess] = useState(false);\n  const isLockedMode = !!(initialJudgeId && initialParticipantId);"
)

# Modify the useEffect for default participant selection to not override locked mode
content = content.replace(
    "if (filteredParticipants.length > 0 && !selectedParticipantId) {",
    "if (filteredParticipants.length > 0 && !selectedParticipantId && !isLockedMode) {"
)

# Hide Judge Selection, Category Filter, and Participant selection when locked mode is true
# We need to find where they are rendered.

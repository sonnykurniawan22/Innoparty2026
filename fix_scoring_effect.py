import re

with open('src/components/ScoringForm.tsx', 'r') as f:
    content = f.read()

# Add effect for initialParticipantId
content = content.replace(
    "useEffect(() => {\n    if (initialJudgeId && [1, 2, 3].includes(initialJudgeId)) {\n      setSelectedJudgeId(initialJudgeId as 1 | 2 | 3);\n    }\n  }, [initialJudgeId]);",
    "useEffect(() => {\n    if (initialJudgeId && [1, 2, 3].includes(initialJudgeId)) {\n      setSelectedJudgeId(initialJudgeId as 1 | 2 | 3);\n    }\n  }, [initialJudgeId]);\n\n  useEffect(() => {\n    if (initialParticipantId) {\n      setSelectedParticipantId(initialParticipantId);\n    }\n  }, [initialParticipantId]);"
)

with open('src/components/ScoringForm.tsx', 'w') as f:
    f.write(content)

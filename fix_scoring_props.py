import re

with open('src/components/ScoringForm.tsx', 'r') as f:
    content = f.read()

# Add to interface
if 'initialParticipantId?: string | null;' not in content:
    content = content.replace(
        "initialJudgeId?: number | null;",
        "initialJudgeId?: number | null;\n  initialParticipantId?: string | null;"
    )

# Add to destructuring
if 'initialParticipantId = null,' not in content:
    content = content.replace(
        "initialJudgeId = null,\n  onScoreSubmitted",
        "initialJudgeId = null,\n  initialParticipantId = null,\n  onScoreSubmitted"
    )

with open('src/components/ScoringForm.tsx', 'w') as f:
    f.write(content)

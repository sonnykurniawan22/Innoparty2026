import re

with open('src/components/MasterParticipants.tsx', 'r') as f:
    content = f.read()

old_update = """        await updateParticipant(editingId, {
          name,
          projectTitle,
          preliminaryScore: Number(preliminaryScore) || 0,"""

new_update = """        await updateParticipant(editingId, {
          name,
          teamCode,
          projectTitle,
          preliminaryScore: Number(preliminaryScore) || 0,"""

content = content.replace(old_update, new_update)

with open('src/components/MasterParticipants.tsx', 'w') as f:
    f.write(content)

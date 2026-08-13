import re

with open('src/components/MasterParticipants.tsx', 'r') as f:
    content = f.read()

old_add = """        await addParticipant({
          name,
          projectTitle,"""

new_add = """        await addParticipant({
          name,
          teamCode,
          projectTitle,"""

content = content.replace(old_add, new_add)

with open('src/components/MasterParticipants.tsx', 'w') as f:
    f.write(content)

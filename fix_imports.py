with open('src/components/AdminSettings.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith("import { RefreshCw,  ContestSettings"):
        new_lines.append(line.replace("import { RefreshCw,  ContestSettings", "import { ContestSettings"))
    elif line.startswith("import { RefreshCw,  updateContestSettings"):
        new_lines.append(line.replace("import { RefreshCw,  updateContestSettings", "import { updateContestSettings"))
    elif line.startswith("import { RefreshCw,  "):
        # This is the lucide-react block
        new_lines.append(line) # Keep RefreshCw here
    else:
        new_lines.append(line)

with open('src/components/AdminSettings.tsx', 'w') as f:
    f.writelines(new_lines)
